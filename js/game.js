"use strict";
/*
 * game.js
 *
 * This file contains the core game logic for the Teen Patti Chip Tracker.
 * It includes functions for:
 * - Player management (addPlayer, renderPlayersList)
 * - Game rounds (startGame, startRound, nextTurn, resetForNextRound, resetGame)
 * - Player actions (chal, raiseBet, pack, requestBackShow, showRound)
 * - Rendering the game state and updating win statistics.
 */

// Global Game State Variables
let players = [];
let initialChips = 1000;
let minBid = 100;
let currentBet = 0;
let pot = 0;
let currentTurnIndex = 0;
let roundActive = false;
let dealerIndex = 0;

// ------------------------------
// Player Management Functions
// ------------------------------
function addPlayer() {
  const nameInput = document.getElementById("playerName");
  const name = nameInput.value.trim();
  if (!name) {
    showAlertModal("Enter player name.", function(){});
    return;
  }
  players.push({
    id: players.length,
    name: name,
    chips: 0,
    blind: true,
    contribution: 0,
    active: true,
    folded: false,
    hasRaised: false,
    wins: 0,
    rounds: 0
  });
  nameInput.value = "";
  renderPlayersList();
}

function renderPlayersList() {
  const ul = document.getElementById("playersList");
  ul.innerHTML = "";
  players.forEach(p => {
    const li = document.createElement("li");
    li.textContent = p.name;
    ul.appendChild(li);
  });
}

// ------------------------------
// Game Flow Functions
// ------------------------------
function startGame() {
  if (players.length < 2) {
    showAlertModal("At least 2 players are required to start the game!", function(){});
    return;
  }
  initialChips = parseInt(document.getElementById("initialChipsSlider").value);
  minBid = parseInt(document.getElementById("minBidSlider").value);
  if (initialChips < 100) {
    showAlertModal("Initial chips must be at least 100.", function(){});
    return;
  }
  if (minBid < 10) {
    showAlertModal("Minimum bid must be at least 10.", function(){});
    return;
  }
  if (minBid > initialChips) {
    showAlertModal("Minimum bid cannot exceed initial chips.", function(){});
    return;
  }
  players.forEach(p => {
    p.chips = initialChips;
    p.contribution = 0;
    p.active = true;
    p.folded = false;
    p.blind = true;
    p.hasRaised = false;
    p.wins = 0;
    p.rounds = 0;
  });
  dealerIndex = 0;
  currentTurnIndex = dealerIndex;
  document.getElementById("setup").classList.add("hidden");
  document.getElementById("round").classList.remove("hidden");
  startRound();
}

function startRound() {
  currentTurnIndex = dealerIndex;
  players.forEach(p => {
    if (p.active) {
      p.folded = false;
      p.contribution = 0;
      p.hasRaised = false;
    }
  });
  pot = 0;
  players.forEach(p => {
    if (p.active) {
      let ante = p.blind ? Math.floor(minBid / 2) : minBid;
      if (p.chips < minBid) {
        p.active = false;
      } else {
        p.chips -= ante;
        p.contribution += ante;
        pot += ante;
      }
    }
  });
  currentBet = minBid;
  roundActive = true;
  renderGame();
}

function updateStats(roundWinner) {
  players.forEach(p => {
    p.rounds = (p.rounds || 0) + 1;
  });
  roundWinner.wins = (roundWinner.wins || 0) + 1;
}

function nextTurn() {
  checkElimination();
  const roundActivePlayers = players.filter(p => p.active && !p.folded);
  if (roundActivePlayers.length === 1) {
    let winner = roundActivePlayers[0];
    updateStats(winner);
    winner.chips += pot;
    showAlertModal(winner.name + " wins the round and takes the pot of " + pot + " chips!", function() {
      pot = 0;
      resetForNextRound();
    });
    return;
  }
  const gameActivePlayers = players.filter(p => p.active);
  if (gameActivePlayers.length === 1) {
    let winner = gameActivePlayers[0];
    showAlertModal(winner.name + " is the game winner!", function() {
      resetGame();
    });
    return;
  }
  do {
    currentTurnIndex = (currentTurnIndex + 1) % players.length;
  } while (!players[currentTurnIndex].active || players[currentTurnIndex].folded);
  renderGame();
}

