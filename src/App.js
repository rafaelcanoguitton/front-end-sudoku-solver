import logo from "./logo.svg";
import "./App.css";
import { useState } from "react";
import Swal from "sweetalert2";
import { useEffect } from "react/cjs/react.development";
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
    let sudokuString = "";
    for (let i = 0; i < sudoku.length; i++) {
      if (sudoku[i] === "0") {
        sudokuString += ".";
      } else {
        sudokuString += sudoku[i];
      }
    }
    ipcRenderer.send("solve", sudokuString);
  };
  const hint = () => {
    let sudokuString = "";
    for (let i = 0; i < sudoku.length; i++) {
      if (sudoku[i] === "0") {
        sudokuString += ".";
      } else {
        sudokuString += sudoku[i];
      }
    }
    ipcRenderer.send("hint", sudokuString);
  };
  useEffect(() => {
    ipcRenderer.on("return-generate", (event, arg) => {
      console.log(arg);
      let generatedSudoku = [];
      for (let i = 0; i < 81; i++) {
        if (arg[i] === ".") {
          generatedSudoku.push("0");
        } else {
          generatedSudoku.push(arg[i]);
        }
      }
      console.log(generatedSudoku);
      setSudoku(generatedSudoku);
    });
    ipcRenderer.on("return-solve", (event, arg) => {
      let solvedSudoku = [];
      for (let i = 0; i < 81; i++) {
        if (arg[i] === ".") {
          solvedSudoku.push("0");
        } else {
          solvedSudoku.push(arg[i]);
        }
      }
      setSudoku(solvedSudoku);
    });
    ipcRenderer.on("return-hint", (event, arg) => {
      let solvedSudoku = [];
      for (let i = 0; i < 81; i++) {
        if (arg.solvedSudoku[i] === ".") {
          solvedSudoku.push("0");
        } else {
          solvedSudoku.push(arg.solvedSudoku[i]);
        }
      }
      let newSudoku = [];
      for (let i = 0; i < 81; i++) {
        if (arg.sudoku[i] === ".") {
          newSudoku.push("0");
        } else {
          newSudoku.push(arg.sudoku[i]);
        }
      }
      let indexesWith0 = [];
      for (let i = 0; i < 81; i++) {
        if (sudoku[i] === "0") {
          indexesWith0.push(i);
        }
      }
      let randomIndex = Math.floor(Math.random() * indexesWith0.length);
      newSudoku[indexesWith0[randomIndex]] =
        solvedSudoku[indexesWith0[randomIndex]];
      setSudoku(newSudoku);
    });
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        <div className="App-body">
          <h1>Sudoku App</h1>
          <div className="grid">
            {sudoku.map((value, index) => {
              let classname = "grid-item";
              if((index+1>18 && index+1<28)||(index+1>45 && index+1<55)){
                classname += " lower-border";
              }
              const rightBorders=[3,6,12,15,21,24,30,33,39,42,48,51,57,60,66,69,75,78];
              if(rightBorders.includes(index+1)){
                classname += " right-border";
              }
              return (
                <div className={classname} id={index}>
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
                generate();
              }}
            >
              Generate
            </button>
            <button
              className="sudoku-button"
              onClick={() => {
                solve();
              }}
            >
              Solve
            </button>
            <button className="sudoku-button" onClick={clear}>
              Clear
            </button>
            <button className="sudoku-button" onClick={hint}>
              Hint
            </button>
          </div>
        </div>
      </header>
    </div>
  );
};

export default App;
