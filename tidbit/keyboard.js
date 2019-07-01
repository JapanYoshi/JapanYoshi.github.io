const keys = document.getElementsByClassName("key_wrapper");
var keyList = [];
for (var i = 0; i < keys.length; i++) {
    keyList.push(keys[i].title);
}
console.log(keyList);
window.addEventListener("keydown", (event) => {
    console.log("keydown " + event.code);
    const i = keyList.findIndex((x) => x === event.code);
    if (i != -1) {
        keys[i].classList.add("active");
    }
});
window.addEventListener("keyup", (event) => {
    console.log("keyup " + event.code);
    const i = keyList.findIndex((x) => x === event.code);
    if (i != -1) {
        keys[i].classList.remove("active");
    }
});