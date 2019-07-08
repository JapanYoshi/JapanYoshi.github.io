const songData = [];
fetch('songs.json').then(response => {
    console.log(response.status);
    response.json().then(userInfo => {
        console.log(userInfo);
    })
});

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
            if (!obj.rating) {
                obj.rating = this.startRating;
            }
            if (!obj.games) {
                obj.games = 0;
            }
            this.data.push(obj);
            console.log(`Added ${obj.song} Lv. ${obj.lv}`);
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

document.addEventListener("DOMContentLoaded", function() {

    var elo = new Elo(songData, 0, 1000);
    const diffs = ["Easy", "Normal"];
    var total = songData.length;
    var questions = undefined;
    console.log("prepared");
    while (!questions) {
        console.log("asking");
        var raw = window.prompt("How many questions?", "NONE");
        if (raw === "NONE") {
            console.log("Prompts are turned off");
            throw "Prompts are turned off.";
        } 
        try {
            questions = parseInt(raw);
        } catch {
            // nothing, just repeat
        }
    }
    console.log(elo.getAll());
    while (questions) {
        var index1 = parseInt(Math.random() * total);
        var index2 = parseInt(Math.random() * total - 1);
        if (index2 >= index1) {
            index2++;
        }
        console.log(questions + " " + index1 + " " + index2);
        var song1 = elo.get(index1);
        var song2 = elo.get(index2);
        var response = undefined;
        while (response === undefined) {
            var raw = window.prompt(`${questions} question${questions == 1 ? "" : "s"} left\nWhich is harder?\nA: ${song1.song} ${diffs[song1.diff]} (Rating ${song1.rating}) Lv. ${song1.lv}\nvs.\nB: ${song2.song} ${diffs[song2.diff]} Lv. ${song2.lv} (Rating ${song2.rating})\n1: A is harder.\n2: B is harder.\n3: They're about the same.\n0: Pass (I haven't played both, or I'm not sure)`, undefined);
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
                break
            case 2:
                questions--;
                elo.game(index2, index1);
                break
            case 3:
                questions--;
                elo.game(index1, index2, true);
                break
            case 0:
            default:
                break
        }
        delete response;
    }
    console.log(elo.getAll(true));
    fs.writeFile("songs.json", elo.getAll(true), function(err) {
        if (err) {
            console.log(err);
        }
    });
}, false);