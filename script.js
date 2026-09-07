// ===============================
// SCORES & STATISTICS
// ===============================

let xScore = Number(localStorage.getItem("xScore")) || 0;
let oScore = Number(localStorage.getItem("oScore")) || 0;

let wins = Number(localStorage.getItem("wins")) || 0;
let losses = Number(localStorage.getItem("losses")) || 0;
let draws = Number(localStorage.getItem("draws")) || 0;

let difficulty = localStorage.getItem("difficulty") || "medium";


// ===============================
// MENU BUTTONS
// ===============================

const twoPlayerBtn = document.getElementById("two-player");
const computerBtn = document.getElementById("computer");
const scoreBtn = document.getElementById("score");
const settingBtn = document.getElementById("setting");
const backMenuBtn = document.getElementById("backMenu");

if (backMenuBtn) {
  backMenuBtn.addEventListener("click", function () {
    window.location.href = "index.html";
  });
}

if (twoPlayerBtn) {
  twoPlayerBtn.addEventListener("click", function () {
    window.location.href = "game.html";
  });
}

if (computerBtn) {
  computerBtn.addEventListener("click", function () {
    window.location.href = "computer.html";
  });
}

if (scoreBtn) {
  scoreBtn.addEventListener("click", function () {
    window.location.href = "score.html";
  });
}

if (settingBtn) {
  settingBtn.addEventListener("click", function () {
    window.location.href = "setting.html";
  });
}


// ===============================
// SOUND SETTINGS
// ===============================

const soundSetting = document.getElementById("soundSetting");

let soundOn = localStorage.getItem("soundOn") !== "false";


// ===============================
// BACKGROUND MUSIC
// ===============================

const bgMusic = document.getElementById("bgMusic");

function startMusic() {
  if (!bgMusic || !soundOn) return;

  bgMusic.volume = 0.15;
  bgMusic.loop = true;

  bgMusic.play().catch(function (error) {
    console.log("Music error:", error);
  });
}

function stopMusic() {
  if (!bgMusic) return;

  bgMusic.pause();
}


// ===============================
// SOUND EFFECTS
// ===============================

let audioContext;

function playSound(type) {

  if (!soundOn) return;

  if (!audioContext) {
    audioContext =
      new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  if (type === "click") {
    oscillator.frequency.value = 600;
  }

  if (type === "win") {
    oscillator.frequency.value = 900;
  }

  if (type === "draw") {
    oscillator.frequency.value = 300;
  }

  oscillator.type = "sine";

  gain.gain.setValueAtTime(
    0.2,
    audioContext.currentTime
  );

  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + 0.2
  );

  oscillator.start();

  oscillator.stop(
    audioContext.currentTime + 0.2
  );
}


// ===============================
// SOUND BUTTON
// ===============================

if (soundSetting) {

  soundSetting.textContent =
    soundOn ? "🔊 Sound ON" : "🔇 Sound OFF";

  soundSetting.addEventListener("click", function () {

    soundOn = !soundOn;

    localStorage.setItem("soundOn", soundOn);

    soundSetting.textContent =
      soundOn ? "🔊 Sound ON" : "🔇 Sound OFF";

    if (soundOn) {
      startMusic();
    } else {
      stopMusic();
    }

  });
}


// ===============================
// DIFFICULTY
// ===============================

const difficultyButtons =
  document.querySelectorAll(".difficulty-btn");

difficultyButtons.forEach(function (button) {

  if (button.dataset.level === difficulty) {
    button.classList.add("selected");
  }

  button.addEventListener("click", function () {

    difficulty = button.dataset.level;

    localStorage.setItem(
      "difficulty",
      difficulty
    );

    difficultyButtons.forEach(function (btn) {
      btn.classList.remove("selected");
    });

    button.classList.add("selected");

  });

});


// ===============================
// GAME
// ===============================

const cells = document.querySelectorAll(".cell");
const computerBoard =
  document.getElementById("computerBoard");

