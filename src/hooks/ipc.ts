const electron = window.require('electron')
const { ipcRenderer } = electron

export function useIpc() {
  return {
    close: () => ipcRenderer.send('indexWindow:close'),
    hide: () => ipcRenderer.send('indexWindow:hide'),
    openMain: (id: ComicId) => ipcRenderer.send('mainWindow:open', id)
  }
}

// export function setTaskTimer (time, name) {
//   ipcRenderer.send('setTaskTimer', time, encodeURIComponent(name))
// }

// export function closeRemind () {
//   ipcRenderer.send('remindWindow:close')
// }

// export function setRemindMsg () {
//   const remindMsg = ref('')
//   ipcRenderer.on('setTask', (event, task) => {
//     remindMsg.value = decodeURIComponent(task)
//   })
//   return remindMsg
// }
