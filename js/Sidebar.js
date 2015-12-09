/**
 * Classe responsável pelos métodos de gereção e exibição do código da interface abstrata e concreta
 *
 * @class Code
 * @author João Victor Magela
 * @constructor
 */
var Sidebar = function () {
    "use strict";

    /** Elemento abstrado selecionado. 
     *
     * @property _currentObj
     * @type Object
     * @default null
     */
    var _currentObj = null;

    /** Elemento concreto selecionado. 
     *
     * @property _currentElement
     * @type jQuery
     * @default null
     */
    var _currentElement = null;

    /** Instância do jQuery.sidr. 
     *
     * @property _sidebar
     * @type HTMLElement
     * @default null
     */
    var _sidebar = null;

    /**
     * Método responsável por renderizar o formulário de propriedades de um determinado elemento concreto.
     * @method _getForm
     * @author João Victor Magela
     * @param {Object} attrs Atributos do elemento concreto.
     * @return HTML do formulário para um determinado elemento concreto.
     */
    var _getForm = function (attrs) {
        return _.template($('#form-prop').html())({item:attrs});
    };

    /**
     * Método responsável por obter os valores do atributos de um determinado elemento concreto.
     * @method _getAttrs
     * @author João Victor Magela
     * @param {Object} data Atributos e valores de um elemento concreto.
     * @return Objeto com atributos e valores a serem inserido no formulário.
     */
    var _getAttrs = function(data){
        var attrs = new Object();
        for(var i=0; i<data.length; i++){
            attrs[data[i].name] = data[i].value;
        }

        return attrs;
    };

    /**
     * Método responsável por salvar as informações inseridas no formulário de propriedades.
     * @method _saveForm 
     * @author João Victor Magela
     */
    var _saveForm = function(){
        var data = $('#form-properties').serializeArray();
        _currentObj.updateAttr(_getAttrs(data));
        concreteInterfaceObj.replaceItem(_currentObj);
    }

    /**
     * Método responsável por executar os testes
     * @method tests 
     * @author João Victor Magela
     */
    var tests = function(){
        QUnit.module("Interface Concreta");

        /**
        * Teste: Propriedades do elemento
        * @author João Victor Magela
        *
        * Verificar se, ao abrir o formulário de propriedades, o campo “valor” está preenchido com “$bind”, para um elemento abstrato com Bind associado.
        * Passos:
        * 1 - Clicar no botão de propriedades do elemento.
        * 2 - Verificar se o campo “Valor” está com o valor “$bind”.
        */
        QUnit.test("Propriedades do elemento", function(assert){
            assert.expect(3);
            var done = assert.async();
            
            var node = globalTree.nodes[0];
            node.bind = "$data.name";
            globalTree.tree = globalTree.refreshTree(globalTree.tree, node);

            //Renderiza novamente a tela
            globalTree.$element.empty().append(globalTree.$wrapper.empty());
            globalTree.buildTree(globalTree.tree, 0);
            globalTree.$element.trigger('treeRender', $.extend(true, {}, globalTree));

            // Passo 1
            var element = new Div(node);
            concreteInterfaceObj.replaceItem(element);
            
            var btnProp = $('.panel-drag[data-id='+ element.id +']').children('.panel-heading').find('.btn-prop');
            btnProp.trigger('click');
            
            // Passo 2
            assert.ok($('#sidr-sidebar').is(':visible'), "Clicou no botão de propriedade e abriu o formulário de propriedades.");
            assert.equal($('#form-properties').find('[name="value"]').val(), "$bind", "Valor associonado ao elemento abstrato exibiu $bind"); //RN1
            
            setTimeout(function() {
                btnProp.trigger('click');
                assert.equal(btnProp.data('open'), 0, "Clicou no mesmo botão e fechou o formulário de propriedades.");
                done();
            }, 1000);
        });

        QUnit.module("Propriedades");
        Project.initDefault();

        /**
        * Teste: Salvar propriedades
        * @author João Victor Magela
        *
        * Verificar se o método updateAttr está funcionando corretamente.
        * Passos:
        * 1 - Executar o método updateAttr com um conjunto de atributos como parâmetro.
        */
        QUnit.test("Salvar propriedades", function(assert){
            var attrs = {
                value: 'Valor de teste',
                class: 'panel panel-body class-test', 
            };
            var node = globalTree.nodes[0];
            var item = new Div(node); //cria uma div

            //Passo 1
            item.updateAttr(attrs);
            assert.equal(item.value, attrs.value, 'Atualizou o atributo "value".');
            assert.equal(item.class, attrs.class, 'Atualizou o atributo "classes".');
        });

    }

    return {
        /**
         * Método responsável por instalar o plugin jQuery.sidr
         * @method installSidebarAndPropForm
         * @author João Victor Magela
         * @static
         */
        installSidebarAndPropForm: function(){
            var currentProp = null;

            _sidebar = $('.btn-prop').sidr({
                name: 'sidr-sidebar',
                side: 'right',
                source: "#title-property, #content-property"

            });

            $(document).on('click', '#btnSalvar', function(e){
                e.preventDefault();
                _saveForm();
                currentProp.click()
                
            });

            //ao clicar no botão fechar
            $(document).on('click', '#btnFechar', function(e){
                e.preventDefault();
                currentProp.click();           
            });

            $(document).on('click', '.btn-prop', function(e){
                currentProp = $(this);  
                e.preventDefault();
                var $this = $(this);

                var open = $this.data('open');
                var id = $this.parent().parent().parent().attr('data-id');
                var node = new Object();
                node.id = id;
                if(open == 0) {
                    $.sidr('open', 'sidr-sidebar');
                    
                    _currentObj = concreteInterfaceObj.findItem(node);
                    _currentElement = $this.parent().parent().parent();
                    if(_currentObj.id != undefined){
                        $('#sidr-id-form-content').html(_getForm(_currentObj));
                    }

                    open = 1;
                }else {
                    $.sidr('close', 'sidr-sidebar');
                    open = 0;
                }

                $this.data('open', open);
            });
        },

        tests: tests
    }


}();