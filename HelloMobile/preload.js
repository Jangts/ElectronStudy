const { ipcRenderer } = require('electron')

console.log('hello')

window.test = 'test'

console.log(document, document.body)

// window.console.log = function(){
//     const args = [...arguments].
//     ipcRenderer.send('replace-console-object', JSON.stringify(args))
// }