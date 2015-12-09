/**
 * Classe responsável pelos métodos de instalação das funcionalidades Draggable e Resize do jQuery UI.
 *
 * @class UIEvents
 * @author João Victor Magela
 * @constructor
 */
var UIEvents = function () {
    "use strict";
    /**
     * Método responsável por selecionar o pai de um determinado elemento.
     * @method _getParent
     * @author João Victor Magela
     * @param {jQuery} el Elemento concreto no qual deseja-se obter o pai.
     * @return O pai do elemento concreto. Caso não tenha um pai, retorna o protótipo.
     */
    var _getParent = function (el) {
        return el.parents('.panel-resize').length > 0 ? el.parents('.panel-resize').first().children('.panel-body') : $('#prototype');
    };

    /**
     * Método responsável por obter o handle de um determinado elemento concreto.
     * @method _getHandle
     * @author João Victor Magela
     * @param {jQuery} el Elemento concreto no qual se deseja obter o handle
     * @return O handle do elemento.
     */
    var _getHandle = function (el) {
        return el.children('.panel-heading').find('.btn-handle');
    };

    /**
     * Método responsável por atualizar a posição de um determinado elemento.
     * @method _refreshPosition
     * @author João Victor Magela
     * @param {jQuery} el Elemento no qual deseja-se atualizar a posição.
     */
    var _refreshPosition = function (el) {
        var parent = _getParent(el);
        var id = el.data('id');
        var node = globalTree.findNodeById(id);
        var item = concreteInterfaceObj.findItem(node);
        item.style = el.attr('style');
        concreteInterfaceObj.replaceItem(item);
    };

    /**
     * Método responsável por obter a largura de um elemento.
     * @method _getWidth
     * @author João Victor Magela
     * @param {jQuery} el Elemento no qual deseja-se obter a largura
     * @return A largura do elemento concreto.
     */
    var _getWidth = function(el) {
        var parent = el.parents('.panel-resize').length > 0 ? el.parents('.panel-resize').first() : $('#prototype');
        var widthParent = parent.width();
        //var paddingParent = parseInt(parent.css('padding-right'));

        //padding = 15px;
        //Border = 1px;

        if(parent.prop('id') == "prototype") return widthParent - 15;
        return widthParent - 30;
    };

    /**
     * Método responsável por determinar a altura mínima de um elemento de acordo com seu conteúdo interno.
     * @method _setMinHeight
     * @author João Victor Magela
     * @param {jQuery} el Elemento concreto no qual deseja-se determinar a altura mínima
     * @return A altura mínima para o elemento.
     */
    var _setMinHeight = function(el) {
        var children = el.children('.panel-body').children('.panel-resize');
        var height = 0;

        for(var i=0; i < children.length; i++) height += $(children[i]).height() + 61; 

        return height == 0 ? 200 : height; 
    };

    /**
     * Método responsável por atualizar o tamanho do elemento concreto.
     * @method _refreshResize
     * @author João Victor Magela
     * @param {jQuery} el Elemento concreto no qual deseja-se atualzar a largura.
     */
    var _refreshResize = function(el){
        var parent = el.parents('.panel-resize').length > 0 ? el.parents('.panel-resize').first() : $('#prototype');
        el.resizable('option', 'maxWidth', _getWidth(el));
        el.resizable('option', 'minWidth', _setMinHeight(el));
        
        var id = el.data('id');
        var node = globalTree.findNodeById(id);
        var item = concreteInterfaceObj.findItem(node);
        item.style = el.attr('style');
        item.componentWidth = el.width() + 'px';
        concreteInterfaceObj.replaceItem(item);

        var children = el.children('.panel-body').children('.panel-resize');
        for(var i=0; i<children.length; i++){
            var child = $(children[i]);
            _refreshResize(child);
            if(child.width() > el.width()) child.removeAttr('style');
        }
    };

    /**
     * Método responsável por executar os testes
     * @author João Victor Magela.
     * @method tests
     * @static 
     */
    var tests = function(){
        QUnit.module("Interface Concreta", {
            setup: function(){
                Project.initDefault();
            }
        });
        /**
        * Teste: Arrastar elemento
        * @author João Victor Magela
        *
        * Verificar se, ao arrastar um elemento, o mesmo respeita as regras de negócio.
        * Passos:
        * 1 - Alterar o tipo do elemento.
        * 2 - Verificar se a operação foi feita com sucesso.
        */
        QUnit.test("Arrastar elemento", function(assert){
            Project.initDefault();
            // Passo 1
            var element1 = concreteInterfaceObj.concreteInterfaceItems[0]; 
            var element2 = concreteInterfaceObj.concreteInterfaceItems[1];
            
            var panel1 = $('.panel-drag[data-id='+ element1.id +']');
            var panel2 = $('.panel-drag[data-id='+ element2.id +']');
            
            assert.equal(_getParent(panel1).attr('id'), "prototype", 'Pai do elemento concreto "'+ element1.name+'" é o protótipo.');
            assert.equal(_getParent(panel2).parent().data('id'), element1.id, 'Pai do elemento concreto "'+ element2.name+'" é o '+element1.name+'.');

            //Passo 2
            //Arrasta o panel1 para cima e para direita
            panel1.children('.panel-heading').find('.btn-handle').simulate("drag", {
                dx: 100,
                dy: -100
            });
            var prototypePositions = $("#prototype").offset();
            prototypePositions.width = $("#prototype").width();

            var element1Positions = panel1.offset();
            element1Positions.width = panel1.width();
            element1Positions.height = panel1.height();
            assert.ok(
                //canto superior esquerdo do pane11 abaixo do protótipo
                prototypePositions.top < element1Positions.top && 
                //Canto esquerdo do Panel1 a antes do canto esquerdo do protótipo
                prototypePositions.left + prototypePositions.width < element1Positions.left + element1Positions.width, 
                'Arrastou o elemento "'+element1.name+'" e não saiu do protótipo.'
            );

            //Arrasta o panel2 para baixo e para direita
            panel2.children('.panel-heading').find('.btn-handle').simulate("drag", {
                dx: 200,
                dy: -150
            });

            var element2Positions = panel2.offset();
            element2Positions.width = panel2.width();
            element2Positions.height = panel2.height();

            element1Positions.top += 30;
            assert.ok(
                //canto superior esquerdo do pane12 abaixo do panel1
                element1Positions.top < element2Positions.top && 
                //canto inferior esquerdo do pane12 acima do panel1
                element1Positions.top + element1Positions.height >= element2Positions.top + element2Positions.height &&
                //canto esquerdo do pane12 a frente do panel1
                element1Positions.left < element2Positions.left && 
                //Canto direito do Panel1 a frente canto direito do panel2
                element1Positions.left + element1Positions.width >= element2Positions.left + element2Positions.width, 
                'Arrastou o elemento "'+element2.name+'" e não saiu do "'+element1.name+'".'
            );
        });


        /**
        * Teste: Redimensionar elemento
        * @author João Victor Magela
        *
        * Verificar se, ao redimensionar um elemento, o mesmo respeita as regras de negócio.
        * Passos:
        * 1 - Redimensionar e verificar se não está menor que a largura mínima.
        * 2 - Redimensionar e verificar se a altura é superior a soma da altura dos filhos.
        */
        QUnit.test("Redimensionar elemento", function(assert){
            Project.initDefault();
            // Passo 1
            var element1 = concreteInterfaceObj.concreteInterfaceItems[0]; 
            var element2 = concreteInterfaceObj.concreteInterfaceItems[1];
            var element3 = concreteInterfaceObj.concreteInterfaceItems[2];
            
            console.log(concreteInterfaceObj.concreteInterfaceItems);
            var panel1 = $('.panel-drag[data-id='+ element1.id +']');
            var panel2 = $('.panel-drag[data-id='+ element2.id +']');
            var panel3 = $('.panel-drag[data-id='+ element3.id +']');

            
            var oldwidth = panel3.width();

            //Seleciona a lateral direita e arrasta pra esquerda
            panel3.children('.ui-resizable-e').simulate("mouseover").simulate("drag",{
                moves: 2,
                dx: -1000, //arrasta tudo pra esquerda
                dy: 0
            });

            assert.equal(panel3.css('width'), "200px", "Arrastou tudo para a esquerda e caiu parou na largura mínima");
            
            //Passo 2
            panel3.removeAttr('style'); //Volta a largura original
            
            //seleciona a borda de baixo e arrasta pra cima
            panel1.children('.ui-resizable-s').simulate("mouseover").simulate("drag",{
                moves: 2,
                dx: 0, //arrasta tudo pra esquerda
                dy: -500
            });

            assert.ok(panel1.height() > panel2.height(), "Altura do pai ainda é maior que a soma da altura dos filhos");
        })
    }

    return {
        /**
         * Método responsável por instalar o método Draggable do jQuery UI para os elementos concretos.
         * @method setDraggable
         * @author João Victor Magela
         * @static 
         */
        setDraggable: function () {
            $('#prototype .panel-resize').each(function(index, element) {
                var _this = $(this);
                $(this).draggable({
                    scroll: true,
                    containment: _getParent(_this),
                    handle: _getHandle(_this),
                    
                    /**
                     * Evento disparado ao fim do arraste. Atualiza a posição do elemento concreto.
                     *
                     * @event Parar arraste
                     */
                    stop: function (event, ui) {
                       _refreshPosition($(element)); 
                    }
                });
            });
        },

        /**
         * Método responsável por instalar o método Resize do jQuery UI para os elementos concretos.
         * @method resizeBox
         * @author João Victor Magela
         * @static
         */
        resizeBox: function() {

            $('#prototype .panel-resize').each(function(index, element) {
                $(this).resizable({
                    maxWidth: _getWidth($(element)),
                    minWidth: 200,
                    minHeight: _setMinHeight($(element)),
                    //handles: "e",
                    /**
                     * Evento disparado ao redimensionar um elemento. Atualiza a dimensão do mesmo.
                     *
                     * @event Redimensionar elemento
                     */
                    resize : function(event, ui) {
                        _refreshResize($(element));
                    }
                });
            })
        },

        tests: tests
    }
}();
