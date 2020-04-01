'use strict';

const words = ["dog", "cat"];
let context = null;
let answer = "";
let tries = 5;
let guesses = [];

$(document).ready(() => {
    context = $("#canvas")[0].getContext("2d");
    context.font = "30px Arial";
    answer = words[0].toUpperCase();
    document.addEventListener("keyup", handleKeyPressEvent);
    draw("", "", generateVisibleString(guesses, answer));
});

function handleKeyPressEvent(event) {
    const guess = event.key.toUpperCase();
    const currentMsg = updateGameState(guess);
    const visible = generateVisibleString(guesses, answer);

    draw(guess, currentMsg, visible);
}

function updateGameState(guess) {
    let currentMsg = ""
    if (guesses.includes(guess)) {
        currentMsg = "You already guessed that letter!";
    } else {
        guesses.push(guess);

        if (!answer.includes(guess)) {
            tries -= 1;
        }
    }

    return currentMsg;
}

function generateVisibleString(guesses, answer) {
    let visible = "";
    [...answer].forEach((chr, i) => {
        visible += (guesses.includes(chr) ? chr.toUpperCase() : "_");
        if (i < answer.length - 1) { visible += " " };
    });

    return visible;
}

function draw(guess, currentMsg, visible) {
    context.clearRect(0, 0, 800, 600)
    context.fillText(visible, 100, 400);
    context.fillText("Guess a letter: " + guess, 10, 500)
    context.fillText(currentMsg, 10, 570)
}
