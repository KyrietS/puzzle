/**
 * Główny kod gry "Układanka"
 * @author Sebastian Fojcik
 */

document.body.onload = init;

const images = [
    "hedgehog1.jpg", "hedgehog2.jpg", "hedgehog3.jpg", "hedgehog4.jpg",
    "cat1.jpg", "chick1.jpg", "dog1.jpg", "fox1.jpg",
    "hippo1.jpg", "penguin1.jpg", "rabbit1.jpg", "squirrel.jpg"
];

const board = new Board(4, 4);
const menu = new Menu(board, images);

board.onfinished = () => document.getElementById("gameTitle").innerText = "GRATULACJE!";
board.onunfinished = () => document.getElementById("gameTitle").innerText = "Układanka";

window.onresize = () => {
    if(clientWidth <= 710) {
        canvas.width = bodyWidth - 10;
        canvas.height = bodyWidth - 10;
    }
};

canvas.onmousemove = function(e) {
    board.highlightTile(e.offsetX, e.offsetY);
};

canvas.onmousedown = function(e) {
    board.moveTile(e.offsetX, e.offsetY);
    board.highlightTile(-1, -1);
};

document.onkeydown = function(e) {
    switch(e.code) {
        case UP: board.move(UP); break;
        case DOWN: board.move(DOWN); break;
        case RIGHT: board.move(RIGHT); break;
        case LEFT: board.move(LEFT); break;
    }
};

document.getElementById("menuBtn").onclick = () => menu.showSizeChooser();
document.getElementById("mixBtn").onclick = () => board.mix(50);

function init() {
    window.onresize(null);
    menu.showSizeChooser();
    board.loadImage("img/hedgehog1.jpg");
    draw();
}

function draw() {
    window.requestAnimationFrame(draw);
    clear("#e66357");
    board.animate();
    board.draw();
}