function resetForNextRound() {
  checkElimination();
  if (players.filter(p => p.active).length === 1) {
    let winner = players.find(p => p.active);
    showAlertModal(winner.name + " is the game winner!", function() {
      resetGame();
    });
    return;
  }
  updateDealer();
  players.forEach(p => {
    if (p.active) {
      p.folded = false;
      p.contribution = 0;
      p.blind = true;
      p.hasRaised = false;
    }
  });
  startRound();
}

function updateDealer() {
  let newDealerIndex = (dealerIndex + 1) % players.length;
  while (!players[newDealerIndex].active) {
    newDealerIndex = (newDealerIndex + 1) % players.length;
    if (newDealerIndex === dealerIndex) break;
  }
  dealerIndex = newDealerIndex;
  currentTurnIndex = dealerIndex;
}

function resetGame() {
  players = [];
  pot = 0;
  currentBet = 0;
  currentTurnIndex = 0;
  roundActive = false;
  dealerIndex = 0;
  document.getElementById("round").classList.add("hidden");
  document.getElementById("setup").classList.remove("hidden");
  document.getElementById("playersList").innerHTML = "";
  document.getElementById("initialChipsSlider").value = 1000;
  updateInitialChipsLabel(1000);
  document.getElementById("minBidSlider").value = 100;
  updateMinBidLabel(100);
}

// ------------------------------
// Rendering Functions
// ------------------------------
function renderGame() {
  document.getElementById("pot").textContent = "Pot: " + pot;
  document.getElementById("currentBet").textContent = "Current Bet: " + currentBet;
  const playersGameDiv = document.getElementById("playersGame");
  playersGameDiv.innerHTML = "";
  players.forEach((p, index) => {
    if (p.active) {
      const card = document.createElement("div");
      card.className = "player-card";
      if (index === currentTurnIndex && !p.folded) {
        card.classList.add("active");
      }
      // Use a flex container to show player info and the win chart side-by-side.
      let blindCheckbox = `<input type="checkbox" id="blind-${p.id}" onchange="toggleBlindStatus(${p.id})" ${p.blind ? "checked" : ""} ${p.blind ? "" : "disabled"}>`;
      let rounds = p.rounds || 0;
      let wins = p.wins || 0;
      let winPercentage = rounds > 0 ? Math.round((wins / rounds) * 100) : 0;
      // Set CSS variable for the radial progress (convert percentage to degrees: percentage * 3.6)
      let degrees = winPercentage * 3.6;
      card.innerHTML = `
        <div class="card-content">
          <div class="player-info">
            <strong>${p.name}</strong><br>
            Chips: ${p.chips}<br>
            Contribution: ${p.contribution}<br>
            Blind: ${blindCheckbox}<br>
            Status: ${p.folded ? "Folded" : "Active"}
          </div>
          <div class="win-chart">
            <div class="radial-progress" style="--percentage: ${degrees};">
              <span>${winPercentage}%</span>
            </div>
          </div>
        </div>
      `;
      playersGameDiv.appendChild(card);
    }
  });
  const currentPlayer = players[currentTurnIndex];
  document.getElementById("turnIndicator").textContent =
      "Current Turn: " + (currentPlayer ? currentPlayer.name : "None");
  renderActions();
}

// ------------------------------
// Action Functions
// ------------------------------
function toggleBlindStatus(id) {
  const checkbox = document.getElementById("blind-" + id);
  const player = players.find(p => p.id === id);
  if (!player) return;
  if (!checkbox.checked) {
    player.blind = false;
    checkbox.disabled = true;
  }
}

