'use strict'

const width = 800;
const height = 600;
const cellSize = 20;
let fps = 1;
let context = null;
let grid = null;
let snake = null;
let lastTime = 0;

const Direction = {
    up: {x: 0, y: -1, id: "up"},
    down: {x: 0, y: 1, id: "down"},
    left: {x: -1, y: 0, id: "left"},
    right: {x: 1, y: 0, id: "right"},
}

const OppositeDirection = {
    up: Direction.down,
    down: Direction.up,
    left: Direction.right,
    right: Direction.left,
}

const KeyDirection = {
    "w": Direction.up,
    "a": Direction.left,
    "s": Direction.down,
    "d": Direction.right,
}

class Cell {
    constructor(x, y) {
        this._x = x;
        this._y = y;
        this._item = null;
    }

    get x() {
        return this._x * cellSize;
    }

    get y() {
        return this._y * cellSize;
    }

    get gridX() {
        return this._x;
    }

    get gridY() {
        return this._y;
    }

    get item() {
        return this._item;
    }

    set item(item) {
        this._item = item;
    }

    isEmpty() {
        return null === this._item;
    }

    clear() {
        this._item = null;
    }

    draw(context) {
        if (this.isEmpty()) return;

        this.item.draw(context);
    }

}

class Grid {
    constructor(width, height, cellSize) {
        this._width = width;
        this._height = height;
        this._cellSize = cellSize;
        this._cellWidth = this._width / this._cellSize;
        this._cellHeight = this._height / this._cellSize;
        this._grid = [];
        for (let y = 0; y < this._cellHeight; ++y) {
            let row = [];
            for (let x = 0; x < this._cellWidth; ++x) {
                row.push(new Cell(x, y));
            }
            this._grid.push(row);
        }
    }

    getCell(x, y) {
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

    getAdjacent(cell, dir) {
        const x = cell.gridX + dir.x;
        const y = cell.gridY + dir.y;
        if (x < 0 || x >= this.cellWidth || y < 0 || y >= this.cellHeight) {
            return null;
        }

        return this._grid[y][x];
    }

    draw(context) {
        this._grid.forEach(row => {
            row.forEach(cell => {
                cell.draw(context);
            });
        });
    }
}

class Snake {
    constructor(cells) {
        this.isDead = false;
        this._body = cells;
        this._direction = Direction.up;
        this._invalidDirection = null;
        this._body.forEach(cell => {
            cell.item = this;
        });
    }

    get direction() {
        return this._direction;
    }

    set direction(direction) {
        this._direction = direction;
    }

    draw(context) {
        context.fillStyle = "#00FF00";
        this._body.forEach(cell => {
            context.fillRect(cell.x, cell.y, cellSize, cellSize);
        })
    }

    updatePosition(grid) {
        this._validateDirection();
        const head = this._body[0];
        const newHead = grid.getAdjacent(head, this._direction);
        if (newHead === null || newHead.item === this) {
            this.isDead = true;
            return;
        } 

        if (newHead.item !== null) {
            fps += 1
            addApple(grid);
        } else {
            const tail = this._body.pop()
            tail.clear();
        }

        newHead.item = this;
        this._body.unshift(newHead);
        this._updateInvalidDirection();
    }

    _validateDirection() {
        if (this._direction === this._invalidDirection) {
            this._direction = OppositeDirection[this._invalidDirection.id];
        }
    }

    _updateInvalidDirection() {
        if (this._body.length > 1) {
            this._invalidDirection = OppositeDirection[this._direction.id];
        }
    }
}

class Apple {
    constructor(cell) {
        this._cell = cell;
    }

    draw(context) {
        context.fillStyle = "#FF0000";
        context.fillRect(this._cell.x, this._cell.y, cellSize, cellSize);
    }
}

$(document).ready(() => {
    document.addEventListener("keydown", handleInput);
    context = $("#canvas")[0].getContext("2d"); 
    initializeGame();
    updateGame();
});

function initializeGame() {
    grid = new Grid(width, height, cellSize);
    snake = new Snake([grid.getCell(19, 19)]);
    lastTime = (new Date()).getTime();
    fps = 1;
    addApple(grid);
}

function handleInput(event) {
    if (event.key in KeyDirection) {
        event.preventDefault();
        snake.direction = KeyDirection[event.key];
    }
}

function addApple(grid) {
    const cell = grid.getEmptyCell();
    cell.item = new Apple(cell);
}

function updateGame() {
    window.requestAnimationFrame(updateGame);

    let currentTime = (new Date).getTime();
    let deltaTime = currentTime - lastTime;
    let interval = 1000 / fps;

    if (deltaTime > interval) {
        lastTime = currentTime
        snake.updatePosition(grid);
        if (snake.isDead) {
            initializeGame();
        }
        context.clearRect(0, 0, width, height);
        grid.draw(context);
    }
}

