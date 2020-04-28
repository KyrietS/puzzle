/**
 * Obsługa menu gry
 * @author Sebastian Fojcik
 */

/**
 * Klasa reprezentująca menu zarządzające planszą
 */
class Menu {
    constructor(board, images) {
        this.board = board;                                                 // instancja planszy
        this.imagePrefix = "img/";                                          // ścieżka do zdjęć pełnowymiarowych
        this.imageMinPrefix = "img-min/";                                   // ścieżka do zdjęć zminifikowanych
        this.images = images;                                               // tablica z nazwami zdjęć

        this.menuTitle = document.getElementById("menuTitle");              // referencja do tytułu głównego menu
        this.sizeChooserSize = 8;                                           // rozmiar wybierałki rozmiaru (8x8)
        if(clientWidth < 710)                                               // szerokość wybierałki rozmiaru (w px)
            this.sizeChooserWidth = bodyWidth-10;
        else
            this.sizeChooserWidth = 400;
        this.sizeChooser = document.getElementById("sizeChooser");          // referencja do wybierałki rozmiaru
        this.sizeItems = [];                                                // kafelki reprezentujące rozmiar w wybierałce
        this.chosenX = 3;                                                   // wybrany rozmiar X (liczone od 0)
        this.chosenY = 3;                                                   // wybrany rozmiar Y (liczone od 0)

        this.imageChooserSize = 4;                                          // rozmiar wybierałki obrazka
        if(clientWidth < 710)                                               // szerokość wybierałki obrazka (w px)
            this.imageChooserWidth = bodyWidth-10;
        else
            this.imageChooserWidth = 400;
        this.imageChooser = document.getElementById("imageChooser");        // referencja do wybierałki obrazka
        this.imageItems = [];                                               // kafelki z mini-obrazkami
        this.chosenImage = this.imagePrefix + images[0];                    // ścieżka do pełnego, wybranego obrazka

        this.menuButton = document.getElementById("menuButton");            // referencja do przycisku na dole menu
    }

    /**
     * Wyświetla wybierałkę rozmiaru z przejściem do wybierałki obrazka.
     */
    showSizeChooser() {
        this.menuTitle.innerText = "Wybierz rozmiar układanki";
        this.menuButton.innerText = "Dalej";
        this._addSizeChooser();
        this.menuButton.onclick = () => {
            this.board.resize(this.chosenY+1, this.chosenX+1);
            this.showImageChooser();
        };
        document.getElementById("imageChooser").style.display = "none";
        document.getElementById("menu").style.display = "inherit";
    }

    /**
     * Wyświetla wybierałkę obrazka.
     */
    showImageChooser() {
        this.menuTitle.innerText = "Wybierz obrazek";
        this.menuButton.innerText = "Zatwierdź";
        this.sizeChooser.style.display = "none";

        this._addImageChooser();

        this.menuButton.onclick = () => {
            document.getElementById("menu").style.display = "none";
            this.board.loadImage(this.chosenImage);
        }
    }

    /**
     * Dodaje do widoku HTML wybierałkę rozmiaru (dynamicznie tworzona)
     * @private
     */
    _addSizeChooser() {
        const width = this.sizeChooserWidth;  // rozmiar wybierałki rozmiaru
        this.sizeChooser.innerHTML = "";
        this.sizeItems = [];
        this.sizeChooser.style.width = `${width}px`;
        for(let i = 0; i < this.sizeChooserSize; i++) {
            const row = document.createElement("div");
            row.className = "sizeRow";
            for(let j = 0; j < this.sizeChooserSize; j++) {
                const item = document.createElement("div");
                item.className = "sizeItem";
                item.style.width = `${width/this.sizeChooserSize}px`;
                item.style.height = `${width/this.sizeChooserSize}px`;
                this.sizeItems.push(item);
                item.onmouseover = () => this._hoverSizeChooserItem(j, i);
                item.onclick = () => this._chooseItem(j, i);
                row.appendChild(item);
            }
            this.sizeChooser.appendChild(row);
        }
        this.sizeChooser.style.display = "table";
        this.sizeChooser.onmouseleave = () => this._hoverSizeChooserItem(-1, -1);
        this._markChosenItems();
    }

    /**
     * Rejestruje zdarzenie najechania myszą na kafelek reprezentujący rozmiar w wybierałce rozmiaru.
     * @param x współrzędna X kafelka
     * @param y współrzędna Y kafelka
     * @private
     */
    _hoverSizeChooserItem(x, y) {
        this._clearSizeChooser();
        this._markHoveredItems(x, y);
        this._markChosenItems();
    }

    /**
     * Resetuje wygląd kafelków reprezentujących rozmiar.
     * @private
     */
    _clearSizeChooser() {
        this.sizeItems.forEach( item => item.style.border = "1px solid white");
        this.sizeItems.forEach( item => item.style.background = "none");
    }

