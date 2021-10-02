"use strict"

//repeats timer function every specified time interval
let updateTimerHandle;
//creates global variable to the timers initilisation
let startTime;
//global timeout handler
let timerDelay;
//defines whether or not the timer animation should cease
let cancelled = false;
//how long the user must hold space for the timer to initiate
let spaceDownThreshold = 400;
//colours for the clock
let startColor = '#32CD30';
let holdColor = '#FF0000';
let defaultColor = 'white';
//retrives DOM elements
let clock = document.getElementById('clock');
let scramble = document.getElementById('scramble');
let ao5 = document.getElementById('ao5');
let ao12 = document.getElementById('ao12');
let menus = document.getElementById('tool-bar');

ao5.innerHTML = session.getAverage(5);
ao12.innerHTML = session.getAverage(12);

let scrambleNotation = [["R", "R'", "R2"], ["L", "L'", "L2"], ["F", "F'", "F2"], ["B", "B'", "B2"], ["U", "U'", "U2"], ["D", "D'", "D2"]]

scrambleToHTML(scrambleGen(scrambleNotation));

function selectRandom(array) {
    return Math.floor(Math.random()*array.length);
}

//function to generate a new scramble
function scrambleGen(scrambleNotation, len=20) {
    let scramble = [];
    let groupIndex;
    let scrambleNotationCopy = JSON.parse(JSON.stringify(scrambleNotation));
    for (let i = 0; i < len; i++) {
        groupIndex = selectRandom(scrambleNotation);
        let scrambleGroup = scrambleNotation[groupIndex];
        let index = selectRandom(scrambleGroup);
        let letter = scrambleGroup[index];
        scramble.push(letter);
        scrambleNotation = JSON.parse(JSON.stringify(scrambleNotationCopy));
        scrambleNotation.splice(groupIndex, 1);

    }
    return scramble;
}

//
function scrambleToHTML(scramble) {
    let scrambleRef = document.getElementById('scramble');
    scrambleRef.innerHTML = '';
    let h2 = document.createElement("h2");
    scrambleRef.appendChild(h2);
    for (let i = 0; i < scramble.length; i++) {
        const newDiv = document.createElement("div");
        newDiv.classList.add('scrambleLetter');
        newDiv.innerHTML = scramble[i];
        h2.appendChild(newDiv);
    }
}


//starts the timer and sets callback function to update the timer every time the browser screen refreshes
function startTimer() {
    cancelled = false;
    startTime = Date.now();
    requestAnimationFrame(updateTimer);
}

//updates the timer
function updateTimer() {
    if (!cancelled) {
        console.log('the timer is still updating')
        let timeElapsed = Date.now() - startTime;
        clock.innerHTML = formatTime(timeElapsed);
        updateTimerHandle = requestAnimationFrame(updateTimer);
    }
}

//waits for a key down, then sets a delay to run timerReady after delay
addEventListener("keydown", setDelay);

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
    console.clear()
    removeEventListener("keyup", clearDelay);
    clock.style.color = startColor;
    //everything is hidden to simplify the timer
    scramble.style.display = 'none';
    averages.style.display = 'none';
    menus.style.display = 'none';
    document.body.style.cursor = 'none';
    addEventListener("keyup", confirmStart);
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

//runs when space is clicked to stop timer
function stopTimer() {
    removeEventListener("keydown", stopTimer);
    cancelled = true;
    console.log('timer has been stopped');
    let solveTime = Date.now() - startTime;
    clock.innerHTML = formatTime(solveTime);
    //redisplay all components that were hidden
    scramble.style.display = 'block';
    averages.style.display = 'block';
    menus.style.display = 'block';
    document.body.style.cursor = 'auto';
    let currentSolve = new Solve(solveTime);
    session.addSolve(currentSolve);
    updateLSData(sessionKey, session);
    ao5.innerHTML = session.getAverage(5);
    ao12.innerHTML = session.getAverage(12);
    scrambleToHTML(scrambleGen(scrambleNotation));
    addEventListener("keyup", resetTimer);
}

//resets timer function
function resetTimer() {
    removeEventListener("keyup", resetTimer);
    addEventListener("keydown", setDelay);
    console.log("this shouldn't run if the glitch has occured");
}