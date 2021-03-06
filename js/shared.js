"use strict";

const sessionKey = "yourBeefsYourMuttons";
const settingsKey = "I sold all of Finlands's military for 50 Lions"

//takes total miliseconds and returns a formatted string to display
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

/**
 * checkLSData function
 * Used to check if any data in LS exists at a specific key
 * @param {string} key LS Key to be used
 * @returns true or false representing if data exists at key in LS
 */
function checkLSData(key) {
  if (localStorage.getItem(key) != null) {
    return true;
  }
  return false;
}
/**
 * retrieveLSData function
 * Used to retrieve data from LS at a specific key.
 * @param {string} key LS Key to be used
 * @returns data from LS in JS format
 */
function retrieveLSData(key) {
  let data = localStorage.getItem(key);
  try {
    data = JSON.parse(data);
  } catch (err) {
  } finally {
    return data;
  }
}
/**
 * updateLSData function
 * Used to store JS data in LS at a specific key
 * @param {string} key LS key to be used
 * @param {any} data data to be stored
 */
function updateLSData(key, data) {
  let json = JSON.stringify(data);
  localStorage.setItem(key, json);
}

class Solve {
  constructor(solveTime, scramble, penalty = "") {
    this._solveTime = solveTime;
    this._scramble = scramble;
    this._date = new Date();
    this._penalty = penalty;
  }
  /**
   * @param {string} penalty
   */
  set penalty(penalty) {
    this._penalty = penalty;
  }
  set time(newTime) {
    this._solveTime = newTime;
  }
  get date() {
    return this._date;
  }
  get time() {
    return this._solveTime;
  }
  get penalty() {
    return this._penalty;
  }
  get scramble() {
    return this._scramble;
  }
  /**
   * @param {string} penalty
   */
  set penalty(penalty) {
    this._penalty = penalty;
  }
  fromData(data) {
    this._date = new Date(data._date);
    this._solveTime =
      data._solveTime === null ? Infinity : Number(data._solveTime);
    this._scramble = data._scramble;
    this._penalty = data._penalty;
  }
  toString() {
    if (this._penalty == "DNF") {
      return "DNF";
    }
    let time;
    let dispMinutes = Math.floor(this._solveTime / 60000);
    let dispSeconds = Math.floor((this._solveTime % 60000) / 1000);
    let dispMiliSec = this._solveTime % 1000;
    dispMiliSec = `00${dispMiliSec}`.substr(-3);
    if (dispMinutes > 0) {
      dispSeconds = `0${dispSeconds}`.substr(-2);
      time = `${dispMinutes}:${dispSeconds}.${dispMiliSec}`;
    } else {
      time = `${dispSeconds}.${dispMiliSec}`;
    }
    if (this._penalty === "+2") {
      return `${time}+`;
    } else {
      return time;
    }
  }
}

class Session {
  constructor(sessionName, solveType, solveList = []) {
    this._solveList = solveList;
    this._solveType = solveType;
    this._sessionName = sessionName;
    this._date = new Date();
  }
  set name(newName) {
    this._sessionName = newName;
  }
  set solveType(newType) {
    this._solveType = newType;
  }
  get solveList() {
    return this._solveList;
  }
  get solveType() {
    return this._solveType;
  }
  get name() {
    return this._sessionName;
  }
  get date() {
    return this._date;
  }
  add(solve) {
    this._solveList.push(solve);
  }
  remove(i) {
    this._solveList.splice(i, 1);
  }
  getAverage(numberOfSolves) {
    if (this._solveList.length >= numberOfSolves) {
      //get the most recent n solves
      let chosenSolves = this._solveList.slice(-numberOfSolves);
      let chosenTimes = [];
      for (let i = 0; i < chosenSolves.length; i++) {
        chosenTimes.push(chosenSolves[i].time);
      }
      let min = Math.min(...chosenTimes);
      let max = Math.max(...chosenTimes);
      // chosenTimes = chosenTimes.filter(e => e != min && e != max);
      const minMax = [min, max];
      for (let i = 0; i < minMax.length; i++) {
        const element = minMax[i];
        const index = chosenTimes.indexOf(element);
        if (index > -1) {
          chosenTimes.splice(index, 1);
        }
      }
      let sum = 0;
      for (let i = 0; i < chosenTimes.length; i++) {
        sum += chosenTimes[i];
      }
      const average = sum / chosenTimes.length;
      if (average === Infinity) {
        return "DNF";
      } else {
        return formatTime(Math.round(average));
      }
    } else {
      return "--";
    }
  }
  fromData(data) {
    this._solveList = [];
    let storedSolveList = data._solveList;
    for (let i = 0; i < storedSolveList.length; i++) {
      let solve = new Solve();
      solve.fromData(storedSolveList[i]);
      this._solveList.push(solve);
    }
    this._sessionName = data._sessionName;
    this._solveType = data._solveType;
  }
}