function renderActions() {
  const actionsDiv = document.getElementById("actions");
  actionsDiv.innerHTML = "";
  const activePlayers = players.filter(p => p.active && !p.folded);
  if (activePlayers.length === 0) return;
  const currentPlayer = players[currentTurnIndex];
  if (!currentPlayer || !currentPlayer.active || currentPlayer.folded) return;
  if (activePlayers.length === 2) {
    const showBtn = document.createElement("button");
    showBtn.textContent = "Show";
    showBtn.onclick = showRound;
    actionsDiv.appendChild(showBtn);
  } else {
    const backShowBtn = document.createElement("button");
    backShowBtn.textContent = "Back Show";
    backShowBtn.onclick = requestBackShow;
    actionsDiv.appendChild(backShowBtn);
  }
  if (currentPlayer.hasRaised) {
    const chalBtn = document.createElement("button");
    chalBtn.textContent = "Chal";
    chalBtn.onclick = chal;
    actionsDiv.appendChild(chalBtn);
  } else {
    const chalBtn = document.createElement("button");
    chalBtn.textContent = "Chal";
    chalBtn.onclick = chal;
    actionsDiv.appendChild(chalBtn);
    const raiseBtn = document.createElement("button");
    raiseBtn.textContent = "Raise";
    raiseBtn.onclick = raiseBet;
    actionsDiv.appendChild(raiseBtn);
    const packBtn = document.createElement("button");
    packBtn.textContent = "Pack";
    packBtn.onclick = pack;
    actionsDiv.appendChild(packBtn);
  }
}

function chal() {
  const currentPlayer = players[currentTurnIndex];
  if (!currentPlayer || !currentPlayer.active || currentPlayer.folded) return;
  let requiredBet = currentPlayer.blind ? Math.floor(currentBet / 2) : currentBet;
  if (currentPlayer.chips - requiredBet < minBid) {
    showConfirmModal("Calling will leave you with fewer than the minimum bid. Press Yes to force a showdown/backshow, or No to pack.", function(decision) {
      if (decision) {
        if (players.filter(p => p.active && !p.folded).length === 2) {
          showRound();
        } else {
          requestBackShow();
        }
      } else {
        currentPlayer.folded = true;
        nextTurn();
      }
    });
    return;
  }
  if (requiredBet > currentPlayer.chips) {
    showAlertModal("Not enough chips to Chal. You are forced to Pack.", function() {
      currentPlayer.folded = true;
      nextTurn();
    });
    return;
  }
  currentPlayer.chips -= requiredBet;
  currentPlayer.contribution += requiredBet;
  pot += requiredBet;
  currentPlayer.hasRaised = false;
  nextTurn();
}

function raiseBet() {
  const currentPlayer = players[currentTurnIndex];
  if (!currentPlayer || !currentPlayer.active || currentPlayer.folded) return;
  const minRaise = currentBet + 10;
  let maxNewBet = currentPlayer.blind ? Math.floor(currentPlayer.chips * 2) : currentPlayer.chips;
  if (minRaise > maxNewBet) {
    showAlertModal("Not enough chips to raise.", function(){});
    return;
  }
  const activePlayers = players.filter(p => p.active && !p.folded);
  if (activePlayers.length === 2) {
    // For 2 players: automatically deduct and pass turn.
    showRaiseModal(minRaise, maxNewBet, function(newBet) {
      let requiredBet = currentPlayer.blind ? Math.floor(newBet / 2) : newBet;
      if (requiredBet > currentPlayer.chips) {
        showAlertModal("Not enough chips to raise.", function(){});
        return;
      }
      currentPlayer.chips -= requiredBet;
      currentPlayer.contribution += requiredBet;
      pot += requiredBet;
      currentBet = newBet;
      nextTurn();
    });
  } else {
    showRaiseModal(minRaise, maxNewBet, function(newBet) {
      currentBet = newBet;
      currentPlayer.hasRaised = true;
      renderGame();
    });
  }
}

function pack() {
  const currentPlayer = players[currentTurnIndex];
  if (currentPlayer) { currentPlayer.folded = true; }
  nextTurn();
}

function showWinnerModal(options, callback) {
  const modal = document.getElementById("winnerModal");
  const modalText = document.getElementById("modalText");
  const option1Btn = document.getElementById("option1");
  const option2Btn = document.getElementById("option2");
  modalText.textContent = "Select Winner:";
  option1Btn.textContent = options[0].name;
  option2Btn.textContent = options[1].name;
  let newOption1 = option1Btn.cloneNode(true);
  let newOption2 = option2Btn.cloneNode(true);
  option1Btn.parentNode.replaceChild(newOption1, option1Btn);
  option2Btn.parentNode.replaceChild(newOption2, option2Btn);
  newOption1.addEventListener("click", function() {
    modal.style.display = "none";
    callback(options[0].name);
  });
  newOption2.addEventListener("click", function() {
    modal.style.display = "none";
    callback(options[1].name);
  });
  modal.style.display = "flex";
}

