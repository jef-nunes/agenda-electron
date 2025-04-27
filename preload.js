const { contextBridge, ipcRenderer } = require('electron');

const isDev = (process.env.NODE_ENV === 'development');

if(isDev){
    contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron
    });
}
else{
    contextBridge.exposeInMainWorld('backend', {
    registraContato: (nome, email, telefone, descricao) => ipcRenderer.invoke('registra-contato', nome, email, telefone, descricao),
    obterContatos: () => ipcRenderer.invoke('obter-contatos'),
    obterContatoPorId: (id) => ipcRenderer.invoke('obter-contato-por-id', id)
  });
}