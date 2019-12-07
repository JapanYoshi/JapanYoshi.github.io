/**
 * thanks for looking into my crappy code!
 * the code for getRandom() contains a list of inappropriate words, jsyk. I just thought you should really know that.
 * so uh, if you're the kind of person who would rather not read them, turn back now.
 * - haley
 */

var dictionary = [];
function getCSV() {
  console.log("getCSV();");
  var req = new XMLHttpRequest();
  req.open("GET", "tmp2pw.csv", true);
  req.onreadystatechange = () => {
    if (req.response !== "") {
      console.log("getCSV() response: " + req.response.substring(0, 32));
      convertCSVtoArray(req.response);
    } else {
      console.log("getCSV() status: " + req.statusText);
    }
  };
  req.onerror = () => {
    console.log("getCSV() soft error: " + req.statusText);
  };
  req.send(null); // HTTPリクエストの発行
}
function convertCSVtoArray(csv) {
  console.log("convertCSVtoArray(" + csv.substring(0, 32) + "...);");
  dictionary = csv.split(",");
  if (dictionary.length <= 1) {
    alert("Error: Dictionary failed to load. Please try reloading the page.");
  }
  document.getElementById("wordcount").innerText = dictionary.length + " words loaded";
}
function checkValid(text) {
  console.log("checkValid(" + text + ");")
  document.getElementById("pw").value = text.toLowerCase().replace(/[^a-z]/g, '')
  if (dictionary.length <= 1) {
    updateValid(-2);
  }
  if (text.length < 4) {
    updateValid(-1);
  } else if (dictionary.includes(text)) {
    console.log(text + " #" + dictionary.indexOf(text));
    updateValid(1);
  } else {
    updateValid(0);
  }
}
function updateValid(state) {
  console.log("updateValid");
  var valid = document.getElementById("pw_valid");
  switch (state) {
    case -2:
      valid.className = "";
      valid.innerText = "The dictionary wasn’t ready. Can you try again?";
      return;
    case -1:
      valid.className = "";
      valid.innerText = "Enter all 4 characters.";
      return;
    case 0:
      valid.className = "invalid";
      valid.innerText = "This isn’t a valid password in TMP2.";
      return;
    case 1:
      valid.className = "valid";
      valid.innerText = "This is a valid password in TMP2!";
      return;
  }
}

function getRandom() {
  console.log("getRandom();");
  var count = +(document.getElementById("count").value);
  var indexes = [];
  if (count > dictionary.length) {
    count = dictionary.length;
  }
  const safe = !document.getElementById("family_friendly").checked;
  var banned = [
     104, // anal
     122, // anus
     144, // arse
     348, // boob
     436, // butt
     551, // clit
     566, // cock
     631, // crap
     689, // damn
     763, // dick
    1180, // fuck
    1455, // hell
    2241, // muff
    2606, // piss
    2655, // poop
    2661, // porn
    3021, // sext
    3037, // shit
    3121, // slut
    3399, // tits
    3497  // turd
  ]
  for (; count > 0; count--) {
    while (true) {
      var i = Math.floor(Math.random() * dictionary.length);
      if (
        !indexes.includes(i) && // new word
        (!safe || !banned.includes(i)) // nsfw or not banned
      ) {
        indexes.push(i);
        console.log("index " + i);
        break;
      }
    }
  }
  var out = document.getElementById("pw_gen");
  while (out.children.length) {
    out.removeChild(out.lastChild);
  }
  for (var i = 0; i < indexes.length; i++) {
    var span = document.createElement("span");
    span.innerText = dictionary[indexes[i]];
    out.appendChild(span);
  }
}
document.addEventListener("DOMContentLoaded", getCSV, {once: true});