var params = {};
var configs = {};
var strings = {};
var contestants = JSON.parse(localStorage.getItem("contestants") || "{}");
var units = localStorage.getItem("units") || "SI";
var episode_listing = {};
const MAX_PLAYER_COUNT = 8;

const snd = new SND([
  "placeholder", // menu
  "signup_base",
  "signup_extra",
  "signup_extra2",
  "options"
], [
  "menu_move", // menu
  "menu_confirm",
  "menu_back",
  "menu_signin",
  "menu_signout",
  "menu_stuck",
  "game_start",
  "menu_fail"
]);
document.addEventListener("voxEnd", function(){
  snd.playNextVox();
});
var currentEventListener = undefined;
var currentEventListenerModal = undefined;

const sleep = ms => new Promise((r, j) => setTimeout(r, ms));

const LANG = "en"; // might change it later
// reload this header for each request
const myHeaders = new Headers();
myHeaders.append('Content-Type', 'text/json');
/**
 * Loads strings to memory via a request.
 */
async function loadStrings(lang) {
  return fetch(ROOT + "strings/" + lang + ".json", {
    method: 'GET',
    headers: myHeaders,
    mode: 'cors'
  }).then(response => {
    if (response.ok) {
      console.log("await1");
      return response.json();
    } else {
      console.log("response:", response);
      alert("Error fetching strings. Response not OK.");
    }
  }).catch(error => {
    console.log(error);
    abort("Error fetching strings." + error);
  });
}

/**
 * Loads the contents of the specified HTML file into the #screen element.
 * @param {string} name Name of the page (minus .html).
 */
loadPage = (name) => {
  const screen = document.getElementById("screen");
  // delete all children
  while (screen.lastChild) {
    screen.removeChild(screen.lastChild);
  }
  // request page
  return new Promise((resolve, reject) => {

    var xhr = new XMLHttpRequest();
    xhr.open('GET', ROOT + name + '.html', true);
    xhr.onreadystatechange = function () {
      if (this.readyState !== 4) throw Error("Page " + name + " could not load");
      if (this.status !== 200) {
        window.alert("Error on loading page " + name + ". Please see the browser console for details.");
        throw new Error("Page " + name + " could not load");
      }; // or whatever error handling you want
      screen.innerHTML = this.responseText;
      resolve();
    };
    xhr.send();

  }
  );
}

/**
 * floorTextSize sets the size of 1 rem to be an integer
 * number of pixels. This should be called on window
 * resize and document DOMContentLoaded.
 */
const floorRem = () => {
  // get max width dimension in multiple of 64
  // get max height dimension in multiple of 36
  // take minimum
  const w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  const h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  const scale = Math.min(
    Math.floor(w / 64),
    Math.floor(h / 36)
  );
  document.documentElement.style.fontSize = `${scale}px`
    ;
}
var waitFloorRem = (function () {
  var interval = 250;
  var lastTime = new Date().getTime() - interval; // last fired
  return function () {
    // exec only if last fired at least interval ms ago
    if ((lastTime + interval) <= new Date().getTime()) {
      lastTime = new Date().getTime();
      floorRem();
    }
  };
})();
window.addEventListener("resize", waitFloorRem);

var formatName = localStorage.getItem("formatName") || "points";
var format = {};
/**
 * Changes how winnings are printed.
 * @param {Object} format
 * @param {number} format.multiplier What to multiply the 10 pts per question by.
 * @param {number} format.decimalDigits How many decimal digits to show.
 * @param {string} format.decimalSymbol Decimal point? Decimal comma? Custom define.
 * @param {Array<number>} format.separatorDigits How often to insert the digit separator. 
 * Define from least significant to most significant. Repeats the last entry.
 * To disable set to []. Usually set to [3]. If lakh/crore, set to [3, 2].
 * @param {string} format.separatorSymbol Separator comma? Separator period? Custom define.
 * @param {Array<string>[2]} format.nega Prefix and suffix when the amount is negative.
 * @param {Array<string>[2]} format.zero Prefix and suffix when the amount is zero.
 * @param {Array<string>[2]} format.posi Prefix and suffix when the amount is positive.
 */
function changeFormat(format) {
  formatPts = (value, plus) => {
    var str = Math.floor(
      value * format.multiplier * Math.pow(10, format.decimalDigits)
    ).toString(10);
    digits = str.length;
    if (format.decimalDigits) {
      if (format.decimalDigits >= str.length) {
        digits = format.decimalDigits + 1;
        str = str.padStart(digits, "0");
      }
      digits -= format.decimalDigits;
      str = str.slice(0, digits) + format.decimalSymbol + str.slice(digits);
    }
    if (format.separatorDigits.length) {
      var i = 0;
      while (digits > format.separatorDigits[i]) {
        digits -= format.separatorDigits[i];
        str = str.slice(0, digits) + format.separatorSymbol + str.slice(digits);
      }
    }
    str +=
      value < 0 ? format.nega[1] :
        plus ? (
          value === 0 ? format.zero[1] : format.posi[1]
        ) : format.noSign[1];
    return value < 0 ? format.nega[0] :
      plus ? (
        value === 0 ? format.zero[0] : format.posi[0]
      ) : format.noSign[0]
        + str;
  }
}

/**
 * keyShiv is set as the EventListener for keyDown,
 * and redirects the event to the specific handlers.
 * The active handler can be changed using
 * changeKeyHandler().
 * Uses the global variables currentEventListener and
 * currentEventListenerModal. currentEventListener is
 * the event listener for the currently active page.
 * currentEventListenerModal is the event listener for
 * the currently active modal. There should be either
 * no modal or 1 modal active at any given moment.
 * This function prioritizes currentEventListenerModal.
 * @param {keyDownEvent} event The event that gets
 * passed through.
 * @return {any} Whatever the specific handler returns.
 * Probably doesn't return anything.
 */
