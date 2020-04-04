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

class BorderedText extends Rect {
    static States = {
        Inactive: 0,
        Active: 1
    }

    constructor(text, font) {
        super(0, 0, 0, 0, "black", false, 2);
        this._state = BorderedText.States.Inactive;
        this._text = text;
        this._font = font;
    }

    get state() { return this._state; }
    set state(newState) { this._state = newState; }

    draw(context) {
        switch (this.state) {
        case BorderedText.States.Inactive:
            this.color = "black";
            break;
        case BorderedText.States.Active:
            this.color = "blue";
            break;
        }

        super.draw(context);
        const x = this.x + this.width / 2;
        const y = this.y + this.height / 1.4;
        context.font = this._font;
        context.textAlign = "center";
        context.fillStyle = this.color;
        context.fillText(this._text, x, y); 
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
        if (this._activeCell !== null) this._activeCell.item.draw(context);
    }

    process(event) {
        switch (event.type) {
        case "mousemove":
            let x = event.offsetX;
            let y = event.offsetY;
            if (this._contains(x, y)) {
                let cell = this.getCellFromPixelCoordinates(x, y);
                if (cell === this._activeCell) return;

                if (this._activeCell !== null) {
                    this._activeCell.item.state = BorderedText.States.Inactive;
                }

                if (cell.item === null) {
                    this._activeCell = null;
                    return;
                }

                this._activeCell = cell;
                this._activeCell.item.state = BorderedText.States.Active;
            } else if (this._activeCell !== null) {
                this._activeCell.item.state = BorderedText.States.Inactive;
                this._activeCell = null;
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
}

$(document).ready(() => {
    canvas = new Canvas($("#canvas")[0], width, height, []);
    let alphabetPanel = new AlphabetPanel(600, 3);
    canvas.add(alphabetPanel);
    canvas.registerEventHandler("mousemove", alphabetPanel);
    canvas.draw();
});

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