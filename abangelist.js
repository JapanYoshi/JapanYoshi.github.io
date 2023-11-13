async function detect() {
  const dismissedBefore = localStorage.getItem("abangelistDismissed");
  if (dismissedBefore !== null) {return}
  let result = -1;
  const url = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
  try {
    await fetch(new Request(url))
    result = 0
  } catch (e) {
    result = 1
  }
  if (result == 0) {
    // Should I use Japanese?
    const userLang = navigator.language || navigator.userLanguage || "";
    const nihongo = userLang.startsWith("ja");
    // Which browser? Guess using User Agent (assume people who aren't using AdBlock also aren't faking their User Agent
    const isLikelyChrome = navigator.userAgent.includes("Chrome") || navigator.userAgent.includes("Chromium")
    const isLikelyEdge = navigator.userAgent.includes("Edge")
    const isLikelyFirefox = navigator.userAgent.includes("Firefox") || navigator.userAgent.includes("Firefox")
    const isLikelyOpera = navigator.userAgent.includes("Opera")
    
    const backdrop = document.createElement("div");
    backdrop.style = "font-family: sans-serif; position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.8);";
    const root = document.createElement("dialog");
    root.open = true;
    root.style = "inset: 0; max-width: 25em; max-height: 100svh; overflow-y: auto;"
    backdrop.appendChild(root)
    const h1 = document.createElement("h1");
    h1.innerText = nihongo ? "広告ブロッカー始めませんか？" : "Why not use an ad blocker?";
    h1.style = "font-size: 2rem; line-height: 2rem; margin: 0; padding: 0; margin-bottom: 0.5rem;";
    root.appendChild(h1);
    const body = document.createElement("div");
    body.innerText = nihongo ?
      "あなたのブラウザーには広告ブロッカーが入ってないようですね。広告ブロッカーは、ブラウザーで閲覧するページから広告を隠したり排除したりする機能です。広告が無くなる以外の利点は、広告を使ったプロファイリングを阻止してプライバシーの保護のレベルが高まることや、広告を提供するサーバーへの接続が節約されるので、読み込み時間が短くなったり、使用する接続量が少なくなったりというものもあります。" :
      "I see you’re not using an ad blocker on your browser yet. An ad blocker is a browser extension that detects and hides ads from the webpages you visit. It may also increase your privacy by preventing the profiling of user data, and because it reduces connections to ad servers, it may also shorten your load times and reduce the amount of Internet bandwidth used.";
    body.style = "margin-bottom: 0.5rem;";
    root.appendChild(body);
    const beforeLink = document.createElement("div");
    const browserName = nihongo ? (
      isLikelyChrome ? "Google Chrome かその他のChromium系ブラウザー" :
      isLikelyFirefox ? "Mozilla Firefox" :
      isLikelyEdge ? "Microsoft Edge（他にもMozilla Firefoxっていう良いのがあるって知ってますか？）" :
      isLikelyOpera ? "OperaかOpera GX" :
      "かなりマニアックなブラウザー"
    ) : (
      isLikelyChrome ? "Google Chrome or another Chromium-based browser" :
      isLikelyFirefox ? "Mozilla Firefox" :
      isLikelyEdge ? "Microsoft Edge (Ever heard of Mozilla Firefox though?)" :
      isLikelyOpera ? "Opera or Opera GX" :
      "some other weird browser"
    )
    beforeLink.innerHTML = nihongo ? (
      "信頼できる広告ブロッカーを、あなたのブラウザーの拡張機能ストアから入れましょう。今使っているブラウザーは多分<b>" + browserName + "</b>だと思いますが、単なる推測です。"
    ) : (
      "Install a trusted ad blocker through your browser’s extension store. I think you’re on <b>" + browserName + "</b>, but I may be wrong."
    );
    root.appendChild(beforeLink);
    const link = document.createElement("a");
    link.innerText = nihongo ? (
      "uBlock Origin を" + (
        isLikelyChrome ? "Chrome Webストアから" :
        isLikelyFirefox ? "Firefox ブラウザーアドオンから" :
        isLikelyEdge ? "Edge アドオンから" :
        isLikelyOpera ? "Opera アドオンから" :
        "このブラウザーでも使えたら"
      ) + "導入"
    ) : (
      "Get uBlock Origin from " + (
        isLikelyChrome ? "Chrome Web Store" :
        isLikelyFirefox ? "Firefox Browser Add-ons" :
        isLikelyEdge ? "Edge Add-ons" :
        isLikelyOpera ? "Opera Addons" :
        "...Hopefully it supports your browser"
      )
    )
    link.href = (
      isLikelyChrome ? "https://chromewebstore.google.com/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm" :
      isLikelyFirefox ? "https://addons.mozilla.org/en/firefox/addon/ublock-origin/" :
      isLikelyEdge ? "https://microsoftedge.microsoft.com/addons/detail/ublock-origin/odfafepnkmbhccpbejgmiehpchacaeak" :
      isLikelyOpera ? "https://addons.opera.com/en/extensions/details/ublock/" :
      "https://ublockorigin.com/"
    )
    link.style = "display: inline-block; border: 2px solid #0070ff; padding: 0.5rem; margin: 0.5rem auto; color: #0070ff; text-decoration: underline; text-shadow: none; border-radius: 0.5rem;";
    root.appendChild(link);
    const dismiss = document.createElement("button");
    dismiss.type = "button";
    dismiss.addEventListener("click", () => {document.body.removeChild(backdrop);});
    dismiss.innerText = nihongo ? "今はいいです" : "Not now, thanks";
    dismiss.style = "font-family: inherit; font-size: 0.8rem;";
    root.appendChild(dismiss);
    const dismissForever = document.createElement("button");
    dismissForever.type = "button";
    dismissForever.addEventListener("click", () => {
      document.body.removeChild(backdrop);
      localStorage.setItem("abangelistDismissed", "1");
    });
    dismissForever.innerText = nihongo ? "もう二度と言わないでください（記憶にローカルストレージを使用します。）" : "No thanks, and don’t remind me again (uses Local Storage)";
    dismissForever.style = "font-family: inherit; font-size: 0.8rem;";
    root.appendChild(dismissForever);
    document.body.appendChild(backdrop);
  }
}
detect()