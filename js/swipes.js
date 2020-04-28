/**
 * Obsługa przesunięć palcem po płótnie (symulacja strzałek).
 * @author Sebastian Fojcik
 */


canvas.addEventListener('touchstart', handleTouchStart, false);
canvas.addEventListener('touchmove', handleTouchMove, false);

let xDown = null;
let yDown = null;

function getTouches(evt) {
    return evt.touches             // browser API
}

function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
}

function handleTouchMove(evt) {
    if ( ! xDown || ! yDown ) {
        return;
    }

    const xUp = evt.touches[0].clientX;
    const yUp = evt.touches[0].clientY;

    const xDiff = xDown - xUp;
    const yDiff = yDown - yUp;

    // noinspection JSSuspiciousNameCombination
    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {
        if ( xDiff > 0 ) {
            sendKeyEvent(LEFT);
        } else {
            sendKeyEvent(RIGHT);
        }
    } else {
        if ( yDiff > 0 ) {
            sendKeyEvent(UP);
        } else {
            sendKeyEvent(DOWN);
        }
    }

    /* reset values */
    xDown = null;
    yDown = null;
}

function sendKeyEvent(keyCode) {
    const keyboardEvent = {code: keyCode};
    // noinspection JSCheckFunctionSignatures
    document.onkeydown(keyboardEvent);
}