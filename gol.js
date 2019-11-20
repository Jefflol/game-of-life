const canvas = document.getElementById('gol');
const ctx = canvas.getContext('2d');
canvas.width = canvas.height = 500;

const SQ = SQUARESIZE = 20;
const GRID_SIZE_X = canvas.width / SQ;
const GRID_SIZE_Y = canvas.height / SQ;

const DEAD_VALUE = 0;
const BLUE_VALUE = 1;
const RED_VALUE = 2;

// const CELL_BLUE_COLOUR = '#3F7CAC';
// const CELL_RED_COLOUR = '#F03A47';
const CELL_BLUE_COLOUR = '#00ADB5';
const CELL_RED_COLOUR = '#D62246';
const CELL_BLACK_COLOUR = '#393E46'

var gameBoard = Array.from(Array(GRID_SIZE_X), _ => Array(GRID_SIZE_Y).fill(0));
var changes = [];

var curr_cell = {
  X: 0,
  Y: 0,
  color: CELL_BLUE_COLOUR,
  value: BLUE_VALUE
};

const selectionDisplay = document.getElementById('selectionDisplay');
selectionDisplay.style.backgroundColor = curr_cell.color;

const run10btn = document.getElementById('run-10');
const run25btn = document.getElementById('run-25');
const run50btn = document.getElementById('run-50');
run10btn.cycleNum = 10, run10btn.cycleSpeed = 50;
run25btn.cycleNum = 25, run25btn.cycleSpeed = 20;
run50btn.cycleNum = 50, run50btn.cycleSpeed = 10;
run10btn.addEventListener("click", runTicks, false);
run25btn.addEventListener("click", runTicks, false);
run50btn.addEventListener("click", runTicks, false);

document.addEventListener("click", getCellPosition);
document.addEventListener('keydown', keyPressed);

function runTicks(e) {
  let i = 0;
  (function theLoop (i) {
    setTimeout(function () {
      runTick();
      if (--i) {
        theLoop(i);
      }
    }, e.target.cycleSpeed);
  })(e.target.cycleNum);
}

function runTick() {
  for(let row = 0; row < GRID_SIZE_Y; row++) {
    for(let col = 0; col < GRID_SIZE_X; col++) {
      let counts = returnNeighbourCount(col, row);
      let value = returnCellValue(counts);
      let color = returnCellColor(counts);

      /* Lives cells with less than 2 neighbours dies due to underpopulation.
         Lives cells with more than 3 neighbours dies due to overpopulation. */
      if((gameBoard[row][col] == BLUE_VALUE || gameBoard[row][col] == RED_VALUE) && (counts.total < 2 || counts.total > 3)) {
        changes.push({
          X: col,
          Y: row,
          value: DEAD_VALUE,
          color: CELL_BLACK_COLOUR
        });
      }

      /* Dead cells reproduce if it has exactly 3 neighbours */
      if(gameBoard[row][col] == DEAD_VALUE && counts.total == 3) {
        changes.push({
          X: col,
          Y: row,
          value: value,
          color: color
        });
      }

      /* Live cells with 2 or 3 neighbours lives on to the next generation */
    }
  }
  updateBoard();
}


function updateBoard() {
  for(let i = 0; i < changes.length; i++) {
    selectCell(changes[i]);
    gameBoard[changes[i].Y][changes[i].X] = changes[i].value;
  }
  changes = [];
}

function returnCellColor(count) {
  return count.blueCount > count.redCount ? CELL_BLUE_COLOUR : CELL_RED_COLOUR;
}

function returnCellValue(count) {
  return count.blueCount > count.redCount ? BLUE_VALUE : RED_VALUE;
}

function returnNeighbourCount(cellX, cellY) {
  let blueCount = 0;
  let redCount = 0;

  for(let j = -1; j < 2; j++) {
    for(let i = -1; i < 2; i++) {
      if((i != 0 || j != 0) &&
         (cellY + j < GRID_SIZE_Y && cellY + j >= 0) &&
         (cellX + i < GRID_SIZE_X && cellX + i >= 0)) {
        if(gameBoard[cellY + j][cellX + i] == BLUE_VALUE)
          blueCount++;
        if(gameBoard[cellY + j][cellX + i] == RED_VALUE)
          redCount++;
      }
    }
  }

  return {
    blueCount: blueCount,
    redCount: redCount,
    total: blueCount + redCount
  };
}

function selectCell(cell = curr_cell) {
  if((cell.X < GRID_SIZE_X && cell.X >= 0) && (cell.Y <= GRID_SIZE_Y && cell.Y >= 0)) {
    if(gameBoard[cell.Y][cell.X] == DEAD_VALUE) {
      drawSquare(cell.X, cell.Y, cell.color, cell.color);
      gameBoard[cell.Y][cell.X] = cell.value;
    } else {  // clear cell
      drawSquare(cell.X, cell.Y, CELL_BLACK_COLOUR, CELL_BLACK_COLOUR);
      gameBoard[cell.Y][cell.X] = DEAD_VALUE;
    }
  }
}

function getCellPosition(event) {
  let pos = getMousePosition(event);

  curr_cell.X = Math.trunc(pos.X/SQ);
  curr_cell.Y = Math.trunc(pos.Y/SQ);

  selectCell();
}

function getMousePosition(event) {
  let rect = canvas.getBoundingClientRect();

  return {
    X: event.clientX - rect.left,
    Y: event.clientY - rect.top
  };
}

(function drawCanvas() {
  ctx.beginPath();
  ctx.fillStyle = CELL_BLACK_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.closePath();
}());

function drawSquare(x, y, color, borderColor) {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.fillRect(x*SQ, y*SQ, SQ, SQ);
  ctx.strokeStyle = borderColor;
  ctx.closePath();
}

function keyPressed(event) {
  /* [spacebar] */
  if(event.keyCode == 32) {
    runTick();
  }
  /* [1] */
  if(event.keyCode == 49) {
    curr_cell.color = CELL_BLUE_COLOUR;
    curr_cell.value = BLUE_VALUE;
    selectionDisplay.style.backgroundColor = CELL_BLUE_COLOUR;
  }
  /* [2] */
  if(event.keyCode == 50) {
    curr_cell.color = CELL_RED_COLOUR;
    curr_cell.value = RED_VALUE;
    selectionDisplay.style.backgroundColor = CELL_RED_COLOUR;
  }
}

(function demoSetup() {
  changes.push({X: 5, Y: 5, color: CELL_BLUE_COLOUR, value: BLUE_VALUE});
  changes.push({X: 6, Y: 5, color: CELL_BLUE_COLOUR, value: BLUE_VALUE});
  changes.push({X: 7, Y: 5, color: CELL_BLUE_COLOUR, value: BLUE_VALUE});
  changes.push({X: 6, Y: 6, color: CELL_BLUE_COLOUR, value: BLUE_VALUE});
  changes.push({X: 7, Y: 4, color: CELL_BLUE_COLOUR, value: BLUE_VALUE});

  updateBoard();
}());