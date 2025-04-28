// Elementos HTML
const btAdcRegistro = document.getElementById("bt-adc");
const tbody = document.querySelector("#listaContatos tbody");
const editNomeInput = document.getElementById("editNomeInput");
const editEmailInput = document.getElementById("editEmailInput");
const editTelefoneInput = document.getElementById("editTelefoneInput");

// Registros salvos
let baseDeDados = [
    {id:1, nome:"João",email:"joão@exemplo.com",telefone:"123"},
    {id:2, nome:"Maria",email:"maria@exemplo.com",telefone:"456"}
]


// Limpar o conteúdo da tabela
function limparTabela(){
    tbody.innerHTML = "";
}

// Limpar e renderizar a tabela novamente
// Adicionando a cada linha da tabela botões
// que permitem editar ou apagar o respectivo registro
function atualizaTabela(){
    limparTabela()
    baseDeDados.forEach(element => {
        // Cria uma nova linha
        let linha = document.createElement("tr");
    
        // Célula nome
        let tdNome = document.createElement("td");
        tdNome.textContent = element.nome;
    
        // Célula email
        let tdEmail = document.createElement("td");
        tdEmail.textContent = element.email;

        // Célula telefone
        let tdTelefone = document.createElement("td");
        tdTelefone.textContent = element.telefone;
    
        // Célula ações (apagar e editar)
        let tdAcoes = document.createElement("td");
        let btnRemover = document.createElement("button");
        let btnEditar = document.createElement("button");
        btnRemover.textContent = "X";
        btnRemover.onclick = () => apagarRegistro(element.id);
        btnEditar.onclick = () => abrirEdicao(element.id);
        btnEditar.textContent = "Editar";
        tdAcoes.appendChild(btnEditar);
        tdAcoes.appendChild(btnRemover);

        // Adicionar as células na linha na tabela
        linha.appendChild(tdNome);
        linha.appendChild(tdEmail);
        linha.appendChild(tdTelefone);
        linha.appendChild(tdAcoes)
        tbody.appendChild(linha);
    });
}


// Criar um novo registro
function criarRegistro(){
    let _nome = document.getElementById("nomeInput").value;
    let _email = document.getElementById("emailInput").value;
    let _telefone = document.getElementById("telefoneInput").value;
    
    if (!_nome){
        alert("Preencha o nome da pessoa.");
        return;
    }
    else{
        if(!_email){
            _email = "?" 
        }
        if(!_telefone){
            _telefone = "?"
        }
        let _id;
        if(baseDeDados.length >= 1){
            _id = baseDeDados[baseDeDados.length-1].id+1;
        } else{
            _id = 0
        }
        const objeto = {id: _id, nome: _nome, email: _email, telefone: _telefone};
        baseDeDados.push(objeto);
        atualizaTabela();
        document.getElementById("nomeInput").value = "";
        document.getElementById("emailInput").value = "";
        document.getElementById("telefoneInput").value = "";
    }
}
btAdcRegistro.addEventListener("click", criarRegistro);

function apagarRegistro(_id){
    for (let i = 0; i < baseDeDados.length; i++){
        if(baseDeDados[i].id===_id){
            baseDeDados.splice(i,1);
        }
    }
    atualizaTabela();
}

// Salvar o id do elemento a ser editado
let elementoEditadoID;

// Abre o formulario popup que permite editar um registro
function abrirEdicao(_id){
    elementoEditadoID = _id;
    document.getElementById("popupForm").style.display = "block";
    document.getElementById("overlay").style.display = "block";
    let elementoAlvo;
    baseDeDados.forEach(element => {
        if(element.id === _id){
            elementoAlvo=element;
        }
    });
    editNomeInput.value = elementoAlvo.nome;
    editEmailInput.value = elementoAlvo.email;
    editTelefoneInput.value = elementoAlvo.telefone;
}

// Fecha o popup
  function fecharEdicao() {
    document.getElementById("popupForm").style.display = "none";
    document.getElementById("overlay").style.display = "none";
  }
  
// Salva a edição do registro alvo
// e em seguida fecha o popup e atualiza a tabela
  function salvarEdicao(){

    const _nome = editNomeInput.value;
    const _email = editEmailInput.value;
    const _telefone = editTelefoneInput.value;
  
    baseDeDados.forEach(element => {
        if(element.id === elementoEditadoID){
            element.nome = _nome;
            element.email = _email;
            element.telefone = _telefone;
        }
    });
    
    fecharEdicao();
    atualizaTabela();
  }

atualizaTabela();
