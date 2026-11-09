
let gameStarted = false;
let locked = false;
let rows = 6;
let cols = 7;
let defaultValue = 0;
let playerTurn = 0;

let player1 = "Spieler 1";
let player2 = "Spieler 2";

const LOCK_MS = 300;
const HINT = "Namen eingeben und „Start“ drücken.";
const directions = [[1, 0], [0, 1], [1, 1], [1, -1]]; // richtungen fuer Gewinnbestimmung

let playField = playFieldGenerator(rows, cols, defaultValue);




// generieren des Spielfelds
function playFieldGenerator(rows, cols, defaultValue) {

    const arr = [];

    for (let i = 0; i < cols; i++) {

        arr.push(new Array(rows).fill(defaultValue)); // erstellen des Spielfeld-Arrays, mit 0 füllen
    }
    return arr;
}

// zuruecksetzen des Spielfelds
function resetField() {

    for (let i = 0; i < cols; i++) {

        for (let j = 0; j < rows; j++) {

            playField[i][j] = defaultValue; // Spielfeld-Array mit 0 auffüllen

            document.getElementById("field-" + i + "-" + j)
                .classList.remove("player1", "player2", "winner"); // DOM-Tokens entfernen bei jedem zurücksetzen
        }
    }
}




// status-Label setzen
function setStatus(text, turn) {

    const status = document.getElementById("currentPlayer");
    status.textContent = text;
    status.className = turn ? "turn" + turn : "";
}

// aktuellen Zug anzeigen
function showTurn() {

    const name = (playerTurn === 1) ? player1 : player2;
    setStatus(name + " ist am Zug!", playerTurn);
}

// Eingaben an-/ausschalten
function setInputsDisabled(disabled) {

    for (const id of ["p1Input", "p2Input", "p1Color", "p2Color"]) {

        document.getElementById(id).disabled = disabled;
    }
}

// Spielfeld (de-)aktivieren
function setBoardActive(active) {

    document.querySelector("table").classList.toggle("inactive", !active);
}

// Spielende
function endGame() {

    gameStarted = false;
    setBoardActive(false);
}




// Spielstart
function start() {

    // Spielernamen einlesen
    const name1 = document.getElementById("p1Input").value.trim();
    const name2 = document.getElementById("p2Input").value.trim();

    // Spielerfarben einlesen
    const color1 = document.getElementById("p1Color").value;
    const color2 = document.getElementById("p2Color").value;


    // Namens- und Farbvalidierung
    if (name1 === "" || name2 === "") {

        setStatus("Bitte beide Spielernamen eingeben.");
        return;
    }
    if (name1.toLowerCase() === name2.toLowerCase()) {

        setStatus("Die Spielernamen müssen sich unterscheiden.");
        return;
    }
    if (color1 === color2) {
        setStatus("Bitte zwei verschiedene Farben wählen.");
        return;
    }

    // Spielernamen setzen
    player1 = name1;
    player2 = name2;

    // Spielerfarben setzen
    document.documentElement.style.setProperty("--p1-color", color1);
    document.documentElement.style.setProperty("--p2-color", color2);


    // Startknopf verstecken, Resetknopf zeigen
    document.getElementById("start").hidden = true;
    document.getElementById("reset").hidden = false;


    setInputsDisabled(true);
    setBoardActive(true);
    gameStarted = true; // Spiel starten

    playerTurn = Math.random() < 0.5 ? 1 : 2; // zufaelliger Spieler beginnt
    showTurn();
}

// Zuruecksetzen
function reset() {

    resetField();

    // Startknopf zeigen, Resetknopf verstecken
    document.getElementById("start").hidden = false;
    document.getElementById("reset").hidden = true;


    setInputsDisabled(false);
    setBoardActive(false);
    setStatus(HINT); // Hinweis anzeigen

    gameStarted = false;
}





function collectLine(c, r, dc, dr, player) {
    // c: columns, r: rows, dc: Spaltenzaelrichtung, dr: Zeilenzaelrichtung, player: Spieler

    const cells = []; // Koordinatenarray fuer Gewinnpruefung

    let cc = c + dc;
    let rr = r + dr;

    while (cc >= 0 && cc < cols && rr >= 0 && rr < rows && playField[cc][rr] === player) {

        cells.push([cc, rr]);
        cc += dc;
        rr += dr;
    }
    return cells;
}

// Gewinnpruefung
function checkWin(c, r, player) {

    let won = false;

    for (const [dc, dr] of directions) {
        // Richtungen durchgehen

        const line = [[c, r],
            ...collectLine(c, r, dc, dr, player),
            ...collectLine(c, r, -dc, -dr, player)]; // mit "-" um auch Gegenrichtung zu pruefen

        if (line.length >= 4) {

            won = true;
            for (const [lc, lr] of line) {
                // Gewinnsteine markieren
                document.getElementById("field-" + lc + "-" + lr).classList.add("winner");
            }
        }
    }
    return won;
}

// Spielfeld ueberpruefen
function checkField(c, r) {

    if (checkWin(c, r, playerTurn)) {

        const winner = (playerTurn === 1) ? player1 : player2;
        setStatus(winner + " hat gewonnen!", playerTurn);
        endGame();

    } else if (playField.every(column => column[rows - 1] !== 0)) {

        setStatus("Unentschieden!");
        endGame();
    }
}




// Spielerwechsel
function changePlayerTurn() {

    if (!gameStarted) return;

    playerTurn = (playerTurn === 1) ? 2 : 1;
    showTurn();
}

// Spielstein "einwerfen" bzw. fallen lassen
function drop(column) {

    if (!gameStarted || locked) return; // verlaesst, wenn Spiel nicht gestartet oder Stein setzen blockiert ist

    for (let j = 0; j < rows; j++) {

        if (playField[column][j] === 0) {

            locked = true;
            setTimeout(() => { locked = false; }, LOCK_MS);
            // klicktimeout zur Vermeidung von 2 gesetzten Steinen bei Doppelklicks

            playField[column][j] = playerTurn; // Spieler-Nummer in Spielfeld-Array eintragen
            document.getElementById("field-" + column + "-" + j)
                .classList.add("player" + playerTurn); // farbig markieren

            checkField(column, j);
            changePlayerTurn();
            return;
        }
    }
}



// Eventlistener
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("start").addEventListener("click", start);
    document.getElementById("reset").addEventListener("click", reset);

    // in jede Spalte klickbar
    document.querySelector("table").addEventListener("click", (event) => {
        const cell = event.target.closest("td, th");
        if (cell === null) return;
        drop(Number(cell.dataset.col));
    });

    setStatus(HINT);
});