function keyShiv(event) {
  if (currentEventListenerModal) {
    return currentEventListenerModal(event);
  } else if (currentEventListener) {
    return currentEventListener(event);
  } else {
    console.log("no key handler");
    return;
  }
}

/**
 * Like keyShiv, but adapts to button presses.
 * @param {controllerPressEvent} event Custom event.
 * @param {number} event.detail.index The index of the controller.
 * @param {boolean} event.detail.player2 On a shared controller, whether the button is on the right hand side. 
 * @param {number} event.detail.button The index of the button.
 */
function buttonShiv(event) {
  if (currentEventListenerModal) {
    return currentEventListenerModal(event);
  } else if (currentEventListener) {
    return currentEventListener(event);
  } else {
    console.log("no key handler");
    return;
  }
}

/**
 * Changes one of the currently active event listeners.
 * Uses the global variables currentEventListener and
 * currentEventListenerModal. For details on these, see
 * keyShiv().
 * @param {function} f The function to change the eventListener to. Set this to undefined to remove it.
 * @param {boolean} modal If this is true, it will change
 * the event listener for modals.
 */
function changeKeyHandler(f, modal) {
  if (modal) {
    currentEventListenerModal = f;
  } else {
    currentEventListener = f;
  }
}
/**
 * Checks if the object is empty (evidently).
 * @param {Object} obj The object to be checked.
 * @return {boolean} Whether the object is empty.
 */
function isEmptyObj(obj) {
  return Object.entries(obj).length === 0 && obj.constructor === Object;
}
/**
 * Given a NodeList (returned by doing HTMLNode.children)
 * finds which of them has the class "sel". There should
 * only be one item with that class at any given moment.
 * If there is no such Node, returns -1.
 * @param {HTMLCollection} buttons The NodeList of "buttons" (or
 * oher elements) to be checked.
 * @return {number} The index of the element with class
 * "sel", or -1 if no such element is found.
 */
function getIndexOfSel(buttons) {
  var selected = -1;
  for (var i = 0; i < buttons.length; i++) {
    if (buttons[i].classList.contains("sel")) {
      selected = i;
      break;
    }
  }
  return selected;
}


const keyName = {
  L: 0,
  up: 1,
  R: 2,
  left: 3,
  down: 4,
  right: 5,
  pause: 6,
  unused7: 7,
  unused8: 8,
  dUp: 9,
  unused10: 10,
  dLeft: 11,
  dDown: 12,
  dRight: 13,
  unused14: 14,
  unused15: 15
}
const KEY_CONFIG = [
  ["KeyQ", "KeyW", "KeyE", "KeyA", "KeyS", "KeyD"],
  ["KeyF", "KeyG", "KeyH", "KeyV", "KeyB", "KeyN"],
  ["KeyU", "KeyI", "KeyO", "KeyJ", "KeyK", "KeyL"],
  ["Numpad7", "Numpad8", "Numpad9", "Numpad4", "Numpad5", "Numpad6"]
];
/**
 * Converts the key code into one value representing which
 * button of which player was pressed.
 * Each player adds 16 to the ID, leaving each player as
 * many buttons.
 * (Each player only uses 7 buttons, but I'm
 * futureproofing it for 16 buttons max. Besides,
 * controllers have 16 "system buttons" defined max.)
 * Players start with 1.
 * Uses the global constant KEY_CONFIG to reference the
 * key code against.
 * @param {KeyboardEvent} e
 * @return {number} 16 * player (from 1) + buttonID (from 0), 0 if undefined.
 */
function sys(e) {
  // Player numbers go from 1 to 4 (or 8)
  // Button numbers go from 0 to 7
  // 0 1 2 - L ^ R
  // 3 4 5 - < v >
  //   6   - pause
  switch (e.keyCode) {
    case 27: // esc = pause
      return 6;
    case 8: // backspace = <
      return 3;
    case 13: // return = >
      return 5;
    default:
      const code = e.code;
      console.log("sys key handle", code);
      for (var i = 0; i < KEY_CONFIG.length; i++) {
        const result = KEY_CONFIG[i].indexOf(code);
        if (result !== -1) {
          return (i + 1) * 16 + result;
        }
      }
      return 0;
  }
}
/**
 * Within modals, replaces the strings "[[" and "]]" with
 * the HTML tags for button display.
 * @param {string} text The unmodified text.
 * @return {string} The modified text.
 */
function formatIcons(text) {
  // replace "[[" with '<span class="icon">' and "]]" with </span>
  return text.replace(/\[\[/g, '<span class="icon">').replace(/\]\]/g, '</span>');
}
/**
 * The standard modal key handler.
 * @param {KeyboardEvent} event The event.
 */
