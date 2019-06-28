window.addEventListener("gamepadconnected", function (e) {
    var gp = navigator.getGamepads()[e.gamepad.index];
    console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
        gp.index, gp.id,
        gp.buttons.length, gp.axes.length);
});

// poll the input
var interval;
if (!('ongamepadconnected' in window)) {
    // No gamepad events available, poll instead.
    interval = setInterval(pollGamepads, 500);
}

function pollGamepads() {
    var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
    for (var i = 0; i < gamepads.length; i++) {
        var gp = gamepads[i];
        if (gp) {
            //gamepadInfo.innerHTML = "Gamepad connected at index " + gp.index + ": " + gp.id + ". It has " + gp.buttons.length + " buttons and " + gp.axes.length + " axes.";
            gameLoop();
            clearInterval(interval);
        }
    }
}

function gameLoop() {
    console.log("loop");
}

function buttonPressed(b) {
    if (typeof(b) == "object") {
        return b.pressed;
    }
    return b == 1.0;
}

const btns = [
    document.getElementById("btn_a"),
    document.getElementById("btn_b"),
    document.getElementById("btn_x"),
    document.getElementById("btn_y"),
    document.getElementById("btn_lb"),
    document.getElementById("btn_rb"),
    document.getElementById("btn_lt"),
    document.getElementById("btn_rt"),
    document.getElementById("btn_sel"),
    document.getElementById("btn_sta"),
    document.getElementById("btn_l3"),
    document.getElementById("btn_r3"),
    document.getElementById("btn_up"),
    document.getElementById("btn_down"),
    document.getElementById("btn_left"),
    document.getElementById("btn_right"),
    document.getElementById("btn_sys")
];
const sticks = [
    document.getElementById("lstick"),
    document.getElementById("rstick")
];
const stick_radius = 25;
function gameLoop() {
    var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
    if (!gamepads) {
        return;
    }
    var gp = gamepads[0];
    //var numButtons = gp.buttons.length;
    //var numAxes = gp.axes.length;
    // buttons
    for (var i = 0; i < gp.buttons.length; i++) {
        if (buttonPressed(gp.buttons[i])) {
            btns[i].classList.add("active");
        } else {
            btns[i].classList.remove("active");
        }
    }
    // sticks
    for (var i = 0; i < gp.axes.length / 2; i++) {
        sticks[i].firstElementChild.style.transform =
        "translate(" + (gp.axes[2*i] * stick_radius).toFixed(0) + "px, " + (gp.axes[2*i+1] * stick_radius).toFixed(0) + "px)";
    }
    start = requestAnimationFrame(gameLoop);
}