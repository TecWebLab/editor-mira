/**
 * Classe responsável pelos métodos de de gerenciamento do projeto (Salvar, novo e abrir).
 *
 * @class Project
 * @author João Victor Magela
 * @constructor
 */
var Project = function () {
    "use strict";

    var DATA_TREE =
    [
        {
            text: "navigation",
            nodes:
            [
                {
                    text: "navigation-list",
                    nodes:
                    [
                        { text: "navigation-list-item" },
                    ]
                },
            ]
        },
        { text: "container" }
    ];

    var myApp;
    myApp = myApp || (function () {
        var pleaseWaitDiv = $('#pleaseWaitDialog');
        return {
            showPleaseWait: function() {
                pleaseWaitDiv.modal();
            },
            hidePleaseWait: function () {
                pleaseWaitDiv.modal('hide');
            },
        };
    })();

    /*
    * Método responsável por captar a extensão de um determinado arquivo.
    * @method _getExtensionFile  
    * @author João Victor Magela 
    * @param {string} filename Nome do arquivo a qual deseja captar a extensão.</param>
    * @return A extensão do arquivo desejado
    */
    var _getExtensionFile = function(filename) {
        return filename.split('.').pop();
    };

    /*
    * Método responsável por verificar se o arquivo é do formato JSON.
    * @method _isJson
    * @author João Victor Magela
    * @param {string} filename Nome do arquivo a qual deseja verificar se é do formato JSON.
    * @return Verdadeiro, se o arquivo é do formato JSON
    */
    var _isJson = function(filename){
        return _getExtensionFile(filename).toLowerCase() == 'json';
    };

    /**
     * Método responsável por converter um Objeto aninhado em um vetor aninhado.
     * @method _nestedObjectToArray
     * @author João Victor Magela
     * @param {Object} obj Object como um Array.
     * @return Array aninhado.
     */
    var _nestedObjectToArray = function(obj) {
        var result = [];

        for(var i in obj){
            var htmlElement = new HTMLElement();
            
            htmlElement.bind = undefined;
            htmlElement.tag = undefined; 
            htmlElement.html = undefined;

            htmlElement.updateAttr(obj[i]);
            result.push(htmlElement);
        }

        return result;
    }

    /**
     * Método responsável por gerar um arquivo JSON contendo as informações do projeto e fazer o download do mesmo.
     * @method _downloadJson
     * @author João Victor Magela
     */
    var _downloadJson = function() {
        var link = $('#link-download');
        saveWebStorage();

        var data = "text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem('project'));
        link.attr('href', 'data:' + data).attr('download', 'Inteface.json');

        link[0].click();
    };

    /**
     * Método responsável por iniciar o mira-editor com valores padrões.
     * @method initDefault
     * @author João Victor Magela
     * @static
     */
    var initDefault = function() {
        concreteInterfaceObj.concreteInterfaceItems = [];
        $("#prototype").empty();
        $('#nameInterface').val('landing');

        $("#tree").treeview({
            data: DATA_TREE,
            showCheckbox: true,
            highlightSelected: false,

            onTreeRender: function(event, data){
                RenderElements.renderTree(data);
            }
        });
    };

    /**
     * Método responsável por iniciar o mira-editor com um valor customizado.
     * @method initCustom
     * @author João Victor Magela
     * @param {Object} abstractInterface Dados para iniciação custmizada do mira-editor
     * @static
     */
    var initCustom = function(abstractInterface) {
        $("#tree").treeview({
            data: abstractInterface,
            showCheckbox: true,
            highlightSelected: false,

            onTreeRender: function(event, data){
                RenderElements.renderTree(data);
            }
        });
    };

    $('#btn-show-tests').click(function(e){
        e.preventDefault();
        
        $('#dialog-confirm').dialog({
            resizable: false,
              height:230,
              width: 550,
              modal: true,
              buttons: {
                "Sim": function() {
                    $('#project-save').click();
                    localStorage.clear();
                    localStorage.setItem('test', '1');
                    window.location.reload();
                },
                "Não" : function(){
                    
                    localStorage.clear();
                    localStorage.setItem('test', '1');
                    window.location.reload();
                },
                Cancel: function() {
                  $( this ).dialog( "close" );
                }
              }
        })

    })

    /*
    * Ao clicar no botõa novo será aberta uma caixa de diálogo para o usuário se deseja mesmo fazer essa operação. Caso seja confirmado, o projeto é
    * iniciado com seu valor padrão.
    */
    $('#project-new').click(function(e){
        e.preventDefault();

        if(confirm('Deseja realmente fechar esse projeto para iniciar outro?')){
            initDefault();
        }
    });

    // Faz o download de um arquivo JSON contento os dados do corrente projeto.
    $('#project-save').click(function(e) {
        e.preventDefault();
        _downloadJson();
    });

    // Abre um projeto existente, fazendo primeiro uma verificação se o arquivo está no padrão correto.
    $('#project-open').on('change', function(e) {
        var filename = $(this).val().replace("C:\\fakepath\\", ""); // Pega o nome do arquivo selecionado.
        $("#upload-file-info").html(filename); // Exibe o nome do arquivo.
        if(!_isJson(filename)) {
            // Verifica se é do formato JSON
            alert('O arquivo selecionado não é do formato JSON');
            return;
        }

        /*
        * Faz a leitura do arquivo para verificar se os dados contidos no mesmo possuem um padrão aceito pelo mira-editor. Para ser aceito o arquivo
        * JSON deve contar as informações "name", "abstractInterface" e "concreteInterfaceItems". Caso algum desses itens não estejam no arquivo JSON,
        * ele é considerado inválido.
        */
        var files = e.target.files;
        for(var i = 0; i < files.length; i++) {
            var file = files[i];

            var reader = new FileReader();
            reader.onload = (function(f) {
                return function(e) {
                    var obj = JSON.parse(e.target.result);
                    if(obj.name == undefined || obj.abstractInterface == undefined || obj.concreteInterfaceItems == undefined) {
                        alert('O arquivo selecionado não está no padrão desejado.');
                    } else {
                        localStorage.setItem('project', e.target.result);
                        $('#nameInterface').val(obj.name);
                        concreteInterfaceObj.concreteInterfaceItems = _nestedObjectToArray(JSON.parse(obj.concreteInterfaceItems));

                        var project = JSON.parse(localStorage.getItem('project'));
                        initCustom(JSON.parse(project.abstractInterface));
                    }
                }
            })(file);

            reader.readAsText(file);
        }
    });

    /**
     * Método responsável por salvar os dados do projeto no localStorage.
     * @method saveWebStorage
     * @author João Victor Magela
     * @static
     */
    var saveWebStorage = function() {
        var obj = new Object();
        obj.name = $('#nameInterface').val();
        obj.abstractInterface = JSON.stringify($.extend({}, true, globalTree.tree));
        obj.concreteInterfaceItems = JSON.stringify($.extend({}, true, concreteInterfaceObj.concreteInterfaceItems));

        localStorage.setItem('project', JSON.stringify(obj));
    };

    /**
     * Método responsável por captar os dados salvos no localStorage.
     * @method loadWebStorage
     * @author João Victor Magela
     * @static
     */
    var loadWebStorage = function() {
        var project = localStorage.getItem('project'); // Coleta os dados do localStorage

        // Caso haja alguma informação, informa o usuário se o mesmo dejeja continuar o projeto.
        if(project && confirm('Já existe um projeto em andamento. Deseja abrí-lo?')) {
            // Inicia o mira-editor com as informações salvas no localStorage
            project = JSON.parse(project);
            $('#nameInterface').val(project.name);
            concreteInterfaceObj.concreteInterfaceItems = JSON.parse(project.concreteInterfaceItems);
            concreteInterfaceObj.concreteInterfaceItems = Array.prototype.slice(concreteInterfaceItems);

            var abstractInterface = JSON.parse(project.abstractInterface);
            abstractInterface = Array.prototype.slice(abstractInterface);
            initCustom(abstractInterface);
        } else {
            //Inicia o mira-editor com o valor padrão.
            localStorage.clear();
            initDefault();
        }
    };

    var tests = function(){
        /********************************************************* Testes ***************************************************/
        QUnit.module("Projeto");
        /**
        * Teste: Salvar projeto
        * @author João Victor Magela
        *
        * Verificar se o projeto foi salvo com os valores corretos.
        * Passos:
        * 1 - Salvar os dados no localStorage
        * 2 - Buscar os dados no localStorage
        * 3 - Verificar se os resultados são os mesmos
        */
        QUnit.test("Salvar projeto", function(assert) {
            // Passo 1 
            var obj = new Object();
            obj.name = $('#nameInterface').val();
            obj.abstractInterface = JSON.stringify($.extend({}, true, globalTree.tree));
            obj.concreteInterfaceItems = JSON.stringify($.extend({}, true, concreteInterfaceObj.concreteInterfaceItems));
            
            saveWebStorage();

            //Passo 2
            var valueWebStorage = JSON.parse(localStorage.getItem('project'));
            
            //Passo 3
            assert.deepEqual(valueWebStorage, obj, "Objeto salvo no localStorage corretamente");

        });

        /**
        * Teste: Novo projeto
        * @author João Victor Magela
        *
        * Verificar se foi iniciado um projeto com os valores padrões.
        * Passos:
        * 1 - Inicializar o projeto com os valores padrões.
        * 2 - Verificar se a Interface Concreta, Abstrata e o nome do projeto estão com os valores padrões.
        */
        QUnit.test("Novo", function(assert) {
            // Passo 1
            var concreteItems = concreteInterfaceObj.concreteInterfaceItems.clone();
            concreteInterfaceObj.concreteInterfaceItems = [];
            var abstractItems = abstractInterfaceObj.widgets.clone();
            abstractInterfaceObj.widgets = [];
            $("#nameInterface").val('lorem ipsum');
            
            initDefault();

            //Passo 2
            assert.deepEqual(concreteItems, concreteInterfaceObj.concreteInterfaceItems, "Interface Concreta está com os valores padrões.");
            assert.deepEqual(abstractItems, abstractInterfaceObj.widgets, "Interface Abstrata está com os valores padrões.");
            assert.equal($("#nameInterface").val(), "landing", "Nome do projeto é o valor padrão");
        });

        /**
        * Teste: Abrir projeto
        * @author João Victor Magela
        *
        * Verificar se o projeto foi iniciado com os valores contidos no arquivo..
        * Passos:
        * 1 - Verificar a extensão de um arquivo.
        * 2 - Verificar se o arquivo é válido.
        * 3 - Verificar se os dados foram carregados com sucesso.
        */
        QUnit.test("Abrir", function(assert){
            //Arquivo de Entrada
            var fileTest = '{"name":"landing","abstractInterface":"{\\"0\\":{\\"text\\":\\"navigation\\",\\"nodes\\":[{\\"text\\":\\"navigation-list\\",\\"nodes\\":[{\\"text\\":\\"navigation-list-item\\",\\"nodeId\\":2,\\"id\\":3,\\"parentId\\":1,\\"selectable\\":true,\\"state\\":{\\"checked\\":false,\\"disabled\\":false,\\"editable\\":false,\\"added\\":false,\\"expanded\\":false,\\"selected\\":false}}],\\"nodeId\\":1,\\"id\\":2,\\"parentId\\":0,\\"selectable\\":true,\\"state\\":{\\"checked\\":false,\\"disabled\\":false,\\"editable\\":false,\\"added\\":false,\\"expanded\\":true,\\"selected\\":false}}],\\"nodeId\\":0,\\"id\\":1,\\"selectable\\":true,\\"state\\":{\\"checked\\":false,\\"disabled\\":false,\\"editable\\":false,\\"added\\":false,\\"expanded\\":true,\\"selected\\":false}},\\"1\\":{\\"text\\":\\"container\\",\\"nodeId\\":3,\\"id\\":4,\\"selectable\\":true,\\"state\\":{\\"checked\\":false,\\"disabled\\":false,\\"editable\\":false,\\"added\\":false,\\"expanded\\":false,\\"selected\\":false}}}","concreteInterfaceItems":"{\\"0\\":{\\"id\\":1,\\"name\\":\\"navigation\\",\\"value\\":\\"\\",\\"class\\":\\"\\",\\"typeElement\\":\\"div\\"},\\"1\\":{\\"id\\":2,\\"name\\":\\"navigation-list\\",\\"value\\":\\"\\",\\"class\\":\\"\\",\\"typeElement\\":\\"div\\"},\\"2\\":{\\"id\\":3,\\"name\\":\\"navigation-list-item\\",\\"value\\":\\"\\",\\"class\\":\\"\\",\\"typeElement\\":\\"div\\"},\\"3\\":{\\"id\\":4,\\"name\\":\\"container\\",\\"value\\":\\"\\",\\"class\\":\\"\\",\\"typeElement\\":\\"div\\"}}"}';

            // Passo 1
            assert.ok(_isJson('teste.json'), "Passado um arquivo com extensão json, retornou true!");
            assert.ok(!_isJson('teste.txt'), "Passado um arquivo com extensão txt, retornou false!");
            assert.ok(_isJson('teste.txt.json'), "Passado um arquivo com extensão json, porém com mais de um ponto, retornou true!");

            // Passo 2
            var obj = JSON.parse(fileTest);
            assert.ok(obj.name, "Name está ok!");
            assert.ok(obj.concreteInterfaceItems, "Itens Concretos estão ok!");
            assert.ok(obj.abstractInterface, "Itens Abstratos estão ok!");

            // Passo 3
            var concreteItems = _nestedObjectToArray(JSON.parse(obj.concreteInterfaceItems));
            assert.deepEqual(concreteInterfaceObj.concreteInterfaceItems, concreteItems, "Objeto aninhado convertido para objeto aninhado");
        })
        /********************************************************* Fim dos Testes *******************************************/
    };
    
    return {
        saveWebStorage: saveWebStorage,
        loadWebStorage: localStorage,
        initDefault: initDefault,
        initCustom: initCustom,
        tests: tests,
        modal: myApp
    }
}();