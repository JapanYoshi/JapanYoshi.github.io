if (typeof(Storage) !== "undefined") {
    if (localStorage.getItem("darkmode") !== null) {
        const usingDarkMode = localStorage.getItem("darkmode")
        document.documentElement.classList.add(usingDarkMode ? "darkmode" : "lightmode");
    }
    document.addEventListener("DOMContentLoaded", function(){
        const boop = document.createElement("div");
        boop.classList.add("darkSwitch");

        const boopBox = document.createElement("div");
        boop.appendChild(boopBox);
        
        const darkDayBox = document.createElement("div");
        darkDayBox.classList="darkDayBox";
        boopBox.appendChild(darkDayBox);
        
        const darkNightBox = document.createElement("div");
        darkNightBox.classList="darkNightBox";
        boopBox.appendChild(darkNightBox);

        boop.addEventListener("click", function(){
            let isDarkMode = document.documentElement.classList.contains("darkmode");
            let isLightMode = document.documentElement.classList.contains("lightmode");
            if (!isDarkMode && !isLightMode) {
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    isDarkMode = true
                }
            }
            document.documentElement.classList.add(isDarkMode ? "lightmode" : "darkmode");
            document.documentElement.classList.remove(isDarkMode ? "darkmode" : "lightmode");
            localStorage.setItem("darkmode", !isDarkMode);
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
        .darkSwitch > div > .darkDayBox {
            background: url('/resource/day.svg');
        }
        .darkSwitch > div > .darkNightBox {
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
        .darkSwitch > div > div > img {
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