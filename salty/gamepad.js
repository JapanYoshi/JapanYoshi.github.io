const sleep = (wait, someFunction) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(someFunction())
    }, wait)
  });
}
// end test/included functions

var daisyWheelPage = 4;
var readyState = 0;
const stickThreshold = 0.4;
var configQueue = [];
// from tilt state to config page
const daisyWheelOrder = [8, 1, 2, 7, 0, 3, 6, 5, 4];
// Length 1: literal. Else: commands. You can input multiple characters with "input".
// e.g. To input the word "the", type "inputthe".
const daisyWheelConfig = [
  [
    ["left", "delete", "right", " "],
    ["A", "B", "C", "D"],
    ["E", "F", "G", "H"],
    ["I", "J", "K", "L"],
    ["M", "N", "O", "P"],
    ["Q", "R", "S", "T"],
    ["U", "V", "W", "X"],
    ["Y", "Z", ".", ","],
    ["?", "!", "'", "num"],
    ["num", "submit"]
  ], [
    ["left", "delete", "right", " "],
    ["0", "1", "2", "3"],
    ["4", "5", "6", "7"],
    ["8", "9", "-", "/"],
    ["", "", "", ""],
    ["", "", "", ""],
    ["", "", "", ""],
    ["", "", "", ""],
    ["", "", "", "num"],
    ["num", "submit"]
  ]
];
function buttonPressed(b) {
  if (typeof b == "object") {
    return b.pressed;
  }
  return b == 1.0;
}
window.addEventListener("gamepadconnected", function (e) {
  var gp = navigator.getGamepads()[e.gamepad.index];
  console.log(
    "Gamepad connected at index %d and ID %s. %d buttons, %d axes.",
    gp.index,
    gp.id,
    gp.buttons.length,
    gp.axes.length
  );
  
  addToConfigQueue(gp.index);
});
window.addEventListener("gamepaddisconnected", function (e) {
  console.log("Gamepad disconnected.");
  //document.getElementById("daisywheel_control").classList.add("disconnected");
  removeGamepad(e.gamepad.index);
  console.log("Gamepad disconnected at index %d.", e.gamepad.index);
});


// poll the input
var interval;
if (!("ongamepadconnected" in window)) {
  // No gamepad events available, poll instead.
  interval = setInterval(pollGamepads, 500);
}
if (!interval) {
  interval = undefined;
}

