var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="jquery.d.ts" />
/* 2D Vector Graphic TypeScript
* Copyright 2014 by Anthony Terra
* Give credit where credit is due.  The koch snowflake implementation is based off of
* Nathan Bronecke applet which can be found here
* http://everything2.com/title/Koch%2520snowflake
*/
/*
The MIT License (MIT)
Copyright (c) 2014 Anthony Terra
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
var VectorGraphics2d;
(function (VectorGraphics2d) {
    var cos60 = 0.5;
    var sin60 = Math.sqrt(3) * 0.5;
    var value2Root3Over3 = Math.sqrt(3) * 2 / 3;

    //any vector graphic drawn will use this line color
    var lineColor = '#ff0000';

    function clearCanvasById(canvasId) {
        var htmlcanvas = document.getElementById(canvasId);
        clearCanvas(htmlcanvas);
    }
    function clearCanvas(htmlcanvas) {
        var drawcontext = htmlcanvas.getContext("2d");

        //clear lines and rect
        drawcontext.beginPath();
        drawcontext.clearRect(0, 0, htmlcanvas.width, htmlcanvas.height);
    }

    

    //#endregion
    //#region Shape Objects
    var Point = (function () {
        function Point(x, y) {
            this.x = x;
            this.y = y;
        }
        Point.prototype.draw = function (htmlcanvas) {
            var drawcontext = htmlcanvas.getContext("2d");
            drawcontext.strokeStyle = lineColor;
            drawcontext.fillRect(this.x, this.y, 10, 10);

            drawcontext.stroke();
        };
        return Point;
    })();

    var Line = (function () {
        function Line(start, end) {
            this.start = start;
            this.end = end;
        }
        Line.prototype.draw = function (htmlcanvas) {
            var drawcontext = htmlcanvas.getContext("2d");
            this.drawByContext(drawcontext);
            drawcontext.stroke();
        };

        Line.prototype.drawByContext = function (drawcontext) {
            drawcontext.moveTo(this.start.x, this.start.y);
            drawcontext.lineTo(this.end.x, this.end.y);

            drawcontext.strokeStyle = lineColor;
        };

        Line.prototype.drawpoints = function (htmlcanvas) {
            this.start.draw(htmlcanvas);
            this.end.draw(htmlcanvas);
        };
        return Line;
    })();

    var Curve = (function (_super) {
        __extends(Curve, _super);
        function Curve() {
            _super.apply(this, arguments);
        }
        Curve.prototype.draw = function (htmlcanvas) {
            var drawcontext = htmlcanvas.getContext("2d");
            drawcontext.beginPath();
            drawcontext.moveTo(this.start.x + 10, this.start.y + 10);
            drawcontext.arcTo(this.start.x + 100, this.start.y + 10, this.end.x, this.end.y + 400, 60);

            drawcontext.strokeStyle = lineColor;
            drawcontext.stroke();
        };
        return Curve;
    })(Line);
    var Triangle = (function () {
        function Triangle(left, middle, right) {
            this.left = left;
            this.middle = middle;
            this.right = right;
            this.height = Math.abs(this.left.y - this.middle.y);
            this.width = Math.abs(this.right.x - this.left.x);

            this.leftLine = new Line(middle, left);
            this.rightLine = new Line(middle, right);
            this.middleLine = new Line(left, right);
        }
        Triangle.prototype.draw = function (htmlcanvas) {
            this.leftLine.draw(htmlcanvas);
            this.rightLine.draw(htmlcanvas);
            this.middleLine.draw(htmlcanvas);
        };
        return Triangle;
    })();

    //#endregion
    //#region Snowflake
    var Snowflake = (function () {
        function Snowflake() {
        }
        Snowflake.prototype.draw = function (canvasId, depth) {
            var htmlcanvas = document.getElementById(canvasId);
            this.drawcontext = htmlcanvas.getContext("2d");

            //clear canvas before drawing the next iteration
            clearCanvas(htmlcanvas);

            var w;
            var h;

            if (htmlcanvas.height < (htmlcanvas.width * value2Root3Over3)) {
                //height is limiting dimension
                h = htmlcanvas.height;
                w = h / value2Root3Over3;
            } else {
                //width is limiting dimension
                w = htmlcanvas.width;
                h = w * value2Root3Over3;
            }

            //create the base points for the starting triangle
            var top = ((htmlcanvas.height - h) * 0.5 + (h * 0.25));
            var p1 = new Point(((htmlcanvas.width - w) * 0.5), top);
            var p2 = new Point(((htmlcanvas.width + w) * 0.5), top);
            var p3 = new Point((htmlcanvas.width >> 1), ((htmlcanvas.height + h) * 0.5));

            var currentDepth = depth;

            //draw the lines recursively
            this.drawSegment(htmlcanvas, p1, p2, currentDepth);
            this.drawSegment(htmlcanvas, p2, p3, currentDepth);
            this.drawSegment(htmlcanvas, p3, p1, currentDepth);

            //do not perform the actual draw until all calulations are complete
            this.drawcontext.stroke();
        };

        Snowflake.prototype.drawSegment = function (htmlcanvas, a, b, depth) {
            if (depth == 0) {
                var currentLine = new Line(a, b);
                currentLine.drawByContext(this.drawcontext);
            } else {
                //compute points
                var distance = new Point((b.x - a.x) / 3, (b.y - a.y) / 3);
                var pa = new Point(a.x + distance.x, a.y + distance.y);
                var pb = new Point(b.x - distance.x, b.y - distance.y);
                var pTip = new Point(pa.x + (distance.x * cos60 + distance.y * sin60), pa.y + (distance.y * cos60 - distance.x * sin60));

                //draw line segments
                var newDepth = depth - 1;

                //depth -= 1;
                this.drawSegment(htmlcanvas, a, pa, newDepth);
                this.drawSegment(htmlcanvas, pa, pTip, newDepth);
                this.drawSegment(htmlcanvas, pTip, pb, newDepth);
                this.drawSegment(htmlcanvas, pb, b, newDepth);
            }
        };
        return Snowflake;
    })();

    //#endregion
    $(document).ready(function () {
        var snowflake = new Snowflake();
        var canvasId = "drawSurface";
        var totalIterations = 8;

        //#region Draw Simple Objects
        $("#drawLine").on("click", function () {
            var htmlcanvas = document.getElementById("drawSurface");
            clearCanvas(htmlcanvas);

            //creates diagnol line across the canvas
            var line = new Line(new Point(0, 0), new Point(htmlcanvas.width, htmlcanvas.height));
            line.draw(htmlcanvas);
        });

        $("#drawLinePoints").on("click", function () {
            var htmlcanvas = document.getElementById("drawSurface");
            clearCanvas(htmlcanvas);

            //creates diagnol line across the canvas
            var line = new Line(new Point(0, 0), new Point(htmlcanvas.width - 10, htmlcanvas.height - 10));
            line.drawpoints(htmlcanvas);
        });

        $("#drawCurve").on("click", function () {
            var htmlcanvas = document.getElementById("drawSurface");
            clearCanvas(htmlcanvas);

            //creates diagnol line across the canvas
            var curve = new Curve(new Point(0, 0), new Point(htmlcanvas.width - 10, htmlcanvas.height - 10));
            curve.draw(htmlcanvas);
        });

        $("#drawCurvePoints").on("click", function () {
            var htmlcanvas = document.getElementById("drawSurface");
            clearCanvas(htmlcanvas);

            //creates diagnol line across the canvas
            var curve = new Curve(new Point(0, 0), new Point(htmlcanvas.width - 10, htmlcanvas.height - 10));
            curve.drawpoints(htmlcanvas);
        });

        $("#drawTriangle").on("click", function () {
            var htmlcanvas = document.getElementById("drawSurface");
            clearCanvas(htmlcanvas);

            //creates diagnol line across the canvas
            var triangle = new Triangle(new Point(0, htmlcanvas.height), new Point(htmlcanvas.width / 2, 0), new Point(htmlcanvas.width, htmlcanvas.height));
            triangle.draw(htmlcanvas);
        });

        //#endregion
        //#region Draw Snowflake
        $("#drawSnowflake").on("click", function () {
            clearCanvasById(canvasId);
            snowflake.draw(canvasId, 8);
        });

        $("#drawAnimatedSnowflake").on("click", function () {
            clearCanvasById(canvasId);
            var timeout = 500;

            createAnimatedSnowFlake(totalIterations, timeout);
        });

        function createAnimatedSnowFlake(iteration, timeout) {
            var currentIteration = totalIterations - iteration;
            setTimeout(function () {
                snowflake.draw(canvasId, currentIteration);
                var newiteration = iteration - 1;
                if (newiteration >= 0) {
                    createAnimatedSnowFlake(newiteration, timeout);
                }
            }, timeout);
        }
        //#endregion
    });
})(VectorGraphics2d || (VectorGraphics2d = {}));
//# sourceMappingURL=VectorGraphics2d.js.map
