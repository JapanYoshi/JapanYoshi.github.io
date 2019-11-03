var params = {}; // persistent data will be stored in here
var episode_listing = {};
var episode_data = {};
var bgm_data = {};
var sfx_data = {};
var bgm_sound;
var bgm_sound_extra;
var bgm_sound_extra2;
var currentEventListener = undefined;
var currentEventListenerModal = undefined;

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
}
const ROOT = _ROOT;
delete _ROOT;

/**
 * This part sets up music and sound effects for Howler.js.
 */
const bgm_names = [
  "placeholder", // menu
  "signup_base",
  "signup_extra",
  "signup_extra2",
  "answer_now", // game
  "reading_question_base",
  "reading_question_extra",
  "gibberish_base",
  "gibberish_extra"
];
const sfx_names = [
  "menu_move", // menu
  "menu_confirm",
  "menu_back",
  "menu_fail",
  "menu_signin",
  "menu_signout",
  "game_start",
  "option_correct", // ingame
  "option_highlight",
  "option_show",
  "option_wrong",
  "pause_enter",
  "pause_exit",
  "point_gain",
  "question_leave",
  "question_show",
  "time_up",
  "title_leave",
  "title_show"
];
/**
 * This part loads the music onto the global variable bgm_data.
 */
for (const name of bgm_names) {
  var sound = new Howl({
    src: [
      ROOT + "audio/music/" + name + ".ogg"
    ],
    autoplay: false,
    loop: true,
    preload: true,
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
for (const name of sfx_names) {
  var sound = new Howl({
    src: [
      ROOT + "audio/sfx/" + name + ".ogg"
    ],
    autoplay: false,
    loop: false,
    preload: true,
    pool: 1,
    onload: function(){
      console.log("SFX " + name + " loaded");
    },
    onloaderror: function(){
      console.log("Error loading SFX " + name);
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
    console.log("playing SFX: " + sfx.name);
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
  var box = document.getElementById("modal").getElementsByClassName("modal-box")[0];
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
  var content = modal.getElementsByClassName("modal-content")[0];
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
  console.log("height", modal.querySelector(".modal-box").clientHeight, modal.querySelector(".modal-box").clientHeight > modal.querySelector.scrollHeight ? "no scroll" : "scroll", content.scrollHeight);
  if (modal.querySelector(".modal-box").clientHeight < content.scrollHeight) {
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
  var content = modal.getElementsByClassName("modal-content")[0];
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
  console.log("height", modal.querySelector(".modal-box").clientHeight, modal.querySelector(".modal-box").clientHeight > modal.querySelector.scrollHeight ? "no scroll" : "scroll", content.scrollHeight);
  if (modal.querySelector(".modal-box").clientHeight < content.scrollHeight) {
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
  abort(["#Under construction","The game proper is still being developed, and is currently nonfunctional.","Sorry about that."]);
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
  fetch(ROOT + 'q/' + filename + ".json", {
    method: 'GET',
    headers: myHeaders,
    mode: 'cors'
  }).then(response => {
    if (response.ok) {
      console.log("response:", response.body);
      return response.json();
    } else {
      abort(["Error on fetching episode contents."]);
      return;
    }
  }).catch(error => {
    console.log(error);
    abort(["Error on fetching episode contents."]);
    return;
  }).then(json => {
    episode_listing = json;
    console.log("Fetched /q/" + filename + ".json", json);
    startEpisode();
  });
}
/**
 * The episode choice screen key handler.
 * @param {keyDownEvent} event The event.
 */
function chooseEpisodeKeys(event) {
  console.log("key handler wip:", event);
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
        playSFX({name: "menu_move"});
        buttons[selected].classList.remove("sel");
        selected = (selected + buttons.length - 1) % buttons.length;
        console.log("new choice:", selected, buttons[selected]);
        buttons[selected].classList.add("sel");
        break;
      case 5:
        console.log("down");
        playSFX({name: "menu_move"});
        buttons[selected].classList.remove("sel");
        selected = (selected + 1) % buttons.length;
        console.log("new choice:", selected, buttons[selected]);
        buttons[selected].classList.add("sel");
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
            abort(["#Error", "*An error occurred while trying to load the episode.", e.message])
            break;
          }
          playSFX({name: "game_start"});
          changeKeyHandler(undefined, false);
          stopMusic(1500);
          console.log("game started");
        } else {
          // nobody signed up
          playSFX({name: "menu_fail"});
          activateModal(["#Nobody signed up.", "Press [[↓]] to sign up, and [[↑]] to sign off.", "[6] Okay"]);
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
    fetch(ROOT + 'q/0.json', {
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
      abort(["Error on fetching episode list."]);
    }).then(json => {
      episode_listing = json;
      console.log("Fetched /q/0.json", json);
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
  var cards = document.getElementById("signup-box").getElementsByClassName("signup");
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
        activateModal(["#Nobody signed up.", "Press ↓ to sign up, and ↑ to sign off.", "[6] Okay"]);
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
    activateModal(["#Error", "An error occured while trying to select a menu item.", "[6]Dismiss"]);
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
          activateModal([
            "# Controls",
            "Each player has 6 keys, called ↖, ↑, ↗, ←, ↓, and →. Player 1 has 123 QWE. Player 2 has FGH VBN. Player 3 has 890 IOP. Player 4 has 789 456 on the numpad.",
            "On console, it should correspond to L, N, R, W, S, and E. (N, E, W, and S are face buttons.)",
            "# Basics",
            "Answer the questions correctly using your set of 6 keys.",
            "*Standard and Candy Trivia",
            "Use your ↑, ←, →, and ↓ keys to select one of four options. Each correct answer nets you 5 points, but each wrong answer costs you 5 points.",
            "In Candy Trivia with Salty Barr, the question and/or options are about candy. (corresponds to Cookie's Fortune Cookie Fortunes with Cookie “Fortune Cookie” Masterson.)",
            "*Sorting Time",
            "Use your ← and → keys to sort the 7 items into 2 categories. Sometimes you need to press ↑ to sort into both. If you are unsure and don't want to risk it, you can press ↓ to skip, you chicken. Each item is worth 2 points. (Corresponds to DisOrDat.)",
            "*All Outta Salt",
            "You will see a phrase whose every syllable rhymes with the syllables of another phrase. When you know what it is, press any key to buzz in, then type in your answer.",
            "Up to 3 hints will be shown. Each AOS is worth 7 points, but each hint will lower the value by 2 points. (Corresponds to Gibberish Question.)",
            "*Sugar Rush",
            "You will get a title, followed by 5 categories containing 6 items. For each category, press the corresponding key to answer whether that item fits that category. Each item is worth 1 point, making the whole game valued at 30 points. (Corresponds to Jack Attack [Full Stream style].)",
            "*Hike Your Likes",
            "You will get 3 items and 5 categories. For each category, press the corresponding key to answer whether that item fits that category. Each correct answer gives the player 10 'likes', which are then converted to points at the end of the game. There is also a 4th bonus item for each category, which, in multiplayer mode, can only be answered by the half of players with the fewest 'likes'. (Altered from Trivia Murder Party's final chase.)",
            "[6] Dismiss"
          ]);
          break;
        case 2:
          activateModal([
            "#About",
            "Salty Trivia with Candy Barr is a sassy trivia video game where the questions are ridiculous but the answers are serious.",
            "This game was created by Haley Wakamatsu, who also wrote the questions, coded this demo, and voiced your host, Candice “Candy” Barr.",
            "[6] Dismiss"
          ]);
          break;
        case 3:
          activateModal([
            "#Credits",
            "*Made out of love for (inspired by)",
            "“You Don't Know Jack” series",
            "created by Harry Gottlieb",
            "IP of Jackbox Games",
            "(This is a fangame that builds upon the formula. We are not affiliated with Jackbox Games in any capacity.)",
            "#Creative Director",
            "Haley Wakamatsu",
            "#Coding",
            "*Head programmer",
            "Haley Wakamatsu",
            "#Writing",
            "*Head writer",
            "Haley Wakamatsu",
            "#Voice",
            "*Candice “Candy” Barr",
            "Haley Wakamatsu",
            "*Miles Stone",
            "Salem Morrison",
            "#Music",
            "*Musical director",
            "Haley Wakamatsu as “Akira Sora”",
            "Salty Trivia Theme - Akira Sora",
            "Coffee at Midnight - Akira Sora",
            "Announcer Music - Akira Sora",
            "15 Second Rock - Akira Sora",
            "[6] accept our thanks for playing!"
          ]);
          break;
        case 4:
          window.open("https://japanyoshi.github.io/social.html", "_blank");
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
  setTimeout(function(){
    document.getElementById("splash_screen").classList = "gone";
    initApp();
    document.addEventListener("keydown", keyShiv, true);
    activateModal(["#Warning",
    "*Keyboard layout",
    "This program assumes that you have a physical keyboard with the QWERTY keyboard layout, so mobile devices are not supported without a Bluetooth keyboard. If you are using a different layout (e.g. QWERTZ, AZERTY, Dvorak, or Colemak), I'm sorry. Please switch to QWERTY.",
    "*Keybind",
    "Each player uses a 3x2 array of keys, represented as [[1]], [[2]], [[3]], [[4]], [[5]], and [[6]]; basically WASD/IJKL with up-left and up-right added.",
    "Player 1: Q W E A S D",
    "Player 2: F G H V B N",
    "Player 3: U I O J K L",
    "Player 4: 7 8 9 4 5 6 (Numpad)",
    "Navigate using [[2]] and [[5]], and confirm by [[6]].",
    "*Audio",
    "This program has audio. Please check your audio volume.",
    "This program is for up to 4 players, but one player must use the numpad.",
    "#Browser compatibility",
    "This application uses Chrome specific features. If the background doesn't look blurry here, you should open this page on Google Chrome.",
    "[6] Start!"]);
  }, 3000);
}, true);