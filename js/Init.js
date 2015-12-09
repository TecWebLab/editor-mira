$(document).ready(function () {
    globalTree = null;
    abstractInterfaceObj = new AbstractInterface();
    concreteInterfaceObj = new ConcreteInterface();
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

    $('#content-templates').load('templates.html', function () {
        RenderElements.initRenderElements();
        Project.initDefault();
        Preview.tabBootstrap();
        RenderElements.commandsRootTree();
        Code.openModalCode();
        Sidebar.installSidebarAndPropForm();

        var isTest = localStorage.getItem('test'); 
        if(isTest == '1') { 
            localStorage.removeItem('test');
            runTest();
        }
    });


});