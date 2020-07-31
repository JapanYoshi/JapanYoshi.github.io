if (typeof(Storage) !== "undefined") {
    if (localStorage.getItem("darkmode")) {
        document.documentElement.classList.add("darkmode");
    }
    document.addEventListener("DOMContentLoaded", function(){
        var boop = document.createElement("div");
        boop.classList.add("darkSwitch");

        var boopBox = document.createElement("div");
        boop.appendChild(boopBox);
        
        var darkDayBox = document.createElement("div");
        darkDayBox.classList="darkDayBox";
        boopBox.appendChild(darkDayBox);
        
        var darkNightBox = document.createElement("div");
        darkNightBox.classList="darkNightBox";
        boopBox.appendChild(darkNightBox);

        boop.addEventListener("click", function(){
            if (document.documentElement.classList.contains("darkmode")) {
                document.documentElement.classList.remove("darkmode");
                localStorage.clear("darkmode");
            } else {
                localStorage.setItem("darkmode", 1);
                document.documentElement.classList.add("darkmode");
            }
        })
        document.body.appendChild(boop);
        var stl = document.createElement("style");
        stl.innerHTML = `
.darkSwitch {
    position: fixed;
    right: 0;
    top: 0;
    width: 1.5rem;
    height: 1.5rem;
    border: 0.25rem solid black;
    border-bottom-left-radius: 50%;
    font-size: 1rem;
    line-height: 2rem;
    text-align: center;
    background: black;
    box-shadow: 0 0 8px white, 0 0 0.25rem black inset;
    overflow: hidden;
}
.darkSwitch .darkDayBox {
    background: url('/resource/day.svg');
}
}
.darkSwitch .darkNightBox {
    background: url('/resource/night.svg');
}
.darkSwitch > div {
    width: 3rem;
    height: 1.5rem;
    display: flex;
    flex-direction: row;
    margin-left: 0rem;
    transition: margin-left ease-in-out 250ms;
}
.darkSwitch > div > div {
    width: 1.5rem;
    height: 1.5rem;
}
.darkSwitch > div > div > img, {
    width: 1.5rem;
}
html.darkmode .darkSwitch > div {
    margin-left: -1.5rem;
}
@media not all and (hover: hover) {
    .darkSwitch:hover > div {
        margin-left: -0.5rem;
    }
    html.darkmode .darkSwitch:hover > div {
        margin-left: -1rem;
    }
}`;
        document.head.appendChild(stl);
    });
}