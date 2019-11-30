class GameSingleton {
  constructor(){
    this.q = 0;
    this.pdata = 
    this.data = episode_data;
    delete episode_data;
  }
  loadQuestionType(questionType){
    const special = document.getElementById("q_special");
    // delete all children
    while (special.lastChild) {
      special.removeChild(special.lastChild);
    }
    if (questionType) {
      // request page
      return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', ROOT + questionType + '.html', true);
        xhr.onreadystatechange = function () {
          if (this.readyState !== 4) throw Error("Page " + name + " could not load");
          if (this.status !== 200) {
            window.alert("Error on loading page " + name + ". Please see the browser console for details.");
            throw new Error("Page " + name + " could not load");
          }; // or whatever error handling you want
          special.innerHTML = this.responseText;
          resolve();
        };
        xhr.send();
        }
      );
    } else { 
      // unload page
      return;
    }
  }
  async getQuestionData(questionID) {
    try {
      const response = await fetch(ROOT + "q/" + questionID + "/q.json", {
        method: 'GET',
        headers: myHeaders,
        mode: 'cors'
      });
      if (response.ok) {
        console.log("await1");
        return response.json();
      }
      else {
        console.log("response:", response);
        alert("Error fetching strings. Response not OK.");
      }
    }
    catch (error) {
      console.log(error);
      abort("Error fetching strings." + error);
    }
  }

  initStandard() {
    this.qData = getQuestionData(this.data.question_id[this.q]);
    console.log(qData);
  }
}
var gameSingleton = new GameSingleton();
document.body.classList = "state_game_title";