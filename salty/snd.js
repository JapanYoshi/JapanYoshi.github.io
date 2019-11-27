class SND {
  constructor(bgm_names, sfx_names) {
    this.bgm_data = {};
    this.sfx_data = {};
    this.vox_data = {};
    this.vox_queue = [];
    this.global_bgm_volume = +(localStorage.getItem("bgmVolume")) || 0.5;
    this.global_vox_volume = +(localStorage.getItem("voxVolume")) || 1;
    this.bgm_volumes = [0, 0, 0];
    this.bgm_sound;
    this.bgm_sound_extra;
    this.bgm_sound_extra2;
  
    // sound effects should be played willy nilly, but one copy per sound effect
    

    /**
     * This part sets up music and sound effects for Howler.js.
     */
    var BGM_PRELOAD_COUNT = 4;
    var SFX_PRELOAD_COUNT = 8;
    /**
     * This part loads the music onto the global variable bgm_data.
     */
    this.loadNewBgm(bgm_names, BGM_PRELOAD_COUNT);
    /**
     * This part loads sound effects into the variable sfx_data.
     */
    this.loadNewSfx(sfx_names, SFX_PRELOAD_COUNT);
  };
  loadNewBgm(names, preload_count) {
    for (var i = 0; i < names.length; i++) {
      var name = names[i]
      var sound = new Howl({
        src: [
          ROOT + "audio/music/" + name + ".ogg"
        ],
        autoplay: false,
        loop: true,
        preload: (i < preload_count),
        pool: 1,
        onload: function () {
          console.log("Music " + name + " loaded");
        },
        onloaderror: function () {
          console.log("Error loading music " + name);
        },
        onplay: function () {
          console.log("Started playing music " + name);
        },
        onplayerror: function () {
          console.log("Error playing music " + name);
        },
        onstop: function () {
          console.log("music " + name + " stopped");
        },
        onend: function () {
          console.log("music " + name + " finished");
        }
      });
      this.bgm_data[name] = sound;
    }
  }
  loadNewSfx(names, preload_count) {
    for (var i = 0; i < names.length; i++) {
      name = names[i];
      var sound = new Howl({
        src: [
          ROOT + "audio/sfx/" + name + ".ogg"
        ],
        autoplay: false,
        loop: false,
        preload: (i < preload_count),
        pool: 1,
        onload: function () {
          console.log("SFX " + name + " loaded");
        },
        onloaderror: function () {
          console.log("Error loading SFX " + name);
        },
        onplay: function () {
          console.log("Playing SFX " + name);
        },
        onplayerror: function () {
          console.log("Error playing SFX " + name);
        },
        onend: function () {
          console.log("SFX " + name + " finished");
        }
      });
      this.sfx_data[name] = sound;
    }
  }
  /**
   * All voice lines should be preloaded as soon as they're defined.
   * @param {Array<string>} names 
   */
  loadNewVox(names) {
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      console.log("SND.loadNewVox " + name);
      if (name === undefined) {
        throw "Name undefined!";
      }
      if (!this.vox_data[name]) {
        var sound = new Howl({
          src: [
            ROOT + "audio/voice/" + name + ".ogg"
          ],
          autoplay: false,
          loop: false,
          preload: true,
          pool: 1,
          onload: function () {
            console.log("VOX " + name + " loaded");
          },
          onloaderror: function () {
            console.log("Error loading VOX " + name);
          },
          onplay: function () {
            console.log("Playing VOX " + name);
          },
          onplayerror: function () {
            console.log("Error playing VOX " + name);
          },
          onend: function () {
            console.log("VOX " + name + " finished");            
            document.dispatchEvent(
              new CustomEvent('voxEnd', {
                detail: {
                  name: name
                }
              })
            );
          }
        });
        this.vox_data[name] = sound;
      }
    }
  };
  /**
   * Queues an array of voice lines for playing. 
   * @param {Array<string>} names Also checks for type string and converts it into an array of length 1.
   */
  queueVox(names) {
    if (typeof names === typeof "") {
      names = [names];
    }
    console.log("SND.queueVox " + name + ": " + this.vox_queue.length);
    for (var i = 0; i < names.length; i++) {
      const data = this.vox_data[names[i]];
      if (![data]) {
        console.log("Voice line not found: " + names[i]);
      } else {
        if (data.state !== "loaded") {
          data.load();
        }
        this.vox_queue.push(data);
        console.log("playNextVox this.vox_queue = ", this.vox_queue);
      }
    }
  }
  /**
   * Does both loadNewVox and queueVox in a row.
   */
  loadQueueVox(names) {
    this.loadNewVox(names);
    this.queueVox(names);
  }
  playFirstVox() {
    if (this.vox_queue.length) {
      var doPlay = (delay) => {
        if (this.vox_queue[0].state() !== "loaded") {
          setTimeout(doPlay, Math.min(1000, delay * 2));
          console.log("Waiting for voice to load.");
          return;
        } else {
          this.vox_queue[0].play();
          console.log("Voice loaded.");
        }
      }
      doPlay(50);
    }
  }
  /**
   * Plays the next queued voice line.
   */
  playNextVox() {
    console.log("playNextVox this.vox_queue = ", this.vox_queue);
    var data = this.vox_queue.shift(); // unshift PUTS elements
    console.log("voxEnd event dispatched");
    if (this.vox_queue.length !== 0) {
      var doPlay = (delay) => {
        if (this.vox_queue[0].state() !== "loaded") {
          setTimeout(doPlay, Math.min(1000, delay * 2));
          console.log("Waiting for voice to load.");
          return;
        } else {
          this.vox_queue[0].play();
          console.log("Voice loaded.");
        }
      }
      doPlay(50);
    } else {
      document.dispatchEvent(
        new CustomEvent('allVoxEnd', {
          detail: {
            name: data._src.substring(data._src.lastIndexOf("/"))
          }
        })
      );
      console.log("allVoxEnd event dispatched");
      return;
    }
  }

  /**
   * Pauses or unpauses a voice line.
   * @param {boolean} pause 
   */
  pauseVox(pause) {
    if (pause) {
      this.vox_queue[0].pause();
    } else {
      this.vox_queue[0].play();
    }
  }

  /**
   * Stops a voice line from playing.
   */
  stopVox() {
    this.vox_queue[0].stop();
    this.vox_queue = [];
  }
  /**
   * Pauses or unpauses the music.
   * @param {boolean} state To pause, pass true. To unpause,
   * pass false.
   */
  pauseBgm(state) {
    if (state) {
      if (this.bgm_sound) {
        this.bgm_sound.pause();
      }
      if (this.bgm_sound_extra) {
        this.bgm_sound_extra.pause();
      }
      if (this.bgm_sound_extra2) {
        this.bgm_sound_extra2.pause();
      }
    } else {
      if (this.bgm_sound) {
        this.bgm_sound.pause();
      }
      if (this.bgm_sound_extra) {
        this.bgm_sound_extra.pause();
      }
      if (this.bgm_sound_extra2) {
        this.bgm_sound_extra2.pause();
      }
    }
  }
  /**
   * Optionally fades the music, then definitely stops it.
   * @param {number} fade_ms Milliseconds to fade for. Pass
   * 0 to disable fading.
   */
  stopBgm(fade_ms) {
    console.log("stopBgm objects are", this.bgm_sound, this.bgm_sound_extra, this.bgm_sound_extra2);
    var c0 = this.bgm_sound;
    var c1 = this.bgm_sound_extra;
    var c2 = this.bgm_sound_extra2;
    if (!fade_ms) {
      console.log("stopBgm control flow", 4);
      if (!!c0) {
        console.log("stopBgm control flow", 5);
        c0.stop();
      }
      if (!!c1) {
        console.log("stopBgm control flow", 6);
        c1.stop();
      }
      if (!!c2) {
        console.log("stopBgm control flow", 7);
        c2.stop();
      }
    } else {
      console.log("stopBgm control flow", 0);
      if (!!c0) {
        console.log("stopBgm control flow", 1);
        c0.once("fade", () => {
          c0.stop();
        })
        c0.fade(c0.volume(), 0, fade_ms);
      }
      if (!!c1) {
        console.log("stopBgm control flow", 2);
        c1.once("fade", () => {
          c1.stop();
        })
        c1.fade(c1.volume(), 0, fade_ms);
      }
      if (!!c2) {
        console.log("stopBgm control flow", 3);
        c2.once("fade", () => {
          c2.stop();
        })
        c2.fade(c2.volume(), 0, fade_ms).stop();
      }
    }
  }
  /**
   * Plays background music.
   * The music is specified by an object:
   * * name - The filename looked up in bgm_data.
   * * vol - the initial volume from 0 to 1.
   * Background music is made of up to 3 simultaneous tracks,
   * which enables dynamically changing background music.
   * You can pass undefined to disable those extra tracks.
   * (In fact, you will need to pass undefined to at least one
   * of bgmExtra and bgmExtra2 most of the time.)
   * @param {Object} bgm Name of track 1. vol defaults to 0.8 if base, 0.6 if bgmExtra or bgmExtra2 is defined.
   * @param {Object} bgmExtra Name of track 2. vol defaults
   * to 0.
   * @param {Object} bgmExtra2 Name of track 3. vol defaults
   * to 0.
   */
  playBgm(bgm, bgmExtra, bgmExtra2) {
    // Trying to play music while another music is playing
    // causes an error, so we want to stop the music if it's
    // playing, before we play our new one.
    console.log("bgm: 1", this.bgm_sound, "2", this.bgm_sound_extra, "3", this.bgm_sound_extra2);
    if (
      (this.bgm_sound && this.bgm_sound.playing()) ||
      (this.bgm_sound_extra && this.bgm_sound_extra.playing()) ||
      (this.bgm_sound_extra2 && this.bgm_sound_extra2.playing())
    ) {
      this.stopBgm(0);
    }
    if (bgm.vol === undefined) {
      bgm.vol = (!!bgmExtra || !!bgmExtra2) ? 0.6 : 0.8;
    }
    if (bgmExtra !== undefined && bgmExtra.vol === undefined) {
      bgmExtra.vol = 0;
    }
    if (bgmExtra2 !== undefined && bgmExtra.vol === undefined) {
      bgmExtra2.vol = 0;
    }
    // set up
    this.bgm_sound = !bgm ? undefined : this.bgm_data[bgm.name];
    this.bgm_extra = !bgmExtra ? undefined : this.bgm_data[bgmExtra.name];
    this.bgm_extra2 = !bgmExtra2 ? undefined : this.bgm_data[bgmExtra2.name];
    if (!this.bgm_sound) {
      console.log("No BGM 1 loaded");
    } else {
      if (this.bgm_sound.state() === "unloaded") {
        this.bgm_sound.load();
      }
    }
    if (!this.bgm_sound_extra) {
      console.log("No BGM 2 loaded");
    } else {
      if (this.bgm_sound_extra.state() === "unloaded") {
        this.bgm_sound_extra.load();
      }
    }
    if (!this.bgm_sound_extra2) {
      console.log("No BGM 3 loaded");
    } else {
      if (this.bgm_sound_extra2.state() === "unloaded") {
        this.bgm_sound_extra2.load();
      }
    }

    var prepareAudio = () => {
      console.log("prepareAudio fired.");
      // play them at close timing to each other
      if (!!this.bgm_sound_extra2) {
        this.bgm_volumes[2] = bgmExtra2.vol;
        this.bgm_sound_extra2.volume(bgmExtra2.vol * this.global_bgm_volume);
        if (this.bgm_sound_extra2.playing()) {
          this.bgm_sound_extra2.once("stop", function () {
            this.bgm_sound_extra2.play();
          })
          this.bgm_sound_extra2.stop();
        } else {
          this.bgm_sound_extra2.play();
        }
      }
      if (!!this.bgm_sound_extra) {
        this.bgm_sound_extra.volume(bgmExtra.vol * this.global_bgm_volume);
        this.bgm_volumes[1] = bgmExtra.vol;
        if (this.bgm_sound_extra.playing()) {
          this.bgm_sound_extra.once("stop", function () {
            this.bgm_sound_extra.play();
          })
          this.bgm_sound_extra.stop();
        } else {
          this.bgm_sound_extra.play();
        }
      }
      if (!!this.bgm_sound) {
        this.bgm_sound.volume(bgm.vol * this.global_bgm_volume);
        this.bgm_volumes[0] = bgm.vol;
        if (this.bgm_sound.volume() !== bgm.vol * this.global_bgm_volume) {
          console.log(
            "BGM sound volume error: The necessary volume was " +
            (bgm.vol * this.global_bgm_volume) +
            ", but the music volume is set to " +
            this.bgm_sound.volume() + "."
          );
        }
        if (this.bgm_sound.playing()) {
          this.bgm_sound.once("stop", function () {
            this.bgm_sound.play();
          })
          this.bgm_sound.stop();
        } else {
          this.bgm_sound.play();
        }
      }
    }
    if (
      !!this.bgm_sound && this.bgm_sound.state() === "unloaded" ||
      !!this.bgm_sound_extra && this.bgm_sound_extra.state() === "unloaded" ||
      !!this.bgm_sound_extra2 && this.bgm_sound_extra2.state() === "unloaded"
    ) {
      var waitForLoad = () => {
        setTimeout(() => {
          if (
            !!this.bgm_sound && this.bgm_sound.state() === "unloaded" ||
            !!this.bgm_sound_extra && this.bgm_sound_extra.state() === "unloaded" ||
            !!this.bgm_sound_extra2 && this.bgm_sound_extra2.state() === "unloaded"
          ) {
            waitForLoad();
          } else {
            // done, play
            prepareAudio();
          }
        }, 50);
      }
      waitForLoad();
    } else {
      // already loaded, play
      prepareAudio();
    }
    console.log("New bgm: 1", this.bgm_sound, "2", this.bgm_sound_extra, "3", this.bgm_sound_extra2);
  }
  /**
   * Adjust the global music volume.
   * Do NOT fire while any track is fading!
   * @param {number} vol A number between 0 and 1 (-1 and 1 if relative).
   * @param {boolean} relative Instead of an absolute number. adjusts volume by difference.
   */
  adjustBgmVolume(vol, relative) {
    if (relative) {
      this.global_bgm_volume = + this.global_bgm_volume + vol;
    } else {
      this.global_bgm_volume = vol;
    }
    this.global_bgm_volume = Math.min(Math.max(0, this.global_bgm_volume), 1);
    // adjust music vol accordingly
    if (this.bgm_sound) {
      this.bgm_sound.volume(this.global_bgm_volume * this.bgm_volumes[0]);
    }
    if (this.bgm_sound_extra) {
      this.bgm_sound_extra.volume(this.global_bgm_volume * this.bgm_volumes[1]);
    }
    if (this.bgm_sound_extra2) {
      this.bgm_sound_extra2.volume(this.global_bgm_volume * this.bgm_volumes[2]);
    }
    console.log("New global bgm volume is " + this.global_bgm_volume);
  }
  /**
   * Adjust the global voice volume.
   * Voice tracks don't fade
   * @param {number} vol A number between 0.5 and 1 (-0.5 and 0.5 if relative).
   * @param {boolean} relative Instead of an absolute number. adjusts volume by difference.
   */
  adjustVoxVolume(vol, relative) {
    if (relative) {
      this.global_vox_volume = + this.global_vox_volume + vol;
    } else {
      this.global_vox_volume = vol;
    }
    this.global_vox_volume = Math.min(Math.max(0.5, this.global_vox_volume), 1);
    // adjust vox vol accordingly
    if (this.vox_queue.length) {
      this.vox_queue[0].volume(this.global_vox_volume);
    }
    console.log("New global vox volume is " + this.global_vox_volume);
  }
  /**
   * 
   * @param {number} vol Volume to set it to from 0 to 1.
   */
  setExtraVolume(vol) {
    if (!this.bgm_sound_extra) {
      return
    }
    this.bgm_sound_extra.fade(this.bgm_sound_extra.volume(), vol, BGM_DELAY);
  }
  setExtra2Volume(vol) {
    if (!this.bgm_sound_extra2) {
      return
    }
    this.bgm_sound_extra2.fade(this.bgm_sound_extra2.volume(), vol, BGM_DELAY);
  }

  /**
   * Plays a sound effect.
   * The sound effect is specified by an object:
   * * name: the filename, which is looked up in the global
   * variable sfx_data.
   * * vol: the volume at which to play this at. If absent,
   * does not change the volume.
   * @param {object} sfx Object specifying the sound effect.
   */
  playSFX(sfx) {
    if (this.sfx_data[sfx.name]) {
      this.sfx_data[sfx.name].stop();
      if (sfx.vol) {
        this.sfx_data[sfx.name].volume(sfx.vol);
      }
      this.sfx_data[sfx.name].play();
    } else {
      console.log("playSFX error: the sound effect " + sfx + " does not exist.");
    }
  }
  /**
   * end howler.js setup stuff
   */
}