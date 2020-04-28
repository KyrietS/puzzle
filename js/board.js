/**
 * Klasy obsługujące planszę.
 * @author Sebastian Fojcik
 */

/**
 * Kafelek reprezentujący pojedynczy puzzel na planszy.
 */
class Tile {
    /**
     * Konstruktor
     * @param {HTMLImageElement} img obrazek źródłowy
     * @param {number} imgX współrzędna na obrazku źródłowym
     * @param {number} imgY współrzędna na obrazku źródłowym
     * @param {number} imgWidth szerokość na obrazku źródłowym
     * @param {number} imgHeight wysokość na obrazku źródłowym
     * @param {number} puzzleX współrzędna na planszy
     * @param {number} puzzleY współrzędna na planszy
     * @param {number} puzzleWidth szerokość puzzla
     * @param {number} puzzleHeight wysokość puzzla
     */
    constructor(img, imgX, imgY, imgWidth, imgHeight, puzzleX, puzzleY, puzzleWidth, puzzleHeight) {
        this.img = img;
        this._imgX = imgX;
        this._imgY = imgY;
        this.width = imgWidth;
        this.height = imgHeight;
        this.puzzleX = puzzleX;
        this.puzzleY = puzzleY;
        this.puzzleWidth = puzzleWidth;
        this.puzzleHeight = puzzleHeight;
        this.x = this.puzzleX * this.puzzleWidth;
        this.y = this.puzzleY * this.puzzleHeight;
        this.empty = false;
        this.highlighted = false;
    }

    /**
     * Rysuje puzzel na płótnie
     */
    draw() {
        if(this.empty) return; // Kafelek pusty
        image(
            this.img,
            this._imgX,
            this._imgY,
            this.width,
            this.height,
            this.x,
            this.y,
            this.puzzleWidth,
            this.puzzleHeight
        );
        if(this.highlighted) {
            this._highlight()
        }
    }

    /**
     * Rysuje podświetlenie puzzla
     * @private
     */
    _highlight() {
        saveContext();
        stroke(1);
        color("black");
        rectStroke(this.x, this.y, this.puzzleWidth, this.puzzleHeight);
        alpha(0.35);
        fill("#f59e42");
        rect(this.x, this.y, this.puzzleWidth, this.puzzleHeight);
        restoreContext();
    }
}

/**
 * Klasa reprezentująca i zarządzająca planszą gry oraz kafelkami na niej.
 */
