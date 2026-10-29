const mode = document.getElementById("mode");

const numberSettings = document.getElementById("number-settings");
const wordSettings = document.getElementById("word-settings");

const minimum = document.getElementById("minimum");
const maximum = document.getElementById("maximum");

const wordInput = document.getElementById("word-input");

const interval = document.getElementById("interval");
const unit = document.getElementById("unit");

const startButton = document.getElementById("start-button");
const stopButton = document.getElementById("stop-button");

const result = document.getElementById("result");
const historyList = document.getElementById("history-list");
const clearHistoryButton = document.getElementById("clear-history-button");

const HISTORY_KEY = "randomNumberGeneratorHistory";
const HISTORY_LIMIT = 20;
let history = loadHistory();

let timer = null;

function loadHistory() {
    try {
        const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
        if (!Array.isArray(saved)) {
            return [];
        }

        const entries = saved.filter(item => item && typeof item === "object" &&
            typeof item.key === "string" &&
            ((item.mode === "words" && Array.isArray(item.words)) ||
                (item.mode === "numbers" && Number.isFinite(item.minimum) && Number.isFinite(item.maximum))));
        const recentEntries = entries.slice(0, HISTORY_LIMIT);

        // Replace the old per-result history with setup-only entries.
        if (recentEntries.length !== saved.length) {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(recentEntries));
        }

        return recentEntries;
    } catch (error) {
        return [];
    }
}

function renderHistory() {
    historyList.replaceChildren();

    history.forEach(entry => {
        const item = document.createElement("li");
        const setup = entry.mode === "words"
            ? `Words: ${entry.words.join(", ")}`
            : `Numbers: ${entry.minimum} through ${entry.maximum}`;
        item.textContent = `${setup} · Every ${entry.intervalAmount} ${entry.unit}`;
        historyList.appendChild(item);
    });
}

function addToHistory(entry) {
    history = history.filter(item => item.key !== entry.key);
    history.unshift(entry);
    history = history.slice(0, HISTORY_LIMIT);
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
        // Keep the current page history usable if browser storage is unavailable.
    }
    renderHistory();
}

clearHistoryButton.addEventListener("click", function () {
    history = [];
    try {
        localStorage.removeItem(HISTORY_KEY);
    } catch (error) {
        // The visible history is still cleared for this page session.
    }
    renderHistory();
});

renderHistory();

function getWords() {
    return wordInput.value
        .split(/[\n,\-–—]+/)
        .map(word => word.trim())
        .filter(word => word.length > 0);
}

function createHistoryEntry(milliseconds) {
    const amount = Number(interval.value);
    const entry = {
        mode: mode.value,
        intervalAmount: amount,
        unit: unit.value
    };

    if (mode.value === "numbers") {
        entry.minimum = Number(minimum.value);
        entry.maximum = Number(maximum.value);

        if (!Number.isFinite(entry.minimum) || !Number.isFinite(entry.maximum) || entry.minimum > entry.maximum) {
            return null;
        }

        entry.key = JSON.stringify([
            entry.mode,
            entry.minimum,
            entry.maximum,
            milliseconds
        ]);
        return entry;
    }

    entry.words = getWords();
    if (entry.words.length === 0) {
        return null;
    }

    const normalizedWords = entry.words
        .map(word => word.toLocaleLowerCase().replace(/\s+/g, " "))
        .sort();
    entry.key = JSON.stringify([
        entry.mode,
        normalizedWords,
        milliseconds
    ]);
    return entry;
}


// ----------------------------------------
// SWITCH BETWEEN NUMBER AND WORD MODE
// ----------------------------------------

mode.addEventListener("change", function () {

    if (mode.value === "numbers") {

        numberSettings.style.display = "flex";
        numberSettings.style.flexDirection = "column";

        wordSettings.style.display = "none";

    } else {

        numberSettings.style.display = "none";

        wordSettings.style.display = "flex";
        wordSettings.style.flexDirection = "column";
    }

});


// ----------------------------------------
// GENERATE A RANDOM NUMBER
// ----------------------------------------

function generateNumber() {

    const min = Number(minimum.value);
    const max = Number(maximum.value);

    if (min > max) {

        result.textContent = "Check your range.";

        return null;
    }

    const randomNumber =
        Math.floor(
            Math.random() * (max - min + 1)
        ) + min;

    return randomNumber;
}


// ----------------------------------------
// SPEAK SOMETHING
// ----------------------------------------

function speak(text) {

    window.speechSynthesis.cancel();

    const speech =
        new SpeechSynthesisUtterance(text);

    window.speechSynthesis.speak(speech);
}


// ----------------------------------------
// GET A RANDOM WORD / PHRASE
// ----------------------------------------

function generateRandomWord() {

    const wordText = wordInput.value.trim();

    if (wordText === "") {

        result.textContent = "Type some words first.";

        return null;
    }

    // Accept commas, hyphens, dashes, or separate lines
    const words = getWords();

    if (words.length === 0) {

        result.textContent = "Type some words first.";

        return null;
    }

    const randomIndex =
        Math.floor(Math.random() * words.length);

    return words[randomIndex];
}


// ----------------------------------------
// GENERATE ONE RESULT
// ----------------------------------------

function generateResult() {

    let value;

    if (mode.value === "numbers") {

        value = generateNumber();

        if (value === null) {
            return false;
        }

    } else {

        value = generateRandomWord();

        if (value === null) {
            return false;
        }
    }

    result.textContent = value;

    speak(String(value));
    return true;
}


// ----------------------------------------
// START
// ----------------------------------------

startButton.addEventListener("click", function () {

    stopGenerator();

    const amount = Number(interval.value);

    if (!Number.isFinite(amount) || amount <= 0) {

        result.textContent =
            "Enter a valid interval.";

        return;
    }

    let milliseconds = amount * 1000;

    if (unit.value === "minutes") {

        milliseconds =
            amount * 60 * 1000;
    }

    // Save the setup once, then generate immediately and repeat as before.
    const historyEntry = createHistoryEntry(milliseconds);
    if (generateResult() && historyEntry !== null) {
        addToHistory(historyEntry);
    }

    // Then repeat
    timer = setInterval(
        generateResult,
        milliseconds
    );

});


// ----------------------------------------
// STOP
// ----------------------------------------

stopButton.addEventListener("click", function () {

    stopGenerator();

});


function stopGenerator() {

    if (timer !== null) {

        clearInterval(timer);

        timer = null;
    }

    window.speechSynthesis.cancel();
}
