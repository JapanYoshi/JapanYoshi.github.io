var params = {}; // persistent data will be stored in here
var episode_index = {};
var episode_data = {};
var bgm_data = {};
var sfx_data = {};
var bgm_sound;
var bgm_sound_extra;
var bgm_sound_extra2;
// sound effects should be played willy nilly, but one copy per sound effect

const MUSIC_DELAY = 400;
const MAX_PLAYER_COUNT = 8;
const ROOT = "https://cors-anywhere.herokuapp.com/https://japanyoshi.github.io/salty/"
const KEY_CONFIG = [
  [81, 87, 69, 65, 83, 68],
  [70, 71, 72, 86, 66, 78],
  [85, 73, 79, 74, 75, 76],
  [103, 104, 105, 100, 101, 102]
];

// howler.js setup stuff
const bgm_names = [
  "signup_base",
  "signup_extra",
  "signup_extra2",
  "placeholder",
  "answer_now",
  "reading_question",
];
const sfx_names = [
  "menu_back",
  "menu_confirm",
  "menu_fail",
  "menu_move",
  "menu_signin",
  "menu_signout",
  "option_correct",
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
    onplayerror: function(){
      console.log("Error playing music " + name);
    },
    onend: function(){
      console.log("music " + name + " finished");
    }
  });
  bgm_data[name] = sound;
}

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
  sound.once('load', function(){
    console.log("SFX " + name + " loaded");
  })
  sfx_data[name] = sound;
}
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

function stopMusic(fade_ms) {
  if (fade_ms) {
    if (bgm_sound){
      bgm_sound.fade(bgm_sound.volume(), 0, fade_ms).stop();
    }
    if (bgm_sound_extra) {
      bgm_sound_extra.fade(bgm_sound_extra.volume(), 0, fade_ms).stop();
    }
    if (bgm_sound_extra2) {
      bgm_sound_extra2.fade(bgm_sound_extra2.volume(), 0, fade_ms).stop();
    }
  } else {
    if (bgm_sound){
      bgm_sound.stop();
    }
    if (bgm_sound_extra) {
      bgm_sound_extra.stop();
    }
    if (bgm_sound_extra2) {
      bgm_sound_extra2.stop();
    }
  }
}
function playMusic(bgm, bgmExtra, bgmExtra2){
  // pass {name: string, vol: float}
  // set up
  if (bgm.vol !== 0 && !bgm.vol) {
    bgm.vol = 1;
  }
  bgm_sound = bgm_data[bgm.name];
  bgm_sound.volume(bgm.vol);
  if (bgmExtra) {
    if (!bgmExtra.vol) {
      bgmExtra.vol = 0;
    }
    bgm_sound_extra = bgm_data[bgmExtra.name];
    bgm_sound_extra.volume(bgmExtra.vol);
  } else {
    bgm_sound_extra = undefined;
  }
  if (bgmExtra2) {
    if (!bgmExtra2.vol) {
      bgmExtra2.vol = 0;
    }
    bgm_sound_extra2 = bgm_data[bgmExtra2.name];
    bgm_sound_extra2.volume(bgmExtra2.vol);
  } else {
    bgm_sound_extra = undefined;
  }
  if (bgm_sound_extra2) {
    bgm_sound.play();
    bgm_sound_extra.play();
    bgm_sound_extra2.play();
  } else if (bgm_sound_extra) {
    bgm_sound.play();
    bgm_sound_extra.play();
  } else {
    bgm_sound.play();
  }
}
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
function playSFX(sfx) {
  if (sfx_data[sfx]) {
    console.log("playing SFX: " + sfx);
    sfx_data[sfx].stop();
    sfx_data[sfx].play();
  } else {
    console.log("playSFX error: the sound effect " + sfx + " does not exist.");
  }
}
/* end howler.js setup stuff */

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