class Board {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.tiles = undefined;
        this.emptyTile = undefined;
        this.animations = [];
        this.img = new Image();
        this.onfinished = () => {};
        this.onunfinished = () => {};
    }

    /**
     * Zmiana rozmiaru planszy
     * @param rows
     * @param cols
     */
    resize(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this._addTiles();
    }

    /**
     * Miesza planszę w 'runs' liczbie przebiegów.
     * @param {number} runs liczba wykonanych losowych rotacji
     */
    mix(runs) {
        const directions = [LEFT, RIGHT, UP, DOWN];
        let counter = 0;
        let lastDir = undefined;

        function oppositeDirection(a, b) {
            return a === LEFT && b === RIGHT ||
                a === RIGHT && b === LEFT ||
                a === UP && b === DOWN ||
                a === DOWN && b === UP;
        }

        const timeout = () => {
            setTimeout( () => {
                let randDir = undefined;
                while(randDir === undefined || oppositeDirection(randDir, lastDir) ) {
                    randDir = directions[Math.floor(Math.random()*directions.length)];
                }
                if( this.move(randDir) ) {
                    lastDir = randDir;
                    counter++;
                }
                if(counter < runs)
                    timeout();
            }, 100);
        };

        timeout();
    }

    /**
     * Wczytuje obrazek z podanego URL
     * @param {string} src URL obrazka
     */
    loadImage(src) {
        this.img = new Image();
        this.img.onload = () => {
            this._addTiles();
        };
        this.img.onerror = () => {
            log("Nieprawidłowy URL obrazka");
            this.tiles = undefined;
        };
        this.img.src = src; // 'src' ustawiam na końcu (!)
        this.onunfinished();
    }

    /**
     * Wykonuje przesunięcie kafelka w wybranym kierunki
     * @param {string} direction
     */
    move(direction) {
        if(!this.emptyTile) return;
        const mX = this.emptyTile.puzzleX;              // Współrzędne 'pustego' kafelka
        const mY = this.emptyTile.puzzleY;
        let neighbour;                                  // Sąsiedni kafelek, z którym nastąpi zamiana
        switch(direction) {
            case LEFT:
                neighbour = this._getTile(mX + 1, mY);
                break;
            case RIGHT:
                neighbour = this._getTile(mX - 1, mY);
                break;
            case UP:
                neighbour = this._getTile(mX, mY + 1);
                break;
            case DOWN:
                neighbour = this._getTile(mX, mY - 1);
                break;
        }
        if(neighbour) {
            this._swapTiles(this.emptyTile, neighbour);
            return true;
        } else {
            return false
        }
    }

    /**
     * Przesuwa kafelek zawierający punkt (x,y)
     * @param {number} x
     * @param {number} y
     */
    moveTile(x, y) {
        if(this.tiles === undefined) return;
        const clickedTile = this._getTileByCanvasPos(x, y);
        const neighbours = Board._areNeighbours(this.emptyTile, clickedTile);
        if(neighbours) {
            this._swapTiles(this.emptyTile, clickedTile);
        }
    }

    /**
     * Podświetla kafelek zawierający punkt (x,y)
     * @param {number} x
     * @param {number} y
     */
    highlightTile(x, y) {
        if(this.tiles === undefined) return;
        this.tiles.forEach( tile => tile.highlighted = false );     // Resetowanie podświetlenia
        const hoveredTile = this._getTileByCanvasPos(x,y);
        const neighbours = Board._areNeighbours(this.emptyTile, hoveredTile);
        if(neighbours) {
            hoveredTile.highlighted = true;
        }
    }

    /**
     * Wykonanie wszystkich animacji dla pojedynczej klatki.
     */
    animate() {
        for(let i = 0; i < this.animations.length; i++) {
            const animation = this.animations[i];
            const finished = animation();

            // Usuń zakończoną animację
            if(finished) {
                this.animations.splice(i, 1);
                i--;
            }
        }
    }

    /**
     * Rysuje planszę
     */
    draw() {
        if(this.tiles === undefined || this.tiles.length === 0) {
            return; // Obrazek jeszcze nie został wczytany
        }
        for(const tile of this.tiles) {
            tile.draw();
        }
    }

    /**
     * Pobiera kafelek zawierający punkt (x,y)
     * @param {number} x współrzędna X na płótnie
     * @param {number} y współrzędna Y na płótnie
     * @returns {undefined|Tile}
     * @private
     */
    _getTileByCanvasPos(x, y) {
        if(this.tiles === undefined || this.tiles.size <= 0) {
            return undefined;
        }
        return this.tiles.find( tile => tile.x <= x && tile.x+tile.puzzleWidth >= x &&
                                        tile.y <= y && tile.y+tile.puzzleHeight >= y);
    }


    /**
     * Sprawdza, czy dwa kafelki są sąsiadujące
     * @returns {undefined|boolean}
     * @private
     */
    static _areNeighbours(tileA, tileB) {
        if(!tileA || !tileB) return undefined;

        const inRow = (tileA.puzzleY === tileB.puzzleY) &&
            (tileA.puzzleX+1 === tileB.puzzleX || tileA.puzzleX-1 === tileB.puzzleX);
        const inColumn = (tileA.puzzleX === tileB.puzzleX) &&
            (tileA.puzzleY+1 === tileB.puzzleY || tileA.puzzleY-1 === tileB.puzzleY);
        return inRow || inColumn;
    }

    /**
     * Zwraca kafelek z planszy o danych współrzędnych
     * @param {number} x współrzędna na planszy
     * @param {number} y współrzędna na planszy
     * @returns {undefined|Tile}
     */
    _getTile(x, y) {
        if(this.tiles === undefined || this.tiles.size <= 0) {
            return undefined;
        }
        return this.tiles.find( tile => tile.puzzleX === x && tile.puzzleY === y);
    }

    /**
     * Uruchamia animację zamiany miejscami dwóch sąsiednich kafelków
     * @param {Tile} tileA
     * @param {Tile} tileB
     * @private
     */
    _swapTiles(tileA, tileB) {
        this._animateToPos(tileA, tileB.puzzleX * this.puzzleWidth, tileB.puzzleY * this.puzzleHeight);
        this._animateToPos(tileB, tileA.puzzleX * this.puzzleWidth, tileA.puzzleY * this.puzzleHeight);

        // Zamiana współrzędnych na planszy
        [tileA.puzzleX, tileB.puzzleX] = [tileB.puzzleX, tileA.puzzleX];
        [tileA.puzzleY, tileB.puzzleY] = [tileB.puzzleY, tileA.puzzleY];

        this._sendFinishedEvent();
    }

    /**
     * Tworzenie animacji płynnej zmiany położenia
     * @param {Tile} tile animowany kafelek
     * @param {number} newX docelowa współrzędna X
     * @param {number} newY docelowa współrzędna Y
     * @private
     */
    _animateToPos(tile, newX, newY) {
        // Closure! (domknięcie)
        const _tile = tile;         // Animowany kafelek
        const _x = tile.x;          // Początkowe położenie X
        const _y = tile.y;          // Początkowe położenie Y
        const _newX = newX;         // Docelowe położenie X
        const _newY = newY;         // Docelowe położenie Y
        let progress = 0.0;         // Postęp animacji (od 0.0 do 1.0)
        this._addAnimation(function() {
            _tile.x = (_newX - _x)*progress + _x;       // Ustawienie pozycji pomiędzy '_newX' a '_x'.
            _tile.y = (_newY - _y)*progress + _y;       // Ustawienie pozycji pomiędzy '_newY' a '_y'.
            progress += 0.05;                           // Prędkość animacji (zależy od FPS)
            if(progress >= 1.0) {                       // Animacja 100%. Ustaw docelową pozycję
                _tile.x = _newX;
                _tile.y = _newY;
                return true;
            }
            return false;
        });
    }

    /**
     * Dodaje animację
     * @param fun animacja animująca kafelek. Zwraca 'true' gdy zostanie zakończona. W przeciwnym przypadku 'false'
     * @private
     */
    _addAnimation(fun) {
        this.animations.push(fun);
    }

    /**
     * Dodaje kafelki do planszy. Obrazek powinien być wcześniej wczytany. (loadImage)
     * @private
     */
    _addTiles() {
        if(!this.img.complete) return; // Obrazek nie został jeszcze załadowany

        this.tiles = [];
        this.fragmentWidth = this.img.width / this.cols;        // Szerokość wycinka w oryginalnym obrazie
        this.fragmentHeight = this.img.height / this.rows;      // Wysokość wycinka w oryginalnym obrazie
        this.puzzleWidth = canvasWidth() / this.cols;                   // Wysokość puzzla
        this.puzzleHeight = canvasHeight() / this.rows;                 // Szerokość puzzla

        for(let i = 0; i < this.rows; i++) {
            for(let j = 0; j < this.cols; j++) {
                let tile = new Tile(
                    this.img,                                   // Referencja do obrazu
                    this.fragmentWidth*j,                 // Współrzędna X na obrazie
                    this.fragmentHeight*i,                // Współrzędna Y na obrazie
                    this.fragmentWidth,                         // Szerokość wycinka w obrazie
                    this.fragmentHeight,                        // Wysokość wycinka w obrazie
                    j,                                          // Współrzędna X na planszy (kolumna)
                    i,                                          // Współrzędna Y na planszy (wiersz)
                    this.puzzleWidth,                           // Szerokość puzzla na planszy
                    this.puzzleHeight                           // Wysokość puzzla na planszy
                );
                this.tiles.push(tile);                          // Kolejność kafelków w tablicy nie ma znaczenia.
            }
        }

        this.emptyTile = this.tiles[0];                         // Początkowy pusty kafelek (dziura w planszy)
    }

    /**
     * Uruchamia listenery 'onfinished' i 'onunfinished' w zależności od ułożenia puzzli.
     * @private
     */
    _sendFinishedEvent() {
        const finished = this._isFinished();
        if(finished) this.onfinished();
        else this.onunfinished();
    }

    /**
     * Sprawdza, czy układ puzzli na planszy jest poprawny.
     * @returns {boolean}
     * @private
     */
    _isFinished() {
        for(let i = 0; i < this.rows; i++) {
            for(let j = 0; j < this.cols; j++) {
                const tile = this.tiles[this.cols*i + j];
                if(tile.puzzleX !== j || tile.puzzleY !== i) {
                    this.emptyTile.empty = true;
                    return false;
                }
            }
        }
        this.emptyTile.empty = false;
        return true;
    }
}