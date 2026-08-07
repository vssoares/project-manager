"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// electron/preload.ts
var preload_exports = {};
module.exports = __toCommonJS(preload_exports);
var import_electron = require("electron");
function subscribe(channel, callback) {
  const listener = (_event, payload) => callback(payload);
  import_electron.ipcRenderer.on(channel, listener);
  return () => import_electron.ipcRenderer.removeListener(channel, listener);
}
var api = {
  isElectron: true,
  loadState: () => import_electron.ipcRenderer.invoke("state:load"),
  saveState: (state) => import_electron.ipcRenderer.invoke("state:save", state),
  pickFile: () => import_electron.ipcRenderer.invoke("fs:pickFile"),
  readFile: (filePath) => import_electron.ipcRenderer.invoke("fs:readFile", filePath),
  writeFile: (filePath, content) => import_electron.ipcRenderer.invoke("fs:writeFile", filePath, content),
  showInFolder: (filePath) => import_electron.ipcRenderer.invoke("fs:showInFolder", filePath),
  runCommand: (payload) => import_electron.ipcRenderer.invoke("run-command", payload),
  openGitk: (projectPath) => import_electron.ipcRenderer.invoke("open-gitk", { projectPath }),
  selectFolder: () => import_electron.ipcRenderer.invoke("select-folder"),
  getAppVersion: () => import_electron.ipcRenderer.invoke("get-app-version"),
  onPsOut: (cb) => subscribe("ps:out", cb),
  onPsErr: (cb) => subscribe("ps:err", cb),
  onPsDone: (cb) => subscribe("ps:done", cb),
  checkForUpdate: () => import_electron.ipcRenderer.invoke("update-check"),
  downloadUpdate: () => import_electron.ipcRenderer.invoke("update-download"),
  installUpdate: () => import_electron.ipcRenderer.invoke("update-install"),
  onUpdateAvailable: (cb) => subscribe("update:available", cb),
  onUpdateProgress: (cb) => subscribe("update:progress", cb),
  onUpdateDownloaded: (cb) => subscribe("update:downloaded", cb),
  onUpdateError: (cb) => subscribe("update:error", cb)
};
import_electron.contextBridge.exposeInMainWorld("api", api);
//# sourceMappingURL=preload.cjs.map
