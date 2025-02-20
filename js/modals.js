"use strict";
/*
 * modals.js
 *
 * This file contains all functions for displaying custom modals:
 * - Alert Modal (showAlertModal)
 * - Confirmation Modal (showConfirmModal)
 * - Raise Modal (showRaiseModal)
 * - Winner Modal (showWinnerModal)
 */

function showAlertModal(message, callback) {
  const modal = document.getElementById("alertModal");
  const modalText = document.getElementById("alertModalText");
  const okBtn = document.getElementById("alertOk");
  modalText.textContent = message;
  const newOkBtn = okBtn.cloneNode(true);
  okBtn.parentNode.replaceChild(newOkBtn, okBtn);
  newOkBtn.addEventListener("click", function () {
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
  newYesBtn.addEventListener("click", function () {
    modal.style.display = "none";
    callback(true);
  });
  newNoBtn.addEventListener("click", function () {
    modal.style.display = "none";
    callback(false);
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
  slider.oninput = function () {
    raiseText.value = slider.value;
  };
  raiseText.onchange = function () {
    let val = parseInt(raiseText.value);
    if (isNaN(val)) {
      val = min;
    }
    val = Math.max(min, Math.min(max, val));
    slider.value = val;
    raiseText.value = val;
  };
  const newConfirmBtn = confirmBtn.cloneNode(true);
  const newCancelBtn = cancelBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
  cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
  newConfirmBtn.addEventListener("click", function () {
    modal.style.display = "none";
    callback(parseInt(slider.value));
  });
  newCancelBtn.addEventListener("click", function () {
    modal.style.display = "none";
  });
  modal.style.display = "flex";
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
  newOption1.addEventListener("click", function () {
    modal.style.display = "none";
    callback(options[0].name);
  });
  newOption2.addEventListener("click", function () {
    modal.style.display = "none";
    callback(options[1].name);
  });
  modal.style.display = "flex";
}
