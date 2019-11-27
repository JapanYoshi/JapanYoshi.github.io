var _ROOT = window.location.href;
if ((window.location.href).startsWith("file://")) {
  // protocol is "file", therefore it's a local test
  alert("Does not work offline!");
  _ROOT = "https://cors-anywhere.herokuapp.com/https://2gd4.me/salty/";
} else if ((window.location.href).startsWith("https://2gd4.me/")) {
  // future-proof if I decide not to renew the 2gd4.me domain
  _ROOT = "https://2gd4.me/salty/";
} else {
  _ROOT = _ROOT.slice(0, _ROOT.lastIndexOf("/") + 1);
}
console.log("ROOT is " + _ROOT)
const ROOT = _ROOT;
delete _ROOT;

BGM_DELAY = 400;