    /**
     * Ustawia wygląd kafelków reprezentujących wybrany rozmiar.
     * @private
     */
    _markChosenItems() {
        const chosen = this._getChosenItems(this.chosenX, this.chosenY);
        chosen.forEach(item => item.style.backgroundColor = "rgba(235, 64, 52, 0.6)");
    }

    /**
     * Ustawia wygląd kafelków reprezentujących możliwy wygląd (jeszcze nie kliknięto myszą)
     * @private
     */
    _markHoveredItems(x, y) {
        const hovered= this._getChosenItems(x, y);
        hovered.forEach(item => item.style.borderColor = "orange");
        hovered.forEach(item => item.style.backgroundColor = "rgba(255, 160, 43, 0.6)");
    }

    /**
     * Zwraca kafelki, które powinny być zakolorowane. (x,y) to dolny prawy róg wybranego prostokąta.
     * @returns {HTMLImageElement[]}
     * @private
     */
    _getChosenItems(x, y) {
        const s = this.sizeChooserSize;
        return this.sizeItems.filter( (v, i) => i%s <= x && (i - (i%s)) / s <= y );
    }

    /**
     * Ustawia kafelki reprezentujące rozmiar na "wybrane"
     * @private
     */
    _chooseItem(x, y) {
        if(x === 0 || y === 0) return;
        if(x === 1 && y === 1) return;
        this.chosenX = x;
        this.chosenY = y;
        this._hoverSizeChooserItem(x,y);
    }

    /**
     * Dodaje do widoku HTML wybierałkę obrazu (dynamicznie generowana)
     * @private
     */
    _addImageChooser() {
        const width = this.imageChooserWidth;  // rozmiar wybierałki rozmiaru
        this.imageChooser.innerHTML = "";
        this.imageChooser.style.width = `${width}px`;
        this.imageItems = [];
        const numOfRows = Math.ceil(this.images.length / this.imageChooserSize);
        for(let i = 0; i < numOfRows; i++) {
            const row = document.createElement("div");
            row.className = "imageRow";
            for(let j = 0; j < this.imageChooserSize; j++) {

                if(i*this.imageChooserSize + j >= this.images.length)
                    break;

                const item = document.createElement("img");
                item.className = "imageItem";
                item.style.width = `${width/this.imageChooserSize}px`;
                item.style.height = `${width/this.imageChooserSize}px`;
                const imageName = this.images[i*this.imageChooserSize + j];
                item.src = this.imageMinPrefix + imageName;
                this.imageItems.push(item);
                item.onclick = () => this._showPreview(item, imageName);


                row.appendChild(item);
            }
            this.imageChooser.appendChild(row);
        }
        this.imageChooser.style.display = "inherit";
    }

    /**
     * Tworzy podgląd obrazka i dodaje go do HTML dynamicznie.
     * @param {HTMLElement} image miniatura obrazka do pokazania w podglądzie
     * @param {string} imageName ścieżka do obrazka pełnowymiarowego do wyświetlenia w podglądzie
     * @private
     */
    _showPreview(image, imageName) {
        const imagePreviewCloseBtn = document.createElement("button");
        imagePreviewCloseBtn.id = "imagePreviewCloseBtn";
        imagePreviewCloseBtn.innerHTML = "&times;";
        imagePreviewCloseBtn.onclick = () => Menu._closePreview();

        const imagePreviewChooseBtn = document.createElement("button");
        imagePreviewChooseBtn.id = "imagePreviewChooseBtn";
        imagePreviewChooseBtn.innerHTML = "&#10003;";

        loadImage(this.imagePrefix + imageName)
            .then(img => {
                const imagePreview = document.getElementById("imagePreview");
                imagePreview.innerHTML = "";

                img.id = "imagePreviewItem";
                imagePreview.appendChild(img);
                imagePreview.appendChild(imagePreviewCloseBtn);
                imagePreview.appendChild(imagePreviewChooseBtn);
                imagePreview.style.display = "inherit";
                imagePreviewChooseBtn.onclick = () => {
                    this._chooseImage(image, imageName);
                    Menu._closePreview();
                };
            })
            .catch(error => {
                console.error(error);
                Menu._closePreview();
            });
    }

    /**
     * Ustawia obrazek 'image' jako 'wybrany' i zapisuje ścieżkę do jego pełnej wersji.
     * @param {HTMLElement} image miniaturka obrazka do oznaczenia jako wybrana
     * @param {string} imageName ścieżka do pełnowymiarowego obrazka
     * @private
     */
    _chooseImage(image, imageName) {
        this.imageItems.forEach(img => img.style.border = "1px solid white");
        image.style.border = "3px solid red";
        this.chosenImage = this.imagePrefix + imageName;
    }

    /**
     * Zamyka podgląd
     * @private
     */
    static _closePreview() {
        const imagePreview = document.getElementById("imagePreview");
        imagePreview.innerHTML = "";
        imagePreview.style.display = "none";
    }
}