function modalKeys(event) {
  var key, player;
  if (event.code !== undefined) {
    const id = sys(event);
    console.log(id);
    key = id % 16;
    player = -(id - key) / 16;
  } else {
    key = event.detail.button;
    player = event.detail.index * 2 + +(event.detail.player2);
  }
  console.log("modalKeys", key, player);
  event.stopPropagation();
  var box = document.getElementById("modal").getElementsByClassName("modal_box")[0];
  var screenHeight = document.getElementById("screen").scrollHeight;
  console.log("screenHeight =", screenHeight);
  switch (key) {
    case keyName.up:
    case keyName.dUp:
      snd.playSFX({ name: "menu_move" });
      box.scrollBy({
        top: document.querySelector(".modal_box").clientHeight / -4,
        left: 0,
        behavior: 'auto'
      });
      break;
    case keyName.down:
    case keyName.dDown:
      snd.playSFX({ name: "menu_move" });
      box.scrollBy({
        top: document.querySelector(".modal_box").clientHeight / 4,
        left: 0,
        behavior: 'auto'
      });
      break;
    case keyName.right:
    case keyName.dRight:
      changeKeyHandler(undefined, true);
      snd.playSFX({ name: "menu_confirm" });
      document.getElementById("modal").classList.remove("active");
      break;
  }
  return;
}
/**
 * Initializes a modal, given an array of strings. All
 * arrays can be exited by any player's button 6 (right).
 * @param {Array<string>} text Lines of text to show on the modal.
 * * starts with "#": headline.
 * * starts with "*": subheading.
 * * starts with "[1]" ... "[6]": button for the
 * corresponding key.
 * * else: paragraph.
 */
function activateModal(text) {
  var modal = document.getElementById("modal");
  var content = modal.getElementsByClassName("modal_content")[0];
  for (var i = content.childNodes.length - 1; i >= 0; i--) {
    content.removeChild(content.childNodes[i]);
  }
  modal.querySelector(".modal_box").scrollTo(0, 0);
  for (var i = 0; i < text.length; i++) {
    var node;
    if (text[i].charAt(0) == "#") {
      // format: #heading
      node = document.createElement("h2");
      text[i] = text[i].substring(1);
    } else if (text[i].charAt(0) == "*") {
      // format: *subheading
      node = document.createElement("h3");
      text[i] = text[i].substring(1);
    } else if (text[i].charAt(0) == "[") {
      // format: [key]text
      node = document.createElement("div");
      node.classList.add("button");
      const btnEnd = text[i].indexOf("]");
      var button = text[i].substring(1, btnEnd);
      text[i] = text[i].substring(btnEnd + 1);
      var keyDisplay = document.createElement("span");
      keyDisplay.classList.add("key");
      keyDisplay.classList.add("icon");
      keyDisplay.innerText = button;
      node.appendChild(keyDisplay);
    } else if (text[i].charAt(0) == "!") {
      node = document.createElement("img");
      node.classList.add("modal_img");
      node.src = text[i].substring(1);
      // don't change innerHTML!
      content.appendChild(node);
      continue;
    } else {
      // format: just text
      node = document.createElement("p");
    }
    node.innerHTML += formatIcons(text[i]);
    content.appendChild(node);
  }
  if (modal.querySelector(".modal_box").clientHeight < content.scrollHeight) {
    modal.classList.add("overflowing");
  }
  content.scrollTo(0, 0);
  setTimeout(function () {
    changeKeyHandler(modalKeys, true);
    console.log("Modal key handler complete.");
  }, 500);
  modal.classList.add("active");
  console.log("Modal complete");
}
/**
 * The fatal error modal key handler.
 * @param {KeyboardEvent} event The event.
 */
function abortModalKeys(event) {
  event.stopPropagation();
  if (event.code !== undefined) {
    key = sys(event) % 16;
  } else {
    key = event.detail.button;
  }
  if (key === keyName.right || key === keyName.dRight) {
    changeKeyHandler(undefined, true);
    snd.playSFX({ name: "menu_confirm" });
    document.getElementById("modal").classList.remove("active");
    document.body.className = "";
    setTimeout(initApp, 2000);
    console.log("Finished abortModalKeys");
  }
  return;
}
/**
 * Like activateModal, but aborts the game and quits to the
 * title screen.
 * @param {Array<string>} text cf. activateModal()
 */
function abort(text) {
  snd.stopBgm(0);
  document.body.className = "error";
  var modal = document.getElementById("modal");
  var content = modal.getElementsByClassName("modal_content")[0];
  for (var i = content.childNodes.length - 1; i >= 0; i--) {
    content.removeChild(content.childNodes[i]);
  }
  for (var i = 0; i < text.length; i++) {
    var node;
    if (text[i].charAt(0) == "#") {
      // format: #heading
      node = document.createElement("h2");
      text[i] = text[i].substring(1);
    } else if (text[i].charAt(0) == "*") {
      // format: *subheading
      node = document.createElement("h3");
      text[i] = text[i].substring(1);
    } else if (text[i].charAt(0) == "[") {
      // format: [key]text
      node = document.createElement("div");
      node.classList.add("button");
      const btnEnd = text[i].indexOf("]");
      var button = text[i].substring(1, btnEnd);
      text[i] = text[i].substring(btnEnd + 1);
      var keyDisplay = document.createElement("span");
      keyDisplay.classList.add("key");
      keyDisplay.classList.add("icon");
      keyDisplay.innerText = button;
      node.appendChild(keyDisplay);
    } else {
      // format: just text
      node = document.createElement("p");
    }
    node.innerHTML += formatIcons(text[i]);
    content.appendChild(node);
  }
  if (modal.querySelector(".modal_box").clientHeight < content.scrollHeight) {
    modal.classList.add("overflowing");
    content.scrollTo(0, 0);
  }
  setTimeout(function () {
    changeKeyHandler(abortModalKeys, true);
    console.log("Modal key handler complete.");
  }, 500);
  modal.classList.add("active");
  console.log("Modal complete");
}
/**
 * Starts the episode!
 */
function startEpisode() {
  loadPage("game");
}
/**
 * Retrieves the data for the specified episode ID.
 * It will be stored in the global variable episode_data.
 * @param {string} filename The filename. This must be
 * in the directory /q/.
 */
