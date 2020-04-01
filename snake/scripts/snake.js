'use strict'

const width = 800;
const height = 600;
const cellSize = 20;
let fps = 3;
let context = null;
let grid = null;
let snake = null;
let lastTime = 0;

const KeyCodes = {
    38: "up",
    40: "down",
    37: "left",
    39: "right",
}

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

const Rotation = {
    up: 0,
    down: 180,
    left: 270,
    right: 90,
}

const Assets = {
    head: loadImage("/snake/assets/head.jpg"),
    tail: loadImage("/snake/assets/tail.jpg"),
    body: loadImage("/snake/assets/body.jpg"),
    corner: loadImage("/snake/assets/corner.jpg"),
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
        console.log(this._cellWidth);
        console.log(this._cellHeight);
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
        if (x < 0 || x >= this._cellWidth || y < 0 || y >= this._cellHeight) {
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
        this._body.forEach((cell, i) => {
            const x = cell.x;
            const y = cell.y;
            let angle = 0;
            let image = null;
            if (i === 0) {
                image = Assets.head;
                angle = Rotation[this._direction.id];
                drawRotatedImage(context, angle, x, y, image);
                return;
            }

            const prevCellX = this._body[i - 1].gridX;
            const prevCellY = this._body[i - 1].gridY;

            if (i === (this._body.length - 1)) {
                image = Assets.tail;
                if (prevCellX < cell.gridX) {
                    angle = 270;
                } else if (prevCellX > cell.gridX) {
                    angle = 90;
                } else if (prevCellY < cell.gridY) {
                    angle = 0;
                } else if (prevCellY > cell.gridY) {
                    angle = 180;
                }
                drawRotatedImage(context, angle, x, y, image);
                return;
            }

            // Determine if its a corner or body piece
            const nextCellX = this._body[i + 1].gridX;
            const nextCellY = this._body[i + 1].gridY;

            if (prevCellX === nextCellX) {
                image = Assets.body; 
                angle = 0;
            } else if (prevCellY === nextCellY) {
                image = Assets.body;
                angle = 90;
            } else {
                image = Assets.corner;
                // Determine rotation of corner
                if (prevCellX < nextCellX && prevCellY > nextCellY) {
                    angle = (prevCellX !== cell.gridX) ? 180 : 0;
                } else if (prevCellX < nextCellX && prevCellY < nextCellY) {
                    angle = (prevCellX !== cell.gridX) ? 90 : 270;
                } else if (prevCellX > nextCellX && prevCellY < nextCellY) {
                    angle = (prevCellX !== cell.gridX) ? 0 : 180;
                } else if (prevCellX > nextCellX && prevCellY > nextCellY) {
                    angle = (prevCellX !== cell.gridX) ? 270 : 90;
                }
            }
            drawRotatedImage(context, angle, x, y, image);
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
            fps += 0.5
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

function getRandomRange(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function loadImage(src) {
    const image = new Image();
    image.src = src;
    return image;
}

function initializeGame() {
    grid = new Grid(width, height, cellSize);
    snake = new Snake([grid.getCell(19, 19), 
                       grid.getCell(19, 20),
                       grid.getCell(19, 21)]);
    lastTime = (new Date()).getTime();
    fps = 3;
    addApple(grid);
}

function handleInput(event) {
    if (event.keyCode in KeyCodes) {
        event.preventDefault();
        snake.direction = Direction[KeyCodes[event.keyCode]];
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

function drawRotatedImage(context, angle, x, y, image) {
    context.save();
    context.translate(x + image.width / 2,  y + image.height / 2);
    context.rotate(angle * Math.PI / 180);
    context.drawImage(image, -image.width / 2, -image.height / 2);
    context.restore();
}