if (cells.length > 0) {

  let currentPlayer = "X";
  let gameOver = false;

  const turnMessage =
    document.getElementById("turnMessage");


  // ===============================
  // WINNING COMBINATIONS
  // ===============================

  const winningCombinations = [

    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    [0, 4, 8],
    [2, 4, 6]

  ];


  // ===============================
  // CHECK WINNER
  // ===============================

  function checkWinner() {

    for (let combination of winningCombinations) {

      let a = combination[0];
      let b = combination[1];
      let c = combination[2];

      if (
        cells[a].textContent !== "" &&
        cells[a].textContent === cells[b].textContent &&
        cells[a].textContent === cells[c].textContent
      ) {

        gameOver = true;

        cells[a].classList.add("winner");
        cells[b].classList.add("winner");
        cells[c].classList.add("winner");

        playSound("win");


        // X WINS
        if (cells[a].textContent === "X") {

          xScore++;

          localStorage.setItem(
            "xScore",
            xScore
          );

          // Computer game = Player win
          if (computerBoard) {

            wins++;

            localStorage.setItem(
              "wins",
              wins
            );

          }

          showPopup("🎉 You Win!");

        }


        // O WINS
        else {

          oScore++;

          localStorage.setItem(
            "oScore",
            oScore
          );

          // Computer game = Computer win
          if (computerBoard) {

            losses++;

            localStorage.setItem(
              "losses",
              losses
            );

            showPopup("🤖 Computer Wins!");

          } else {

            showPopup("🎉 O Wins!");

          }

        }

        return true;
      }
    }


    // ===============================
    // DRAW
    // ===============================

    let isDraw = true;

    cells.forEach(function (cell) {

      if (cell.textContent === "") {
        isDraw = false;
      }

    });


    if (isDraw) {

      gameOver = true;

      playSound("draw");

      if (computerBoard) {

        draws++;

        localStorage.setItem(
          "draws",
          draws
        );

      }

      showPopup("🤝 It's a Draw!");

      return true;
    }

    return false;
  }


  // ===============================
  // RANDOM COMPUTER MOVE
  // EASY
  // ===============================

  function randomComputerMove() {

    let emptyCells = [];

    cells.forEach(function (cell, index) {

      if (cell.textContent === "") {
        emptyCells.push(index);
      }

    });

    if (emptyCells.length === 0) return;

    let randomIndex =
      Math.floor(
        Math.random() * emptyCells.length
      );

    let computerCell =
      emptyCells[randomIndex];

    cells[computerCell].textContent = "O";

    cells[computerCell].classList.add("o-mark");

    playSound("click");

    checkWinner();
  }


  // ===============================
  // WINNING MOVE
  // ===============================

  function findWinningMove(player) {

    for (let combination of winningCombinations) {

      let values = combination.map(function (index) {
        return cells[index].textContent;
      });

      if (
        values.filter(function (value) {
          return value === player;
        }).length === 2 &&
        values.includes("")
      ) {

        let emptyIndex =
          values.indexOf("");

        return combination[emptyIndex];
      }

    }

    return null;
  }


  // ===============================
  // MEDIUM COMPUTER MOVE
  // ===============================

  function mediumComputerMove() {

    // Computer tries to win
    let winningMove =
      findWinningMove("O");

    if (winningMove !== null) {

      cells[winningMove].textContent = "O";

      cells[winningMove].classList.add("o-mark");

      playSound("click");

      checkWinner();

      return;
    }


    // Computer blocks player
    let blockingMove =
      findWinningMove("X");

    if (blockingMove !== null) {

      cells[blockingMove].textContent = "O";

      cells[blockingMove].classList.add("o-mark");

      playSound("click");

      checkWinner();

      return;
    }


    // Otherwise random
    randomComputerMove();
  }


  // ===============================
  // HARD COMPUTER MOVE
  // ===============================

  function hardComputerMove() {

    // 1. Try to win
    let winningMove =
      findWinningMove("O");

    if (winningMove !== null) {

      cells[winningMove].textContent = "O";

      cells[winningMove].classList.add("o-mark");

      playSound("click");

      checkWinner();

      return;
    }


    // 2. Block player
    let blockingMove =
      findWinningMove("X");

    if (blockingMove !== null) {

      cells[blockingMove].textContent = "O";

      cells[blockingMove].classList.add("o-mark");

      playSound("click");

      checkWinner();

      return;
    }


    // 3. Take center
    if (cells[4].textContent === "") {

      cells[4].textContent = "O";

      cells[4].classList.add("o-mark");

      playSound("click");

      checkWinner();

      return;
    }


    // 4. Take a corner
    let corners = [0, 2, 6, 8];

    let emptyCorners = corners.filter(function (index) {

      return cells[index].textContent === "";

    });


    if (emptyCorners.length > 0) {

      let randomCorner =
        emptyCorners[
          Math.floor(
            Math.random() * emptyCorners.length
          )
        ];

      cells[randomCorner].textContent = "O";

      cells[randomCorner].classList.add("o-mark");

      playSound("click");

      checkWinner();

      return;
    }


    // 5. Random if nothing else
    randomComputerMove();
  }


  // ===============================
  // COMPUTER MOVE
  // ===============================

  function computerMove() {

    if (difficulty === "easy") {

      randomComputerMove();

    }

    else if (difficulty === "medium") {

      mediumComputerMove();

    }

    else if (difficulty === "hard") {

      hardComputerMove();

    }

  }


  // ===============================
  // 2 PLAYER GAME
  // ===============================

  if (!computerBoard) {

    cells.forEach(function (cell) {

      cell.addEventListener("click", function () {

        startMusic();

        if (gameOver) return;

        if (cell.textContent !== "") return;


        cell.textContent = currentPlayer;

        playSound("click");


        if (currentPlayer === "X") {

          cell.classList.add("x-mark");

        } else {

          cell.classList.add("o-mark");

        }


        checkWinner();

        if (gameOver) return;


        if (currentPlayer === "X") {

          currentPlayer = "O";

          if (turnMessage) {
            turnMessage.textContent = "O turn";
          }

        }

        else {

          currentPlayer = "X";

          if (turnMessage) {
            turnMessage.textContent = "X turn";
          }

        }

      });

    });

  }


  // ===============================
  // COMPUTER GAME
  // ===============================

  if (computerBoard) {

    cells.forEach(function (cell) {

      cell.addEventListener("click", function () {

        startMusic();

        if (gameOver) return;

        if (cell.textContent !== "") return;


        // Player X
        cell.textContent = "X";

        cell.classList.add("x-mark");

        playSound("click");


        checkWinner();

        if (gameOver) return;


        if (turnMessage) {
          turnMessage.textContent =
            "🤖 Computer turn";
        }


        // Computer delay
        setTimeout(function () {

          if (gameOver) return;

          computerMove();

          if (!gameOver && turnMessage) {

            turnMessage.textContent =
              "Your turn";

          }

        }, 500);

      });

    });

  }


  // ===============================
  // RESTART GAME
  // ===============================

  const restartBtn =
    document.getElementById("restart");

  if (restartBtn) {

    restartBtn.addEventListener("click", function () {

      cells.forEach(function (cell) {

        cell.textContent = "";

        cell.classList.remove("winner");

        cell.classList.remove("x-mark");

        cell.classList.remove("o-mark");

      });

      currentPlayer = "X";

      gameOver = false;


      if (turnMessage) {

        turnMessage.textContent =
          computerBoard
            ? "Your turn"
            : "X turn";

      }

    });

  }

}


