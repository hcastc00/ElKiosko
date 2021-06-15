const musica = new Audio('../../assets/audio/breakout.mp3')
const canvas = document.getElementById("canvas");
const rulesBtn = document.getElementById('rules-btn');
const closeBtn = document.getElementById('close-btn');
const rules = document.getElementById('rules');
const ctx = canvas.getContext("2d");

const ballRadius = 10;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;
const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false;
let leftPressed = false;
const brickRowCount = 9;
const brickColumnCount = 6;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;
let score = 0;
let lives = 3;
let pause = true;

const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = {x: 0, y: 0, status: 3};
    }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

//Move paddle with arrows
function keyDownHandler(e) {
    if (e.keyCode === 39) {
        rightPressed = true;
    } else if (e.keyCode === 37) {
        leftPressed = true;
    } else if (e.keyCode === 80) {
        pause = pause !== true;
    }
}

function keyUpHandler(e) {
    if (e.keyCode === 39) {
        rightPressed = false;
    } else if (e.keyCode === 37) {
        leftPressed = false;
    }
}

//Move paddle with mouse
function mouseMoveHandler(e) {
    const relativeX = e.clientX - canvas.offsetLeft - screen.width / 2.32;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
    }
}

//Miss the ball with the paddle
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status > 0) {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status--;
                    if (b.status === 0)
                        score++;
                    if (score === brickRowCount * brickColumnCount) {
                        sendScore();
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        lives = 3;
                        score = 0;
                        drawBackground();
                        reDrawBricks();
                        drawLives();
                        drawPaddle();
                        drawBall();
                    }
                }
            }
        }
    }
}

//Draw background
function drawBackground() {
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ece8b3";
    ctx.fill();
    ctx.closePath();
}

//Draw ball
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

//Draw paddle
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#004085";
    ctx.fill();
    ctx.closePath();
}

// Draw bricks
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status > 0) {
                const brickX = (r * (brickWidth + brickPadding)) + brickOffsetLeft;
                const brickY = (c * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth - 5, brickHeight);
                if (bricks[c][r].status === 1)
                    ctx.fillStyle = "#FF0000";
                else if (bricks[c][r].status === 2)
                    ctx.fillStyle = "#b12b38";
                else
                    ctx.fillStyle = "#32373c";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function reDrawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const brickX = (r * (brickWidth + brickPadding)) + brickOffsetLeft;
            const brickY = (c * (brickHeight + brickPadding)) + brickOffsetTop;
            bricks[c][r].x = brickX;
            bricks[c][r].y = brickY;
            bricks[c][r].status = 3;
            ctx.fillStyle = "#32373c";
            ctx.beginPath();
            ctx.rect(brickX, brickY, brickWidth - 5, brickHeight);
            ctx.fill();
            ctx.closePath();
        }
    }
}

//Score
function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: " + score, 8, 20);
}

//Lives
function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Lives: " + lives, canvas.width - 65, 20);
}

function pausecomp(millis) {
    const date = new Date();
    let curDate = null;
    do {
        curDate = new Date();
    }
    while (curDate - date < millis);
}

//Game run
function draw() {
    if (pause === false) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBackground();
        drawBricks();
        drawBall();
        drawPaddle();
        drawScore();
        drawLives();
        collisionDetection();
        if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
            dx = -dx;
        }
        if (y + dy < ballRadius) {
            dy = -dy;
        } else if (y + dy > canvas.height - ballRadius) {
            if (x > paddleX && x < paddleX + paddleWidth) {
                dy = -dy;
            } else {
                lives--;
                if (!lives) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    sendScore();
                    lives = 4;
                    score = 0;
                    drawBackground();
                    reDrawBricks();
                    drawLives();
                    drawPaddle();
                    drawBall();
                } else {
                    x = canvas.width / 2;
                    y = canvas.height - 30;
                    dx = Math.abs(dx);
                    dy = -Math.abs(dy);
                    paddleX = (canvas.width - paddleWidth) / 2;
                    pausecomp(500);
                }
            }
        }

        if (rightPressed && paddleX < canvas.width - paddleWidth) {
            paddleX += 7;
        } else if (leftPressed && paddleX > 0) {
            paddleX -= 7;
        }

        x += dx;
        y += dy;
    }
    requestAnimationFrame(draw);

}

//Handler to start the game
function start() {
    if (event.keyCode === 32 && pause === true) {
        pause = false;
        draw();
    }
}

//Help list
rulesBtn.addEventListener('click', () => rules.classList.add('show'));
closeBtn.addEventListener('click', () => rules.classList.remove('show'));

//Draw the pre-game
drawBackground();
drawBricks();
drawLives();
drawPaddle();
drawBall();

function sendScore() {
    $.post('/socio/juegos/breakout', {score: score})
        .done(function (result) {
            console.log(result)
            $.toast({
                text: 'Se han añadido ' + result.monedas + ' monedas a tu saldo',
                title: 'Enhorabuena!',
                icon: "success",
                position: "top-right",
                hideAfter: 8000
            })
        })
}

    document.body.addEventListener("keydown", () => {
        if (musica.paused) {
            musica.play().then(() => {
                musica.volume = 0.05
                musica.loop = true
            })
        }
    }, false);