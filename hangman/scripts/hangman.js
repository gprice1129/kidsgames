'use strict';

import { Canvas } from "../../common/canvas.js";
import { Grid } from "../../common/grid.js";
import { Drawable, Rect } from "../../common/drawable.js";


const Assets = {
    check: loadImage("assets/check.png"),
    cross: loadImage("assets/cross.png"),
    restart: loadImage("assets/restart.png"),
    ant: loadImage("assets/ant.png"),
    apple: loadImage("assets/apple.png"),
    ball: loadImage("assets/ball.png"),
    bat: loadImage("assets/bat.png"),
    bed: loadImage("assets/bed.png"),
    bee: loadImage("assets/bee.png"),
    bell: loadImage("assets/bell.png"),
    bird: loadImage("assets/bird.png"),
    boat: loadImage("assets/boat.png"),
    book: loadImage("assets/book.png"),
    cat: loadImage("assets/cat.png"),
    cow: loadImage("assets/cow.png"),
    cup: loadImage("assets/cup.png"),
    dog: loadImage("assets/dog.png"),
    door: loadImage("assets/door.png"),
    duck: loadImage("assets/duck.png"),
    egg: loadImage("assets/egg.png"),
    fish: loadImage("assets/fish.png"),
    frog: loadImage("assets/frog.png"),
    hand: loadImage("assets/hand.png"),
    hat: loadImage("assets/hat.png"),
    kite: loadImage("assets/kite.png"),
    pig: loadImage("assets/pig.png"),
    star: loadImage("assets/star.png"),
    sun: loadImage("assets/sun.png"),
    tree: loadImage("assets/tree.png"),
}
const words = {
    "ANT": Assets.ant,
    "APPLE": Assets.apple,
    "BALL": Assets.ball,
    "BAT": Assets.bat,
    "BED": Assets.bed,
    "BEE": Assets.bee,
    "BELL": Assets.bell,
    "BIRD": Assets.bird,
    "BOAT": Assets.boat,
    "BOOK": Assets.book,
    "CAT": Assets.cat,
    "COW": Assets.cow,
    "CUP": Assets.cup,
    "DOG": Assets.dog, 
    "DOOR": Assets.door,
    "DUCK": Assets.duck,
    "EGG": Assets.egg,
    "FISH": Assets.fish,
    "FROG": Assets.frog,
    "HAND": Assets.hand,
    "HAT": Assets.hat,
    "KITE": Assets.kite,
    "PIG": Assets.pig,
    "STAR": Assets.star,
    "SUN": Assets.sun,
    "TREE": Assets.tree,
};
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const width = 800;
const height = 600;
const maxTries = 5;
let requestId = 0;
let tries = maxTries;
let canvas = null;
let answer = null;
let wordProgress = null;
let alphabetPanel = null;
let restartButton = null;
let guesses = [];

class Answer extends Rect {
    constructor(answer, image) {
        super(100, 20, 400, 400, "black", false, 2);
        this.reset(answer, image);
    }

    get peepholeScale() { return this._peepholeScale; }
    set peepholeScale(newScale) { this._peepholeScale = newScale; }
    get answer() { return this._answer; }

    reset(answer, image) {
        this._answer = answer;
        this._image = image;
        this._peepholeScale = 0;
    }

    includes(guess) {
        return this._answer.includes(guess);
    }

    show() {
        this._peepholeScale = 1;
    }

    draw(context) {
        if (this.peepholeScale > 0) {
            const scale = Math.min(this.width / this._image.width, this.height / this._image.height);
            const imgWidth = (this._image.width * scale);
            const imgHeight = (this._image.height * scale);
            const x = this.x + (this.width - imgWidth) / 2;
            const y = this.y + (this.height - imgHeight) / 2;
            context.drawImage(this._image, x, y, imgWidth, imgHeight);
        }

        if (this.peepholeScale < 1) {
            const rectSize = (this.width / 2) * (1 - this.peepholeScale);
            context.fillStyle = "white";
            context.fillRect(this.x, this.y, this.width, rectSize);
            context.fillRect(this.x, this.y + this.height - rectSize, this.width, rectSize);
        }

        super.draw(context);
    }
}

class BorderedText extends Rect {
    static States = {
        Inactive: 0,
        Active: 1,
        Correct: 2,
        Wrong: 3
    }

    constructor(text, font) {
        super(0, 0, 0, 0, "black", false, 2);
        this._text = text;
        this._font = font;
        this.reset();
    }

    get state() { return this._state; }
    set state(newState) { 
        if (this._state !== BorderedText.States.Correct &&
            this._state !== BorderedText.States.Wrong) {
                this._state = newState;
        }
    }
    get text() { return this._text; }

    reset() {
        this._state = BorderedText.States.Inactive;
        this._image = null;
    }

    draw(context) {
        this.color = "black";
        switch (this.state) {
        case BorderedText.States.Active:
            this.color = "blue";
            break;
        case BorderedText.States.Correct:
            this._image = Assets.check;
            break;
        case BorderedText.States.Wrong:
            this._image = Assets.cross;
            break;
        }

        super.draw(context);
        const x = this.x + this.width / 2;
        const y = this.y + this.height / 1.4;
        context.font = this._font;
        context.textAlign = "center";
        context.fillStyle = this.color;
        context.fillText(this._text, x, y);
        if (this._image !== null) {
            let width = this.width / 1.2;
            let height = this.height / 1.2;
            let offsetX = (this.width - width) / 2;
            let offsetY = (this.height - height) / 2;
            context.drawImage(this._image, this.x + offsetX, this.y + offsetY, width, height);
        }
    }
}

