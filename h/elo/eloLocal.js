const l10n = {
    "en": {
        "labelJsonArea": "Paste JSON here",
        "labelQuestions": "Number of questions to ask",
        "start": "Start",
        "labelQuestionNumber": "Question {{0}} of {{1}}",
        "labelHarder": "Which is harder?",
        "formatSong": "<b>{{SONG}}</b>{{ARTIST}}",
        "formatChart": "{{DIFF}} Lv. {{LV}}",
        "diffs": ["Easy", "Normal"],
        "labelSame": "Same",
        "labelPass": "Pass",
        "btnSubmit": "Submit"
    },
    "ja": {
        "labelJsonArea": "JSONをここにペースト",
        "labelQuestions": "問題数",
        "start": "スタート",
        "labelQuestionNumber": "{{1}}問中{{0}}問",
        "labelHarder": "どっちが難しい？",
        "formatSong": "{{SONG}} - {{ARTIST}}",
        "formatChart": "{{DIFF}} Lv. {{LV}}",
        "diffs": ["かんたん", "ふつう"],
        "labelSame": "同じ",
        "labelPass": "パス",
        "btnSubmit": "確認"
    }
}

class Elo {
    constructor(data, minRating = 1000, maxRating = 2000, m = 400, k = 32) {
        this.games = 0;
        this.data = [];
        this.min = minRating;
        this.max = maxRating;
        this.m = m; // multiplier
        this.k = k; // adjustment speed
        this.startRating = (maxRating - minRating) / 2 + minRating;
        this.addData(data);
    }

    addData(data) {
        data.forEach(obj => {
            try {
                
                if (!obj.rating) {
                    obj.rating = this.startRating;
                }
                if (!obj.games) {
                    obj.games = 0;
                }
                this.data.push(obj);
                console.log(`Added ${obj.song} Lv. ${obj.lv}`);
            } catch(err) {
                alert(err);
            }
        })
    }

    game(winner, loser, tied = false) {
        // assume player 1 has won or tied
        const r1 = this.data[winner].rating; // R_A
        const r2 = this.data[loser].rating; // R_B
        // expected outcome
        const exp = 1.0 / (1.0 + Math.pow(10, (r1 - r2) / this.m)); // W_BA
        // adjust
        const exchange = Math.round(this.k * (tied ? 0.5 : 1) * exp); // = k * W_BA
        if (r1 + exchange > this.maxRating) {
            // out of range
            exchange = Math.round(this.maxRating - r1);
        }
        if (r2 - exchange < this.minRating) {
            // out of range
            exchange = Math.round(r2 - this.minRating);
        }
        console.log("exp" + exp);
        console.log(`${this.data[winner].song} ${this.data[winner].lv} ${this.data[winner].rating} - ${this.data[loser].song} ${this.data[loser].lv} ${this.data[loser].rating}`);
        // commit changes
        this.data[winner].rating = r1 + exchange; // R'_A = R_A + k * W_BA
        this.data[loser].rating = r2 - exchange; // R'_B = R_B - k * W_BA
        this.data[winner].games++;
        this.data[loser].games++;
        this.games++;
        console.log(`${this.data[winner].song} ${this.data[winner].lv} ${this.data[winner].rating} - ${this.data[loser].song} ${this.data[loser].lv} ${this.data[loser].rating}`);
    }

    generateGame(){
        var index1 = parseInt(Math.random() * this.data.length);
        var index2 = parseInt(Math.random() * this.data.length - 1);
        if (index2 >= index1) {
            index2++;
        }
        var song1 = this.get(index1);
        var song2 = this.get(index2);
        return [index1, index2, song1, song2];
    }

    get(index) {
        try {
            return this.data[index];
        } catch(err) {
            console.log(err);
            return undefined;
        } 
    }

    getAll(sorted = false) {
        if (sorted) {
            return this.data.sort((a, b) => (a.rating > b.rating) ? 1 : -1);
        } else {
            return this.data;
        }
    }
}

