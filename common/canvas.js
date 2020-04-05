'use strict'

import { EventManager } from "./eventManager.js";

export class Canvas extends EventManager {
    constructor(canvas, width, height, drawables) {
        super(canvas);
        this._canvas = canvas;
        this._context = canvas.getContext("2d");
        this._width = width;
        this._height = height;
        this._drawables = drawables;
    }

    get context() { return this._context; }
    get width() { return this._width; }
    get height() { return this._height; }

    add(drawable) {
        this._drawables[drawable.id] = drawable;
    }

    remove(drawable) {
        delete this._drawables[drawable.id];
    }

    draw() {
        Object.values(this._drawables).forEach(drawable => {
            drawable.draw(this._context);
        });
    }
}