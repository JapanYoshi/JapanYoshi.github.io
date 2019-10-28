var params = {}; // persistent data will be stored in here
var episode_data = {};
var bgm_data = {};
var sfx_data = {};
var bgm_sound;
var bgm_sound_extra;
const MAX_PLAYER_COUNT = 8;
const ROOT = "https://cors-anywhere.herokuapp.com/https://japanyoshi.github.io/salty/"

/* howler.js setup stuff */
const bgm_names = [
  "answer_now",
  "placeholder",
  "reading_question",
  "signup_base",
  "signup_extra"
];
const sfx_names = [
  "option_correct",
  "option_highlight",
  "option_show",
  "option_wrong",
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
      ROOT + "audio/music/" + name + ".ogg",
      ROOT + "audio/music/" + name + ".wav"
    ],
    loop: true
  });
  bgm_data[name] = sound;
}

for (const name of sfx_names) {
  var sound = new Howl({
    src: [
      ROOT + "audio/sfx/" + name + ".ogg",
      ROOT + "audio/sfx/" + name + ".wav"
    ],
    loop: true
  });
  sfx_data[name] = sound;
}

function playMusic(bgm, bgmExtra, bgmStartVol, bgmExtraStartVol){
  if (bgmStartVol !== 0 && !bgmStartVol) {
    bgmStartVol = 1;
  }
  if (!bgmExtraStartVol) {
    bgmExtraStartVol = 0;
  }
  bgm_sound = bgm_data[bgm];
  if (!bgmExtra) {
    bgm_sound_extra = undefined;
  } else {
    bgm_sound_extra = bgm_data[bgmExtra];
  }
  bgm_sound.volume(bgmStartVol);
  bgm_sound_extra.volume(bgmExtraStartVol);
  bgmLoaded = false;
  bgm_sound.play();
  bgm_sound_extra.play();
}
function setExtraVolume(vol) {
  bgm_sound_extra.fade(bgm_sound_extra.volume(), vol, 500);
}
function playSFX(sfx) {
  if (sfx_data[sfx]) {
    sfx_data[sfx].stop().play();
  } else {
    console.log("playSFX error: the sound effect " + sfx + " does not exist.");
  }
}
/* end howler.js setup stuff */

function sys(keycode) {
  var playerID = 0;
  var keyID = 0;
  switch (keycode) {
    case 81: // q
    case 70: // f
    case 85: // u
    case 103: // numpad 7
    case 27: // esc
      keyID = 1;
      break;
    case 87: // w
    case 71: // g
    case 73: // i
    case 104: // numpad 8
    case 32: // space
      keyID = 2;
      break;
    case 69: // e
    case 72: // h
    case 79: // o
    case 105: // numpad 9
      keyID = 3;
      break;
    case 65: // a
    case 86: // v
    case 74: // j
    case 100: // numpad 4
      keyID = 4;
      break;
    case 83: // s
    case 66: // b
    case 75: // k
    case 101: // numpad 5
      keyID = 5;
      break;
    case 68: // d
    case 78: // n
    case 76: // l
    case 102: // numpad 6
    case 13: // return
      keyID = 6;
      break;
  }
  if (keyID == 0) {
    return 0;
  }
  switch (keycode) {
    case 81: // q
    case 87: // w
    case 69: // e
    case 65: // a
    case 83: // s
    case 68: // d
      playerID = 1;
      break;
    case 70: // f
    case 71: // g
    case 72: // h
    case 86: // v
    case 66: // b
    case 78: // n
      playerID = 2;
      break;
    case 85: // u
    case 73: // i
    case 79: // o
    case 74: // j
    case 75: // k
    case 76: // l
      playerID = 3;
      break;
    case 103: // numpad 7
    case 104: // numpad 8
    case 105: // numpad 9
    case 100: // numpad 4
    case 101: // numpad 5
    case 102: // numpad 6
      playerID = 4;
      break;
  }
  return playerID * 64 + keyID;
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
      box.scrollBy(0, screenHeight / -8);
      break;
    case 5:
      console.log("Down was pressed. Scrolling px:", screenHeight / 8);
      box.scrollBy(0, screenHeight / 8);
      break;
    case 6:
      document.removeEventListener("keydown", modalKeys);
      setTimeout(function(){
        // give time for the title screen to process that the modal is still active
        document.getElementById("modal").classList.remove("active");
      }, 10);
      break;
    default:
      console.log(keyCode, "No action is defined for that key.");
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
      var button = parseInt(text[i].substring(1, btnEnd));
      var buttonTxt = ["?", "↖", "↑", "↗", "←", "↓", "→"][button];
      text[i] = text[i].substring(btnEnd + 1);
      var keyDisplay = document.createElement("span");
      keyDisplay.classList.add("key");
      keyDisplay.innerHTML = buttonTxt;
      node.appendChild(keyDisplay);
    } else {
      // format: just text
      node = document.createElement("p");
    }
    var textNode = document.createTextNode(text[i]);
    node.appendChild(textNode);
    content.appendChild(node);
  }
  console.log("height", modal.querySelector(".modal-box").clientHeight, modal.querySelector(".modal-box").clientHeight > modal.querySelector.scrollHeight ? "no scroll" : "scroll", content.scrollHeight);
  if (modal.querySelector(".modal-box").clientHeight < content.scrollHeight) {
    modal.classList.add("overflowing");
  }
  setTimeout(function(){
    document.addEventListener("keydown", modalKeys);
    console.log("Modal key handler complete.");
  }, 500);
  modal.classList.add("active");
  console.log("Modal complete");
}

