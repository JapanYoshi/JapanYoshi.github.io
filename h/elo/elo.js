const songData = [
    {
        song: "Raise Your Hands",
        artist: "Ummet Ozcan",
        diff: 1,
        lv: 9
    },
    {
        song: "Spacecats",
        artist: "Ummet Ozcan",
        diff: 1,
        lv: 9
    },
    {
        song: "Where's the Party At?",
        artist: "Mosh 'n' Smash",
        diff: 1,
        lv: 10
    },
    {
        song: "Handz Up",
        artist: "FЯEED",
        diff: 1,
        lv: 9
    },
    {
        song: "On the Floor Like",
        artist: "Bassjackers & Joe Ghost ft. MOTi",
        diff: 1,
        lv: 9
    },
    {
        song: "BLOW UP",
        artist: "R3DS",
        diff: 1,
        lv: 9
    },
    {
        song: "Butterfly",
        artist: "kors k ft. Starbitz",
        diff: 1,
        lv: 10
    },
    {
        song: "Don't Stop!!",
        artist: "BEMANI Sound Team \"Sota F.\"",
        diff: 1,
        lv: 10
    },
    {
        song: "DOWNER & UPPER",
        artist: "BEMANI Sound Team \"DJ TOTTO\"",
        diff: 1,
        lv: 9
    },
    {
        song: "Wicked",
        artist: "Hommarju",
        diff: 1,
        lv: 9
    },
    {
        song: "Saturday Night Love -Phunk Disco Mix-",
        artist: "Sota Fujimori",
        diff: 1,
        lv: 9
    },
    {
        song: "Disco Nights",
        artist: "RELECT",
        diff: 1,
        lv: 9
    },
    {
        song: "DAWN OF FALCON",
        artist: "L.E.D.-G",
        diff: 1,
        lv: 9
    },
    {
        song: "Gimme a Big Beat",
        artist: "kors k",
        diff: 1,
        lv: 9
    },
    {
        song: "Crystarium",
        artist: "BlackY",
        diff: 1,
        lv: 9
    },
    {
        song: "Luminous Pajama",
        artist: "BEMANI Sound Team \"SYUNN\"",
        diff: 1,
        lv: 9
    },
    {
        song: "FLOWER (STARDOM Remix)",
        artist: "BEMANI Sound Team \"DJ TOTTO\"",
        diff: 0,
        lv: 9
    },
    {
        song: "FLOWER (STARDOM Remix)",
        artist: "BEMANI Sound Team \"DJ TOTTO\"",
        diff: 1,
        lv: 10
    },
    {
        song: "Impress",
        artist: "BEMANI Sound Team \"SYUNN\"",
        diff: 1,
        lv: 9
    },
    {
        song: "RISING FIRE HAWK",
        artist: "L.E.D.-G",
        diff: 1,
        lv: 9
    },
    {
        song: "Midnight Amaretto",
        artist: "Camellia",
        diff: 1,
        lv: 9
    },
    {
        song: "THE SAFARI (STARDOM Remix)",
        artist: "BEMANI Sound Team \"SYUNN\"",
        diff: 1,
        lv: 10
    },
    {
        song: "DUB I DUB",
        artist: "kors k feat. Starbitz",
        diff: 1,
        lv: 10
    },
    {
        song: "take me higher",
        artist: "KOTONOHOUSE",
        diff: 1,
        lv: 9
    },
    {
        song: "BEYOND THE EARTH (STARDOM Remix)",
        artist: "BEMANI Sound Team \"Sota F.\"",
        diff: 1,
        lv: 10
    },
    {
        song: "Catch Our Fire! (STARDOM Remix)",
        artist: "kors k",
        diff: 1,
        lv: 10
    },
    {
        song: "Love 2 Shuffle",
        artist: "BEMANI Sound Team \"Sota F.\" feat. Starbitz",
        diff: 1,
        lv: 10
    },
    {
        song: "Shiva",
        artist: "Relect",
        diff: 1,
        lv: 10
    },
    {
        song: "Crazy Shuffle",
        artist: "Yooh",
        diff: 1,
        lv: 9
    },
    {
        song: "Dual Bladez",
        artist: "Omoshiro Sangokushi",
        diff: 1,
        lv: 9
    },
    {
        song: "Raw Crawler",
        artist: "Masayoshi Iimori",
        diff: 1,
        lv: 9
    },
    {
        song: "Bad Boy Birdwatch",
        artist: "HyperJuice",
        diff: 1,
        lv: 9
    },
    {
        song: "Garuda",
        artist: "kors k",
        diff: 0,
        lv: 9
    },
    {
        song: "Garuda",
        artist: "kors k",
        diff: 1,
        lv: 10
    },
    {
        song: "Second Heaven -Samba, Samba, Somebody MIX-",
        artist: "DJ YOSHITAKA",
        diff: 1,
        lv: 9
    },
    {
        song: "Hastur",
        artist: "USAO",
        diff: 1,
        lv: 10
    }
];

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
            console.log(obj);
            if (!obj.rating) {
                obj.rating = this.startRating;
            }
            if (!obj.games) {
                obj.games = 0;
            }
            this.data.push(obj);
        })
    }

    game(winner, loser, tied = false) {
        // assume player 1 has won or tied
        const r1 = this.data[winner].rating; // R_A
        const r2 = this.data[loser].rating; // R_B
        console.log(r1 + " " + r2);
        // expected outcome
        const exp = 1.0 / (1.0 + Math.pow(10, (r1 - r2) / this.m)); // W_BA
        console.log(exp);
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
        // commit changes
        this.data[winner].rating = r1 + exchange; // R'_A = R_A + k * W_BA
        this.data[loser].rating = r2 - exchange; // R'_B = R_B - k * W_BA
        this.data[winner].games++;
        this.data[loser].games++;
        this.games++;
    }

    search(song=null, artist=null, diff=null) {
        var found = this.data.find((obj) => {
            return (song ? obj.song === song : true) && (artist ? obj.artist === artist : true) && (diff ? obj.diff === diff : true);
        });
        return found;
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

var elo = new Elo(songData, 0, 1000);
const diffs = ["Easy", "Normal"];
var total = songData.length;
console.log("How many questions would you like to answer? ");
var questions
while (!questions) {
    var raw = window.prompt("How many questions?", undefined);
    try {
        questions = parseInt(raw);
    } catch {
        // nothing, just repeat
    }
}
while (questions) {
    var index1 = parseInt(Math.random() * total);
    var index2 = parseInt(Math.random() * total - 1);
    if (index2 >= index1) {
        index2++;
    }
    var song1 = elo.get(index1);
    var song2 = elo.get(index2);
    var response;
    while (!response) {
        var raw = window.prompt(`Which is harder?\nA: ${song1.name} ${diffs[song1.diff]} Lv. ${song1.lv}\nvs.\nB: ${song2.name} ${diffs[song2.diff]} Lv. ${song2.lv}\n1: A is harder.\n2: B is harder.\n3: They're about the same.\n0: Pass (I haven't played both, or I'm not sure)`, undefined);
        try {
            response = parseInt(raw, 10);
        } catch {
            // nothing, just repeat
        }
    }
    switch (response) {
        case 1:
            questions--;
            elo.game(index1, index2);
            return
        case 2:
            questions--;
            elo.game(index2, index1);
            return
        case 3:
            questions--;
            elo.game(index1, index2, true);
            return
        default:
            return
    }
}
console.log(elo.getAll());