class AlphabetPanel extends Grid {
    constructor(x, y) {
        super(x, y, 3, 9, 66, alphabet.split('').map(letter => {
                return new BorderedText(letter, "45px Comic Sans MS");
        }));
        this._activeCell = null;
    }

    reset() {
        super.reset();
        this._activeCell = null;
    }

    draw(context) {
        super.draw(context);
        if (this._activeCell !== null) this._activeCell.draw(context);
    }

    process(event) {
        let cell = null;
        switch (event.type) {
        case "mousemove":
            cell = this._getNewActiveCell(event.offsetX, event.offsetY);
            if (cell === this._activeCell) return;

            this._setActiveCellState(BorderedText.States.Inactive);
            if (cell !== null) {
                this._activeCell = cell;
                this._setActiveCellState(BorderedText.States.Active);
            } else {
                this._activeCell = null;
            }
            break;

        case "mousedown":
            cell = this._getNewActiveCell(event.offsetX, event.offsetY);
            if (cell !== null && !cell.isEmpty()) {
                const guess = cell.item.text;
                const state = updateGameState(guess);
                cell.item.state = state;
            }
            break;
        }
    }    

    _contains(x, y) {
        return x > this.x && x < this.x + this._pxWidth &&
               y > this.y && y < this.y + this._pxHeight;
    }

    _getNewActiveCell(x, y) {
        if (this._contains(x, y)) {
            return this.getCellFromPixelCoordinates(x, y);
        }

        return null;
    }

    _setActiveCellState(state) {
        if (this._activeCell !== null && !this._activeCell.isEmpty()) {
            this._activeCell.item.state = state;
        }
    }
}

class WordProgress extends Drawable {
    constructor(x, y) {
        super(x, y, 0);
        this._visible = "";
        this._guessed = "";
    }

    get guessed() { return this._guessed; }

    reset() {
        this._visible = "";
        this._guessed = "";
    }

    updateVisible(guesses, answer) {
        let visible = "";
        let guessed = "";
        [...answer].forEach((chr, i) => {
            if (guesses.includes(chr)) {
                visible += chr;
                guessed += chr;
            } else {
                visible += "_";
                guessed += "_";
            }
            if (i < answer.length - 1) { visible += " " };
        });

        this._visible = visible;
        this._guessed = guessed;
    }

    draw(context) {
        context.textAlign = "center";
        context.fillStyle = "black";
        context.fillText(this._visible, this.x, this.y);
    }
}

class RestartButton extends Rect {
    constructor(x, y, width, height, image) {
        super(x, y, width, height, "white", false);
        this._image = image;
    }

    _contains(x, y) {
        return x > this.x && x < this.x + this.width &&
               y > this.y && y < this.y + this.height;
    }

    draw(context) {
        context.drawImage(this._image, this.x, this.y, this.width, this.height);
    }

    process(event) {
        let x = event.offsetX;
        let y = event.offsetY;
        if (this._contains(x, y)) {
            restart();
        }
    }
}

$(document).ready(() => {
    canvas = new Canvas($("#canvas")[0], width, height, []);
    let word = getNewWord();
    answer = new Answer(word, words[word]);
    alphabetPanel = new AlphabetPanel(600, 3);
    wordProgress = new WordProgress(300, 500);
    wordProgress.updateVisible(guesses, answer.answer);
    restartButton = new RestartButton(10, 10, 64, 64, Assets.restart);
    init();
});

function updateGameState(guess) {
    if (guesses.includes(guess)) return;

    guesses.push(guess);
    wordProgress.updateVisible(guesses, answer.answer);

    if (!answer.includes(guess)) {
        tries -= 1;
        answer.peepholeScale = (maxTries- tries) / maxTries;
        return BorderedText.States.Wrong;
    }

    if (answer.answer === wordProgress.guessed) {
        tries = 0;
        answer.show()
        canvas.removeEventHandler("mousedown", alphabetPanel);
        canvas.removeEventHandler("mousemove", alphabetPanel);
    }

    return BorderedText.States.Correct;
}

function init() {
    canvas.add(alphabetPanel);
    canvas.add(answer);
    canvas.add(wordProgress);
    canvas.add(restartButton);
    canvas.registerEventHandler("mousemove", alphabetPanel);
    canvas.registerEventHandler("mousedown", alphabetPanel);
    canvas.registerEventHandler("mousedown", restartButton);
    loop();
}

function restart() {
    window.cancelAnimationFrame(requestId);
    tries = maxTries;
    guesses = [];
    canvas.reset();
    let word = getNewWord();
    answer.reset(word, words[word]);
    alphabetPanel.reset();
    wordProgress.reset();
    wordProgress.updateVisible(guesses, answer.answer);
    init();
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function getNewWord() {
    const allWords = Object.keys(words);
    return allWords[randomInt(0, allWords.length)];
}

function loadImage(src) {
    const image = new Image();
    image.src = src;
    return image;
}

function loop() {
    requestId = window.requestAnimationFrame(loop);
    canvas.draw()
}