function showRaiseModal(min, max, callback) {
  const modal = document.getElementById("raiseModal");
  const slider = document.getElementById("raiseSlider");
  const raiseText = document.getElementById("raiseText");
  const confirmBtn = document.getElementById("raiseConfirm");
  const cancelBtn = document.getElementById("raiseCancel");
  slider.min = min;
  slider.max = max;
  slider.step = 10;
  slider.value = min;
  raiseText.value = min;
  slider.oninput = function() {
    raiseText.value = slider.value;
  };
  raiseText.onchange = function() {
    let val = parseInt(raiseText.value);
    if (isNaN(val)) { val = min; }
    val = Math.max(min, Math.min(max, val));
    slider.value = val;
    raiseText.value = val;
  };
  const newConfirmBtn = confirmBtn.cloneNode(true);
  const newCancelBtn = cancelBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
  cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
  newConfirmBtn.addEventListener("click", function() {
    modal.style.display = "none";
    callback(parseInt(slider.value));
  });
  newCancelBtn.addEventListener("click", function() {
    modal.style.display = "none";
  });
  modal.style.display = "flex";
}

function showAlertModal(message, callback) {
  const modal = document.getElementById("alertModal");
  const modalText = document.getElementById("alertModalText");
  const okBtn = document.getElementById("alertOk");
  modalText.textContent = message;
  const newOkBtn = okBtn.cloneNode(true);
  okBtn.parentNode.replaceChild(newOkBtn, okBtn);
  newOkBtn.addEventListener("click", function() {
    modal.style.display = "none";
    if (callback) callback();
  });
  modal.style.display = "flex";
}

function showConfirmModal(message, callback) {
  const modal = document.getElementById("confirmModal");
  const modalText = document.getElementById("confirmModalText");
  const yesBtn = document.getElementById("confirmYes");
  const noBtn = document.getElementById("confirmNo");
  modalText.textContent = message;
  const newYesBtn = yesBtn.cloneNode(true);
  const newNoBtn = noBtn.cloneNode(true);
  yesBtn.parentNode.replaceChild(newYesBtn, yesBtn);
  noBtn.parentNode.replaceChild(newNoBtn, noBtn);
  newYesBtn.addEventListener("click", function() {
    modal.style.display = "none";
    callback(true);
  });
  newNoBtn.addEventListener("click", function() {
    modal.style.display = "none";
    callback(false);
  });
  modal.style.display = "flex";
}

function requestBackShow() {
  const currentPlayer = players[currentTurnIndex];
  let prevIndex = (currentTurnIndex - 1 + players.length) % players.length;
  while (!players[prevIndex].active || players[prevIndex].folded || prevIndex === currentTurnIndex) {
    prevIndex = (prevIndex - 1 + players.length) % players.length;
    if (prevIndex === currentTurnIndex) break;
  }
  const opponent = players[prevIndex];
  let requiredBet = currentPlayer.blind ? Math.floor(currentBet / 2) : currentBet;
  if (currentPlayer.chips < requiredBet) {
    showAlertModal(currentPlayer.name + " does not have enough chips for back show. Forced to Pack.", function() {
      currentPlayer.folded = true;
      nextTurn();
    });
    return;
  }
  currentPlayer.chips -= requiredBet;
  currentPlayer.contribution += requiredBet;
  pot += requiredBet;
  showConfirmModal(opponent.name + ", do you accept a back show request from " + currentPlayer.name + "?", function(accept) {
    if (accept) {
      if (currentPlayer.blind) {
        currentPlayer.blind = false;
        const currCheckbox = document.getElementById("blind-" + currentPlayer.id);
        if (currCheckbox) { currCheckbox.checked = false; currCheckbox.disabled = true; }
      }
      if (opponent.blind) {
        opponent.blind = false;
        const oppCheckbox = document.getElementById("blind-" + opponent.id);
        if (oppCheckbox) { oppCheckbox.checked = false; oppCheckbox.disabled = true; }
      }
      showWinnerModal(
        [
          { name: currentPlayer.name, id: currentPlayer.id },
          { name: opponent.name, id: opponent.id }
        ],
        function(winnerName) {
          if (winnerName === currentPlayer.name) { opponent.folded = true; }
          else if (winnerName === opponent.name) { currentPlayer.folded = true; }
          nextTurn();
        }
      );
    } else {
      showAlertModal("Back show declined.", function() {
        nextTurn();
      });
    }
  });
}

