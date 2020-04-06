'use strict';

import { Canvas } from "../../common/canvas.js";
import { Grid } from "../../common/grid.js";
import { Rect } from "../../common/drawable.js";

const words = ["dog", "cat"];
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const width = 800;
const height = 600;
let canvas = null;
let answer = "";
let tries = 5;
let guesses = [];

let Assets = {
    check: loadImage("assets/check.png"),
    cross: loadImage("assets/cross.png"),
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
        this._state = BorderedText.States.Inactive;
        this._text = text;
        this._font = font;
        this._image = null;
    }

    get state() { return this._state; }
    set state(newState) { 
        if (this._state !== BorderedText.States.Correct &&
            this._state !== BorderedText.States.Wrong) {
                this._state = newState;
        }
    }
    get text() { return this._text; }

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
            context.fillStyle = 'rgba(0,0,0,0)';
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
            console.log(cell);
            if (cell !== null && !cell.isEmpty()) {
                const guess = cell.item.text;
                const state = updateGameState(guess);
                cell.item.state = state;
            }
            break;
        }
        canvas._context.clearRect(0, 0, 800, 600);
        canvas.draw();
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

$(document).ready(() => {
    canvas = new Canvas($("#canvas")[0], width, height, []);
    let alphabetPanel = new AlphabetPanel(600, 3);
    answer = words[0].toUpperCase();
    canvas.add(alphabetPanel);
    canvas.registerEventHandler("mousemove", alphabetPanel);
    canvas.registerEventHandler("mousedown", alphabetPanel);
    canvas.draw();
});

function updateGameState(guess) {
    console.log(guess);
    console.log(answer);
    if (guesses.includes(guess)) return;

    guesses.push(guess);

    if (!answer.includes(guess)) {
        tries -= 1;
        return BorderedText.States.Wrong;
    }
    return BorderedText.States.Correct;
}

function generateVisibleString(guesses, answer) {
    let visible = "";
    [...answer].forEach((chr, i) => {
        visible += (guesses.includes(chr) ? chr.toUpperCase() : "_");
        if (i < answer.length - 1) { visible += " " };
    });

    return visible;
}

function loadImage(src) {
    const image = new Image();
    image.src = src;
    return image;
}