function loadEpisode(filename) {
  document.body.className = "state_loading_episode";
  fetch(ROOT + 'ep/' + filename + ".json", {
    method: 'GET',
    headers: myHeaders,
    mode: 'cors'
  }).then(response => {
    if (response.ok) {
      console.log("response:", response.body);
      return response.json();
    } else {
      abort(strings.error_episode_load);
      return;
    }
  }).catch(error => {
    console.log(error);
    abort(strings.error_episode_load);
    return;
  }).then(json => {
    episode_data = json;
    console.log("Fetched /ep/" + filename + ".json", json);
    startEpisode();
  });
}
function getNextPlayerName(index){
  if (index >= params.presentList.length) {
    try {
      loadEpisode(episode_listing[selected].id);
    } catch (e) {
      abort(strings.error_episode_load + [e.message])
      return;
    }
    snd.playSFX({ name: "game_start" });
    changeKeyHandler(undefined, false);
    snd.stopBgm(1500);
    console.log("game started");
  } else {
    t.activate(index,
      params.presentList[index] < 0 ? 
        (params.isMobile ? 2 : 0)
      : 1, "Player " + (index+1) + ", enter your name"
    );
  }
}
function getPlayerNames(){
  getNextPlayerName(0);
}
/**
 * The episode choice screen key handler.
 * @param {KeyboardEvent} event The event.
 */
function chooseEpisodeKeys(event) {
  var key, player;
  if (event.code !== undefined) {
    const id = sys(event);
    if (id < 16) { return; }
    key = id % 16;
    player = -(id - key) / 16;
  } else {
    key = event.detail.button;
    player = event.detail.index * 2 + +(event.detail.player2);
  }
  if (!params.presentList.includes(player)) { // not a present player
    return;
  } else {
    const buttons = document.getElementById("episode_carousel").children;
    var selected = getIndexOfSel(buttons);
    switch (key) {
      case keyName.up:
      case keyName.dUp:
        console.log("up");
        if (selected) {
          snd.playSFX({ name: "menu_move" });
          buttons[selected].classList.remove("sel");
          selected = (selected + buttons.length - 1) % buttons.length;
          console.log("new choice:", selected, buttons[selected]);
          buttons[selected].classList.add("sel");
        } else {
          snd.playSFX({ name: "menu_stuck" });
        }
        break;
      case keyName.down:
      case keyName.dDown:
        console.log("down");
        if ((selected + 1) % buttons.length) {
          snd.playSFX({ name: "menu_move" });
          buttons[selected].classList.remove("sel");
          selected = (selected + 1) % buttons.length;
          console.log("new choice:", selected, buttons[selected]);
          buttons[selected].classList.add("sel");
        } else {
          snd.playSFX({ name: "menu_stuck" });
        }
        break;
      case keyName.left:
      case keyName.dLeft:
        // back
        changeKeyHandler(undefined, false);
        snd.playSFX({ name: "menu_back" });
        snd.setExtraVolume(0.6);
        snd.setExtra2Volume(0);
        startSignup();
        break;
      case keyName.right:
      case keyName.dRight:
        getPlayerNames();
        break;
    }
  }
}
/**
 * Starts the episode choice screen, including
 * the episode selector carousel.
 */
function chooseEpisode() {
  document.body.className = "state_episode_list";
  var episodeCarousel = document.getElementById("episode_carousel");
  if (episodeCarousel.childElementCount) {
    // reset selection
    episodeCarousel.scrollTop = 0;
    episodeCarousel.querySelector(".sel").classList.remove("sel");
  } else {
    const summary = Object.keys(episode_listing);
    summary.forEach((key) => {
      const episode = episode_listing[key];
      const i = summary.indexOf(key);
      console.log("episode", episode, "i", i);
      var item = document.createElement("div");
      var marker = document.createElement("span");
      marker.classList = "marker";
      marker.innerText = (i + 1).toString();
      item.appendChild(marker);
      var title = document.createElement("span");
      title.innerHTML = episode.title;
      item.appendChild(title);
      episodeCarousel.append(item);
    });
  }
  episodeCarousel.firstElementChild.classList.add("sel");
  changeKeyHandler(chooseEpisodeKeys, false);
}
/**
 * Fetches episode data from the listing, if it hasn't been
 * loaded and stored before in the global variable
 * episode_listing.
 */
function getEpisodes() {
  changeKeyHandler(undefined, false);
  document.body.className = "state_episode";
  if (isEmptyObj(episode_listing)) {
    fetch(ROOT + 'episodes.json', {
      method: 'GET',
      headers: myHeaders,
      mode: 'cors'
    }).then(response => {
      if (response.ok) {
        return response.json();
      } else {
        abort(["Error on fetching episode list."]);
        return;
      }
    }).catch(error => {
      console.log(error);
      abort(strings.error_episode_list);
    }).then(json => {
      episode_listing = json;
      console.log("Fetched /episodes.json", json);
      chooseEpisode();
    });
  } else {
    chooseEpisode();
  }
}
/**
 * The player signup screen key handler.
 * @param {KeyboardEvent} event The event.
 */