function titleKeys(event) {
  console.log("titleKeys");
  event.stopPropagation();
  if (document.querySelector("#modal.active")) {
    console.log("modal is active");
    return;
  }
  var buttons = document.getElementById("title_option_box").children;
  console.log("buttons", buttons);
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
      buttons[selected].classList.remove("sel");
      selected = (selected + buttons.length - 1) % buttons.length;
      buttons[selected].classList.add("sel");
      break;
    case 5:
      console.log("down");
      buttons[selected].classList.remove("sel");
      selected = (selected + 1) % buttons.length;
      buttons[selected].classList.add("sel");
      break;
    case 6:
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
            "by Jackbox Games",
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
            "#Music",
            "*Musical director",
            "Haley Wakamatsu as “Akira Sora”",
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
function signupKeys(){
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
      params.players[player - 1].present = true;
      cards[player - 1].classList.add("on");
      params.playerCount++;
      break;
    case 2:
      // unregister
      params.players[player - 1].present = false;
      cards[player - 1].classList.remove("on");
      params.playerCount--;
      break;
    case 4:
      // back
      document.removeEventListener("keydown", signupKeys);
      setExtraVolume(0);
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
        initGame();
      } else {
        // nobody signed up
        activateModal(["#Nobody signed up.", "Press ↓ to sign up, and ↑ to sign off.", "[6] Okay"]);
        setTimeout(function(){document.addEventListener("keydown", signupKeys)}, 1000);
      }
      break;
  }
}
function initGame(){
  document.removeEventListener("keydown", signupKeys);
  playerCount = params.playerCount;
  activateModal([`#${playerCount} ${playerCount > 1 ? "players" : "player"}`, "Alright, let's begin!", "[6] Yeah!"]);
  document.body.className = "";
}
function startSignup(){
  document.removeEventListener("keydown", titleKeys);
  document.body.className = "state_signup";
  document.addEventListener("keydown", signupKeys);
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

  setExtraVolume(0.8);
}
function initApp(){
  document.body.className = "state_title";
  document.addEventListener("keydown", titleKeys);
}
document.addEventListener("DOMContentLoaded", initApp);
document.addEventListener("DOMContentLoaded", function(){
  // first time boot
  setTimeout(function(){
    document.getElementById("splash_screen").classList = "gone";
  }, 3000);
  playMusic("signup_base", "signup_extra", 0.8, 0);
  activateModal(["#Warning", "*Keyboard layout", "This program assumes that you have a physical keyboard with the QWERTY keyboard layout, so mobile devices are not supported without a Bluetooth keyboard. If you are using a different layout (e.g. QWERTZ, AZERTY, Dvorak, or Colemak), I'm sorry. Please switch to QWERTY.", "*Keybind", "Each player uses a 3x2 array of keys, represented as ↖, ↑, ↗, ←, ↓, and →; basically WASD/IJKL with up-left and up-right added.",
  "Player 1: Q W E A S D",
  "Player 2: F G H V B N",
  "Player 3: U I O J K L",
  "Player 4: 7 8 9 4 5 6 (Numpad)",
  "Navigate using ↑ and ↓, and confirm by →.", "*Audio", "This program has audio. Please check your audio volume.", "This program is for up to 4 players, but one player must use the numpad.", "#Browser compatibility", "This application uses Chrome specific features. If the background doesn't look blurry here, you should open this page on Google Chrome.", "[6] Start!"]);
});