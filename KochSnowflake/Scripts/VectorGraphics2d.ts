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
module VectorGraphics2d {
    var cos60: number = 0.5;//value of cos(60 degrees)
    var sin60: number = Math.sqrt(3) * 0.5;//value of sin(60 degrees)
    var value2Root3Over3 = Math.sqrt(3) * 2 / 3;
    //any vector graphic drawn will use this line color
    var lineColor = '#ff0000';

    function clearCanvasById(canvasId: string) {
        var htmlcanvas = <HTMLCanvasElement>document.getElementById(canvasId);
        clearCanvas(htmlcanvas);
    }
    function clearCanvas(htmlcanvas: HTMLCanvasElement) {
        var drawcontext = htmlcanvas.getContext("2d");
        //clear lines and rect
        drawcontext.beginPath();
        drawcontext.clearRect(0, 0, htmlcanvas.width, htmlcanvas.height);
    }

    //#region Interfaces
    //Simple vector Graphic Interfaces
    interface IPoint {
        x: number;
        y: number;
        draw(htmlcanvas: HTMLCanvasElement);
    }

    interface ILine {
        start: IPoint;
        end: IPoint;
        draw(htmlcanvas: HTMLCanvasElement);
    }
    
    interface ITriangle {
        left: IPoint;
        middle: IPoint;
        right: IPoint;
        leftLine: ILine;
        rightLine: ILine;
        middleLine: ILine;
        height: number;
        width: number;
        draw(htmlcanvas: HTMLCanvasElement);
    }
    //#endregion

    //#region Shape Objects
    class Point implements IPoint {
        constructor(public x, public y) {
        }
        draw(htmlcanvas: HTMLCanvasElement) {
            var drawcontext : CanvasRenderingContext2D = htmlcanvas.getContext("2d");
            drawcontext.strokeStyle = lineColor;
            drawcontext.fillRect(this.x, this.y, 10, 10);
           
            drawcontext.stroke();
        }
    }


    class Line implements ILine {
        constructor(public start: Point, public end: Point) { }
        draw(htmlcanvas: HTMLCanvasElement) {
            var drawcontext: CanvasRenderingContext2D = htmlcanvas.getContext("2d");
            this.drawByContext(drawcontext);
            drawcontext.stroke();
        }

        drawByContext(drawcontext: CanvasRenderingContext2D) {
            drawcontext.moveTo(this.start.x, this.start.y);
            drawcontext.lineTo(this.end.x, this.end.y);

            drawcontext.strokeStyle = lineColor;
            
        }

        drawpoints(htmlcanvas: HTMLCanvasElement) {
            this.start.draw(htmlcanvas);
            this.end.draw(htmlcanvas);
        }
    }

    class Curve extends Line {
        draw(htmlcanvas: HTMLCanvasElement) {
            var drawcontext: CanvasRenderingContext2D = htmlcanvas.getContext("2d");
            drawcontext.beginPath();  
            drawcontext.moveTo(this.start.x+10, this.start.y+10);
            drawcontext.arcTo(this.start.x+100, this.start.y+10, this.end.x, this.end.y+400,60);

            drawcontext.strokeStyle = lineColor;
            drawcontext.stroke();
        }
    }
    class Triangle implements ITriangle {
        constructor(public left: IPoint, public middle: IPoint, public right: IPoint) {
            this.height = Math.abs(this.left.y - this.middle.y);
            this.width = Math.abs(this.right.x - this.left.x);

            this.leftLine = new Line(middle, left);
            this.rightLine = new Line(middle, right);
            this.middleLine = new Line(left, right);
        }
        height: number;
        width: number;
        leftLine: ILine;
        rightLine: ILine;
        middleLine: ILine;

        draw(htmlcanvas: HTMLCanvasElement) {
            this.leftLine.draw(htmlcanvas);
            this.rightLine.draw(htmlcanvas);
            this.middleLine.draw(htmlcanvas);


        }
    }
    //#endregion

    //#region Snowflake
    class Snowflake {
        drawcontext: CanvasRenderingContext2D;

        draw(canvasId: string, depth:number){
            var htmlcanvas = <HTMLCanvasElement>document.getElementById(canvasId);
            this.drawcontext = htmlcanvas.getContext("2d");
            //clear canvas before drawing the next iteration
            clearCanvas(htmlcanvas);

            var w: number;
            var h: number;

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
            var top: number = ((htmlcanvas.height - h) * 0.5 + (h * 0.25));
            var p1: IPoint = new Point(((htmlcanvas.width - w) * 0.5), top);
            var p2: IPoint = new Point(((htmlcanvas.width + w) * 0.5), top);
            var p3: IPoint = new Point(
                (htmlcanvas.width >> 1),
                ((htmlcanvas.height + h) * 0.5)
                );

            var currentDepth: number = depth;
            //draw the lines recursively
            this.drawSegment(htmlcanvas, p1, p2, currentDepth);
            this.drawSegment(htmlcanvas, p2, p3, currentDepth);
            this.drawSegment(htmlcanvas, p3, p1, currentDepth);
            //do not perform the actual draw until all calulations are complete
            this.drawcontext.stroke();
        }
        