function signupKeys(event) {
  console.log("signupKeys()");

  console.log("Player", player, "Key", key, "pressed.");
  console.log("Players", params.players);
  console.log("PresentList", params.presentList);

  event.stopPropagation();
  var key, player;
  if (event.code !== undefined) {
    const id = sys(event);
    key = id % 16;
    player = -(id - key) / 16;
  } else {
    key = event.detail.button;
    player = event.detail.index * 2 + +(event.detail.player2);
  }
  // unused: var cards = document.getElementById("signup_box").getElementsByClassName("signup");
  var box = document.getElementById("signup_box");
  switch (key) {
    case keyName.up:
    case keyName.dUp:
      // register
      if (!params.presentList.includes(player)) {
        snd.playSFX({ name: "menu_signin" });
        params.players[player] = {
          id: player,
          name: ""
        };
        params.presentList.push(player);
        /* Make a new entry for the signup box */
        var newItem = document.createElement("div");
        newItem.classList = "signup_item";
        var icon = document.createElement("img");
        icon.classList = "signup_icon move";
        icon.src = "data/icon_" + (
          player < 0 ? (
            params.isMobile ? "touch" : "kb"
          ) : configs[event.detail.index].shared ? (
            event.detail.player2 ? "left" : "right"
          ) : configs[event.detail.index].noAxes ? "retro" : "solo"
        ) + ".svg";

        newItem.appendChild(icon);
        var label = document.createElement("span");
        label.classList = "signup_label_text";
        label.innerText = 
        player < 0 ? "Keyboard " + (-player) : "Gamepad " + (event.detail.index + 1) + (
          configs[event.detail.index].shared ? (
            event.detail.player2 ? "Left" : "Right"
          ) : ""
        );
        newItem.appendChild(label);
        box.appendChild(newItem);
        snd.setExtraVolume(0.6);
        return;
      } else {
        break;
      }
    case keyName.down:
    case keyName.dDown:
      // unregister
      if (params.presentList.includes(player)) {
        snd.playSFX({ name: "menu_signout" });
        params.players[player] = undefined;
        box.removeChild(box.children[params.presentList.indexOf(player)]);
        params.presentList.splice(params.presentList.indexOf(player), 1);
        if (params.presentList.length === 0) {
          snd.setExtraVolume(0);
        }
      }
      return;
    case keyName.left:
    case keyName.dLeft:
      // back
      changeKeyHandler(undefined, false);
      snd.playSFX({ name: "menu_back" });
      snd.stopBgm(400);
      initApp();
      return;
    case keyName.right:
    case keyName.dRight:
      // start
      if (params.presentList.length) {
        // somebody signed up
        snd.playSFX({ name: "menu_confirm" });
        changeKeyHandler(undefined, false);
        snd.setExtra2Volume(0.6);
        snd.setExtraVolume(0);
        getPlayerNames();
      } else {
        // nobody signed up
        snd.playSFX({ name: "menu_fail" });
        activateModal(strings.error_nobody.concat("[→]" + strings.sys_dismiss));
        setTimeout(function () { changeKeyHandler(signupKeys, false) }, 1000);
      }
      return;
  }
  /* shake the icon */
  if (params.presentList.includes(player)) {
    var item = box.children[params.presentList.indexOf(player)].querySelector("signup_icon");
    item.removeClass("move");
    setTimeout(()=>item.addClass("move"), 1);
  }
}

/**
 * Used in the settings screen key handler and setup.
 * Will need to be removed when exiting.
 */
function queueVoxSettings() {
  console.log("queueVoxSettings");
  snd.loadQueueVox(
    [
      "intro_01"
    , "intro_02"
    , "intro_03"
    , "intro_04"
    , "intro_05"
    , "intro_06"
    , "intro_07"
    , "intro_08"
    , "intro_09"
    , "intro_bagel"
    ]
  );
  snd.playFirstVox();
}

function listScroll(container, target){
  var targetRect = target.getBoundingClientRect();
  var containerRect = container.getBoundingClientRect();
  if (targetRect.top < containerRect.top) {
    console.log("listScroll() scrolling up", targetRect.top, containerRect.top);
    container.scrollBy(0, targetRect.top - containerRect.top - containerRect.height / 8);
  } else if (targetRect.bottom > containerRect.bottom) {
    console.log("listScroll() scrolling down", targetRect.bottom, containerRect.bottom);
    container.scrollBy(0, targetRect.bottom - containerRect.bottom + containerRect.height / 8);
  }
}
/**
 * The settings screen key handler.
 * @param {KeyboardEvent} event The event.
 */