function pollGamepads() {
  var gamepads = navigator.getGamepads
    ? navigator.getGamepads()
    : navigator.webkitGetGamepads ? navigator.webkitGetGamepads : [];
  for (var i = 0; i < gamepads.length; i++) {
    var gp = gamepads[i];
    if (gp) {
      //controllerLoop();
      if (interval) {
        clearInterval(interval);
      }
    }
  }
}
const configStrings = [
  "Press the face buttons in order. [[↑]]"
, "Press the face buttons in order. [[→]]"
, "Press the face buttons in order. [[↓]]"
, "Press the face buttons in order. [[←]]"
, "Does this have an analog stick?<br>[[←]]No, [[→]]Yes"
, "Tilt the left stick to the right."
, "Tilt the left stick downward."
, "Is this a shared controller?<br>[[←]]No, [[→]]Yes, [[↑]]Help"
, "Left player: Press [[↖]]."
, "Left player: Press [[↗]]."
, "Right player: Press [[↖]]."
, "Right player: Press [[↗]]."
, "Tilt the right stick to the right."
, "Tilt the right stick downward."
, "Press the left shoulder button [[↖]]."
, "Press the right shoulder button [[↗]]."
, "Press the left shoulder button [[↖]]. If you do not have shoulder buttons, press [[↓]]."
, "Press the right shoulder button [[↗]]. If you do not have shoulder buttons, press [[↓]]."
, "Press up on your D-pad."
, "Press right on your D-pad."
, "Press down on your D-pad."
, "Press left on your D-pad."
, "Finally, press the pause button."
, "While holding your D-pad up,<br>press [[→]]."
, "While holding your D-pad up-right,<br>press [[→]]."
, "While holding your D-pad right,<br>press [[→]]."
, "While holding your D-pad down-right,<br>press [[→]]."
, "While holding your D-pad down,<br>press [[→]]."
, "While holding your D-pad down-left,<br>press [[→]]."
, "While holding your D-pad left,<br>press [[→]]."
, "While holding your D-pad up-left,<br>press [[→]]."
]
function addToConfigQueue(id) {
  configQueue.push(id)
  if (1 === configQueue.length) {
    // first one here, config immediately
    configGamepad(id);
  } // else, wait for finishConfig() to be called
}
function finishConfig() {
  const justFinished = configQueue.shift();
  configs[justFinished].lastFrameButtonState = undefined;
  configs[justFinished].lastFrameButtonState1 = getGamepadStateSys(justFinished, false);
  configs[justFinished].lastFrameButtonState2 = getGamepadStateSys(justFinished, true);
  if (configQueue.length) {
    // more controllers need to be configured
    configGamepad(configQueue[0]);
  } else {
    // all controllers set up
    controllerLoop();
    document.getElementById("gamepad_config").classList.remove("shown");
  }
}
function configChangeState(state, retro, shared) {
  if (state === -1) {
    document.getElementById("gamepad_config_body").querySelector("h3").innerHTML = "Done!";
    document.getElementById("gamepad_diagram").src = "ready_" + (
      retro ? "retro" : shared ? "shared" : "solo"
    ) + ".svg";
  } else {
    console.log("state" + state);
    document.getElementById("gamepad_config_body").querySelector("h3").innerHTML = formatIcons(configStrings[state]);
    const changeBackground = [
      0 // none
    , 5 // solo
    , 7 // none
    , 8 // side_shared
    , 12 // shared
    , 14 // solo
    , 16 // retro
    ];
    if (changeBackground.includes(state)){
      document.getElementById("gamepad_diagram_bg").src = (state === 0 || state === 7) ? "" : (
        "data/joystick/bg_" + (retro ? "retro.svg" : shared ? (state === 8 ? "side_shared.svg" : "shared.svg") : "solo.svg")
      );
    }
    // 18..30 (last element) have multiple variants
    document.getElementById("gamepad_diagram").src = "data/joystick/" + state.toString(10).concat((state >= 18) ? retro ? "_retro.svg" : (shared ? "_shared.svg" : "_solo.svg") : ".svg")
  }
}
function getNewPresses(oldState, newState) {
  return newState & ~oldState; // bitwise not is ~
}
function getNewPressesSys(oldState, newState) {
  var result = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (var i = 0; i < newState.length - 1; i++) {
    result[i] = !oldState[i] & newState[i]
  }
  // special for d-pad: index 8 has d-pad state
  // new horizontal movement
  if (oldState[i] % 3 !== 2 && newState[i] % 3 === 2) {
    result[keyName.dRight] = 1;
  } else if (oldState[i] % 3 !== 0 && newState[i] % 3 === 0) {
    result[keyName.dLeft] = 1;
  }
  // new vertical movement
  if (oldState[i] >= 3 && newState[i] < 3) {
    result[keyName.dUp] = 1;
  } else if (oldState[i] < 6 && newState[i] >= 6) {
    result[keyName.dDown] = 1;
  }
  return result;
}
function getButtonState(id) {
  var buttons = getGamepads()[id].buttons;
  var state = 0;
  for (var b = 0; b < buttons.length; b++) {
    if (buttons[b].pressed) {
      state |= 1 << b;
    }
  }
  return state;
}

