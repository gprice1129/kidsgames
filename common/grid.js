'use strict'

import { Drawable } from "/common/drawable.js";

export class Cell {
    constructor(x, y, item) {
        this._x = x;
        this._y = y;
        this._item = item;
    }

    get x() { return this._x; }
    get y() { return this._y; }
    get item() { return this._item; }
    set item(item) { this._item = item; }

    isEmpty() {
        return null === this._item;
    }

    clear() {
        this._item = null;
    }
}

export class Grid extends Drawable {
    constructor(pxX, pxY, width, height, pxCellSize, items) {
        super(pxX, pxY);
        this._pxCellSize = pxCellSize;
        this._width = width;
        this._height = height;
        this._pxWidth = width * pxCellSize;
        this._pxHeight = height * pxCellSize;
        this._grid = [];

        for (let y = 0; y < height; ++y) {
            let row = [];
            for (let x = 0; x < width; ++x) {
                let item = items[width * y + x] || null;
                if (item !== null) {
                    item.x = pxX + x * this._pxCellSize;
                    item.y = pxY + y * this._pxCellSize;
                    item.width = pxCellSize;
                    item.height = pxCellSize;
                    item.rotation = 0;
                }
                row.push(new Cell(x, y, item));
            }
            this._grid.push(row);
        }
    }

    getCell(x, y) {
        return this._grid[y][x];
    }

    getCellFromPixelCoordinates(pxX, pxY) {
        const x = Math.floor((pxX - this.x) / this._pxCellSize);
        const y = Math.floor((pxY - this.y) / this._pxCellSize);
        return this._grid[y][x];
    }

    getEmptyCell() {
        let emptyCells = [];
        this._grid.forEach(row => {
            row.forEach(cell => {
                if (cell.isEmpty()) emptyCells.push(cell);
            });
        });

        return emptyCells[(Math.floor(Math.random() * emptyCells.length))];
    }

    draw(context) {
        this._grid.forEach(row => {
            row.forEach(cell => {
                if (cell.isEmpty()) return;
                cell.item.draw(context);
            });
        });
    }
}