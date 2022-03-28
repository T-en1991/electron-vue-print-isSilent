const { ipcRenderer } = require('electron');
console.log('preload')
ipcRenderer.on('print-edit', (event, obj,flag) => {
  console.log('edit')
  let html = '';
  html+=`<div>${obj.html}</div>`
  document.body.innerHTML = html;
  ipcRenderer.send('do', obj.deviceName,flag);
})
