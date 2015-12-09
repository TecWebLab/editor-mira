$(document).ready(function () {
    globalTree = null;
    abstractInterfaceObj = new AbstractInterface();
    concreteInterfaceObj = new ConcreteInterface();
    

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