// ===============================
// SCORE PAGE
// ===============================

const xScoreDisplay =
  document.getElementById("xScore");

const oScoreDisplay =
  document.getElementById("oScore");

if (xScoreDisplay) {

  xScoreDisplay.textContent = xScore;

}

if (oScoreDisplay) {

  oScoreDisplay.textContent = oScore;

}


// ===============================
// STATISTICS DISPLAY
// ===============================

const winsDisplay =
  document.getElementById("wins");

const lossesDisplay =
  document.getElementById("losses");

const drawsDisplay =
  document.getElementById("draws");


if (winsDisplay) {

  winsDisplay.textContent = wins;

}

if (lossesDisplay) {

  lossesDisplay.textContent = losses;

}

if (drawsDisplay) {

  drawsDisplay.textContent = draws;

}


// ===============================
// RESET SCORE
// ===============================

const resetScoreBtn =
  document.getElementById("resetScore");

if (resetScoreBtn) {

  resetScoreBtn.addEventListener("click", function () {

    const confirmReset =
      showPopup(
        "Are you sure you want to reset the score?"
      );

    if (confirmReset) {

      xScore = 0;
      oScore = 0;

      localStorage.setItem("xScore", 0);
      localStorage.setItem("oScore", 0);

      if (xScoreDisplay) {
        xScoreDisplay.textContent = 0;
      }

      if (oScoreDisplay) {
        oScoreDisplay.textContent = 0;
      }

    }

  });

}