class SessionList {
  constructor(sessions = [], activeIndex = 0) {
    this._sessionList = sessions;
    this._activeIndex = Number(activeIndex);
  }
  get list() {
    return this._sessionList;
  }
  get active() {
    return this._activeIndex;
  }
  /**
   * @param {number} newActiveIndex
   */
  set active(newActiveIndex) {
    this._activeIndex = newActiveIndex;
  }
  add(session) {
    this._sessionList.push(session);
  }
  remove(i) {
    this._sessionList.splice(i, 1);
    this._activeIndex = i === 1 ? 0 : this._sessionList.length - 1;
  }
  fromData(data) {
    this._sessionList = [];
    let sessionList = data._sessionList;
    for (let i = 0; i < sessionList.length; i++) {
      const session = new Session();
      session.fromData(sessionList[i]);
      this._sessionList.push(session);
    }
    this._activeIndex = Number(data._activeIndex);
  }
}

const defaultScrambleLen = {
  '2x2': 11,
  '3x3': 25,
  '4x4': 40,
  '5x5': 60,
  '6x6': 80,
  '7x7': 100,
  'Skewb': 9,
  'Pyraminx': 25,
  '3BLD': 25
}

class Settings {
  constructor(background = 0, manualEntry = false, backgroundColor = '#000000', holdDownThresh = 400, textColor = '#ffffff') {
    this._background = background;
    // this._scrambleLen = scrambleLen;
    this._manualEntry = manualEntry;
    this._backgroundColor = backgroundColor;
    this._holdDownThresh = holdDownThresh;
    this._textColor = textColor;
  }
  get manualEntry() {
    return this._manualEntry;
  }
  get background() {
    return this._background;
  }
  get backgroundColor() {
    return this._backgroundColor;
  }
  get holdDownThresh() {
    return this._holdDownThresh;
  }
  get textColor() {
    return this._textColor;
  }
  set holdDownThresh(newThresh) {
    this._holdDownThresh = newThresh;
  }
  set textColor(newColor) {
    this._textColor = newColor;
  }
  set manualEntry(bool) {
    this._manualEntry = bool;
  }
  set background(newBackground) {
    this._background = newBackground;
  }
  set backgroundColor(newColor) {
    this._backgroundColor = newColor;
  }
  fromData(data) {
    this._background = Number(data._background);
    this.manualEntry = data._manualEntry;
    this.backgroundColor = data._backgroundColor;
    this._holdDownThresh = Number(data._holdDownThresh);
    this._textColor = data._textColor;
  }
}

let sessionList;
let settings;
let data;

if (checkLSData(sessionKey)) {
  data = retrieveLSData(sessionKey);
  sessionList = new SessionList();
  sessionList.fromData(data);
} else {
  console.log("new session was created")
  sessionList = new SessionList([new Session("Session 1", "3x3")]);
}

if (checkLSData(settingsKey)) {
  data = retrieveLSData(settingsKey);
  settings = new Settings();
  settings.fromData(data);
} else {
  settings = new Settings();
}