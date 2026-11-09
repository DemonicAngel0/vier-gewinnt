
let gameStarted = false;
let rows = 6;
let cols = 7;
let defaultValue = 0;
let playerTurn = 0;

let player1 = "Spieler 1";
let player2 = "Spieler 2";
let player1Color = "red"
let player2Color = "yellow"

let gameWon = false;

let playField = playFieldGenerator( rows, cols, defaultValue );



function playFieldGenerator( rows, cols, defaultValue){

    let arr = [];

    // Creates all lines:
    for(let i=0; i < cols; i++){

        // Creates an empty line
        arr.push([]);

        // Adds cols to the empty line:
        arr[i].push( new Array(rows));

        for(let j=0; j < rows; j++){
            // Initializes:
            arr[i][j] = defaultValue;
        }
    }


    return arr;
}

function resetField() {

    for (let i=0; i < cols; i++){

        for (let j=0; j < rows; j++){

            playField[i][j] = defaultValue;
            document.getElementById("field-" + i + "-" + j).style.background = 'white';


        }
    }
}


// click event for start button
function start() {


    document.getElementById('start').style.display = "none";
    document.getElementById('reset').style.display = "block";
    gameStarted = true;

    player1Color = document.getElementById("p1Color").value;
    player2Color = document.getElementById("p2Color").value;

    playerTurn = Math.floor((Math.random()+0.5)*2); //random start
    changePlayerTurn()
}


function reset() {

    resetField();

    document.getElementById('start').style.display = "block";
    document.getElementById('reset').style.display = "none";

    document.getElementById("currentPlayer").textContent = "";
    player1 = "Spieler 1";
    player2 = "Spieler 2";

    gameStarted = false;
    gameWon = false;


}


function calcVertical(row, col, bottom,  cou) {

    for (let v = row; v >= bottom; v--) {

        if (playField[col][v] === playerTurn) cou[0]++
        else if (cou[0] < 4) cou[0] = 0;
    }
    return cou;
}

function calcHorizontal(row,  leftBorder, rightBorder, cou) {

    for (let h = leftBorder; h < rightBorder; h++) {

        if (playField[h][row] === playerTurn) cou[1]++
        else if (cou[1] < 4) cou[1] = 0;
    }
    return cou;
}

function calcDiagonal(row, col, rightBorder, top, cou) {

    for (let lc = 0; lc < cols; lc++) {

        if (( row + 3 - lc ) < rows && ( row + 3 - lc ) >=0 && ( col - 3 + lc ) <= rightBorder && ( col - 3 + lc ) >= 0) {

            if (playField[ col - 3 + lc ][ row + 3 - lc ] === playerTurn) cou[2]++;
            else if (cou[2] < 4) cou[2] = 0;
        }
        if (( row - 3 + lc ) <= top && ( row - 3 + lc ) >=0 && ( col - 3 + lc ) <= rightBorder && ( col - 3 + lc ) >= 0) {

            if (playField[col - 3 + lc][row - 3 + lc] === playerTurn) cou[3]++;
            else if (cou[3] < 4) cou[3] = 0;
        }
    }
    return cou;
}




function checkField(c, r) {

    let up, down, left, right;

    let counts= [0,0,0,0] // vertikal, horizontal, diagonal lo->ru , lu->ro


    if (c < 3) left = 0;
    else left = c - 3;

    if (c > 3) right = cols-1;
    else right = c + 3;

    if (r < 3) down = 0;
    else down = r - 3;

    if (r > 2) up = rows-1;
    else up = r + 3;

    counts = calcVertical( r, c, down, counts );

    counts = calcHorizontal( r, left, right+1, counts)

    counts = calcDiagonal( r, c, right, up, counts);


    for (let i = 0; i < 4; i++){

        if (counts[i] >= 4) {

            if (playerTurn === 1) document.getElementById("currentPlayer").textContent = player1 + " hat gewonnen!";
            else document.getElementById("currentPlayer").textContent = player2 + " hat gewonnen!";
            gameWon = true;
            gameStarted = false
            break;
        }
    }


    if (gameWon !== true){

        let finalRow = 0;

        for (let f = 0; f < cols; f++){

            if (playField[f][rows-1] !== 0) finalRow++;
        }

        if (finalRow === cols) {

            document.getElementById("currentPlayer").textContent = "Unentschieden!";

            gameStarted = false
        }
    }

}


function changePlayerTurn() {

   if (gameStarted) {

       if (document.getElementById("p2Input").value === document.getElementById("p1Input").value) {
           document.getElementById("p2Input").value = document.getElementById("p2Input").value + 2;
           player2 =  document.getElementById("p2Input").value;
       }
       if (playerTurn === 1) {
           playerTurn = 2;

           if (document.getElementById("p2Input").value !== "") {
               player2 = document.getElementById("p2Input").value;

           }
           document.getElementById("currentPlayer").textContent = player2 + " ist am Zug!";

       } else {
           playerTurn = 1;
           if (document.getElementById("p1Input").value !== "") {
               player1 = document.getElementById("p1Input").value;
           }
           document.getElementById("currentPlayer").textContent = player1 + " ist am Zug!";

       }

   }


}

function playerColor() {

    if (playerTurn === 1) return player1Color
    else return player2Color
}

function drop(column) {

    if (gameStarted) {

        for (let j = 0; j < rows; j++) {

            if (playField[column][j] === 0) {

                playField[column][j] = playerTurn;
                document.getElementById("field-" + column + "-" + j).style.background = playerColor();
                checkField(column, j);
                changePlayerTurn();
                break;
            }
        }


    }
}





//register click handler for start button
document.addEventListener('DOMContentLoaded', function() {

    document.getElementById("start").addEventListener("click", start, false);
    document.getElementById("reset").addEventListener("click", reset, false);

    document.querySelector("table").addEventListener("click", (event) => {
        const cell = event.target.closest("td");
        if (cell === null) return;
        drop(Number(cell.dataset.col));
    });



});