"use strict";
/*
 * ui-sync.js
 *
 * This file handles all the UI synchronization functions for sliders,
 * plus/minus buttons, and text inputs in the setup and raise controls.
 */

// ------------------------------
// Setup Controls Sync Functions
// ------------------------------
function updateInitialChipsLabel(val) {
  val = Number(val);
  
  let minBidSlider = document.getElementById('minBidSlider');
  let newMaxBid = Math.floor(val * 0.1);
  minBidSlider.max = newMaxBid;
  
  let minBidText = document.getElementById('minBidText');
  
  let currentMinBid = parseInt(minBidSlider.value);
  if (currentMinBid > newMaxBid) {
    minBidSlider.value = newMaxBid;
    minBidText.value = newMaxBid; 
    updateMinBidLabel(newMaxBid);
  } else {
    minBidText.value = currentMinBid; 
  }
}

function updateMinBidLabel(val) {
  document.getElementById('minBidLabel').textContent = val;
}

function syncInitialChipsFromSlider() {
  const slider = document.getElementById("initialChipsSlider");
  const textInput = document.getElementById("initialChipsText");
  textInput.value = slider.value;
  updateInitialChipsLabel(slider.value);
}

function syncInitialChipsFromText() {
  const slider = document.getElementById("initialChipsSlider");
  const textInput = document.getElementById("initialChipsText");
  let val = parseInt(textInput.value);
  if (isNaN(val)) val = parseInt(slider.min);
  val = Math.max(parseInt(slider.min), Math.min(parseInt(slider.max), val));
  slider.value = val;
  textInput.value = val;
  updateInitialChipsLabel(val);
}

function syncMinBidFromSlider() {
  const slider = document.getElementById("minBidSlider");
  const textInput = document.getElementById("minBidText");
  textInput.value = slider.value;
  updateMinBidLabel(slider.value);
}

function syncMinBidFromText() {
  const slider = document.getElementById("minBidSlider");
  const textInput = document.getElementById("minBidText");
  let val = parseInt(textInput.value);
  if (isNaN(val)) val = parseInt(slider.min);
  val = Math.max(parseInt(slider.min), Math.min(parseInt(slider.max), val));
  slider.value = val;
  textInput.value = val;
  updateMinBidLabel(val);
}

// ------------------------------
// Plus/Minus Buttons for Setup Controls
// ------------------------------
document.getElementById("initialChipsMinus").addEventListener("click", function() {
  const slider = document.getElementById("initialChipsSlider");
  const textInput = document.getElementById("initialChipsText");
  let step = parseInt(slider.step);
  let newVal = Math.max(parseInt(slider.min), parseInt(slider.value) - step);
  slider.value = newVal;
  textInput.value = newVal;
  updateInitialChipsLabel(newVal);
});

document.getElementById("initialChipsPlus").addEventListener("click", function() {
  const slider = document.getElementById("initialChipsSlider");
  const textInput = document.getElementById("initialChipsText");
  let step = parseInt(slider.step);
  let newVal = Math.min(parseInt(slider.max), parseInt(slider.value) + step);
  slider.value = newVal;
  textInput.value = newVal;
  updateInitialChipsLabel(newVal);
});

document.getElementById("initialChipsText").addEventListener("change", syncInitialChipsFromText);

document.getElementById("minBidMinus").addEventListener("click", function() {
  const slider = document.getElementById("minBidSlider");
  const textInput = document.getElementById("minBidText");
  let step = parseInt(slider.step);
  let newVal = Math.max(parseInt(slider.min), parseInt(slider.value) - step);
  slider.value = newVal;
  textInput.value = newVal;
  updateMinBidLabel(newVal);
});

document.getElementById("minBidPlus").addEventListener("click", function() {
  const slider = document.getElementById("minBidSlider");
  const textInput = document.getElementById("minBidText");
  let step = parseInt(slider.step);
  let newVal = Math.min(parseInt(slider.max), parseInt(slider.value) + step);
  slider.value = newVal;
  textInput.value = newVal;
  updateMinBidLabel(newVal);
});

document.getElementById("minBidText").addEventListener("change", syncMinBidFromText);

// ------------------------------
// Raise Modal Controls Sync (For Raise Modal)
// ------------------------------
function syncRaiseFromSlider() {
  const slider = document.getElementById("raiseSlider");
  const textInput = document.getElementById("raiseText");
  textInput.value = slider.value;
}
function syncRaiseFromText(min, max) {
  const slider = document.getElementById("raiseSlider");
  const textInput = document.getElementById("raiseText");
  let val = parseInt(textInput.value);
  if (isNaN(val)) val = min;
  val = Math.max(min, Math.min(max, val));
  slider.value = val;
  textInput.value = val;
}

document.getElementById("raiseMinus").addEventListener("click", function() {
  const slider = document.getElementById("raiseSlider");
  const textInput = document.getElementById("raiseText");
  let step = parseInt(slider.step);
  let newVal = Math.max(parseInt(slider.min), parseInt(slider.value) - step);
  slider.value = newVal;
  textInput.value = newVal;
});

document.getElementById("raisePlus").addEventListener("click", function() {
  const slider = document.getElementById("raiseSlider");
  const textInput = document.getElementById("raiseText");
  let step = parseInt(slider.step);
  let newVal = Math.min(parseInt(slider.max), parseInt(slider.value) + step);
  slider.value = newVal;
  textInput.value = newVal;
});
