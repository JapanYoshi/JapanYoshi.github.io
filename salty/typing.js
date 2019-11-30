class TypingSingleton {
  constructor(){
    // from tilt state to config page
    this.dwOrder = [8, 1, 2, 7, 0, 3, 6, 5, 4];
    // Length 1: literal. Else: commands. You can input multiple characters with "input".
    // e.g. To input the word "the", type "inputthe".
    this.dwConfig = [
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
    this.deviceID = undefined;
  }
  getPage() {
    return this.dwOrder[getGamepadStateSys(Math.floor(this.deviceID / 2), this.deviceID % 2)[8]];
  }
  /**
   * Initializes a typing modal for the given player and input type.
   */
  activateTyping(player, type, title) {
    var modal = document.getElementById("modal_typing");
    var content = modal.getElementsByClassName("typing_content");
    this.deviceID = params.presentList[player];
    modal.classList.add("shown");
    modal.getElementById("typing_title").innerText = title;
    switch (type) {
    case 0:
        // keyboard
        content.classList = "keyboard";
        break;
    case 1:
        // gamepad
        content.classList = "gamepad";
        break;
    case 2:
        // mobile device
        content.classList = "mobile";
        break;
    default:
        abort(["#activateTyping() error", "Argument 1 \"type\" has an unrecognized value " + type + ".", "Accepted values are 0 = keyboard, 1 = gamepad, and 2 = mobile."]);
        return;
    }
    setTimeout(function () {
      changeKeyHandler(typingKeys, true);
      console.log("Modal key handler complete.");
    }, 500);
  }
}
var t = new TypingSingleton();