function getGamepadStateSys(id, player2) {
  var gp = getGamepads()[id];
  if (!gp || player2 && !configs[id].shared) {
    return undefined; // neutral state just for testing
  }
  var cfgButtons = configs[id].buttons;
  var state = [];
  var numButtons = 8;
  var buttonStart = configs[id].shared && !player2 ? 8 : 0;
  var axisStart = configs[id].shared && player2 ? 2 : 0;
  // buttons: stored in state[0..7]
  for (var b = buttonStart; b < buttonStart + numButtons; b++) {
    if (cfgButtons[b] !== -1 && gp.buttons[cfgButtons[b]].pressed) {
      state.push(1);
    } else {
      state.push(0);
    }
  }
  if (configs[id].noAxes) {
    // D-pad: stored in state[8]
    if (configs[id].weirdDpad) {
      // weird d-pad, monitor dpad state
      const dPadState = gp.axes[configs[id].weirdDpad - 1];
      for (var s = 0; s < 9; s++) {
        if (Math.abs(dPadState - configs[id].weirdDpadValues[s]) < 0.0001) {
          state[8] = [4, 1, 2, 5, 8, 7, 6, 3, 0][s];
          // 0 1 2      8 1 2
          // 3 4 5 <--- 7 0 3
          // 6 7 8      6 5 4
          break;
        }
      }
    } else {
      // buttons 9, 11, 12, and 13
      if (gp.buttons[cfgButtons[keyName.dRight]].pressed) {
        state[8] = 5;
      } else if (gp.buttons[cfgButtons[keyName.dLeft]].pressed) {
        state[8] = 3;
      } else {
        state[8] = 4;
      }
      if (gp.buttons[cfgButtons[keyName.dDown]].pressed) {
        state[8] += 3;
      } else if (gp.buttons[cfgButtons[keyName.dUp]].pressed) {
        state[8] -= 3;
      }
    }
  } else {
    // two axes
    const x = configs[id].axes[axisStart] > 0 ? gp.axes[configs[id].axes[axisStart] - 1] : -gp.axes[-configs[id].axes[axisStart] - 1];
    const y = configs[id].axes[axisStart + 1] > 0 ? gp.axes[configs[id].axes[axisStart + 1] - 1] : -gp.axes[-configs[id].axes[axisStart + 1] - 1];
    if (x >= stickThreshold) {
      state[8] = 2;
    } else if (x > -stickThreshold) {
      state[8] = 1;
    } else {
      state[8] = 0;
    }

    if (y >= stickThreshold) {
      state[8] += 6;
    } else if (y > -stickThreshold) {
      state[8] += 3;
    }
  }
  return state;
}
const configHandle = (id, configState) => {
  var gp = getGamepads()[id];
  if (!gp) {
    // disconnected during setup
    configs[id] = {};
    configState = -1;
    configChangeState(-1, configs[id].retro, configs[id].shared);
    finishConfig();
  }
  var configStateChanged = false;
  // detect NEW presses only
  var thisFrameButtonState = getButtonState(id);
  var buttonStateChange = getNewPresses(configs[id].lastFrameButtonState, thisFrameButtonState);
  configs[id].lastFrameButtonState = thisFrameButtonState;
  var btn;
  if (buttonStateChange) {
    // hacky, returns the position of the lowest 1 bit
    // found on: https://stackoverflow.com/questions/12247186
    btn = Math.log2(buttonStateChange & -buttonStateChange);
    console.log("btn", btn);
  } else {
    btn = -1;
  }
  switch (configState) {
    case -1:
      return;
    case 0:
      // face button up
      if (-1 !== btn) {
        configs[id].buttons[1] = btn;
        configState = 1;
        configStateChanged = true;
      }
      if (configs[id].weirdDpad === 0) {
        for (var axis = 0; axis < gp.axes.length; axis++) {
          // a neutral Weird D-pad has value 23/7
          if (Math.abs(gp.axes[axis] - 23 / 7) <= 0.00001) { // in case rounding errors happen
            console.log("Weird D-pad detected: axis " + axis);
            configs[id].weirdDpad = axis + 1;
            configs[id].weirdDpadValues = [gp.axes[axis]];
          }
        }
      }
      break;
    case 1:
    case 2:
    case 3:
      // face button others
      if (-1 !== btn) {
        if (false === configs[id].buttons.includes(btn)) {
          // change button index 5, 4, then 3
          configs[id].buttons[6 - configState] = btn;
          configStateChanged = true;
          if (configState == 3 && gp.axes.length === 0) {
            // DEFINITELY no joysticks, choose "no" for them
            configState = 16;
            configs[id].retro = true;
          } else {
            configState++;
          }
        }
      }
      break;
    case 4:
      // ask if there's a joystick
      switch (btn) {
        case -1:
          break;
        case configs[id].buttons[3]: //left
          configState = 16;
          configs[id].retro = true;
          configStateChanged = true;
          configs[id].noAxes = true;
          break;
        case configs[id].buttons[5]: //right
          configState = 5;
          configStateChanged = true;
          break;
      }
      break;
    case 5:
    case 6:
    case 12:
    case 13:
      // joysticks
      for (var j = 0; j < gp.axes.length; j++) {
        if (configs[id].axes.includes( j + 1)
         || configs[id].axes.includes(-j - 1)
         || configs[id].weirdDpad === j + 1) { continue; }
        const axis = gp.axes[j];
        if (Math.abs(axis) >= stickThreshold) {
          if (axis > 0) {
            configs[id].axes.push(+j + 1);
          } else {
            configs[id].axes.push(-j - 1);
          }
          configStateChanged = true;
          if (configState === 13) {
            configState = 18;
          } else if (configState === 6 && gp.axes.length < 4) {
            // definitely doesn't have 2 joysticks
            configState = 14;
          } else {
            configState++;
          }
        }
      }
      break;
    case 7:
      // ask if shared
      switch (btn) {
        case -1:
          break;
        case configs[id].buttons[1]: //up
          document.getElementById("gamepad_config").querySelector("p").innerText = "This game supports sharing one controller among 2 players. Each player must have 4 face buttons, 2 shoulder buttons, and a joystick.";
          break;
        case configs[id].buttons[3]: //left
          document.getElementById("gamepad_config").querySelector("p").innerText = "";
          configState = 14;
          configStateChanged = true;
          break;
        case configs[id].buttons[5]: //right
          document.getElementById("gamepad_config").querySelector("p").innerText = "";
          configState = 8;
          configStateChanged = true;
          configs[id].shared = true;
          break;
      }
      break;
    case 8:
    case 9:
    case 10:
    case 11:
      // 2P shoulder buttons
      if (-1 !== btn) {
        if (false === configs[id].buttons.includes(btn)) {
          // case 8: index 8;
          // case 9: index 10;
          // case 10: index 0;
          // case 11: index 2;
          configs[id].buttons[
            configState < 10 ?
              8 + (configState - 8) * 2 :
              (configState - 10) * 2
          ] = btn;
          configStateChanged = true;
          configState++;
        }
      }
      break;
    case 14:
    case 15:
      // 1P shoulder buttons in normal mode
      if (-1 !== btn) {
        if (false === configs[id].buttons.includes(btn)) {
          // case 14: index 0;
          // case 15: index 2;
          configs[id].buttons[
            (configState - 14) * 2
          ] = btn;
          configStateChanged = true;
          if (configState === 15) {
            configState = 22;
          } else {
            configState++;
          }
        }
      }
      break;
      break;
    case 16:
    case 17:
      // 1P shoulder buttons in retro mode
      if (-1 !== btn) {
        if (false === configs[id].buttons.includes(btn)) {
          // case 16: index 0;
          // case 17: index 2;
          configs[id].buttons[
            (configState - 16) * 2
          ] = btn;
          configStateChanged = true;
          configState++;
        } else if (btn === configs[id].buttons[4]) {
          // skip by pressing face buton down
          configState++;
        }
        if (configState === 18 && configs[id].weirdDpad) {
          configState = 23;
        }
      }
      break;
    case 18:
    case 19:
    case 20:
    case 21:
      // dpad
      if (-1 !== btn) {
        if (false === configs[id].buttons.includes(btn)) {
          // change button index 8+1, 8+5, 8+4, then 8+3
          configs[id].buttons[
            configState == 18 ?
              9 :
              32 - configState
          ] = btn;
          configStateChanged = true;
          configState++;
        }
      }
      break;
    case 22:
      if (-1 !== btn) {
        if (false === configs[id].buttons.includes(btn)) {
          // change button index 6
          configs[id].buttons[6] = btn;
          configStateChanged = true;
          configState = -1;
        }
      }
      break;
    case 23:
    case 24:
    case 25:
    case 26:
    case 27:
    case 28:
    case 29:
    case 30:
      if (btn === configs[id].buttons[5]) {
        const dpadValue = gp.axes[configs[id].weirdDpad - 1];
        console.log(dpadValue);
        if (!configs[id].weirdDpadValues.includes(dpadValue)) {
          configs[id].weirdDpadValues.push(dpadValue);
          if (configState === 30) {
            configState = 22;
          } else {
            configState++;
          }
          configStateChanged = true;
        }
      }
      break;
  }
  if (configStateChanged) {
    /* wait for the user */
    configChangeState(configState, configs[id].retro, configs[id].shared);
    if (configState == -1) {
      finishConfig();
    } else {
      setTimeout(function () {
        configHandle(id, configState);
      }, 1000 / 10);
    }
  } else {
    setTimeout(function () {
      configHandle(id, configState);
    }, 1000 / 30);
  }
};
function configGamepad() {
  const id = configQueue[0];
  var gp = getGamepads()[id];
  document.getElementById("gamepad_config").classList.add("shown");
  configs[id] = {
    buttons: [
      -1, -1, -1, -1, -1, -1, -1, -1, // first 8 is P1
      -1, -1, -1, -1, -1, -1, -1, -1 // second 8 is P2
    ],
    axes: [], // axis ID + 1, negative if inverted.
    lastFrameButtonState: 0,
    shared: false,
    weirdDpad: 0, // axis ID + 1 for consistency
    weirdDpadValues: [],
    noAxes: false
  };
  configChangeState(0);
  configHandle(id, 0);
  document.getElementById("gamepad_config").querySelector("p").innerText = "Configuring gamepad #" + id + " called " + gp.id;
  return;
}

