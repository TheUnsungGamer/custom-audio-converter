const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: "#000000",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

function sendProgress(win, payload) {
  if (win && !win.isDestroyed()) {
    win.webContents.send("convert-progress", payload);
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("pick-mp4", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "MP4 Video", extensions: ["mp4"] }],
  });

  if (result.canceled || !result.filePaths.length) {
    return null;
  }

  return result.filePaths[0];
});

ipcMain.handle("convert-mp4-to-wav", async (_event, payload) => {
  const { inputPath, outputPath } = payload;
  const win = BrowserWindow.getAllWindows()[0];

  return new Promise((resolve) => {
    const ffmpegArgs = [
      "-y",
      "-i",
      inputPath,
      "-vn",
      "-acodec",
      "pcm_s16le",
      "-ar",
      "44100",
      "-ac",
      "2",
      "-progress",
      "pipe:1",
      "-nostats",
      outputPath,
    ];

    sendProgress(win, { stage: "starting", line: "OPENING CONTAINER", percent: 2 });

    const ffmpeg = spawn("ffmpeg", ffmpegArgs);

    let stderr = "";
    let durationSeconds = null;
    let lastPercent = -1;

    ffmpeg.stderr.on("data", (data) => {
      const text = data.toString();
      stderr += text;

      const durationMatch = text.match(/Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/);
      if (durationMatch) {
        const hours = Number(durationMatch[1]);
        const minutes = Number(durationMatch[2]);
        const seconds = Number(durationMatch[3]);
        durationSeconds = hours * 3600 + minutes * 60 + seconds;
      }
    });

    ffmpeg.stdout.on("data", (data) => {
      const lines = data.toString().split(/\r?\n/).filter(Boolean);

      for (const line of lines) {
        const [rawKey, rawValue] = line.split("=");
        const key = rawKey?.trim();
        const value = rawValue?.trim();

        if (!key) continue;

        if (key === "out_time_ms" && durationSeconds) {
          const outTimeMs = Number(value);
          const currentSeconds = outTimeMs / 1_000_000;
          const percent = Math.max(
            0,
            Math.min(99, Math.floor((currentSeconds / durationSeconds) * 100))
          );

          if (percent !== lastPercent) {
            lastPercent = percent;
            sendProgress(win, {
              stage: "converting",
              line: `TRANSMUTING AUDIO ${percent}%`,
              percent,
            });
          }
        }

        if (key === "progress" && value === "end") {
          sendProgress(win, {
            stage: "finalizing",
            line: "SEALING ARCHIVE",
            percent: 100,
          });
        }
      }
    });

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        resolve({ ok: true });
      } else {
        resolve({
          ok: false,
          stderr: stderr || `ffmpeg exited with code ${code}`,
        });
      }
    });

    ffmpeg.on("error", (error) => {
      resolve({
        ok: false,
        stderr: error.message,
      });
    });
  });
});