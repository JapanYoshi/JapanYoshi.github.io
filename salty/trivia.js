var params = {};
var strings = {};
var episode_listing = {};
var bgm_data = {};
var sfx_data = {};
var bgm_sound;
var bgm_sound_extra;
var bgm_sound_extra2;
var currentEventListener = undefined;
var currentEventListenerModal = undefined;

/**
 * Loads strings to memory via a request.
 */
fetch("strings.json", {
  method: 'GET',
  headers: myHeaders,
  mode: 'cors'
}).then(response => {
  if (response.ok) {
    console.log("response:", response.body);
    return response.json();
  } else {
    alert("Error fetching strings.");
    return;
  }
}).catch(error => {
  console.log(error);
  abort("Error fetching strings.");
  return;
});

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
;}
window.addEventListener("resize", floorRem);

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
function keyShiv(event){
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
 * Given a NodeList (returned by doing HTMLNode.childNodes)
 * finds which of them has the class "sel". There should
 * only be one item with that class at any given moment.
 * If there is no such Node, returns -1.
 * @param {NodeList} buttons The NodeList of "buttons" (or
 * oher elements) to be checked.
 * @return {number} The index of the element with class
 * "sel", or -1 if no such element is found.
 */
function getIndexOfSel(buttons){
  var selected = -1;
  for (var i = 0; i < buttons.length; i++) {
    if (buttons[i].classList.contains("sel")) {
      selected = i;
      break;
    }
  }
  return selected;
}
// sound effects should be played willy nilly, but one copy per sound effect

const MUSIC_DELAY = 400;
const MAX_PLAYER_COUNT = 8;
var _ROOT = "https://japanyoshi.github.io/salty/";
if ((window.location.href).charAt(0) == "f") {
  // protocol is "file", therefore it's a local test
  _ROOT = "https://cors-anywhere.herokuapp.com/" + _ROOT;
} else if ((window.location.href).charAt(8) == "2") {
  // future-proof if I decide not to renew the 2gd4.me domain
  _ROOT = "https://2gd4.me/salty/";
}
const ROOT = _ROOT;
delete _ROOT;
/**
 * Loads the contents of the specified HTML file into the #screen element.
 * @param {string} name Name of the page (minus .html).
 */
const loadPage = (name) => {
  document.body.classList = "";
  setTimeout(function(){
    const screen = document.getElementById("screen");
    // delete all children
    while (screen.lastChild) {
      screen.removeChild(screen.lastChild);
    }
    // request page
    var xhr= new XMLHttpRequest();
    xhr.open('GET', name + '.html', true);
    xhr.onreadystatechange = function() {
      if (this.readyState !== 4) return;
      if (this.status !== 200) {
        window.alert("Error on loading page " + name + ". Please see the browser console for details.");
      }; // or whatever error handling you want
      screen.innerHTML= this.responseText;
    };
    xhr.send();
  }, 1000);
}
/**
 * This part sets up music and sound effects for Howler.js.
 */
const BGM_PRELOAD_COUNT = 4;
const bgm_names = [
  "placeholder", // menu
  "signup_base",
  "signup_extra",
  "signup_extra2"
];
const SFX_PRELOAD_COUNT = 8;
const sfx_names = [
  "menu_move", // menu
  "menu_confirm",
  "menu_back",
  "menu_signin",
  "menu_signout",
  "menu_stuck",
  "game_start",
  "menu_fail"
];
/**
 * This part loads the music onto the global variable bgm_data.
 */
for (var i = 0; i < bgm_names.length; i++) {
  var name = bgm_names[i]
  var sound = new Howl({
    src: [
      ROOT + "audio/music/" + name + ".ogg"
    ],
    autoplay: false,
    loop: true,
    preload: (i < BGM_PRELOAD_COUNT),
    pool: 1,
    onload: function(){
      console.log("Music " + name + " loaded");
    },
    onloaderror: function(){
      console.log("Error loading music " + name);
    },
    onplay: function(){
      console.log("Started playing music " + name);
    },
    onplayerror: function(){
      console.log("Error playing music " + name);
    },
    onstop: function(){
      console.log("music " + name + " stopped");
    },
    onend: function(){
      console.log("music " + name + " finished");
    }
  });
  bgm_data[name] = sound;
}
/**
 * This part loads sound effects into the variable sfx_data.
 */
for (var i = 0; i < sfx_names.length; i++) {
  name = sfx_names[i];
  var sound = new Howl({
    src: [
      ROOT + "audio/sfx/" + name + ".ogg"
    ],
    autoplay: false,
    loop: false,
    preload: (i < SFX_PRELOAD_COUNT),
    pool: 1,
    onload: function(){
      console.log("SFX " + name + " loaded");
    },
    onloaderror: function(){
      console.log("Error loading SFX " + name);
    },
    onplay: function(){
      console.log("Playing SFX " + name);
    },
    onplayerror: function(){
      console.log("Error playing SFX " + name);
    },
    onend: function(){
      console.log("SFX " + name + " finished");
    }
  });
  sfx_data[name] = sound;
}
/**
 * Pauses or unpauses the music.
 * @param {boolean} state To pause, pass true. To unpause,
 * pass false.
 */
function pauseMusic(state) {
  if (state) {
    if (bgm_sound){
      bgm_sound.pause();
    }
    if (bgm_sound_extra) {
      bgm_sound_extra.pause();
    }
    if (bgm_sound_extra2) {
      bgm_sound_extra2.pause();
    }
  } else {
    if (bgm_sound){
      bgm_sound.pause();
    }
    if (bgm_sound_extra) {
      bgm_sound_extra.pause();
    }
    if (bgm_sound_extra2) {
      bgm_sound_extra2.pause();
    }
  }
}
/**
 * Optionally fades the music, then definitely stops it.
 * @param {number} fade_ms Milliseconds to fade for. Pass
 * 0 to disable fading.
 */
function stopMusic(fade_ms) {
  console.log("stopMusic objects are", bgm_sound, bgm_sound_extra, bgm_sound_extra2);
  var c0 = bgm_sound;
  var c1 = bgm_sound_extra;
  var c2 = bgm_sound_extra2;
  if (!fade_ms) {
    console.log("stopMusic control flow", 4);
    if (c0){
      console.log("stopMusic control flow", 5);
      c0.stop();
    }
    if (c1) {
      console.log("stopMusic control flow", 6);
      c1.stop();
    }
    if (c2) {
      console.log("stopMusic control flow", 7);
      c2.stop();
    }
  } else {
    console.log("stopMusic control flow", 0);
    if (c0){
      console.log("stopMusic control flow", 1);
      c0.once("fade", () => {
        c0.stop();
      })
      c0.fade(c0.volume(), 0, fade_ms);
    }
    if (c1) {
      console.log("stopMusic control flow", 2);
      c1.once("fade", () => {
        c1.stop();
      })
      c1.fade(c1.volume(), 0, fade_ms);
    }
    if (c2) {
      console.log("stopMusic control flow", 3);
      c2.once("fade", () => {
        c2.stop();
      })
      c2.fade(c2.volume(), 0, fade_ms).stop();
    }
  }
}
/**
 * Plays background music.
 * The music is specified by an object:
 * * name - The filename looked up in bgm_data.
 * * vol - the initial volume from 0 to 1.
 * Background music is made of up to 3 simultaneous tracks,
 * which enables dynamically changing background music.
 * You can pass undefined to disable those extra tracks.
 * (In fact, you will need to pass undefined to at least one
 * of bgmExtra and bgmExtra2 most of the time.)
 * @param {Object} bgm Name of track 1. vol defaults to 0.8.
 * @param {Object} bgmExtra Name of track 2. vol defaults
 * to 0.
 * @param {Object} bgmExtra2 Name of track 3. vol defaults
 * to 0.
 */
function playMusic(bgm, bgmExtra, bgmExtra2){
  // Trying to play music while another music is playing
  // causes an error, so we want to stop the music if it's
  // playing, before we play our new one.
  console.log(bgm_sound, bgm_sound_extra, bgm_sound_extra2);
  console.log("control flow", 0);
  if (
    (bgm_sound        && bgm_sound.playing()       ) ||
    (bgm_sound_extra  && bgm_sound_extra.playing() ) ||
    (bgm_sound_extra2 && bgm_sound_extra2.playing())
  ) {
    console.log("control flow", 1);
    stopMusic(0);
  }
  if (!bgm.vol && bgm.vol !== 0) {
    bgm.vol = 0.8;
    console.log("control flow", 2);
  }
  // set up
  bgm_sound = bgm_data[bgm.name];
  bgm_sound.volume(bgm.vol);
  if (bgmExtra) {
    console.log("control flow", 3);
    if (!bgmExtra.vol) {
      bgmExtra.vol = 0;
      console.log("control flow", 4);
    }
    bgm_sound_extra = bgm_data[bgmExtra.name];
    bgm_sound_extra.volume(bgmExtra.vol);
    if (bgmExtra2) {
      console.log("control flow", 5);
      if (!bgmExtra2.vol) {
        bgmExtra2.vol = 0;
        console.log("control flow", 6);
      }
      bgm_sound_extra2 = bgm_data[bgmExtra2.name];
      bgm_sound_extra2.volume(bgmExtra2.vol);
    } else {
      console.log("control flow", 7);
      bgm_sound_extra = undefined;
    }
  } else {
    console.log("control flow", 8);
    bgm_sound_extra = undefined;
    bgm_sound_extra2 = undefined;
  }
  console.log(bgm_sound, bgm_sound_extra, bgm_sound_extra2);
  // play them
  if (bgm_sound_extra2) {
    console.log("control flow", 9);
    bgm_sound_extra2.once("stop", function(){
      bgm_sound_extra2.play();
    })
    bgm_sound_extra.once("stop", function(){
      bgm_sound_extra.play();
    })
    bgm_sound.once("stop", function(){
      bgm_sound.play();
    })
    bgm_sound.stop();
    bgm_sound_extra.stop();
    bgm_sound_extra2.stop();
  } else if (bgm_sound_extra) {
    console.log("control flow", 10);
    bgm_sound_extra.once("stop", function(){
      bgm_sound_extra.play();
    })
    bgm_sound.once("stop", function(){
      bgm_sound.play();
    })
    bgm_sound.stop();
    bgm_sound_extra.stop();
  } else {
    console.log("control flow", 11);
    bgm_sound.once("stop", function(){
      bgm_sound.play();
    })
    bgm_sound.stop();
  }
}
/**
 * 
 * @param {number} vol Volume to set it to from 0 to 1.
 */
function setExtraVolume(vol) {
  if (!bgm_sound_extra) {
    return
  }
  bgm_sound_extra.fade(bgm_sound_extra.volume(), vol, 500);
}
function setExtra2Volume(vol) {
  if (!bgm_sound_extra2) {
    return
  }
  bgm_sound_extra2.fade(bgm_sound_extra2.volume(), vol, 500);
}

/**
 * Plays a sound effect.
 * The sound effect is specified by an object:
 * * name: the filename, which is looked up in the global
 * variable sfx_data.
 * * vol: the volume at which to play this at. If absent,
 * does not change the volume.
 * @param {object} sfx Object specifying the sound effect.
 */
function playSFX(sfx) {
  if (sfx_data[sfx.name]) {
    sfx_data[sfx.name].stop();
    if (sfx.vol) {
      sfx_data[sfx.name].volume(sfx.vol);
    }
    sfx_data[sfx.name].play();
  } else {
    console.log("playSFX error: the sound effect " + sfx + " does not exist.");
  }
}
/**
 * end howler.js setup stuff
 */

const KEY_CONFIG = [
  [81, 87, 69, 65, 83, 68],
  [70, 71, 72, 86, 66, 78],
  [85, 73, 79, 74, 75, 76],
  [103, 104, 105, 100, 101, 102]
];
/**
 * Converts the key code into one value representing which
 * button of which player was pressed.
 * Each player adds 64 to the ID, leaving each player as
 * many buttons.
 * (64 may have been excessive, but it's better to
 * overshoot it than undershoot it!)
 * Uses the global constant KEY_CONFIG to reference the
 * key code against.
 * @param {number} keycode The key code of the keyDown event,
 * gotten from event.keyCode (mind the caps).
 * @return {number}
 */
function sys(keycode) {
  // Player numbers go from 1 to 4 (or 8)
  // Button numbers go from 0 to 7
  // 0 - pause
  // 1 - northwest
  // 2 - north
  // 3 - northeast
  // 4 - west
  // 5 - south
  // 6 - east
  // 7 - unused
  switch (keycode) {
    case 27: // esc
      return 1;
    case 32: // space
      return 2;
    case 13: // return
      return 6;
    default:
      for (var i = 0; i < KEY_CONFIG.length; i++) {
        const result = KEY_CONFIG[i].indexOf(keycode);
        if (result !== -1) {
          return (i + 1) * 64 + result + 1;
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
 * @param {keyDownEvent} event The event.
 */
function modalKeys(event) {
  console.log("modalKeys");
  event.stopPropagation();
  var keyCode = event.keyCode;
  if (!keyCode) {
    window.alert("event.keyCode failed");
    return;
  }
  var box = document.getElementById("modal").getElementsByClassName("modal_box")[0];
  var screenHeight = document.getElementById("screen").scrollHeight;
  console.log("screenHeight =", screenHeight);
  switch (sys(keyCode) % 64) {
    case 2:
      console.log("Up was pressed. Scrolling px:", screenHeight / -8);
      playSFX({name: "menu_move"});
      box.scrollBy(0, screenHeight / -8);
      break;
    case 5:
      console.log("Down was pressed. Scrolling px:", screenHeight / 8);
      playSFX({name: "menu_move"});
      box.scrollBy(0, screenHeight / 8);
      break;
    case 6:
      changeKeyHandler(undefined, true);
      playSFX({name: "menu_confirm"});
      setTimeout(function(){
        // give time for the title screen to process that the modal is still active
        document.getElementById("modal").classList.remove("active");
      }, 10);
      break;
  }
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
  }
  content.scrollTo(0, 0);
  setTimeout(function(){
    changeKeyHandler(modalKeys, true);
    console.log("Modal key handler complete.");
  }, 500);
  modal.classList.add("active");
  console.log("Modal complete");
}
/**
 * The fatal error modal key handler.
 * @param {keyDownEvent} event The event.
 */
function abortModalKeys(event) {
  event.stopPropagation();
  if (sys(event.keyCode) % 64 === 6) {
    changeKeyHandler(undefined, true);
    playSFX({name: "menu_confirm"});
    document.getElementById("modal").classList.remove("active");
    document.body.className = "";
    setTimeout(initApp, 2000);
    console.log("Finished abortModalKeys");
  }
}
/**
 * Like activateModal, but aborts the game and quits to the
 * title screen.
 * @param {Array<string>} text cf. activateModal()
 */
function abort(text) {
  stopMusic(0);
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
  setTimeout(function(){
    changeKeyHandler(abortModalKeys, true);
    console.log("Modal key handler complete.");
  }, 500);
  modal.classList.add("active");
  console.log("Modal complete");
}
/**
 * Starts the episode!
 */
function startEpisode(){
  loadPage("game");
}
/**
 * Retrieves the data for the specified episode ID.
 * It will be stored in the global variable episode_data.
 * @param {string} filename The filename. This must be
 * in the directory /q/.
 */
function loadEpisode(filename){
  document.body.className = "state_loading_episode";
  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'text/json');
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
/**
 * The episode choice screen key handler.
 * @param {keyDownEvent} event The event.
 */
function chooseEpisodeKeys(event) {
  const id = sys(event.keyCode);
  const key = id % 64;
  const player = (id - key) / 64;
  console.log("player", player, "key", key, "pressed");
  if (
    !player // player 0 means it's not a game key
    || !(params.players[player-1].present) // not a present player
  ){
    return;
  } else {
    const buttons = document.getElementById("episode_carousel").childNodes;
    var selected = getIndexOfSel(buttons);
    switch (key) {
      case 2:
        console.log("up");
        if (selected) {
          playSFX({name: "menu_move"});
          buttons[selected].classList.remove("sel");
          selected = (selected + buttons.length - 1) % buttons.length;
          console.log("new choice:", selected, buttons[selected]);
          buttons[selected].classList.add("sel");
        } else {
          playSFX({name: "menu_stuck"});
        }
        break;
      case 5:
        console.log("down");
        if ((selected + 1) % buttons.length) {
          playSFX({name: "menu_move"});
          buttons[selected].classList.remove("sel");
          selected = (selected + 1) % buttons.length;
          console.log("new choice:", selected, buttons[selected]);
          buttons[selected].classList.add("sel");
        } else {
          playSFX({name: "menu_stuck"});
        }
        break;
      case 4:
        // back
        changeKeyHandler(undefined, false);
        playSFX({name: "menu_back"});
        setExtraVolume(0.6);
        setExtra2Volume(0);
        startSignup();
        break;
      case 6:
        // start
        var playerCount = 0
        for (var i = 0; i < params.players.length; i++) {
          if (params.players[i].present) {
            playerCount++;
          }
        }
        if (playerCount) {
          // somebody signed up
          try {
            loadEpisode(episode_listing[selected].id);
          } catch (e) {
            abort(strings.error_episode_load + [e.message])
            break;
          }
          playSFX({name: "game_start"});
          changeKeyHandler(undefined, false);
          stopMusic(1500);
          console.log("game started");
        } else {
          // nobody signed up
          playSFX({name: "menu_fail"});
          activateModal(strings.error_nobody);
          setTimeout(function(){changeKeyHandler(signupKeys, false)}, 1000);
        }
        break;
    }
  }
}
/**
 * Starts the episode choice screen, including
 * the episode selector carousel.
 */
function chooseEpisode(){
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
      marker.innerText = (i+1).toString();
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
function getEpisodes(){
  changeKeyHandler(undefined, false);
  document.body.className = "state_episode";
  if (isEmptyObj(episode_listing)) {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'text/json');
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
 * @param {keyDownEvent} event The event.
 */
function signupKeys(event){
  console.log("signupKeys()");
  event.stopPropagation();
  var keyCode = event.keyCode;
  if (!keyCode) {
    window.alert("event.keyCode failed");
    return;
  }
  const id = sys(keyCode);
  const key = id % 64;
  const player = (id - key)/64;
  console.log("Player", player, "Key", key, "pressed.");
  var cards = document.getElementById("signup_box").getElementsByClassName("signup");
  if (cards.length != 8) {alert("assertion failed: cards.length != 8")};
  switch (key) {
    case 5:
      // register
      if (!params.players[player - 1].present){
        playSFX({name: "menu_signin"});
        params.players[player - 1].present = true;
        cards[player - 1].classList.add("on");
        params.playerCount++;
        setExtraVolume(0.6);
      }
      break;
    case 2:
      // unregister
      if (params.players[player - 1].present){
        playSFX({name: "menu_signout"});
        params.players[player - 1].present = false;
        cards[player - 1].classList.remove("on");
        params.playerCount--;
        if (params.playerCount === 0) {
          setExtraVolume(0);
        }
      }
      break;
    case 4:
      // back
      changeKeyHandler(undefined, false);
      playSFX({name: "menu_back"});
      stopMusic(400);
      initApp();
      break;
    case 6:
      // start
      var playerCount = 0
      for (var i = 0; i < params.players.length; i++) {
        if (params.players[i].present) {
          playerCount++;
        }
      }
      if (playerCount) {
        // somebody signed up
        playSFX({name: "menu_confirm"});
        changeKeyHandler(undefined, false);
        setExtra2Volume(0.6);
        setExtraVolume(0);
        getEpisodes();
      } else {
        // nobody signed up
        playSFX({name: "menu_fail"});
        activateModal(strings.error_nobody);
        setTimeout(function(){changeKeyHandler(signupKeys, false)}, 1000);
      }
      break;
  }
}
/**
 * Starts the signup screen.
 */
function startSignup(){
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
  params_players_cache = [];
  const playerNames = ["Velocity", "Acceleration", "Jerk", "Snap", "Crackle", "Pop", "Lock", "Drop"];
  for (i = 0; i < MAX_PLAYER_COUNT; i++) {
    params_players_cache[i] = {
      present: false,
      name: playerNames[i]
    };
  }
  params.playerCount = 0;
  console.log(params_players_cache);
  params.players = params_players_cache;
  console.log(params.players);
  // set key handler and music with a delay
  setTimeout(function(){
    if (bgm_sound !== bgm_data["signup_base"]) {
      stopMusic(400);
      playMusic(
        {name: "signup_base", vol: 0.6},
        {name: "signup_extra", vol: 0},
        {name: "signup_extra2", vol: 0}
      );
    }
    changeKeyHandler(signupKeys, false)
  }, MUSIC_DELAY);
}
/**
 * The title screen key handler.
 * @param {keyDownEvent} event The event.
 */
function titleKeys(event) {
  console.log("titleKeys");
  event.stopPropagation();
  if (document.querySelector("#modal.active")) {
    console.log("modal is active");
    return;
  }
  var buttons = document.getElementById("title_option_box").children;
  var selected = getIndexOfSel(buttons);
  if (selected == -1) {
    // error
    activateModal(strings.error_menu_item);
    buttons[0].classList.add("sel");
  }
  // branch by key
  var input = sys(event.keyCode);
  switch (input % 64) {
    case 2:
      console.log("up");
      playSFX({name: "menu_move"});
      buttons[selected].classList.remove("sel");
      selected = (selected + buttons.length - 1) % buttons.length;
      buttons[selected].classList.add("sel");
      break;
    case 5:
      console.log("down");
      playSFX({name: "menu_move"});
      buttons[selected].classList.remove("sel");
      selected = (selected + 1) % buttons.length;
      buttons[selected].classList.add("sel");
      break;
    case 6:
      playSFX({name: "menu_confirm"});
      switch (selected) {
        case 0:
          stopMusic(300);
          startSignup();
          break;
        case 1:
          activateModal(string.modal_controls);
          break;
        case 2:
          activateModal(strings.modal_about);
          break;
        case 3:
          stopMusic(1000);
          activateModal(strings.modal_credits);
          break;
        case 4:
          stopMusic(1000);
          window.open("https://japanyoshi.github.io/social.html", "_blank");
          activateModal([
            "To show this page, please allow pop-ups.",
            "Alternatively, please go directly to " + (window.location.origin === "japanyoshi.github.io" ? window.location.origin : "2gd4.me") + "/social .",
            "[6] Dismiss"
          ]);
          break;
      }
      return;
  }
}
/**
 * Called when the game is initialized or when the player
 * returns to the menu.
 */
function initApp(){
  console.log("initApp() called");
  document.body.className = "state_title";
  changeKeyHandler(titleKeys, false);
  setTimeout(
    function(){
      playMusic({name: "placeholder"}, undefined, undefined);
    }, MUSIC_DELAY
  );
}
document.addEventListener("DOMContentLoaded", function(){
  // first time boot
  floorRem();
  loadPage("menu");
  setTimeout(function(){
    document.getElementById("splash_screen").classList = "gone";
    initApp();
    document.addEventListener("keydown", keyShiv, true);
    activateModal(strings.modal_first);
  }, 3000);
}, true);