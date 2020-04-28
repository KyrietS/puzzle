/**
 * Pomocnicze funkcje do rysowania na płótnie
 * @author Sebastian Fojcik
 */

/* Klawisze sterujące */
const UP    = "ArrowUp";
const DOWN  = "ArrowDown";
const RIGHT = "ArrowRight";
const LEFT  = "ArrowLeft";

/**
 * Wypisuje komunikat na konsolę. (Skrót od console.log)
 * @param msg
 */
function log(msg) {
    console.log(msg);
}

const clientWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;

const bodyWidth = document.body.clientWidth;

/**
 * Referencja do płótna, na którym rysowana jest gra.
 */
const canvas = document.getElementById("mainCanvas");

/**
 * Kontekst 2D
 * @type {CanvasRenderingContext2D}
 * @private
 */
const ctx = canvas.getContext("2d");

/**
 * Szerokość płótna
 * @type {number}
 */
function canvasWidth() {
    return canvas.width;
}

/**
 * Wysokość płótna
 * @type {number}
 */
function canvasHeight() {
    return canvas.height;
}

/**
 * Grubość rysowanej linii
 * @type {number}
 * @private
 */
let _stroke = 1;

/**
 * Kolor rysowanej linii
 * @type {string}
 * @private
 */
let _color = "black";

/**
 * Kolor wypełnienia
 * @type {string}
 * @private
 */
let _fill = "black";

/** Ustawia grubość linii */
function stroke(n) {
    _stroke = n;
}

/** Ustawia kolor rysowanych linii */
function color(c) {
    _color = c;
}

/** Ustawia kolor wypełnienia rysowanych figur */
function fill(f) {
    _fill = f;
}

/** Ustawia przezroczystość rysowania */
function alpha(a) {
    ctx.globalAlpha = a;
}

/**
 * Rysuje fragment obrazka na płótnie
 * @param {HTMLImageElement} img obrazek do narysowania
 * @param {number} imgX współrzędna X fragmentu obrazka
 * @param {number} imgY współrzędna Y fragmentu obrazka
 * @param {number} imgWidth szerokość fragmentu obrazka
 * @param {number} imgHeight wysokość fragmentu obrazka
 * @param {number} x współrzędna X na płótnie
 * @param {number} y współrzędna Y na płótnie
 * @param {number} width długość fragmentu obrazka na płótnie
 * @param {number} height wysokość fragmentu obrazka na płótnie
 */
function image(img, imgX, imgY, imgWidth, imgHeight, x, y, width, height) {
    img.onload = function() {
        ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight, x, y, width, height);
    };
    img.onload(null);
}

/**
 * Pobieranie i ładowanie obrazka jako Promise
 * @param url
 * @returns {Promise}
 */
function loadImage(url) {
    return new Promise((resolve, reject) => {
        let img = new Image();
        img.addEventListener('load', () => resolve(img));
        img.addEventListener('error', () => {
            reject(new Error(`Failed to load image's URL: ${url}`));
        });
        img.src = url;
    });
}

/**
 * Rysuje obramowanie prostokąta (ramkę)
 * @param x
 * @param y
 * @param width
 * @param height
 */
function rectStroke(x, y, width, height) {
    ctx.lineWidth = _stroke;
    ctx.strokeStyle = _color;
    ctx.strokeRect(x, y, width, height);
}

/**
 * Rysowanie prostokąta na płótnie
 * @param x
 * @param y
 * @param width
 * @param height
 */
function rect(x, y, width, height) {
    ctx.fillStyle = _fill;
    ctx.fillRect(x, y, width, height);
}

/**
 * Zapisuje ustawienia płótna
 */
function saveContext() {
    ctx.save();
}

/**
 * Przywraca ustawienia płótna
 */
function restoreContext() {
    ctx.restore();
}

/**
 * Czyści płótno
 */
function clear(fill = _fill) {
    ctx.fillStyle = fill;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}