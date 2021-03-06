"use strict";

import getScramble from "./cubing.js"

let nextScramble = "...";
let currentScramble = "...";

const updateScramble = async () => {
  removeEventListener("keyup", updateScramble);
  removeEventListener("touchend", updateScramble);
  const sessionType = sessionList.list[sessionList.active].solveType;
  if (["6x6", "7x7"].includes(sessionType)) {
    document.querySelector("#scramble").classList.add('large-cube');
  } else if (["4x4", "5x5"].includes(sessionType)) {
    document.querySelector('#scramble').classList.add('medium-cube')
  }
  let newScramble = await getScramble(sessionType);
  nextScramble = newScramble
  return newScramble;
}


let activeIndex = sessionList.active;
const session = sessionList.list[activeIndex];
session.solveList.sort((a, b) => a.date - b.date);
//repeats timer function every specified time interval
let updateTimerHandle;
//creates global variable to the timers initilisation
let startTime;
//global timeout handler
let timerDelay;
let timerDelayTouch;
//defines whether or not the timer animation should cease
let cancelled = false;
//how long the user must hold space for the timer to initiate
const spaceDownThreshold = settings.holdDownThresh;
//colours for the clock
let startColor = "#32CD30";
let holdColor = "#FF0000";
let defaultColor = settings.textColor;
document.body.style.color = settings.textColor;
//retrives DOM elements
const clock = document.getElementById("clock");
const ao5 = document.getElementById("ao5");
const ao12 = document.getElementById("ao12");
const menus = document.getElementById("tool-bar");
const statIcon = document.getElementById("stat-icon");
const plusTwo = document.querySelector("#plusTwo");
const dnf = document.querySelector("#DNF");
dnf.style.display = "none";
plusTwo.style.display = "none";

//fill averages on screen
ao5.innerHTML = session.getAverage(5);
ao12.innerHTML = session.getAverage(12);

statIcon.addEventListener("click", () => {
  updateLSData(sessionKey, sessionList);
  window.location.href = "./stats.html";
});

if (settings.manualEntry) {
  plusTwo.style.display = "";
  dnf.style.display = "";
  document.querySelector(".form__group").style.display = "block";
  document.querySelector("#clock").style.display = "none";
} else {
  //waits for a key down, then sets a delay to run timerReady after delay
  document.querySelector("#clock").style.display = "block";
}


currentScramble = await updateScramble();

/*timer code*/
function formatTime(totalMiliSec) {
  let dispMinutes = Math.floor(totalMiliSec / 60000);
  let dispSeconds = Math.floor((totalMiliSec % 60000) / 1000);
  let dispMiliSec = totalMiliSec % 1000;
  dispMiliSec = `00${dispMiliSec}`.substr(-3);
  if (dispMinutes > 0) {
    dispSeconds = `0${dispSeconds}`.substr(-2);
    return `${dispMinutes}:${dispSeconds}.${dispMiliSec}`;
  } else {
    return `${dispSeconds}.${dispMiliSec}`;
  }
}

