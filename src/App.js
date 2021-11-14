import logo from "./logo.svg";
import "./App.css";
import { useState } from "react";
import ReactDOM from "react-dom";
import Swal from "sweetalert2";
const ipcRenderer = window.require("electron").ipcRenderer;
const App = () => {
  ipcRenderer.send("initApp");

  const [sudoku, setSudoku] = useState(Array(81).fill("0"));
  const handleChange = (e) => {
    if (isNaN(e.target.value) || e.target.value.length > 1) {
      return;
    }
    if (RowColValidator(e.target.id, e.target.value)) {
      console.log(e.target.id);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "¡Esa jugada es ilegal!",
        background: "#282c34",
      });
      return;
    }
    const { value, id } = e.target;
    const newSudoku = [...sudoku];
    newSudoku[id] = value;
    setSudoku(newSudoku);
  };
  const RowColValidator = (idx, value) => {
    const TrueIdx = parseInt(idx) + 1;
    let row = TrueIdx % 9;
    let col;
    if (row === 0) {
      row = 9;
      col = Math.floor(TrueIdx / 9);
    } else {
      col = Math.floor(TrueIdx / 9 + 1);
    }
    let cuadrant;
    if (row <= 3) {
      if (col <= 3) {
        cuadrant = 1;
      } else if (col <= 6) {
        cuadrant = 4;
      } else {
        cuadrant = 7;
      }
    } else if (row <= 6) {
      if (col <= 3) {
        cuadrant = 2;
      } else if (col <= 6) {
        cuadrant = 5;
      } else {
        cuadrant = 8;
      }
    } else {
      if (col <= 3) {
        cuadrant = 3;
      } else if (col <= 6) {
        cuadrant = 6;
      } else {
        cuadrant = 9;
      }
    }
    var cuadrantIndexes;
    switch (cuadrant) {
      case 1:
        cuadrantIndexes = [1, 2, 3, 10, 11, 12, 19, 20, 21];
        break;
      case 2:
        cuadrantIndexes = [4, 5, 6, 13, 14, 15, 22, 23, 24];
        break;
      case 3:
        cuadrantIndexes = [7, 8, 9, 16, 17, 18, 25, 26, 27];
        break;
      case 4:
        cuadrantIndexes = [28, 29, 30, 37, 38, 39, 46, 47, 48];
        break;
      case 5:
        cuadrantIndexes = [31, 32, 33, 40, 41, 42, 49, 50, 51];
        break;
      case 6:
        cuadrantIndexes = [34, 35, 36, 43, 44, 45, 52, 53, 54];
        break;
      case 7:
        cuadrantIndexes = [55, 56, 57, 64, 65, 66, 73, 74, 75];
        break;
      case 8:
        cuadrantIndexes = [58, 59, 60, 67, 68, 69, 76, 77, 78];
        break;
      case 9:
        cuadrantIndexes = [61, 62, 63, 70, 71, 72, 79, 80, 81];
        break;
    }
    //check per row
    let rowIndexes = [];
    for (let i = 0; i < 9; i++) {
      rowIndexes.push(row + i * 9);
    }
    //check per col
    let colIndexes = [];
    for (let i = 0; i < 9; i++) {
      colIndexes.push(col * 9 - i);
    }
    //actual checking
    let firstCheck = cuadrantIndexes.filter((idx) => {
      let actualIdx = idx - 1;
      if (idx != TrueIdx) {
        if (sudoku[actualIdx] === value) {
          return true;
        }
      }
    });
    let secondCheck = rowIndexes.filter((idx) => {
      let actualIdx = idx - 1;
      if (idx != TrueIdx) {
        if (sudoku[actualIdx] === value) {
          return true;
        }
      }
    });
    let thirdCheck = colIndexes.filter((idx) => {
      let actualIdx = idx - 1;
      if (idx != TrueIdx) {
        if (sudoku[actualIdx] === value) {
          return true;
        }
      }
    });
    if (
      firstCheck.length > 0 ||
      secondCheck.length > 0 ||
      thirdCheck.length > 0
    ) {
      return true;
    }
    return false;
  };
  const clear = () => {
    setSudoku(Array(81).fill("0"));
  };
  const generate = () => {
    ipcRenderer.send("generate");
  };
  const solve = () => {
    ipcRenderer.send("solve");
  };

  const hint = () => {
    ipcRenderer.send("hint");
  };
  ipcRenderer.on("return-generate", (event, arg) => {
    setSudoku(arg);
  });
  ipcRenderer.on("return-solve", (event, arg) => {
    setSudoku(arg);
  });
  ipcRenderer.on("return-hint", (event, arg) => {
    setSudoku(arg);
  });
  return (
    <div className="App">
      <header className="App-header">
        <div className="App-body">
          <h1>Sudoku App</h1>
          <div className="grid">
            {sudoku.map((value, index) => {
              return (
                <div className="grid-item" id={index}>
                  <input
                    id={index}
                    value={value == "0" ? "" : value}
                    onChange={handleChange}
                  />
                </div>
              );
            })}
          </div>
          <div className="Button-grid">
            <button
              className="sudoku-button"
              onClick={() => {
                console.log("xd");
                ipcRenderer.send("generate");
              }}
            >
              Generate
            </button>
            <button className="sudoku-button">Solve</button>
            <button className="sudoku-button" onClick={clear}>
              Clear
            </button>
            <button className="sudoku-button">Hint</button>
          </div>
        </div>
      </header>
    </div>
  );
};

export default App;