const configUnitOptions = ["SI", "SI_US", "US_SI", "US"];
const configCurrencyOptions = ["points", "dollars", "euro", "pounds", "yen", "rubbles", "Bitcoin"]
function settingKeys(event) {
  console.log("settingKeys()");
  event.stopPropagation();
  var key, player;
  if (event.code !== undefined) {
    const id = sys(event);
    key = id % 16;
    player = -(id - key) / 16;
  } else {
    key = event.detail.button;
    player = event.detail.index * 2 + +(event.detail.player2);
  }
  var optionCount = document.getElementById("setting_box").children.length;
  var selectedOption = getIndexOfSel(document.getElementById("setting_box").children);
  switch (key) {
    case keyName.up:
    case keyName.dUp:
      // move up
      snd.playSFX({ name: "menu_move" });
      document.getElementById("setting_box").querySelector(".setting_item.sel").classList.remove("sel");
      selectedOption = (optionCount + --selectedOption) % optionCount;
      document.getElementById("setting_box").querySelectorAll(".setting_item")[selectedOption].classList.add("sel");
      // keep scrolling up until new selected element is in view
      listScroll(document.getElementById("setting_box"), document.getElementById("setting_box").querySelector(".setting_item.sel"));
      break;
    case keyName.down:
    case keyName.dDown:
      // move down
      snd.playSFX({ name: "menu_move" });
      document.getElementById("setting_box").querySelector(".setting_item.sel").classList.remove("sel");
      selectedOption = ++selectedOption % optionCount;
      document.getElementById("setting_box").querySelectorAll(".setting_item")[selectedOption].classList.add("sel");
      // keep scrolling up until new selected element is in view
      listScroll(document.getElementById("setting_box"), document.getElementById("setting_box").querySelector(".setting_item.sel"));
      break;
    case keyName.left:
    case keyName.dLeft:
      // change option left
      switch (selectedOption) {
        case 0:
          if (snd.global_bgm_volume === 0) {
            snd.playSFX({ name: "menu_stuck" });
          } else {
            snd.playSFX({ name: "menu_move" });
            snd.adjustBgmVolume(-1 / 16, true);
            var setVolume = document.getElementById("setting_volume");
            var sliderWidth = document.querySelector(".setting_slider_base").clientWidth - document.querySelector(".setting_slider_knob").clientWidth;
            setVolume.querySelector(".setting_slider_highlight").style.left = sliderWidth * snd.global_bgm_volume;
            setVolume.querySelector(".setting_slider_knob").style.left = sliderWidth * snd.global_bgm_volume;
            setVolume.querySelector(".setting_slider_value").innerText = (snd.global_bgm_volume * 16).toString(10) + "/16";
          }
          break;
        case 1:
          if (snd.global_vox_volume === 0.5) {
            snd.playSFX({ name: "menu_stuck" });
          } else {
            snd.playSFX({ name: "menu_move" });
            snd.adjustVoxVolume(-1 / 16, true);
            var setVolume = document.getElementById("setting_volume_vox");
            var sliderWidth = document.querySelector(".setting_slider_base").clientWidth - document.querySelector(".setting_slider_knob").clientWidth;
            setVolume.querySelector(".setting_slider_highlight").style.left = sliderWidth * snd.global_vox_volume;
            setVolume.querySelector(".setting_slider_knob").style.left = sliderWidth * snd.global_vox_volume;
            setVolume.querySelector(".setting_slider_value").innerText = (snd.global_vox_volume * 16).toString(10) + "/16";
          }
          break;
        case 2:
          snd.playSFX({ name: "menu_move" });
          var items = document.getElementById("setting_units").querySelectorAll(".setting_option");
          var index = getIndexOfSel(items);
          items[index].classList.remove("sel");
          index = (configUnitOptions.length + --index) % configUnitOptions.length;
          items[index].classList.add("sel");
          units = configUnitOptions[index];
          break;
        case 3:
          snd.playSFX({ name: "menu_move" });
          var items = document.getElementById("setting_currency").querySelectorAll(".setting_option");
          var index = getIndexOfSel(items);
          items[index].classList.remove("sel");
          index = (configCurrencyOptions.length + --index) % configCurrencyOptions.length;
          items[index].classList.add("sel");
          formatName = configCurrencyOptions[index];
          break;
        case 5:
          changeKeyHandler(undefined, false);
          snd.playSFX({ name: "menu_back" });
          document.body.className = "";
          units = localStorage.getItem("units") || "SI";
          snd.global_bgm_volume = +(localStorage.getItem("bgmVolume")) || 1;
          formatName = localStorage.getItem("formatName") || "points";
          snd.stopBgm(400);
          snd.stopVox();
          initApp();
          break;
      }
      break;
    case keyName.right:
    case keyName.dRight:
      // change option right
      switch (selectedOption) {
        case 0:
          if (snd.global_bgm_volume === 1) {
            snd.playSFX({ name: "menu_stuck" });
          } else {
            snd.playSFX({ name: "menu_move" });
            snd.adjustBgmVolume(1 / 16, true);
            var setVolume = document.getElementById("setting_volume");
            var sliderWidth = document.querySelector(".setting_slider_base").clientWidth - document.querySelector(".setting_slider_knob").clientWidth;
            setVolume.querySelector(".setting_slider_highlight").style.left = sliderWidth * snd.global_bgm_volume;
            setVolume.querySelector(".setting_slider_knob").style.left = sliderWidth * snd.global_bgm_volume;
            setVolume.querySelector(".setting_slider_value").innerText = (snd.global_bgm_volume * 16).toString(10) + "/16";
          }
          break;
        case 1:
          if (snd.global_vox_volume === 1) {
            snd.playSFX({ name: "menu_stuck" });
          } else {
            snd.playSFX({ name: "menu_move" });
            snd.adjustVoxVolume(1 / 16, true);
            var setVolume = document.getElementById("setting_volume_vox");
            var sliderWidth = document.querySelector(".setting_slider_base").clientWidth - document.querySelector(".setting_slider_knob").clientWidth;
            setVolume.querySelector(".setting_slider_highlight").style.left = sliderWidth * snd.global_vox_volume;
            setVolume.querySelector(".setting_slider_knob").style.left = sliderWidth * snd.global_vox_volume;
            setVolume.querySelector(".setting_slider_value").innerText = (snd.global_vox_volume * 16).toString(10) + "/16";
          }
          break;
        case 2:
          snd.playSFX({ name: "menu_move" });
          var items = document.getElementById("setting_units").querySelectorAll(".setting_option");
          var index = getIndexOfSel(items);
          items[index].classList.remove("sel");
          index = ++index % configUnitOptions.length;
          items[index].classList.add("sel");
          units = configUnitOptions[index];
          break;
        case 3:
          snd.playSFX({ name: "menu_move" });
          var items = document.getElementById("setting_currency").querySelectorAll(".setting_option");
          var index = getIndexOfSel(items);
          items[index].classList.remove("sel");
          index = ++index % configCurrencyOptions.length;
          items[index].classList.add("sel");
          formatName = configCurrencyOptions[index];
          break;
        case 4:
          changeKeyHandler(undefined, false);
          snd.playSFX({ name: "menu_back" });
          snd.stopBgm(400);
          initApp();
          break;
        case 5:
          changeKeyHandler(undefined, false);
          document.body.className = "";
          snd.playSFX({ name: "menu_back" });
          localStorage.setItem("units", units);
          localStorage.setItem("bgmVolume", snd.global_bgm_volume);
          localStorage.setItem("voxVolume", snd.global_vox_volume);
          localStorage.setItem("formatName", formatName);
          snd.stopBgm(400);
          snd.stopVox();
          document.removeEventListener("allVoxEnd", queueVoxSettings);
          initApp();
          break;
      }
  }
  console.log("Player", player, "Key", key, "pressed.");
  console.log("Players", params.players);
  console.log("PresentList", params.presentList);
}
/**
 * Starts the signup screen.
 */
