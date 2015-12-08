/**
 * Classe responsável pelos métodos de renderização da aplicação (exibição dos elemento concreto, TreeView, Código gerado)
 *
 * @class RenderElements
 * @author João Victor Magela
 * @constructor
 */
var RenderElements = function() {
    "use strict";
    var panelBase;

    /**
     * Método responsável por renderizar os elementos concretos no protótipo.
     * @method _renderConcreteInterface
     * @author João Victor Magela
     * @param {Object} node Elemento abstrato. 
     * @param {jQuery} root Elemento jQuery onde serão inseridos novos elementos concretos.
     * @return O protótipo com os elementos.
     */
    var _renderConcreteInterface = function(node, root) {
        if(!root) {
            var item = concreteInterfaceObj.findItem(node);
            if(item.id == undefined) item = new Div(node);
            
            item.typeElement = item.typeElement ? item.typeElement : "div";
            item.html = item.html && item.html.jquery ? item.html.clone() : item.getTemplate(item.typeElement);
            item.name = node.text;
            item.bind = node.bind ? node.bind : undefined;
            
            concreteInterfaceObj.replaceItem(item);
            
            root = $(_.template(panelBase)({item:item})); //insere o elemento dentro do panel base
        }

        var length = node.nodes ? node.nodes.length : 0;
        for(var i=0; i < length; i++) {
            var itemNode = concreteInterfaceObj.findItem(node.nodes[i]);
            if(itemNode.id == undefined) itemNode = new Div(node.nodes[i]);
            
            itemNode.typeElement = itemNode.typeElement ? itemNode.typeElement : "div";
            itemNode.html = itemNode.html && itemNode.html.jquery ? itemNode.html.clone() : itemNode.getTemplate(itemNode.typeElement);
            itemNode.name = node.nodes[i].text;
            itemNode.bind = node.nodes[i].bind ? node.nodes[i].bind : undefined;
            
            concreteInterfaceObj.replaceItem(itemNode);

            var child = $(_.template(panelBase)({item:itemNode})); //insere o elemento dentro do panel base
            if(node.nodes[i].nodes) child = _renderConcreteInterface(node.nodes[i], child);

            root.find('.panel-body').first().append(child);
        }

        return root;
    };

    /**
     * Método responsável por realizar a mudança de um elemento concreto para outro tipo.
     * @method _changeElement
     * @author João Victor Magela
     * @param {Object} item Elemento concreto. 
     * @param {string} value Tipo do novo elemento concreto.
     * @return O novo elemento concreto.
     */
    var _changeElement = function(value, node){
        switch(value){
            case 'div' :                    return new Div(node);
            case 'p' :                      return new Paragraph(node);
            case 'header' :                 return new Header(node);
            case 'a' :                      return new Link(node);
            case 'label' :                  return new Label(node);
            case 'span' :                   return new Span(node);
            case 'list' :                   return new List(node);
            case 'list-item' :              return new ListItem(node);
            case 'image' :                  return new ImageHtml(node);
            case 'carousel' :               return new Carousel(node);
            case 'carousel-item' :          return new CarouselItem(node);
            case 'navigation' :             return new BootstrapNavigation(node);
            case 'navigation-list' :        return new BootstrapNavigationList(node);
            case 'navigation-list-item' :   return new BootstrapNavigationListItem(node);
            case 'form' :                   return new Formulario(node);
            case 'input-text' :             return new InputText(node);
            case 'input-textarea' :         return new InputTextarea(node);
            case 'input-radio' :            return new InputRadioCheck(node);
            case 'input-select' :           return new InputSelect(node);
            case 'input-option' :           return new InputOption(node);
            case 'input-button' :           return new Button(node);
        }

        return undefined;
    };

    /**
     * Evento disparado quando há a mudança do elemento concreto no combobox. A partir do novo elemento selecionado, é buscado o template correspondente
     * e feita a atualização do elemento concreto.
     *
     * @event ChangeSelectType
     */
    $(document).on('change', '.select-type-element', function(e){
        var value = $(this).val();
        var root = $(this).parent().parent().parent().parent();
        var id = root.data('id');
        var node = globalTree.findNodeById(id);
        var item = concreteInterfaceObj.findItem(node);
        item = _changeElement(value, node);

        item.componentWidth = root.width() + 'px';
        concreteInterfaceObj.replaceItem(item);
        Code.showConcreteInterfaceCode();
        
        $('#tree').trigger('treeRender', $.extend({}, true, globalTree));
    });

    /**
     * Método responsável por executar os testes
     * @method testsTreeView
     * @author João Victor Magela
     */
    var testsTreeView = function(){
        var btnRoot = $('#btn-root-add'), keydown = $.Event('keydown');
        var assert;
        /**
         * Método responsável por executar o evento keydown de para Esc, Enter ou Tab em um input text
         * @method _triggerkeyDownEvent
         * @author João Victor Magela
         */
        var _triggerkeyDownEvent = function(assert, input, which, value){
            
            var oldText = input.val();
            input.focus();
            keydown.which = which;
            
            input.val(value).trigger(keydown); //Altera o valor do campo e pressiona enter    
            if(which == 27) {
                assert.equal(globalTree.nodes[globalTree.nodes.length-1].text, oldText, "Pressionou Esc e voltou ao valor antigo."); // Verifica se não foi alterado o nome pressionando ESC    
            }else {
                assert.equal(globalTree.nodes[globalTree.nodes.length-1].text, value, "Alterou o valor do campo para \""+ value +"\"."); // Verifica se o alterou o texto do elemento
                assert.ok(!globalTree.nodes[globalTree.nodes.length-1].state.editable && !globalTree.nodes[globalTree.nodes.length-1].state.added, "Pressionou "+ which == 9 ? "Tab" : "Enter" + " e saiu do modo editável."); // Verifica se o item saiu do modo editável
            }
        }

        /**
         * Método responsável por testar a adição de um elemento e pressionar enter no campo. O resultado deve ser a confirmação da operação
         * @method _testAddElementRootEnter
         * @author João Victor Magela
         */
        var _testAddElementRootEnter = function(assert){
            var length = globalTree.nodes.length; //tamanho antes de adicionar
            
            btnRoot.trigger('click'); // Passo 1
            var newlength = globalTree.nodes.length;

            assert.equal(newlength, length+1, "Novo item adicionado!"); // Verifica se adicionou um novo item
            assert.ok(globalTree.nodes[globalTree.nodes.length-1].state.added, "Item está no modo editável."); // Verifica se o item está no mdo editável

            var newItem = globalTree.$element.find('[data-nodeid="'+(globalTree.nodes.length-1)+'"]'); //seleciona o último item adicionado
            _triggerkeyDownEvent(assert, newItem.find('input'), 13, "TestEnter");
        };

        /**
         * Método responsável por testar a adição de um elemento e pressionar tab no campo. O resultado deve ser a confirmação da operação
         * @method _testAddElementRootTab
         * @author João Victor Magela
         */
        var _testAddElementRootTab = function(assert){
            btnRoot.trigger('click');

            var newItem = globalTree.$element.find('[data-nodeid="'+(globalTree.nodes.length-1)+'"]'); //seleciona o último item adicionado
            _triggerkeyDownEvent(assert, newItem.find('input'), 9, "TestTab");
        };

        /**
         * Método responsável por testar a adição de um elemento e pressionar esc no campo. O resultado deve ser a anulação da operação
         * @method _testAddElementRootEsc
         * @author João Victor Magela
         */
        var _testAddElementRootEsc = function(assert){
            btnRoot.trigger('click');
            var length = globalTree.nodes.length; //armazena quantos itens tinham antes da operação

            var input = globalTree.$element.find('[data-nodeid="'+(globalTree.nodes.length-1)+'"]').find('input'); //seleciona o último item adicionado
            keydown.which = 27;
            input.trigger(keydown); //Pressiona Esc no input
            assert.equal(globalTree.nodes.length, length-1, "Pressionou Esc no campo e o item foi removido."); //Verifica se o item foi removido.
        };

        /**
         * Método responsável por testar a remoção dos elementos selecionados.
         * @method _testRemoveSelectedsRoot
         * @author João Victor Magela
         */
        var _testRemoveSelectedsRoot = function(assert){
            var length = globalTree.nodes.length;
            
            //Passo 1
            var items = globalTree.$element.find('.node-tree').filter(function(){
                return parseInt($(this).attr('data-nodeid')) > globalTree.nodes.length-3;
            });

            items.each(function(index, element){
                var el = globalTree.$element.find('[data-nodeid='+$(this).data('nodeid')+']');
                el.children('.check-icon').trigger('click');
            });

            // Passo 2
            $('#btn-root-removeall').click(); //remove as itens selecionados

            // Passo 3
            assert.equal(globalTree.nodes.length, length-2, "Dois últimos itens removidos com sucesso!"); // verifica se foram removidos
        };

        /**
         * Método responsável por testar a edição de um elemento.
         * @method _testRemoveSelectedsRoot
         * @author João Victor Magela
         */
        var testEditElement = function(assert){
            
            // Passo 1 - Clica no botão editar de um elemento.
            var item = globalTree.$element.find('[data-nodeid="'+(globalTree.nodes.length-1)+'"]'); //seleciona o último item adicionado
            item.find('#btn-tree-edit').trigger('click');

            // Passo 2 - Pressionar a tecla Enter no campo e verifica se foi confirmada a operação.
            assert.equal(item.find('input').length, 1 , "Item está no estado editável."); //Verifica se o item ficou editável
            _triggerkeyDownEvent(assert, item.find('input'), 13, "TestEnter"); // Altera o nome do input e pressiona enter

            // Passo 3 - Repetir a operação pressionando a tecla Tab e verifica se foi confirmada.
            item = globalTree.$element.find('[data-nodeid="'+(globalTree.nodes.length-1)+'"]'); //seleciona o último item adicionado
            item.find('#btn-tree-edit').click(); //clica novamente pra editar
            assert.equal(item.find('input').length, 1 , "Item está no estado editável."); //Verifica se o item ficou editável
            _triggerkeyDownEvent(assert, item.find('input'), 9, "TestTab"); // Altera o nome do input e pressiona tab
            
            // Passo 4 - Repetir a operação pressionando a tecla Esc e verifica se foi cancelada.
            item = globalTree.$element.find('[data-nodeid="'+(globalTree.nodes.length-1)+'"]'); //seleciona o último item adicionado
            item.find('#btn-tree-edit').click(); //clica novamente pra editar
            assert.equal(item.find('input').length, 1 , "Item está no estado editável."); //Verifica se o item ficou editável
            _triggerkeyDownEvent(assert, item.find('input'), 27, "TestEsc"); // Altera o nome do input e pressiona Esc*/
        };

        /**
         * Método responsável por testar a adição de um filho a um elemento.
         * @method _testAddChild
         * @author João Victor Magela
         */
        var _testAddChild = function(assert) {
            var nodeId = 3; // Nó com filhos

            // Passo 1 - Clica no botão adicionar filho de um elemento.
            var item = globalTree.$element.find('[data-nodeid="'+ nodeId +'"]'); //seleciona o item pai
            item.find('#btn-tree-add').trigger('click'); //Clica no botão de adicionar filho

            // Passo 2 - Pressionar a tecla Enter no campo e verificar se foi confirmada a operação.    
            var node = globalTree.findNode(nodeId); //Obtém os dados do pai
            assert.ok(node.nodes && node.nodes.length == 1, "Primeiro filho adicionado com sucesso"); // verifica se foi adicionado um filho
            assert.ok(node.nodes[0].state.added, "Primeiro filho adicionado no estado editável"); // Verifica se foi adicionado no estado editável
            var child = globalTree.$element.find('[data-nodeid="'+node.nodes[0].nodeId+'"]'); //seleciona o último item adicionado
            _triggerkeyDownEvent(assert, child.find('input'), 13, "ChildEnter"); // Pressiona Enter

            // Passo 3 - Repetir a operação pressionando a tecla Tab e verificar se a mesma foi confirmada.
            item = globalTree.$element.find('[data-nodeid="'+ nodeId +'"]'); //seleciona o último item adicionado
            item.find('#btn-tree-add').trigger('click'); //Clica no botão de adicionar filho
            node = globalTree.findNode(nodeId); //faz a busca dos dados do nó
            assert.ok(node.nodes && node.nodes.length == 2, "Segundo filho adicionado com sucesso"); // verifica se foi adicionado um filho
            assert.ok(node.nodes[1].state.added, "Segundo filho adicionado está no estado editável");// Verifica se foi adicionado no estado editável
            child =  globalTree.$element.find('[data-nodeid="'+node.nodes[1].nodeId+'"]'); //seleciona o último item adicionado
            _triggerkeyDownEvent(assert, child.find('input'), 9, "ChildTab"); //Pressiona Tab

            // Passo 4 - Repetir a operação pressionando a tecla Esc e verificar se a mesma foi cancelada.
            item = globalTree.$element.find('[data-nodeid="'+ nodeId +'"]'); //seleciona o último item adicionado
            item.find('#btn-tree-add').trigger('click'); //Clica no botão de adicionar filho
            node = globalTree.findNode(item); //faz a busca dos dados do nó
            assert.ok(node.nodes && node.nodes.length == 3, "Terceiro filho adicionado com sucesso"); // verifica se foi adicionado um filho
            assert.ok(node.nodes[2].state.added, "Terceiro filho adicionado está no estado editável"); // Verifica se foi adicionado no estado editável
            child =  globalTree.$element.find('[data-nodeid="'+node.nodes[2].nodeId+'"]'); //seleciona o último item adicionado
            
            keydown.which = 27;
            child.find('input').trigger(keydown); //Pressiona Esc no campo.
            node = globalTree.findNode(item); //Atualiza os dados do nó
            assert.equal(node.nodes.length, 2, "Pressionou Esc e o filho foi removido."); //Verifica se o item foi removido.
        };

        /**
         * Método responsável por testar a remoção de um elemento e seus filhos
         * @method _testRemoveElement
         * @author João Victor Magela
         */
        var _testRemoveElement = function(assert) {
            var _checkChildrenRemoved = function(assert, node) {
                for(var i=0; node.nodes && i < node.nodes.length; i++) {
                    _checkChildrenRemoved(assert, node.nodes[i]);
                }

                var child = globalTree.findNodeById(node.id);
                assert.ok(!child, '"' + node.text + '" foi removido.');                    
            };

            // Passo  1 - Clicar no botão de remoção de um elemento.
            var nodeId = 0;            
            var node = globalTree.findNode(nodeId); //Obtém os dados do pai
            assert.ok(node.nodes && node.nodes.length > 0, "O item selecionado possui filho(s)");
            var item = globalTree.$element.find('[data-nodeid="'+ nodeId +'"]'); //seleciona o item;
            item.find('#btn-tree-remove').trigger('click'); //Clica no botão de remover item
            
            // Passo 2 - Verificar se os filhos foram removidos.
            var newNode = globalTree.findNodeById(node.id);
            _checkChildrenRemoved(assert, node);
        };

        /**
         * Método responsável por testar a remoção dos filhos de um elemento
         * @method _testRemoveChidrenSelected
         * @author João Victor Magela
         */
        var _testRemoveChidrenSelected = function(assert){
            var nodeId = 0; // Nó com filhos

            //Passo 1 - Selecionar os itens a serem removidos.
            var node = globalTree.findNode(nodeId); //Obtém os dados do pai
            assert.equal(node.nodes.length, 2, "Pai contém dois filhos.");
            var child = globalTree.$element.find('[data-nodeid="'+ node.nodes[0].nodeId +'"]').find('.check-icon').trigger('click'); 
            
            // Passo 2 - Clicar no botão de remover filhos selecionados do pai.
            var item = globalTree.$element.find('[data-nodeid="'+ nodeId +'"]'); //seleciona o item pai
            item.find('#btn-tree-removeall').trigger('click'); //Clica no botão de remoção de filhos selecionados
            
            // Passo 3 - Verificar se os itens foram removidos.
            node = globalTree.findNodeById(node.id);
            assert.equal(node.nodes.length, 1, "Pai contém apenas um filho."); //Verifica se foi realmente excluído um item
        };

        /**
         * Método responsável por testar a inserção de dados em um elemento com uma expressão inválida
         * @method _testInsertDataError
         * @author João Victor Magela
         */
         /*
        var _testInsertDataError = function(assert, nodeId){
            var done = assert.async();

            //Primeiro verifica com o link errado
            $('#field-datasource').val('lorem ipsun');
            $('#modal-tree-download').find('#btn-download-information').trigger('click');
            setTimeout(function(){
                $('#btn-confirm-download').trigger('click');
                var node = globalTree.findNode(nodeId);
                assert.ok(!node.$data, "Inseriu uma expressão/url inválida e não inseriu nenhum dado no nó.");
                done();
            }, 200);
        };*/

        /**
         * Método responsável por retornar os dados da requisição AJAX
         * @method _testAjax
         * @author João Victor Magela
         */
        var _testAjax = function(assert, nodeId, url, callback){
            var node = globalTree.findNode(nodeId);
            
            var result = $.ajax({
                url: url,
                type: 'GET',
                success: function(data){
                    data = $.parseJSON($(data.responseText)[0].data);
                    node.$data = data;
                }

            }).always(function(){
                callback(node);
            })
        };

        /**
         * Método responsável por testar a operação de inserir informações em um elemento.
         * @method _testInsertData
         * @author João Victor Magela
         */
        var _testInsertData = function(assert) {
            var _testSetDataToChildren = function(node){
                //Passa os dados de pai pra filho
                node = globalTree.setDataToChildren(node, node.$data);
                globalTree.tree = globalTree.refreshTree(globalTree.tree, node);
                for(var i = 0; i < node.nodes.length; i++) {
                    assert.deepEqual(node.$data, node.nodes[i].$data, 'Dados do "'+ node.text +'" foram passados para o filho "'+ node.nodes[i].text+'".');
                }

                return node;
            };

            assert.expect(3);
            var done = assert.async(2);

            // Passo 1 - Selecionar os itens da árvore com filhos.
            var nodeId = 0;
            var modal = $('#modal-tree-download');
            var node = globalTree.findNode(nodeId);
            modal.attr('data-id', node.id);
            var url = 'http://mira.tecweb.inf.puc-rio.br/api/futebol/1'; //Seleciona um time de futebol
            var oldData = node.$data;

            //Passo 2 - Fazer uma requisição AJAX com uma url/expressão inválida.
            _testAjax(assert, nodeId, "lorem ipsun", function(n){
                node = n;    
                assert.deepEqual(node.$data, oldData, 'Inseriu a url inválida: lorem ipsun e não alterou o valor anterior.');
                done();
            });

            // Passo 3 - Fazer uma requisição AJAX com uma url/expressão válida.
            _testAjax(assert, nodeId, url, function(n){
                node = n;    
                assert.ok(node.$data, 'Inseriu a url válida: ' + url + ' e alterou o valor anterior.');

                // Passo 4 - Verificar se os dados foram passados para os filhos.
                node = _testSetDataToChildren(node);
                done();
            });
        };

        /**
         * Método responsável por testar a mudança do tipo de elemento.
         * @method _testChangeElement
         * @author João Victor Magela
         */
        var _testChangeElement = function(assert){
            var node = globalTree.nodes[0]; //seleciona um item abstrato
            var item = concreteInterfaceObj.findItem(node) //seleciona o item concreto relacionado ao item abstrato;

            var types =  ['div', 'p', 'header', 'a', 'label', 'span', 'list', 'list-item', 'image', 'carousel', 'carousel-item',
                        'navigation', 'navigation-list', 'navigation-list-item', 'form', 'input-text', 'input-textarea', 'input-radio',
                        'input-select', 'input-option', 'input-button'];
            for(var i =0 ; i < types.length; i++) {
                var current = item.typeElement;
                // Passo 1 - Alterar o tipo do elemento.
                item = _changeElement(types[i], node);

                // Passo 2 - Verificar se a operação foi feita com sucesso.
                assert.equal(types[i], item.typeElement, 'Mudou de "'+ current +'" para "' + item.typeElement+ '".');
            }
        }
                
        QUnit.module("Interface Abstrata");
        /**
        * Teste: Adicionar item à raiz da árvore
        * @author João Victor Magela
        *
        * Verificar a adição de elementos na raiz da árvore.
        * Passos:
        * 1 - Clicar no botão e pressionar "Enter" no campo.
        * 2 - Clicar no botão e pressionar "Tab" no campo.
        * 3 - Clicar no botão e pressionar "Esc" no campo.
        */
        QUnit.test("Adicionar item à raiz da árvore", function(assert){
            _testAddElementRootEnter(assert);
            _testAddElementRootTab(assert);
            _testAddElementRootEsc(assert);
        });

        /**
        * Teste: Remover itens selecionados da raiz
        * @author João Victor Magela
        *
        * Verificar se os itens selecionados da raiz estão sendo removidos.
        * Passos:
        * 1 - Selecionar os itens da raiz que deseja remover.
        * 2 - Clicar no botão de remoção.
        * 3 - Verificar se os itens foram removidos.
        */
        QUnit.test("Remover itens selecionados da raiz", function(assert){
            _testRemoveSelectedsRoot(assert);
        });


        /**
        * Teste: Editar elemento
        * @author João Victor Magela
        *
        * Verificar se a edição de um elemento é feita com sucesso.
        * Passos:
        * 1 - Clica no botão editar de um elemento.
        * 2 - Pressionar a tecla Enter no campo e verifica se foi confirmada a operação.
        * 3 - Repetir a operação pressionando a tecla Tab e verificar se a mesma foi confirmada.
        * 4 - Repetir a operação pressionando a tecla Esc e verificar se a mesmafoi cancelada.
        */
        QUnit.test("Editar elemento", function(assert){
            testEditElement(assert);
        });


        Project.initDefault(); //retorna ao valores padrões
        /**
        * Teste: Adicionar filho
        * @author João Victor Magela
        *
        * Verificar a adição de um item para um nó existente.
        * Passos:
        * 1 - Clica no botão adicionar filho de um elemento.
        * 2 - Pressionar a tecla Enter no campo e verificar se foi confirmada a operação.
        * 3 - Repetir a operação pressionando a tecla Tab e verificar se a mesma foi confirmada.
        * 4 - Repetir a operação pressionando a tecla Esc e verificar se a mesma foi cancelada.
        */
        QUnit.test("Adicionar filho", function(assert){
            _testAddChild(assert);
        });

        /**
        * Teste: Remover Elemento
        * @author João Victor Magela
        *
        * Verificar se, ao excluir um item, seus filhos também são removidos.
        * Passos:
        * 1 - Clicar no botão de remoção de um elemento.
        * 2 - Verificar se os filhos foram removidos.
        */
        QUnit.test("Remover Elemento", function(assert){
            _testRemoveElement(assert);
        });

        /**
        * Teste: Remover filhos selecionados
        * @author João Victor Magela
        *
        * Verificar a remoção dos itens selecionados de um nó existente.
        * Passos:
        * 1 - Selecionar os itens a serem removidos.
        * 2 - Clicar no botão de remover filhos selecionados do pai.
        * 3 - Verificar se os itens foram removidos.
        */
        QUnit.test("Remover filhos selecionados", function(assert){
            _testRemoveChidrenSelected(assert);
        });

        Project.initDefault(); //retorna ao valores padrões
        /**
        * Teste: Inserir dados
        * @author João Victor Magela
        *
        * Verificar se a requisição e passagem dos dados é feita com sucesso.
        * Passos:
        * 1 - Selecionar os itens da árvore com filhos.
        * 2 - Fazer uma requisição AJAX com uma url/expressão inválida.
        * 3 - Fazer uma requisição AJAX com uma url/expressão válida.
        * 4 - Verificar se os dados foram passados para os filhos.
        */
        QUnit.test("Inserir dados", function(assert){
            _testInsertData(assert);
        });

        Project.initDefault(); //retorna ao valores padrões

        QUnit.module("Interface Concreta");
        /**
        * Teste: Alterar Tipo do Elemento
        * @author João Victor Magela
        *
        * Verificar se a operação de mudança do elemento é feita com sucesso.
        * Passos:
        * 1 - Alterar o tipo do elemento.
        * 2 - Verificar se a operação foi feita com sucesso.
        */
        QUnit.test("Alterar tipo do elemento", function(assert){
            _testChangeElement(assert);
        });

    };

    return {
        /**
         * Método responsável por obter o template base dos elementos.
         * @method initRenderElements
         * @author João Victor Magela
         * @static
         */
        initRenderElements: function() {
            panelBase = $('#panel-base').html();
        },

        /**
         * Método responsável por definir as ações do botão para a raiz da TreeView (Não existe tal funcionalidade no plugin)
         * @method commandsRootTree
         * @author João Victor Magela
         * @static
         */
        commandsRootTree: function() {
            $("#btn-root-add").click(function(e) {
                //cria um novo objeto
                var newItem = new Object();
                newItem.text = "Novo Item";
                newItem.state = new Object();
                newItem.state.added = true;
                newItem.state.disabled = true;
                newItem.nodeId = globalTree.nodes.length;
                newItem.id = globalTree.setId();
                newItem.selectable = false;
                
                //insere como filho do nó corrente
                globalTree.tree.push(newItem);

                //insere a fila de nós
                globalTree.nodes.push(newItem);

                $('#tree').treeview('addElement', [ newItem , { silent: true } ]);
            });

            $("#btn-root-removeall").click(function(e){
                var ids = [];
                for(var i=0; i<globalTree.tree.length; i++){
                    if(globalTree.tree[i].state.checked) ids = globalTree.getChidrenNode(globalTree.tree[i], ids);
                }

                globalTree.removeElements(ids);
                
                $("#tree").treeview('removeElements', [ ids , { silent: true } ]);
                
                globalTree.$element.empty().append(globalTree.$wrapper.empty());
                globalTree.buildTree(globalTree.tree, 0);
                globalTree.$element.trigger('treeRender', $.extend(true, {}, globalTree));
            })
        },

        /**
         * Método responsável por renderizar a TreeView e a partir disso atualizar toda a aplicação.
         * @method renderTree
         * @author João Victor Magela
         * @param {Object} data Instancia do plugin BootstrapTreeView.
         * @static
         */
        renderTree: function(data){
            var listItens = [];
            globalTree = data;

            concreteInterfaceObj.cleanConcreteInterface();
            
            $("#prototype").empty();
            for(var i=0; i<data.tree.length; i++){
                $("#prototype").append(_renderConcreteInterface(data.tree[i]));
            }

            Code.showAbstractInterfaceCode(data);
            Code.showConcreteInterfaceCode();
            
            UIEvents.resizeBox();
            UIEvents.setDraggable();

            $('.carousel').carousel();
            Project.saveWebStorage();
        },

        testsTreeView: testsTreeView
    }
}();