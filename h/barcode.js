const stripes = "Il|\u01C0\u01C1\u0399\u0406\u04C0\u04CF\u0964\u0965\u2016\u2223\u239C\u239F\u23A2\u23A5\u23AA\u23AE\u23B8\u23B9\u2502\u2503\u2551\u2588\u258A\u258C\u25AE\u2758\u2759\u275A\u2AF4\u2AFC\uFE31\uFF5C\uFFE8";
const charset = "0123456789ABCDEF" + "GHIJKLMNOPQRSTUV" + "WXYZ -/'.,!?()[]" + "<>&*:;#+%^_=|~\"\n";

const filterOut = (str) => {
    out = "";
    for (var i = 0; i < str.length; i++) {
        console.log(str[i]);
        if (charset.indexOf(str[i]) !== -1 ) {
            out += str[i];
        }
    }
    return out;
}

const validate = () => {
    const name = document.getElementById("name").value.toUpperCase();
    document.getElementById("name").value = filterOut(name);
};

const trim = () => {
    const name = document.getElementById("name").value.toUpperCase();
    document.getElementById("name").value = filterOut(name).slice(0, 25);
}

document.getElementById("encode").addEventListener("click", function(){
    var name = document.getElementById("name").value.toUpperCase();
    input = filterOut(name);
    document.getElementById("name").value = input;
    if (input.length % 5 !== 0) {
        input += "     ".slice(input.length % 5);
    }
    console.log(input);
    // group 5 * 6bit to 6 * 5bit. limit to 25 characters, right pad with spaces
    output = ""
    for (var i = 0; i < input.length / 5; i++) {
        var chunk = input.substring(5*i, 5*(i+1));
        var data = 0;
        // encode. javascript supports up to 32 bit integers, and we need 6 * 5 = 30 bits
        for (var j = 0; j < 5; j++) {
            data += charset.indexOf(chunk[j]) << (4-j) * 6
            console.log(j, chunk[j], (charset.indexOf(chunk[j])+64).toString(2).slice(1));
            console.log(j, (data+(1<<30)).toString(2).slice(1));
        }
        for (var j = 0; j < 6; j++) {
            var code = data >> ((5-j) * 5) & 31;
            console.log(j, (code + 32).toString(2).slice(1), code);
            output += stripes.slice(code, code + 1);
        }
    }
    document.getElementById("barcode").value = output;
});

const decodeBarcode = (str) => {
    out = [];
    for (var i = 0; i < str.length; i++) {
        id = stripes.indexOf(str[i]);
        if (id !== -1) {
            out.push(id);
        }
    }
    return out;
}

document.getElementById("decode").addEventListener("click", function(){
    var barcode = document.getElementById("barcode").value;
    input = decodeBarcode(barcode);
    console.log(input);
    // group 6 stripes
    output = "";
    for (var i = 0; i < input.length / 6; i++) {
        var chunk = input.slice(i * 6, (i + 1) * 6);
        var data = 0;
        for (var j = 0; j < 6; j++) {
            console.log(j, ((chunk[j]+64).toString(2)).slice(1));
            data += chunk[j] << ((5-j) * 5);
        }
        console.log(data.toString(2));
        for (var j = 0; j < 5; j++) {
            var code = (data >> (4 - j) * 6) & 63;
            console.log(j, code.toString(2), charset[code]);
            output += charset[code];
        }
    }
    document.getElementById("name").value = output.trim();
})

const clipboard = () => {
    var copyText = document.getElementById("barcode");
    copyText.select();
    document.execCommand("copy");
    alert("Copied barcode!\n" + copyText.value);
}