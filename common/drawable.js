'use strict'

export class Drawable {
    static __id = 0;

    static _getId() {
        let id = Drawable.__id;
        Drawable.__id += 1;
        return id;
    }

    constructor(x, y, rotation) {
        this._id = Drawable._getId();
        this._x = x ? x : 0;
        this._y = y ? y : 0;
        this._rotation = rotation ? rotation : 0;
    }

    get id() { return this._id; }
    get x() { return this._x; }
    set x(newX) { this._x = newX; }
    get y() { return this._y; }
    set y(newY) { this._y = newY; }
    get rotation() { return this._rotation; }
    set rotation(angle) { this._rotation = angle; }

    draw(context) {
        console.error("Must define draw function");
    }
}

export class Rect extends Drawable {
    constructor(x, y, width, height, color,
            fill, borderSize, rotation) {
        super(x, y, rotation);
        this._width = width ? width : 0;
        this._height = height ? height : 0;
        this._color = color ? color : "black";
        this._fill = fill ? fill : false;
        this._borderSize = borderSize ? borderSize : "0";
    }

    get width() { return this._width; }
    set width(newWidth) { this._width = newWidth; }
    get height() { return this._height; }
    set height(newHeight) { this._height = newHeight; }
    get color() { return this._color; }
    set color(newColor) { this._color = newColor; }
    get fill() { return this._fill; }

    draw(context) {
        context.save();
        let x = this.x;
        let y = this.y;
        if (this.rotation !== 0) {
            context.translate(x + this.width / 2, y + this.height / 2);
            context.rotate(this.rotation * Math.PI / 180);
            x = -this.width / 2;
            y = -this.height / 2;
        }

        if (this.fill) {
            context.fillStyle = this._color;
            context.fillRect(x, y, this.width, this.height);
        } else {
            context.beginPath();
            context.lineWidth = this._borderSize;
            context.strokeStyle = this._color;
            context.rect(x, y, this.width, this.height);
            context.stroke();
        }
        context.restore();
    }
}