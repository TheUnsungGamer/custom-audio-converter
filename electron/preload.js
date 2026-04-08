const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  pickMp4: () => ipcRenderer.invoke("pick-mp4"),
  convertMp4ToWav: (payload) => ipcRenderer.invoke("convert-mp4-to-wav", payload),
  onConvertProgress: (callback) => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on("convert-progress", listener);
    return () => ipcRenderer.removeListener("convert-progress", listener);
  },
});