function showRound() {
  const activePlayers = players.filter(p => p.active && !p.folded);
  if (activePlayers.length !== 2) {
    showAlertModal("Show is only available when 2 players remain.", function(){});
    return;
  }
  const currentPlayer = players[currentTurnIndex];
  let requiredBet = currentPlayer.blind ? Math.floor(currentBet / 2) : currentBet;
  if (currentPlayer.chips < requiredBet) {
    showAlertModal(currentPlayer.name + " does not have enough chips for show. Forced to Pack.", function() {
      currentPlayer.folded = true;
      nextTurn();
    });
    return;
  }
  currentPlayer.chips -= requiredBet;
  currentPlayer.contribution += requiredBet;
  pot += requiredBet;
  showWinnerModal(
    [
      { name: activePlayers[0].name, id: activePlayers[0].id },
      { name: activePlayers[1].name, id: activePlayers[1].id }
    ],
    function(winnerName) {
      const winner = activePlayers.find(p => p.name === winnerName);
      if (!winner) {
        showAlertModal("Invalid winner.", function(){});
        return;
      }
      winner.chips += pot;
      showAlertModal(winner.name + " wins the pot of " + pot + " chips!", function() {
        pot = 0;
        players.forEach(p => { if (p.chips <= 0) { p.active = false; } });
        resetForNextRound();
      });
    }
  );
}

// ------------------------------
// Game Flow Functions
// ------------------------------
function checkElimination() {
  players.forEach(p => { if (p.active && p.chips < minBid) { p.active = false; } });
}
function nextTurn() {
  checkElimination();
  const roundActivePlayers = players.filter(p => p.active && !p.folded);
  if (roundActivePlayers.length === 1) {
    let winner = roundActivePlayers[0];
    updateStats(winner);
    winner.chips += pot;
    showAlertModal(winner.name + " wins the round and takes the pot of " + pot + " chips!", function() {
      pot = 0;
      resetForNextRound();
    });
    return;
  }
  const gameActivePlayers = players.filter(p => p.active);
  if (gameActivePlayers.length === 1) {
    let winner = gameActivePlayers[0];
    showAlertModal(winner.name + " is the game winner!", function() {
      resetGame();
    });
    return;
  }
  do {
    currentTurnIndex = (currentTurnIndex + 1) % players.length;
  } while (!players[currentTurnIndex].active || players[currentTurnIndex].folded);
  renderGame();
}
function resetForNextRound() {
  checkElimination();
  if (players.filter(p => p.active).length === 1) {
    let winner = players.find(p => p.active);
    showAlertModal(winner.name + " is the game winner!", function() {
      resetGame();
    });
    return;
  }
  updateDealer();
  players.forEach(p => {
    if (p.active) {
      p.folded = false;
      p.contribution = 0;
      p.blind = true;
      p.hasRaised = false;
    }
  });
  startRound();
}
function updateDealer() {
  let newDealerIndex = (dealerIndex + 1) % players.length;
  while (!players[newDealerIndex].active) {
    newDealerIndex = (newDealerIndex + 1) % players.length;
    if (newDealerIndex === dealerIndex) break;
  }
  dealerIndex = newDealerIndex;
  currentTurnIndex = dealerIndex;
}
function resetGame() {
  players = [];
  pot = 0;
  currentBet = 0;
  currentTurnIndex = 0;
  roundActive = false;
  dealerIndex = 0;
  document.getElementById("round").classList.add("hidden");
  document.getElementById("setup").classList.remove("hidden");
  document.getElementById("playersList").innerHTML = "";
  document.getElementById("initialChipsSlider").value = 1000;
  updateInitialChipsLabel(1000);
  document.getElementById("minBidSlider").value = 100;
  updateMinBidLabel(100);
}
