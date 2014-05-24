/// <reference path="jquery.d.ts" />
/*Vector Graphic.TypeScript
* Copyright 2014 by Anthony Terra
* Give credit where credit is due.  The snowflake implementation is based off of
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
var VectorGraphics;
(function (VectorGraphics) {
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
    var Point = (function () {
        function Point(x, y) {
            this.x = x;
            this.y = y;
        }
        return Point;
    })();

    var Line = (function () {
        function Line(start, end) {
            this.start = start;
            this.end = end;
        }
        Line.prototype.draw = function (htmlcanvas) {
            var drawcontext = htmlcanvas.getContext("2d");
            drawcontext.moveTo(this.start.x, this.start.y);
            drawcontext.lineTo(this.end.x, this.end.y);

            drawcontext.strokeStyle = lineColor;
            drawcontext.stroke();
        };
        return Line;
    })();

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

    var Snowflake = (function () {
        function Snowflake() {
        }
        Snowflake.prototype.draw = function (canvasId, depth) {
            var htmlcanvas = document.getElementById(canvasId);

            //this.triangle.draw(htmlcanvas);
            //clear canvas before drawing the next iteration
            clearCanvas(htmlcanvas);

            // Restore the transform
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

            var top = ((htmlcanvas.height - h) * 0.5 + (h * 0.25));
            var p1 = new Point(((htmlcanvas.width - w) * 0.5), top);
            var p2 = new Point(((htmlcanvas.width + w) * 0.5), top);
            var p3 = new Point((htmlcanvas.width >> 1), ((htmlcanvas.height + h) * 0.5));
            var currentDepth = depth;
            this.drawSegment(htmlcanvas, p1, p2, currentDepth);
            this.drawSegment(htmlcanvas, p2, p3, currentDepth);
            this.drawSegment(htmlcanvas, p3, p1, currentDepth);
        };

        Snowflake.prototype.drawSegment = function (htmlcanvas, a, b, depth) {
            if (depth == 0) {
                var currentLine = new Line(a, b);
                currentLine.draw(htmlcanvas);
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

    $(document).ready(function () {
        var snowflake = new Snowflake();
        var canvasId = "drawSurface";

        $("#drawLine").on("click", function () {
            var htmlcanvas = document.getElementById("drawSurface");
            clearCanvas(htmlcanvas);

            //creates diagnol line across the canvas
            var line = new Line(new Point(0, 0), new Point(htmlcanvas.width, htmlcanvas.height));
            line.draw(htmlcanvas);
        });
        $("#drawTriangle").on("click", function () {
            var htmlcanvas = document.getElementById("drawSurface");
            clearCanvas(htmlcanvas);

            //creates diagnol line across the canvas
            var triangle = new Triangle(new Point(0, htmlcanvas.height), new Point(htmlcanvas.width / 2, 0), new Point(htmlcanvas.width, htmlcanvas.height));
            triangle.draw(htmlcanvas);
        });
        $("#drawSnowflake").on("click", function () {
            clearCanvasById(canvasId);
            snowflake.draw(canvasId, 5);
        });

        //triangle.draw("drawSurface");
        $("#drawAnimatedSnowflake").on("click", function () {
            clearCanvasById(canvasId);
            setTimeout(function () {
                snowflake.draw(canvasId, 0);
                setTimeout(function () {
                    snowflake.draw(canvasId, 1);
                    setTimeout(function () {
                        snowflake.draw(canvasId, 2);
                        setTimeout(function () {
                            snowflake.draw(canvasId, 3);
                            setTimeout(function () {
                                snowflake.draw(canvasId, 4);
                                setTimeout(function () {
                                    snowflake.draw(canvasId, 5);
                                }, 1000);
                            }, 1000);
                        }, 1000);
                    }, 1000);
                }, 1000);
            }, 1000);
        });
    });
})(VectorGraphics || (VectorGraphics = {}));
//# sourceMappingURL=KochSnowflake.js.map