var elo;

var lang = "en";

function setLang(){
        console.log("lang " + lang);
        console.log(l10n[lang]);
        const keys = Object.keys(l10n["en"]);
        console.log(keys);
        for (var i = 0; i < keys.length; i++) {
            console.log(keys[i]);
            switch (keys[i]) {
                case "formatSong":
                case "formatChart":
                case "diffs":
                    // reformat the song
                    break;
                default:
                    try {
                        document.getElementById(keys[i]).innerText = l10n[lang].hasOwnProperty(keys[i]) ? l10n[lang][keys[i]] : l10n["en"][keys[i]];
                    } catch(err) {
                        console.log(err);
                        alert(err + " " + keys[i]);
                    }
                    break;
            }
        }
        console.log("setLang");
}

function addLanguageChangers(){
    document.getElementById("langEn").addEventListener("click", function(){
        lang = "en";
        setLang();
    });
    document.getElementById("langJa").addEventListener("click", function(){
        lang = "ja";
        setLang();
    });
    console.log("addLanguageChangers");
}

function resetRadios() {
    var radios = document.getElementById("question").getElementsByClassName("radio");
    for (var i = 0; i < radios.length; i++) {
        radios[i].checked = (i === 0);
    }
}

var questions;
var qAsked;

function ask() {
    if (qAsked < questions) {
        resetRadios();
        document.getElementById("labelQuestionNumber").innerText = l10n[lang]["labelQuestionNumber"].replace("{{0}}", qAsked+1).replace("{{1}}", questions);
    
        const data = elo.generateGame();
        var cards = [document.getElementById("card1"), document.getElementById("card2")];
        for (var i = 0; i < cards.length; i++) {
            cards[i].getElementsByClassName("song")[0].innerHTML = l10n[lang]["formatSong"].replace("{{SONG}}", data[i+2].song).replace("{{ARTIST}}", data[i+2].artist);
            cards[i].getElementsByClassName("chart")[0].innerHTML = l10n[lang]["formatChart"].replace("{{DIFF}}", l10n[lang]["diffs"][data[i+2].diff]).replace("{{LV}}", data[i+2].lv);
            cards[i].getElementsByClassName("chart")[0].classList.add(`diff${data[i+2].diff}`);
            cards[i].getElementsByClassName("chart")[0].classList.remove(`diff${1 - data[i+2].diff}`);
        }
        document.getElementById("btnSubmit").addEventListener("click", function(){answer(data[0], data[1])}, {"once": true});
    } else {
        document.getElementById("jsonArea").value = JSON.stringify(elo.getAll(true));
        document.body.classList.remove("asking");
    }
}

function answer(index1, index2) {
    console.log(index1 + " " + index2);
    var response = parseInt(document.querySelector('input[name="opinion"]:checked').value);
    switch (response) {
        case 1:
            elo.game(index1, index2, false);
            break;  
        case 2:
            elo.game(index2, index1, false);
            break;
        case 3:
            elo.game(index1, index2, true);
            break;
        case 4:
            break;
        default:
            // put the onetime listener back again
            window.alert("Please select an option.");
            document.getElementById("btnSubmit").addEventListener("click", function(){answer(index1, index2)}, {"once": true});
    }
    if (1 <= response) {
        if (3 >= response) {
            qAsked++;
        }
        ask();
    }
}

function startAsking(){
    document.body.classList.add("asking");
    elo = new Elo(
        JSON.parse(document.getElementById("jsonArea").value),
        0, 2000, 400, 64
    );
    questions = document.getElementById("questions").value;
    qAsked = 0;
    ask(qAsked, questions);
    /*document.getElementById("jsonArea").value = elo.getAll(true);
    document.body.classList.remove("asking");*/
}

document.addEventListener("DOMContentLoaded", function() {
    addLanguageChangers();
    setLang("en");
    document.getElementById("start").addEventListener("click", startAsking);
});