var dictionary = [];
function getCSV() {
  console.log("getCSV();");
  return new Promise((resolve, reject) => {
    var req = new XMLHttpRequest(); // HTTPでファイルを読み込むためのXMLHttpRrequestオブジェクトを生成、サーバと非同期通信するためのAPI
    req.open("GET", "tmp2pw.csv", true); // アクセスするファイルを指定
    req.onreadystatechange = () => {
      if (req.readyState === 4 && req.status === 0) {
        alert(req.responseText.substring(0, 32));
        resolve(convertCSVtoArray(req.responseText));
      } else {
        reject(new Error(req.statusText));
      }
    };
    req.onerror = () => {
      reject(new Error(req.statusText));
    };
    req.send(null); // HTTPリクエストの発行
  });
}
function convertCSVtoArray(csv) {
  console.log("convertCSVtoArray(" + csv.substring(0, 32) + "...);");
  dictionary = csv.split(",");
  document.getElementById("wordcount").innerText = dictionary.length + " words loaded";
}
function checkValid(text) {
  console.log("checkValid(" + text + ");")
  if (dictionary.length) {
    updateValid(-2);
  }
  if (text.length < 4) {
    updateValid(-1);
  } else if (dictionary.includes(text)) {
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
  for (; count > 0; count--) {
    while (true) {
      var i = Math.floor(Math.random() * dictionary.length);
      if (!indexes.includes(i)) {
        indexes.push(i);
        console.log("index " + i);
        continue;
      }
    }
  }
  var out = document.getElementById("pw_gen");
  out.innerHTML = "";
  for (var i = 0; i < indexes.length; i++) {
    out.innerHTML += dictionary[indexes[i]] + "<br>";
  }
}
document.addEventListener("DOMContentLoaded", getCSV, {once: true});