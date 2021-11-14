const path = require("path");

const { app, BrowserWindow, ipcMain } = require("electron");
const isDev = require("electron-is-dev");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const callShellWithArguments = async (args) => {
  console.log(args);
  const { stdout, stderr } = await exec("cd ~ && ls -a");
  if (stderr) {
    console.error(stderr);
    return;
  }
  console.log(stdout);
  return stdout;
};
const generate = async() => {
  const { stdout, stderr } = await exec("cd sudoku-solver && cabal run sudoku-solver.cabal");
  if (stderr) {
    console.error(stderr);
    return;
  }
  console.log(stdout);
  return stdout;
}
const initApp = async () => {
  try {
    const { stdout, stderr } = await exec("cd sudoku-solver");
    return true;
  } catch (err) {
    try {
      console.log(err);
      const { stdout, stderr } = await exec(
        "git clone https://github.com/rafaelcanoguitton/sudoku-solver"
      );
      if (stderr) {
        console.error(stderr);
        return false;
      }
      console.log(stdout);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
};
function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    },
  });

  // and load the index.html of the app.
  // win.loadFile("index.html");
  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );
  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools({ mode: "detach" });
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
ipcMain.on("ping", (e) => {
  console.log("ping received");
  e.sender.send("pong");
});
ipcMain.on("callShell", async (e) => {
  console.log("pinga");
  const result = await callShellWithArguments("sexo");
  console.log(result);
  e.reply("sexo", result);
});
initApp();
ipcMain.on("generate", async (e) => {
  const result = await generate();
  console.log(result);
  e.reply("sexo", result);
});
