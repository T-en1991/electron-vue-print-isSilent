const { ipcRenderer } = require('electron');
ipcRenderer.on('print-edit', (event, obj) => {
  console.log('edit')
  let html = '';
  html+=`<div>${obj.html}</div>`
  document.body.innerHTML = html;
  ipcRenderer.send('do', obj.deviceName);
})

function tt(){
  alert(ipcRenderer)
}