        private drawSegment(htmlcanvas: HTMLCanvasElement, a: IPoint , b: IPoint , depth:number) {

            if (depth == 0) {
                var currentLine: Line = new Line(a, b);
                currentLine.drawByContext(this.drawcontext);
            } else {

                //compute points
                var distance: IPoint = new Point((b.x - a.x) / 3, (b.y - a.y) / 3);
                var pa: IPoint = new Point(a.x + distance.x, a.y + distance.y);
                var pb: IPoint = new Point(b.x - distance.x, b.y - distance.y);
                var pTip: IPoint = new Point(
                    pa.x + (distance.x * cos60 + distance.y * sin60),
                    pa.y + (distance.y * cos60 - distance.x * sin60)
                );

                //draw line segments
                var newDepth: number = depth - 1;
                //depth -= 1;
                this.drawSegment(htmlcanvas, a, pa, newDepth);
                this.drawSegment(htmlcanvas, pa, pTip, newDepth);
                this.drawSegment(htmlcanvas, pTip, pb, newDepth);
                this.drawSegment(htmlcanvas, pb, b, newDepth);
               
            }
        }
    }
    //#endregion

    $(document).ready(() => {
        
        var snowflake:Snowflake = new Snowflake();
        var canvasId = "drawSurface";
        var totalIterations = 8;
        //#region Draw Simple Objects
        $("#drawLine").on("click", () => {
            var htmlcanvas = <HTMLCanvasElement>document.getElementById("drawSurface");
            clearCanvas(htmlcanvas);
            //creates diagnol line across the canvas
            var line: Line = new Line(new Point(0, 0), new Point(htmlcanvas.width, htmlcanvas.height));
            line.draw(htmlcanvas);
        });

        $("#drawLinePoints").on("click", () => {
            var htmlcanvas = <HTMLCanvasElement>document.getElementById("drawSurface");
            clearCanvas(htmlcanvas);
            //creates diagnol line across the canvas
            var line: Line = new Line(new Point(0, 0), new Point(htmlcanvas.width-10, htmlcanvas.height-10));
            line.drawpoints(htmlcanvas);
        });

        $("#drawCurve").on("click", () => {
            var htmlcanvas = <HTMLCanvasElement>document.getElementById("drawSurface");
            clearCanvas(htmlcanvas);
            //creates diagnol line across the canvas
            var curve: Curve = new Curve(new Point(0, 0), new Point(htmlcanvas.width-10, htmlcanvas.height-10));
            curve.draw(htmlcanvas);
        });

        $("#drawCurvePoints").on("click", () => {
            var htmlcanvas = <HTMLCanvasElement>document.getElementById("drawSurface");
            clearCanvas(htmlcanvas);
            //creates diagnol line across the canvas
            var curve: Curve = new Curve(new Point(0, 0), new Point(htmlcanvas.width-10, htmlcanvas.height-10));
            curve.drawpoints(htmlcanvas);
        });

        $("#drawTriangle").on("click", () => {
            var htmlcanvas = <HTMLCanvasElement>document.getElementById("drawSurface");
            clearCanvas(htmlcanvas);
            //creates diagnol line across the canvas
            var triangle = new Triangle(new Point(0, htmlcanvas.height), new Point(htmlcanvas.width / 2, 0), new Point(htmlcanvas.width, htmlcanvas.height));
            triangle.draw(htmlcanvas);
        });
        //#endregion

        //#region Draw Snowflake
        $("#drawSnowflake").on("click", () => {
            clearCanvasById(canvasId);
            snowflake.draw(canvasId, 8);
        });

        $("#drawAnimatedSnowflake").on("click", () => {
            clearCanvasById(canvasId);
            var timeout = 500;

            createAnimatedSnowFlake(totalIterations, timeout);
        });

        function createAnimatedSnowFlake(iteration:number, timeout:number) {
            var currentIteration = totalIterations - iteration;
            setTimeout(() => {
                snowflake.draw(canvasId, currentIteration);
                var newiteration: number = iteration - 1;
                if (newiteration >= 0) {
                    createAnimatedSnowFlake(newiteration, timeout);
                }
            }, timeout);
        }
        //#endregion
    });
}
