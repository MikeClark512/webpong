let downKeys: { [key: string]: boolean } = {};
let c: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;

class Rect {
    constructor(
        public x: number = 0,
        public y: number = 0,
        public width: number = 0,
        public height: number = 0,
    ) {

    }

    public toArray(): [number, number, number, number] {
        return [this.x, this.y, this.width, this.height];
    }

    get bottom(): number {
        return this.y + this.height;
    }

    get right(): number {
        return this.x + this.width;
    }
}

class Paddle extends Rect {

}

class Player {
    constructor(
        public paddle: Paddle
    ) {
    }
}

class Game {
    private moveSize: number = 5;
    private frameCounter: number = 0;
    public ball: Rect;
    public p1: Player;
    public p2: Player;
    public ballDirectionX: number = 0;
    public ballDirectionY: number = 0;

    constructor(
    ) {
        this.ball = new Rect(c.width / 2, c.height / 2, 25, 25);
        this.p1 = new Player(new Paddle(0, 0, 25, 100));
        this.p2 = new Player(new Paddle(0, 0, 25, 100));

        this.relocateGameElementsBasedOnCanvasSize();

        this.randomizeBallDirection();
    }

    flipBallDirectionX() {
        this.ballDirectionX = -this.ballDirectionX;
    }

    flipBallDirectionY() {
        this.ballDirectionY = -this.ballDirectionY;
    }

    randomizeBallDirection() {
        this.ballDirectionX = randomInt(1, 4);
        this.ballDirectionY = randomInt(1, 4);
        if (Math.random() >= 0.5) {
            this.flipBallDirectionX();
        }
        if (Math.random() >= 0.5) {
            this.flipBallDirectionY()
        }
    }

    clampObjectToCanvas(rect: Rect, side: "left" | "right" | null = null) {
        if (rect.x < 0) {
            rect.x = 0;
        }
        if (rect.y < 0) {
            rect.y = 0;
        }
        if (rect.bottom > c.height) {
            rect.y = c.height - rect.height;
        }
        if (rect.right > c.width) {
            rect.x = c.width - rect.width;
        }
        if (side == "left") {
            rect.x = 0;
        } else if (side == "right") {
            rect.x = c.width - rect.width;
        }
    }

    relocateGameElementsBasedOnCanvasSize() {
        this.clampObjectToCanvas(this.ball);
        this.clampObjectToCanvas(this.p1.paddle, "left");
        this.clampObjectToCanvas(this.p2.paddle, "right");
    }

    redraw() {
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.beginPath();
        ctx.fillStyle = "red";
        ctx.rect(this.ball.x, this.ball.y, this.ball.width, this.ball.height);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = "blue";
        ctx.rect(...this.p1.paddle.toArray());
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = "green";
        ctx.rect(...this.p2.paddle.toArray());
        ctx.fill();

        //console.log("redraw");
    }

    loop() {
        this.frameCounter += 1;

        // if (downKeys["ArrowDown"]) {
        //     this.ball.y += this.moveSize;
        //     //console.log("ArrowDown", box);
        // }

        // if (downKeys["ArrowUp"]) {
        //     this.ball.y -= this.moveSize;
        //     //console.log("ArrowUp", box);
        // }

        // if (downKeys["ArrowRight"]) {
        //     this.ball.x += this.moveSize;
        //     //console.log("ArrowRight", box);
        // }

        // if (downKeys["ArrowLeft"]) {
        //     this.ball.x -= this.moveSize;
        //     //console.log("ArrowLeft", box);
        // }

        if (downKeys["a"]) {
            this.p1.paddle.y -= this.moveSize;
        }

        if (downKeys["z"]) {
            this.p1.paddle.y += this.moveSize;
        }

        if (downKeys["k"]) {
            this.p2.paddle.y -= this.moveSize;
        }

        if (downKeys["m"]) {
            this.p2.paddle.y += this.moveSize;
        }

        if (this.ball.right >= c.width) {
            this.flipBallDirectionX();
        }

        if (this.ball.bottom >= c.height) {
            this.flipBallDirectionY();
        }

        if (this.ball.x <= 0) {
            this.flipBallDirectionX();
        }

        if (this.ball.y <= 0) {
            this.flipBallDirectionY();
        }

        this.ball.x += this.ballDirectionX;
        this.ball.y += this.ballDirectionY;


        this.ball.x = Math.max(0, Math.min(c.width - this.ball.width, this.ball.x));
        this.ball.y = Math.max(0, Math.min(c.height - this.ball.height, this.ball.y));

        this.relocateGameElementsBasedOnCanvasSize();

        this.redraw();

        window.requestAnimationFrame(this.loop.bind(this));
    }

    onResize() {
        this.p2.paddle.x = c.width - this.p2.paddle.width;
    }
}

let game: Game;


function onDOMContentLoaded() {
    console.log("DOMContentLoaded");
    c = <HTMLCanvasElement>document.getElementById("c")!;
    ctx = c.getContext("2d")!;
    c.style.backgroundColor = "#DDD";

    document.addEventListener("keydown", (evt) => {
        if (!downKeys[evt.key]) {
            downKeys[evt.key] = true;
            //console.log("keydown; downKeys", downKeys);
        }
    });
    document.addEventListener("keyup", (evt) => {
        delete downKeys[evt.key];
        //console.log("keyup; downKeys", downKeys);
    });

    updateCanvasSizeBasedOnWindowSize();

    game = new Game();

    window.requestAnimationFrame(game.loop.bind(game));
}

function updateCanvasSizeBasedOnWindowSize() {
    if (c) {
        let changed = false;
        if (c.width != window.innerWidth) {
            c.width = window.innerWidth;
            changed = true;
        }
        if (c.height != window.innerHeight) {
            c.height = window.innerHeight;
            changed = true;
        }
        if (changed) {
            if (game) {
                game.onResize();
            }
        }
        console.log(`updateCanvasSizeBasedOnWindowSize c=${c} changed=${changed}`);
    } else {
        console.log(`updateCanvasSizeBasedOnWindowSize c=null changed=false`);
    }
}

function onWindowResize() {
    console.log("onWindowResize");
    updateCanvasSizeBasedOnWindowSize();
}

function randomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

document.addEventListener("DOMContentLoaded", onDOMContentLoaded);
window.addEventListener("resize", onWindowResize);

