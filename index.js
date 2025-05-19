function ready(fn) {
    if (document.readyState !== "loading"){
        fn();
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

function docReady() {
    let trackDayInput = document.getElementById("track-day-file");
    let quickRaceInput = document.getElementById("quick-race-file");
    trackDayInput.addEventListener('change', fileOnChange);  
    quickRaceInput.addEventListener('change', fileOnChange);  
}

function fileOnChange(e) {
    let trackDayInput = document.getElementById("track-day-file");
    let quickRaceInput = document.getElementById("quick-race-file");
    if (trackDayInput.files.length > 0 && quickRaceInput.files.length > 0) {
        let container = document.getElementById("generate-file-container");
        if (container.children > 0) return;
        let btn = document.createElement("button");
        btn.id = "generate-file";
        btn.onclick = generateButtonOnClick;
        btn.innerText = "Submit";
        container.appendChild(btn);
    }
}

async function generateButtonOnClick() {
    let trackFile = document.getElementById("track-day-file").files[0];
    let quickRaceFile = document.getElementById("quick-race-file").files[0];
    const trackData = await parseJsonFile(trackFile);
    const quickRaceData = await parseJsonFile(quickRaceFile);
    let finalResult = {};
    finalResult["track"] = quickRaceData["track"];
    finalResult["number_of_sessions"] = 3;
    finalResult["players"] = quickRaceData["players"];
    finalResult["sessions"] = [];
    let practice = practiceSession(finalResult);
    let quali = qualifyingSession(trackData);
    let race = raceSession(quickRaceData);
    finalResult["sessions"].push(practice);
    finalResult["sessions"].push(quali);
    finalResult["sessions"].push(race);
    finalResult["extras"] = quickRaceData["extras"];
    finalResult["__raceIni"] = quickRaceData["__raceIni"];
    finalResult["__quickDrive"] = quickRaceData["__quickDrive"];
    downloadResult(finalResult);
    document.getElementById("page-message-container").style.display = "block";
    document.getElementById("page-message").innerText = "Download will start shortly";
}


function downloadResult(finalResult) {
    const elm = document.createElement("a");
    elm.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(finalResult)));
    elm.setAttribute("download", "weekend.json");
    elm.style.display = "none";
    document.body.appendChild(elm);
    elm.click();
    document.body.removeChild(elm);
}

function raceSession(quickRaceData){
    let session = {};
    const raceData = quickRaceData["sessions"][0];
    session["event"] = 0;
    session["name"] = "Race";
    session["type"] = 3;
    session["lapsCount"] = raceData["lapsCount"];
    session["duration"] = 0;
    session["laps"] = raceData["laps"];
    session["lapstotal"] = raceData["lapstotal"];
    session["bestLaps"] = raceData["bestLaps"];
    session["raceResult"] = raceData["raceResult"];
    return session;
}

function qualifyingSession(trackData) {
    let session = {};
    const qualiData = trackData["sessions"][0];
    session["event"] = 0;
    session["name"] = "Qualifying";
    session["type"] = 2;
    session["lapsCount"] = 0;
    session["duration"] = qualiData["duration"];
    session["laps"] = qualiData["laps"];
    session["lapstotal"] = qualiData["lapstotal"];
    session["bestLaps"] = qualiData["bestLaps"];
    return session;
}

function practiceSession(finalResult) {
    let session = {};
    session["event"] = 0;
    session["name"] = "Practice";
    session["type"] = 1;
    session["lapsCount"] = 0;
    session["duration"] = 1;
    session["laps"] = [];
    const carCount = finalResult["players"].length;
    for (let x = 1; x <= carCount - 1; x++) {
        let lap = {};
        lap["lap"] = 0;
        lap["car"] = x;
        lap["sectors"] = [];
        lap["time"] = -1;
        lap["cuts"] = 0;
        lap["tyre"] = "";
        session["laps"].push(lap);
    }
    session["lapstotal"] = Array(carCount).fill(1);
    session["lapstotal"][0] = 0;
    session["bestLaps"] = [];
    return session;
}

async function parseJsonFile(file) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = e => resolve(JSON.parse(e.target.result));
        fileReader.onerror = err => reject(err);
        fileReader.readAsText(file);
    });
}

ready(docReady);