//starts the timer and sets callback function to update the timer every time the browser screen refreshes
function isTouchDevice() {
  return (('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    (navigator.msMaxTouchPoints > 0));
}

function startTimerComputer() {
  addEventListener("keydown", setDelay);
}

function startTimerTouch() {
  addEventListener("touchstart", setDelayTouch);
}

function setDelayTouch() {
  console.log("the screen was clicked")
  removeEventListener("touchstart", setDelayTouch);
  clock.style.color = holdColor;
  timerDelayTouch = setTimeout(timerReadyTouch, spaceDownThreshold);
  //If the user releases the space bar before the timing threshold, then timerReady will not run
  addEventListener("touchend", clearDelayTouch);
}

function timerReadyTouch() {
  // console.clear()
  removeEventListener("touchend", clearDelayTouch);
  removeEventListener("keyup", clearDelay);
  clock.style.color = startColor;
  //everything is hidden to simplify the timer
  scramble.style.display = "none";
  averages.style.display = "none";
  menus.style.display = "none";
  plusTwo.style.display = "none";
  dnf.style.display = "none";
  document.body.style.cursor = "none";

  addEventListener("touchend", confirmStartTouch);
  addEventListener("touchend", updateScramble);
  addEventListener("keyup", confirmStart);
  addEventListener("keyup", updateScramble);
  console.log("update scramble was called");
}

function clearDelayTouch() {
  removeEventListener("touchend", clearDelayTouch);
  clearTimeout(timerDelayTouch);
  clock.style.color = defaultColor;
  addEventListener("touchstart", setDelayTouch);
}

function confirmStartTouch() {
  removeEventListener("touchend", confirmStartTouch);
  clock.style.color = defaultColor;
  startTimer();
  addEventListener("touchstart", stopTimerTouch);
}

function stopTimerTouch() {
  removeEventListener("touchstart", stopTimerTouch);
  removeEventListener("keydown", stopTimer);
  cancelled = true;
  const solveTime = Date.now() - startTime;
  clock.innerHTML = formatTime(solveTime);
  //redisplay all components that were hidden
  //store solve
  processSolve(solveTime);
  addEventListener("touchend", resetTimerTouch);
  addEventListener("keyup", resetTimer);
}

function resetTimerTouch() {
  plusTwo.style.display = "";
  dnf.style.display = "";
  scramble.style.display = "";
  averages.style.display = "";
  menus.style.display = "";
  document.body.style.cursor = "auto";
  removeEventListener("touchend", resetTimerTouch);
  addEventListener("touchstart", setDelayTouch);
}

function startTimer() {
  cancelled = false;
  startTime = Date.now();
  requestAnimationFrame(updateTimer);
}

//updates the timer
function updateTimer() {
  if (!cancelled) {
    let timeElapsed = Date.now() - startTime;
    clock.innerHTML = formatTime(timeElapsed);
    updateTimerHandle = requestAnimationFrame(updateTimer);
  }
}

//once the space key is held down, this turns the clock red until spaceDownThreshold has passed
function setDelay(e) {
  if (e.key === " ") {
    removeEventListener("keydown", setDelay);
    clock.style.color = holdColor;
    timerDelay = setTimeout(timerReady, spaceDownThreshold);
    //If the user releases the space bar before the timing threshold, then timerReady will not run
    addEventListener("keyup", clearDelay);
  }
}

//if space is released before required time interval, then the timer start action is cancelled
function clearDelay(e) {
  if (e.key === " ") {
    removeEventListener("keyup", clearDelay);
    clearTimeout(timerDelay);
    clock.style.color = defaultColor;
    addEventListener("keydown", setDelay);
  }
}

//runs if user has held space bar for required spaceDownThreshold (waits for space release to start timer)
function timerReady() {
  // console.clear()
  removeEventListener("keyup", clearDelay);
  clock.style.color = startColor;
  //everything is hidden to simplify the timer
  scramble.style.display = "none";
  averages.style.display = "none";
  menus.style.display = "none";
  plusTwo.style.display = "none";
  dnf.style.display = "none";
  document.body.style.cursor = "none";

  addEventListener("keyup", confirmStart);
  addEventListener("keyup", updateScramble);
  console.log("update scramble was called");
}

//starts the timer
function confirmStart(e) {
  if (e.key === " ") {
    removeEventListener("keyup", confirmStart);
    clock.style.color = defaultColor;
    startTimer();
    addEventListener("keydown", stopTimer);
  }
}

function processSolve(solveTime) {
  console.log(currentScramble);
  let currentSolve = new Solve(solveTime, currentScramble);
  console.log(currentScramble);
  currentScramble = nextScramble;
  console.log(currentScramble)
  session.add(currentSolve);
  updateLSData(sessionKey, sessionList);
  //update averages
  ao5.innerHTML = session.getAverage(5);
  ao12.innerHTML = session.getAverage(12);
  //generate new scramble
  // scrambleToHTML(currentScramble);
  //active penalty buttons
  dnf.addEventListener("click", addDNF);
  plusTwo.addEventListener("click", addPlusTwo);
  plusTwo.style.display = "inline-block";
  dnf.style.display = "inline-block";
}
//runs when space is clicked to stop timer
function stopTimer() {
  removeEventListener("keydown", stopTimer);
  cancelled = true;
  const solveTime = Date.now() - startTime;
  clock.innerHTML = formatTime(solveTime);
  //redisplay all components that were hidden

  document.body.style.cursor = "auto";
  //store solve
  processSolve(solveTime);
  addEventListener("keyup", resetTimer);
}

//resets timer function
function resetTimer() {
  console.log("buttons should be reinstated");
  console.log(plusTwo);
  console.log(dnf);
  plusTwo.style.display = "block";
  dnf.style.display = "block";
  scramble.style.display = "";
  averages.style.display = "";
  menus.style.display = "";
  removeEventListener("keyup", resetTimer);
  addEventListener("keydown", setDelay);
}

function addDNF() {
  dnf.removeEventListener("click", addDNF);
  const recentSolve = session.solveList[session.solveList.length - 1];
  recentSolve.time = Infinity;
  recentSolve.penalty = "DNF";
  if (clock) clock.innerHTML = recentSolve.toString();
  dnf.style.display = "none";
  plusTwo.style.display = "none";
  ao5.innerHTML = session.getAverage(5);
  ao12.innerHTML = session.getAverage(12);
  updateLSData(sessionKey, sessionList);
}

function addPlusTwo() {
  plusTwo.removeEventListener("click", addPlusTwo);
  const recentSolve = session.solveList[session.solveList.length - 1];
  recentSolve.time = recentSolve.time + 2000;
  recentSolve.penalty = "+2";
  if (clock) clock.innerHTML = recentSolve.toString();
  dnf.style.display = "none";
  plusTwo.style.display = "none";
  ao5.innerHTML = session.getAverage(5);
  ao12.innerHTML = session.getAverage(12);
  updateLSData(sessionKey, sessionList);
}

function addManualSolve(e) {
  const manualTimeRef = document.querySelector("#name");
  if (e.key === "Enter" && manualTimeRef.value) {
    const solveTime = Number(manualTimeRef.value) * 1000;
    //store solve
    processSolve(solveTime);
    addEventListener("keyup", updateScramble);
    manualTimeRef.value = "";
    // manualTimeRef.blur();
  }
}

//if statment to determine if manual entry is true
if (settings.manualEntry) {
  addEventListener("keydown", addManualSolve);
} else {
  //waits for a key down, then sets a delay to run timerReady after delay
  if (isTouchDevice()) {
    startTimerTouch();
    console.log("this is a touch device")
  } else {
    startTimerComputer();
  }
}