// ===============================
// RESET STATISTICS
// ===============================

const resetStats =
  document.getElementById("resetStats");

if (resetStats) {

  resetStats.addEventListener("click", function () {

    const confirmReset =
      showPopup(
        "Are you sure you want to reset statistics?"
      );

    if (confirmReset) {

      wins = 0;
      losses = 0;
      draws = 0;

      localStorage.setItem("wins", 0);
      localStorage.setItem("losses", 0);
      localStorage.setItem("draws", 0);

      if (winsDisplay) {
        winsDisplay.textContent = 0;
      }

      if (lossesDisplay) {
        lossesDisplay.textContent = 0;
      }

      if (drawsDisplay) {
        drawsDisplay.textContent = 0;
      }

    }

  });

}


// ===============================
// THEME
// ===============================

const themeSetting =
  document.getElementById("themeSetting");

let darkMode =
  localStorage.getItem("darkMode") === "true";


if (darkMode) {

  document.body.classList.add("dark");

}


if (themeSetting) {

  themeSetting.textContent =
    darkMode
      ? "☀️ Light Mode"
      : "🌙 Dark Mode";


  themeSetting.addEventListener("click", function () {

    darkMode = !darkMode;

    localStorage.setItem(
      "darkMode",
      darkMode
    );

    document.body.classList.toggle("dark");


    themeSetting.textContent =
      darkMode
        ? "☀️ Light Mode"
        : "🌙 Dark Mode";

  });

}


// ===============================
// RESET SETTINGS
// ===============================

const resetSettings =
  document.getElementById("resetSettings");

if (resetSettings) {

  resetSettings.addEventListener("click", function () {

    localStorage.removeItem("soundOn");
    localStorage.removeItem("darkMode");
    localStorage.removeItem("difficulty");

    soundOn = true;

    darkMode = false;

    difficulty = "medium";


    document.body.classList.remove("dark");


    if (soundSetting) {

      soundSetting.textContent =
        "🔊 Sound ON";

    }


    if (themeSetting) {

      themeSetting.textContent =
        "🌙 Dark Mode";

    }


    difficultyButtons.forEach(function (button) {

      button.classList.remove("selected");

      if (button.dataset.level === "medium") {
        button.classList.add("selected");
      }

    });


    stopMusic();

    showPopup("⚙️ Settings reset!");

  });

}
// ===============================
// CUSTOM POPUP
// ===============================

const customPopup = document.getElementById("customPopup");
const popupMessage = document.getElementById("popupMessage");
const popupOk = document.getElementById("popupOk");

function showPopup(message) {
  if (!customPopup || !popupMessage) return;

  popupMessage.textContent = message;
  customPopup.style.display = "flex";
}

if (popupOk) {
  popupOk.addEventListener("click", function () {
    customPopup.style.display = "none";
  });
}
