/**
 * Classe responsável pelos métodos de gereção e exibição do código da interface abstrata e concreta
 *
 * @class Code
 * @constructor
 */
var Code = function () {
    /************************************************************ Variáveis para testes **************************************************/
    //Modelo pré-definido
    var times = 
    [
        {
            text: 'container', 
            nodes: [
                {
                    text: 'content-panel',
                    nodes: [
                        {
                        text: 'panel', 
                        nodes: [
                            {text: 'panel-title'},
                            {
                                text: 'panel-body',
                                nodes: [
                                    {text: 'label-state'},
                                    {text: 'value-state'},
                                    {text: 'label-points'},
                                    {text: 'value-points'},
                                ]
                            }
                        ]
                    }
                    ]
                }
            ]
        }
    ];
    //Como deve ficar a interface abstrata
    var resultAbstractInterface = 
    {
        name: 'landing',
        widgets: 
        [
            {
                name: 'container',
                datasource: 'http://mira.tecweb.inf.puc-rio.br/api/futebol',
                children: 
                [
                    {
                        name: 'content-panel',
                        children: [
                            {
                                name: 'panel',
                                children: 
                                [
                                    {name: 'panel-title', bind: '$data.nome'},
                                    {
                                        name: 'panel-body', 
                                        children:
                                        [
                                            {name: 'label-state'},
                                            {name: 'value-state', bind: '$data.estado'},
                                            {name: 'label-points'},
                                            {name: 'value-points', bind: '$data.ponto'}
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    };
    

    //Interface Concreta que deve dar como resultado
    var resultConcreteInterface = 
    {
        name: 'landing',
        maps: 
        [
            {name: 'container', class: 'container'},
            {name: 'content-panel', class: 'col-md-4'},
            {name: 'panel', class: 'panel panel-primary'},
            {name: 'panel-title', class: 'panel-heading', value: '$bind'},
            {name: 'panel-body', class: 'panel-body'},
            {name: 'label-state', tag: 'label', value: "Estado: "},
            {name: 'value-state', tag: 'p', value: '$bind'},
            {name: 'label-points', tag: 'label', value: "Pontos: "},
            {name: 'value-points', tag: 'p', value: '$bind'},
        ]
    };
    

    /************************************************************Fim - Variáveis para testes **************************************************
    
    /**
     * Método responsável por captar trocar todas as ocorrências de uma determinada expressão por outra.
     * @param {string} de Expressão a ser trocada.
     * @param {string} para Nova expressão a ser inserida
     * @return Nova string
     */
    String.prototype.replaceAll = function(de, para){
        var str = this;
        var pos = str.indexOf(de);
        while (pos > -1){
            str = str.replace(de, para);
            pos = str.indexOf(de);
        }
        return (str);
    };

    "use strict";
    /**
     * Método responsável por remover as aspas duplas de determinados termos.
     * @author João Victor Magela.
     * @method cleanString
     * @param {string} string
     * @return A string sem termos com aspas duplas.
     */
    var _cleanString = function (string) {
        return string.replaceAll('\"name\":', 'name:')
        .replaceAll('\"widget\":', 'widget:')
        .replaceAll('\"widgets\":', 'widgets:')
        .replaceAll('\"datasource\":', 'datasource:')
        .replaceAll('\"children\":', 'children:')
        .replaceAll('\"head\":', 'head:')
        .replaceAll('\"maps\":', 'maps:')
        .replaceAll('\"class\":', 'class:')
        .replaceAll('\"value\":', 'value:')
        .replaceAll('\"href\":', 'href:')
        .replaceAll('\"parse\":', 'parse:')
        .replaceAll('\"tag\":', 'tag:')
        .replaceAll('\"src\":', 'src:')
        .replaceAll('\"alt\":', 'alt:')
        .replaceAll('\"bind\":', 'bind:')
        .replaceAll('\\\"', '\'');
    };

    var _initAbstract = function(){
        var _processAjax = function(){
            var panelTitle = globalTree.nodes[3];
            panelTitle.bind = '$data.nome';

            var valueState = globalTree.nodes[6];
            valueState.bind = '$data.estado';

            var valuePoints = globalTree.nodes[8];
            valuePoints.bind = '$data.ponto';

            globalTree.tree = globalTree.refreshTree(globalTree.tree, panelTitle);
            globalTree.tree = globalTree.refreshTree(globalTree.tree, valueState);
            globalTree.tree = globalTree.refreshTree(globalTree.tree, valuePoints);
        }


        var node = globalTree.nodes[0];
        node.datasource = 'http://mira.tecweb.inf.puc-rio.br/api/futebol';

        $.ajax({
            url: node.datasource,
            type: 'GET',
            success: function(data){
                data = $.parseJSON($(data.responseText)[0].data);
                node = globalTree.setDataToChildren(node, data);
                globalTree.tree = globalTree.refreshTree(globalTree.tree, node);
                _processAjax();
            }
        });
    };

    var _initConcrete = function(){
        concreteInterfaceObj.concreteInterfaceItems[0].class = 'container';
        concreteInterfaceObj.concreteInterfaceItems[1].class = 'col-md-4';
        concreteInterfaceObj.concreteInterfaceItems[2].class = 'panel panel-primary';
        concreteInterfaceObj.concreteInterfaceItems[3] = new Div(globalTree.nodes[3]);
        concreteInterfaceObj.concreteInterfaceItems[3].class = 'panel-heading';

        concreteInterfaceObj.concreteInterfaceItems[4].class = 'panel-body';

        concreteInterfaceObj.concreteInterfaceItems[5] = new Label(globalTree.nodes[5]);
        concreteInterfaceObj.concreteInterfaceItems[5].value = "Estado: ";

        concreteInterfaceObj.concreteInterfaceItems[6] = new Paragraph(globalTree.nodes[6]);

        concreteInterfaceObj.concreteInterfaceItems[7] = new Label(globalTree.nodes[7]);
        concreteInterfaceObj.concreteInterfaceItems[7].value = "Pontos: ";

        concreteInterfaceObj.concreteInterfaceItems[8] = new Paragraph(globalTree.nodes[8]);
    }

    /**
     * Método responsável por exibir executar os testes
     * @author João Victor Magela.
     * @method tests
     * @static 
     */
    var tests = function(){
        concreteInterfaceObj.concreteInterfaceItems = [];

        // Inicia com o modelo pre-definido
        Project.initCustom(times); 
        QUnit.module("Código Gerado");

        /**
        * Teste: Gerar código das interfaces
        * @author João Victor Magela
        *
        * Verificar se a geração do código para a Interface Concreta e Abstrata está de acordo com o esperado.
        * Passos:
        *1 - Gerar o código das Interfaces.
        *2 - Verificar se está de acordo com o esperado.
        */
        QUnit.test("Gerar código das interfaces", function(assert){
            assert.expect(4);
            var done = assert.async();
            _initAbstract();
            setTimeout(function() {
                _initConcrete();
                
                //Passo 1
                globalTree.$element.empty().append(globalTree.$wrapper.empty());
                globalTree.buildTree(globalTree.tree, 0);
                globalTree.$element.trigger('treeRender', $.extend(true, {}, globalTree));

                //Passo 2
                //Verifica se a interface abstrata foi gerada corretamente
                var widgets1 = JSON.parse(stringify(abstractInterfaceObj.widgets, {maxLength: 80, indent: 2}));
                var widgets2 = JSON.parse(stringify(resultAbstractInterface.widgets, {maxLength: 80, indent: 2}));

                assert.equal(abstractInterfaceObj.name, resultAbstractInterface.name, "Nome da Interface Abstrata está correta.");
                assert.ok(_.isEqual(widgets1, widgets2), "Widgets Abstratos foram gerados corretamente.");    

                //Verifica se a interface concreta foi gerada corretamente
                var maps1 = JSON.parse(stringify(concreteInterfaceObj.maps, {maxLength: 80, indent: 2}));
                var maps2 = JSON.parse(stringify(resultConcreteInterface.maps, {maxLength: 80, indent: 2}));
                assert.equal(concreteInterfaceObj.name, resultConcreteInterface.name, "Nome da Interface Concreta está correta.");
                assert.deepEqual(maps1, maps2, "Mapeamento dos widgtes concretos foi feito corretamente.");    
                done();
            }, 800);
        });
    };

    return {
        /**
         * Método responsável por exibir em um modal do Twitter Bootstrap o código gerado.
         * @author João Victor Magela.
         * @method openModalCode
         * @static 
         */
        openModalCode: function () {
            $('.btn-open-modal').click(function(e) {
                var code = $(this).parents('.panel').find('pre').clone();
                
                $('#modal-code').find('.modal-body').html(code);
                $('#modal-code').modal('show');
            });
        },

        /**
         * Método responsável por exibir o código gerado da interface abstrata.
         * @author João Victor Magela.
         * @param {Object} data Dados com os widgets abstratos.
         * @method showAbstractInterfaceCode
         * @static 
         */
        showAbstractInterfaceCode: function(data) {
            $('#abstract-code pre').html(
                _cleanString(abstractInterfaceObj.generateAbstractInterface(data.abstractInterface))
            );
        },

        /**
         * Método responsável por exibir o código gerado da interface concreta.
         * @author João Victor Magela.
         * @method showConcreteInterfaceCode
         * @static 
         */
        showConcreteInterfaceCode: function() {
            $('#concrete-code pre').html(
                _cleanString(concreteInterfaceObj.generateConcreteInterface())
            );
        },

        tests: tests
    };
}();