function startSignup() {
  changeKeyHandler(undefined, false);
  // init elements
  document.body.className = "state_signup";
  Array.prototype.forEach.call(
    document.getElementById("s_signup").getElementsByClassName("on"),
    el => {
      el.classList.remove("on");
    }
  );
  // init signup data
  params.players = [];
  params.presentList = [];
  console.log(params.players);
  // set key handler and music with a delay
  if (snd.bgm_sound !== snd.bgm_data["signup_base"]) {
    snd.stopBgm(BGM_DELAY);
  }
  setTimeout(function () {
    snd.playBgm(
      { name: "signup_base" },
      { name: "signup_extra" },
      { name: "signup_extra2" }
    );
    changeKeyHandler(signupKeys, false);
  }, BGM_DELAY);
}

/**
 * Starts the setting screen.
 */
function startSetting() {
  changeKeyHandler(undefined, false);
  // init elements
  document.body.className = "state_setting";
  // set key handler and music with a delay
  snd.stopBgm(BGM_DELAY);
  loadPage("setting").then(() => {
    // other strings
    const setUnits = document.getElementById("setting_units");

    setTimeout(function () {
      // Once the page loads, highlight the selected options and stuff
      var sliderWidth = document.querySelector(".setting_slider_base").clientWidth - document.querySelector(".setting_slider_knob").clientWidth;
      console.log("sliderWidth", sliderWidth);
      
      var setVolume = document.getElementById("setting_volume");
      setVolume.querySelector(".setting_slider_highlight").style.left = sliderWidth * snd.global_bgm_volume;
      setVolume.querySelector(".setting_slider_knob").style.left = sliderWidth * snd.global_bgm_volume;
      setVolume.querySelector(".setting_slider_value").innerText = (snd.global_bgm_volume * 16).toString(10) + "/16";
      
      var setUnits = document.getElementById("setting_units");
      console.log(setUnits.querySelectorAll(".setting_option"));
      setUnits.querySelectorAll(".setting_option")[
        (configUnitOptions.indexOf(units) + 1 || 1) - 1
      ].classList.add("sel");
      
      var setCurrency = document.getElementById("setting_currency");
      setCurrency.querySelectorAll(".setting_option")[
        (configUnitOptions.indexOf(formatName) + 1 || 1) - 1
      ].classList.add("sel");

      snd.playBgm(
        { name: "options" },
        undefined,
        undefined
      );
      queueVoxSettings();
      document.addEventListener("allVoxEnd", queueVoxSettings);
      changeKeyHandler(settingKeys, false);
    }, BGM_DELAY);
  });

}
/**
 * The title screen key handler.
 * @param {KeyboardEvent} event The event.
 */
function titleKeys(event) {
  hideVKButton()
  console.log("titleKeys");
  event.stopPropagation();
  if (document.querySelector("#modal.active")) {
    console.log("modal is active");
    return;
  }
  var key;
  if (event.code !== undefined) {
    const id = sys(event);
    key = id % 16;
  } else {
    key = event.detail.button;
  }
  var buttons = document.getElementById("title_option_box").children;
  var selected = getIndexOfSel(buttons);
  if (selected == -1) {
    // error
    activateModal(strings.error_menu_item.concat("[→]" + strings.sys_dismiss));
    buttons[0].classList.add("sel");
  }
  // branch by key
  switch (key) {
    case keyName.up:
    case keyName.dUp:
      console.log("up");
      snd.playSFX({ name: "menu_move" });
      buttons[selected].classList.remove("sel");
      selected = (selected + buttons.length - 1) % buttons.length;
      buttons[selected].classList.add("sel");
      break;
    case keyName.down:
    case keyName.dDown:
      console.log("down");
      snd.playSFX({ name: "menu_move" });
      buttons[selected].classList.remove("sel");
      selected = (selected + 1) % buttons.length;
      buttons[selected].classList.add("sel");
      break;
    case keyName.right:
    case keyName.dRight:
      snd.playSFX({ name: "menu_confirm" });
      switch (selected) {
        case 0:
          snd.stopBgm(300);
          startSignup();
          break;
        case 1:
          snd.stopBgm(300);
          startSetting();
          break;
        case 2:
          activateModal(strings.modal_controls.concat("[→]" + strings.sys_dismiss));
          break;
        case 3:
          activateModal(strings.modal_about.concat("[→]" + strings.sys_dismiss));
          break;
        case 4:
          snd.stopBgm(1000);
          activateModal(strings.modal_credits);
          break;
        case 5:
          snd.stopBgm(1000);
          window.open("https://japanyoshi.github.io/social.html", "_blank");
          activateModal([
            strings.modal_popup[0],
            strings.modal_popup[1] + (window.location.origin === "japanyoshi.github.io" ? window.location.origin : "2gd4.me") + modal_popup[2],
            "[→]" + strings.sys_dismiss
          ]);
          break;
      }
    default:
      console.log("Key name " + key + " was not found.");
  }
  console.log("key: ", key);
  return;
}
/**
 * Called when the game is initialized or when the player
 * returns to the menu.
 */
