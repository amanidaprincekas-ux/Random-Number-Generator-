const mode = document.getElementById("mode");

const numberSettings =
    document.getElementById("number-settings");

const wordSettings =
    document.getElementById("word-settings");

const minimum =
    document.getElementById("minimum");

const maximum =
    document.getElementById("maximum");

const wordInput =
    document.getElementById("word-input");

const interval =
    document.getElementById("interval");

const unit =
    document.getElementById("unit");

const startButton =
    document.getElementById("start-button");

const stopButton =
    document.getElementById("stop-button");

const result =
    document.getElementById("result");


let timer = null;


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
// GENERATE ONE RESULT
// ----------------------------------------

function generateResult() {

    let value;


    if (mode.value === "numbers") {

        value = generateNumber();

        if (value === null) {
            return;
        }

    } else {

        value = wordInput.value.trim();

        if (value === "") {

            result.textContent =
                "Type a word first.";

            return;
        }
    }


    result.textContent = value;

    speak(String(value));
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


    // Say the first result immediately

    generateResult();


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