function formatIcons(text) {
  // replace "[[" with '<span class="icon">' and "]]" with </span>
  return text.replace(/\[\[/g, '<span class="icon">').replace(/\]\]/g, '</span>');
}
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
      playSFX("menu_move");
      box.scrollBy(0, screenHeight / -8);
      break;
    case 5:
      console.log("Down was pressed. Scrolling px:", screenHeight / 8);
      playSFX("menu_move");
      box.scrollBy(0, screenHeight / 8);
      break;
    case 6:
      document.removeEventListener("keydown", modalKeys);
      playSFX("menu_confirm");
      setTimeout(function(){
        // give time for the title screen to process that the modal is still active
        document.getElementById("modal").classList.remove("active");
      }, 10);
      break;
  }
}
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
    document.addEventListener("keydown", modalKeys);
    console.log("Modal key handler complete.");
  }, 500);
  modal.classList.add("active");
  console.log("Modal complete");
}
function chooseEpisode(){
  document.removeEventListener("keydown", signupKeys);
  document.body.className = "state_episode";
  if (!episode_index) {
    fetch(ROOT + 'q/0.json', {
      method: 'GET',
      mode: 'same-origin',
      credentials: 'include'
    }).then(
      response => response.json()
    ).then(
      text => console.log(text)
    ).catch(
      error => console.log(error)
    );
  }
}
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
        playSFX("menu_signin");
        params.players[player - 1].present = true;
        cards[player - 1].classList.add("on");
        params.playerCount++;
        setExtraVolume(0.8);
      }
      break;
    case 2:
      // unregister
      if (params.players[player - 1].present){
        playSFX("menu_signout");
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
      document.removeEventListener("keydown", signupKeys);
      playSFX("menu_back");
      stopMusic(400);
      initApp();
      break;
    case 6:
      // start
      document.removeEventListener("keydown", signupKeys);
      var playerCount = 0
      for (var i = 0; i < params.players.length; i++) {
        if (params.players[i].present) {
          playerCount++;
        }
      }
      if (playerCount) {
        // somebody signed up
        playSFX("menu_confirm");
        setExtra2Volume(0.8);
        setExtraVolume(0);
        chooseEpisode();
      } else {
        // nobody signed up
        playSFX("menu_fail");
        activateModal(["#Nobody signed up.", "Press ↓ to sign up, and ↑ to sign off.", "[6] Okay"]);
        setTimeout(function(){document.addEventListener("keydown", signupKeys)}, 1000);
      }
      break;
  }
}
function startSignup(){
  document.removeEventListener("keydown", titleKeys);
  document.body.className = "state_signup";
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
  stopMusic(400);
  setTimeout(function(){
    document.addEventListener("keydown", signupKeys);
    playMusic({name: "signup_base", vol: 0.8}, {name: "signup_extra"}, {name: "signup_extra2"});
  }, MUSIC_DELAY)
}
function titleKeys(event) {
  console.log("titleKeys");
  event.stopPropagation();
  if (document.querySelector("#modal.active")) {
    console.log("modal is active");
    return;
  }
  var buttons = document.getElementById("title_option_box").children;
  var selected = -1;
  for (var i = 0; i < buttons.length; i++) {
    if (buttons[i].classList.contains("sel")) {
      selected = i;
      break;
    }
  }
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
      playSFX("menu_move");
      buttons[selected].classList.remove("sel");
      selected = (selected + buttons.length - 1) % buttons.length;
      buttons[selected].classList.add("sel");
      break;
    case 5:
      console.log("down");
      playSFX("menu_move");
      buttons[selected].classList.remove("sel");
      selected = (selected + 1) % buttons.length;
      buttons[selected].classList.add("sel");
      break;
    case 6:
      playSFX("menu_confirm");
      switch (selected) {
        case 0:
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
function initApp(){
  document.body.className = "state_title";
  document.addEventListener("keydown", titleKeys);
  setTimeout(
    function(){
      playMusic({name: "placeholder"}, undefined, undefined);
    }, MUSIC_DELAY
  );
}
document.addEventListener("DOMContentLoaded", initApp);
document.addEventListener("DOMContentLoaded", function(){
  // first time boot
  setTimeout(function(){
    document.getElementById("splash_screen").classList = "gone";
  }, 3000);
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
});