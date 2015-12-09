//Conjunto de variáveis é funções globais
'use strict';
var globalTree = null;
var abstractInterfaceObj;
var concreteInterfaceObj;
var messagesLog = [];

//Executa os testes
var runTest = function(){
    Project.modal.showPleaseWait();
    Project.tests();
    RenderElements.testsTreeView();
    UIEvents.tests();
    Sidebar.tests();
    setTimeout(function() {
        Code.tests();
        Preview.tests();
    }, 4000);

    setTimeout(function() {
        Project.modal.hidePleaseWait();
        $('#modal-test').modal('show');
        downloadLog(generateLog());
    }, 7000);
};

// gerar os logs dos testes
var generateLog = (function(){
	var text = '';

	for(var i = 0; i < messagesLog.length; i++) {
		text += messagesLog[i].module + " - " +  messagesLog[i].name + "\n";
		text += "Status: " + (messagesLog[i].result ? "Passou" : "Não passou") + "\n";
		text += "Assertiva: " + messagesLog[i].message + "\n";
		text += "\n";
	}

	return text;
})

//Faz o download do log gerado
var downloadLog = function(text){
	var file = new Blob([text], {type: 'text/plain'})
	var url = URL.createObjectURL(file);
	var element = document.createElement('a');
	element.setAttribute('href', url);
	element.setAttribute('download', 'Mira-editor-log');
	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
};

//Evento do QUnit
QUnit.log(function(details){
	messagesLog.push(details);
});

