const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  pickMp4: () => ipcRenderer.invoke("pick-mp4"),
  convertMp4ToWav: (payload) => ipcRenderer.invoke("convert-mp4-to-wav", payload),
});