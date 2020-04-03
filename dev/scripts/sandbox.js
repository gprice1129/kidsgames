'use strict'

import { Rect } from "/common/drawable.js";
import { Grid } from "/common/grid.js";
import { Canvas } from "/common/canvas.js";

$(document).ready(() => {
    let context = $("#canvas")[0].getContext("2d"); 
    let canvas = new Canvas(context, 100, 100, {});
    canvas.add(grid);
    canvas.draw();
});