function initApp() {
  console.log("initApp() called");
  document.body.className = "state_title";
  loadPage("menu").then(() => {
    // other strings
    buttons = document.getElementById("title_option_box").querySelectorAll(".button");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].innerText = strings.title_option_box[i];
      console.log(strings.title_option_box[i]);
    }
    document.getElementById("title_salty").querySelector("span").innerText = strings.game_title[0];
    document.getElementById("title_dropcap").innerText = strings.game_title[1];
    document.getElementById("title_rest").innerText = strings.game_title[2];
    document.getElementById("title_subtitle").innerText = strings.game_title[3];
    document.getElementById("title_box").querySelector("h1").innerText = strings.game_title[3];

    document.getElementById("modal").querySelector(".scroll_tip").innerHTML = formatIcons(strings.sys_scroll);

    var parent = document.querySelectorAll(".floating_back_button");
    for (var i = 0; i < parent.length; i++) {
      parent[i].querySelector("span").innerText = strings.sys_cancel;
    }
    parent = document.querySelectorAll(".floating_func_button");
    for (var i = 0; i < parent.length; i++) {
      parent[i].querySelector("span").innerText = strings.sys_start;
    }

  });

  changeKeyHandler(titleKeys, false);
  setTimeout(
    function () {
      snd.playBgm({ name: "placeholder" }, undefined, undefined);
    }, BGM_DELAY
  );
}
/**
 * The virtual (touch) keypad click functions.
 */
function keyListener0() {
  document.dispatchEvent(new KeyboardEvent("keydown", { keyCode: 81, code: "KeyQ" }));
}
function keyListener1() {
  document.dispatchEvent(new KeyboardEvent("keydown", { keyCode: 87, code: "KeyW" }));
}
function keyListener2() {
  document.dispatchEvent(new KeyboardEvent("keydown", { keyCode: 69, code: "KeyE" }));
}
function keyListener3() {
  document.dispatchEvent(new KeyboardEvent("keydown", { keyCode: 65, code: "KeyA" }));
}
function keyListener4() {
  document.dispatchEvent(new KeyboardEvent("keydown", { keyCode: 83, code: "KeyS" }));
}
function keyListener5() {
  document.dispatchEvent(new KeyboardEvent("keydown", { keyCode: 68, code: "KeyD" }));
}
function keyListener6() {
  document.dispatchEvent(new KeyboardEvent("keydown", { keyCode: 27, code: "Esc" }));
}
/**
 * Enables virtual (touch) keypad.
 * Unlike the gamepads, touch keypads emulate key press events directly.
 */
function enableVK() {
  params.isMobile = true;
  document.getElementById("vk_button").removeAttribute("class");
  document.getElementById("vk_container").classList.add("active");
  document.getElementById("screen").classList.add("vk_is_active");
  document.getElementById("modal").classList.add("vk_is_active");
  document.getElementById("gamepad_config").classList.add("vk_is_active");
  const _key_el = document.getElementById("vk_container").querySelectorAll(".vk_key");
}
/**
 * Disables the virtual (touch) keypad activation button.
 */
function hideVKButton() {
  document.getElementById("vk_button").removeAttribute("class");
}
splashTimeout = undefined;
function advanceSplashScreen() {
  if (!splashTimeout) return;
  if (document.getElementById("splash_screen").classList.contains("gone")) {
    clearTimeout(splashTimeout);
    delete splashTimeout;
    document.getElementById("splash_screen_2").classList.add("gone");
    changeKeyHandler(undefined, false);
    activateModal(strings.modal_first.concat("[→]" + strings.sys_start));
    initApp();
  } else {
    document.getElementById("splash_screen").classList.add("gone");
    changeKeyHandler(undefined, false);
    clearTimeout(splashTimeout);
    splashTimeout = setTimeout(function () {
      advanceSplashScreen();
    }, 3000);
    setTimeout(() => { changeKeyHandler(splashScreenHandler, false) }, 1000);
  }
}
function splashScreenHandler(e) {
  // on any key press, advance the splash screen
  advanceSplashScreen();
}
document.addEventListener("DOMContentLoaded", function () {
  // prepare the "virtual keyboard"
  document.getElementById("vk_button").classList.add("active");
  document.getElementById("vk_button").addEventListener("click", enableVK);
  // vk button should disappear if the user presses a key

  // first time boot
  loadStrings(LANG).then(result => {
    console.log(result);
    strings = result;
    if (strings === undefined) {
      throw new Error("Fuck you, asynchronous code!");
    } else {
      console.log("strings seems to be loaded:", strings.modal_first);
    }
    /**
     * unrelated code from here on out.
     * i don't know how to make the program wait for
     * strings to load in a better way.
     * race conditions, you can kiss my ass
     */
    floorRem();

    /* splash screen */
    document.getElementById("splash_screen_top_text").innerText =
      strings.splash_screen_tagline[
      Math.floor(Math.random() * strings.splash_screen_tagline.length)
      ]; // choose random line
    document.getElementById("splash_screen_bottom_text").innerText =
      strings.splash_screen_name;
    document.getElementById("splash_screen_2_top_text").innerText =
      strings.splash_screen_tagline_2[
      Math.floor(Math.random() * strings.splash_screen_tagline_2.length)
      ]; // choose random line
    document.getElementById("splash_screen_2_bottom_text").innerText =
      strings.splash_screen_name_2;
    document.addEventListener("keydown", keyShiv, true);
    document.addEventListener("controllerPress", buttonShiv, true);

    setTimeout(() => { changeKeyHandler(splashScreenHandler, false) }, 1000);
    splashTimeout = setTimeout(function () {
      advanceSplashScreen();
    }, 3000);
  });
}, true);
