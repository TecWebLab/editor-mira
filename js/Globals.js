//Conjunto de variáveis globais
'use strict';
var globalTree = null;
var abstractInterfaceObj;
var concreteInterfaceObj;
var messagesLog = [];
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
    }, 7000);
};