function getGamepads() {
  var gamepads = navigator.getGamepads
    ? navigator.getGamepads()
    : navigator.webkitGetGamepads ? navigator.webkitGetGamepads : [];
  if (!gamepads) {
    console.log("!gamepads");
    return [];
  }
  return gamepads;
}

function removeGamepad(index) {
  console.log("Gamepad " + index + " removed.");
  configs[index] = {};
}

function controllerLoop() {
  var buttonPressedState = 0;
  var gamepads = getGamepads();
  if (!gamepads) { return; }
  var gamepadCount = gamepads.length;
  for (var i = 0; i < gamepads.length; i++) {
    if (!Object.getOwnPropertyNames(configs[i]).length) {
      // config was deleted, because gamepad was disconnected
      gamepadCount--;
      continue;
    }
    gp = gamepads[i];
    const state1 = getGamepadStateSys(i, false);
    const new1 = getNewPressesSys(state1, configs[i].lastFrameButtonState1);
    for (var k = 0; k < new1.length; k++) {
      if (new1[k]) {
        console.log("gamepad " + i + " player 1 button " + k, state1, new1);
      }
    }
    configs[i].lastFrameButtonState1 = state1;
    if (configs[i].shared) {
      const state2 = getGamepadStateSys(i, true);
      const new2 = getNewPressesSys(state2, configs[i].lastFrameButtonState2);
      for (var k = 0; k < new2.length; k++) {
        if (new2[k]) {
          console.log("gamepad " + i + " player 2 button " + k);
        }
      }
      configs[i].lastFrameButtonState2 = state2;
    }
  }
  if (!configQueue.length && gamepadCount) {
    // only continue if the config queue is empty,
    // and there are actually gamepads connected.
    start = requestAnimationFrame(controllerLoop);
  }
}
