const { app, ipcMain, BrowserWindow, dialog } = require('electron');
const path = require('path');
const Database = require('better-sqlite3');
const validator = require('validator');

const fs = require('fs');

// Especifíca em qual ambiente o NodeJS está rodando
const isDev = (process.env.NODE_ENV === 'development');


//________ [Configurando o Electron] __________________

// Configurações do navegador
function createWindow(){
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      // Script especial do renderer com acesso às APIs do NodeJS
      preload: path.resolve(__dirname, 'preload.js')
    }
  });

  win.loadFile(path.resolve(__dirname,'renderer','index.html'));

  // Bloquear navegação externa
  win.webContents.on('will-navigate', (event, url) => {
    event.preventDefault();
    if(isDev){
        console.warn(`Bloqueada tentativa de navegação para: ${url}`);
    }
  });

  win.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    if(isDev){
        console.warn(`Bloqueada tentativa de abrir nova janela para: ${url}`);
    }
    else{
        dialog.showErrorBox('Navegação Bloqueada', 'A navegação para URL externa foi bloqueada.');
    }
    });
}

// Ciclo de vida
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Chamadas IPC
ipcMain.handle('registra-contato', (event, nome, email, telefone, descricao) => {
  return registraContato(nome, email, telefone, descricao)
});

ipcMain.handle('obter-contatos', (event) => {
  return obterContatos();
});

ipcMain.handle('obter-contato-por-id', (event, id) => {
  return obterContatoPorID(id);
})

//___________ [Banco de dados] _____________________________

// Criar diretório do banco de dados caso não exista
if (!fs.existsSync('./database')) {
  fs.mkdirSync('./database');
}

// Iniciar o banco de dados
const db = new Database('./database/sqlite3.db', { verbose: console.log });
const criarTabelaContato = db.prepare("\
  CREATE TABLE IF NOT EXISTS Contato (\
    id INTEGER PRIMARY KEY AUTOINCREMENT,\
    nome VARCHAR(255),\
    email VARCHAR(255),\
    telefone VARCHAR(30),\
    descricao VARCHAR(50)\
  );\
")
criarTabelaContato.run();

// Validar o registro de um novo contato
function validaRegistroContato(nome, email, telefone, descricao) {
  if (nome.length < 3 || nome.length > 255) {
    return false;
  }

  if (!validator.isEmail(email)) {
    return false;
  }

  if (!validator.isMobilePhone(telefone) || telefone.length > 30) {
    return false;
  }

  if (descricao.length > 50) {
    return false;
  }

  return true;
}

// Função para registrar um novo contato
// retorna verdadeiro caso o registro for efetivado
function registraContato(nome, email, telefone, descricao) {
  if (!validaRegistroContato(nome, email, telefone, descricao)) {
    return { sucesso: false, mensagem: 'Dados inválidos para o contato.' };
  }
  const query = db.prepare(`
    INSERT INTO Contato (nome, email, telefone, descricao)
    VALUES (?, ?, ?, ?)
  `);

  try {
    const resultado = query.run(nome, email, telefone, descricao);
    return { sucesso: true, mensagem: 'Contato inserido com sucesso.' };
  } catch (error) {
    return { sucesso: false, mensagem: `Erro ao inserir contato: ${error.message}` };
  }
}


// Obter todos os contatos
function obterContatos() {
  const c = db.prepare('SELECT * FROM Contato').all();
  if(isDev){
  console.log(c);
  }
  return {sucesso: true, contatos:c};
}

// Validar se um ID contem apenas números
function idValido(id){
  const regex = /^\d+$/;
  return regex.test(id);
}

// Obter um contato pelo ID
function obterContatoPorID(id) {
  if(idValido(id)){
    const c = db.prepare('SELECT * FROM Contato WHERE id = ?').get(id);
    if(isDev){
    console.log(c);
    }
    return {sucesso: true, contato:c};
  }
  return {sucesso: false, contato:{}}
}