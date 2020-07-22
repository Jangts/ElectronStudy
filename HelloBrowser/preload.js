// const { remote } = require('electron')
// const { ipcRenderer } = require('electron')

// const share = remote.getGlobal('share')

console.log('preload')
// console.log('remote', remote)
// console.log('remote', share)
// console.log('remote', share.console)

// console = window.console = share.console
// window.OBJ = share.OBJ

// const viewConsole = ipcRenderer.sendSync('get-view-console', 'reload')
// if(viewConsole) {
//     console = window.console = viewConsole
// } else {
    // ipcRenderer.on('set-view-console', (event, arg) => {
    //     console = window.console = arg
    // })
// }