/**
 * Classe responsável pelos métodos de renderização do Preview.
 *
 * @class Preview
 * @author João Victor Magela
 * @constructor
 */
var Preview = function () {
    /**
     * Método responsável por obter o valor associado a um elemento concreto (através do bind ou inserido manualmente)
     * @method _getValue
     * @author João Victor Magela
     * @param {Object} node Elemento abstrato contendo informações.
     * @param {Object} element Elemento concreto com propriedades atribuidas pelo usuário
     * @param {boolean} isBind Determina se o valor deve ser obtido do bind ou não.
     * @param {Object} attr Atributo no qual deseja-se obter o valor.
     * @param {Numeber} index Índice onde se deve obter os dados.
     * @return Os valores associados ao elemento concreto.
     */
    var _getValue = function(node, element, isBind, attr, index) {
        var value = "";
        if(node.$data && (element[attr] == "$bind" || element[attr].indexOf("$data") > -1)){
            var data = [];
            if(index == undefined ){
                $data = node.$data;

            } else if(node.$data[index]) {
                $data = node.$data[index];
            }

            try {

                var strEval = isBind ? node.bind : element[attr];
                value = eval(strEval) !== false ? eval(strEval) : element[attr]; 

            }catch(error){
                value = element[attr];
            }
        }else{
            value = element[attr];
        }

        return value;
    };

    /**
     * Metodo responsável por renderizar um DIV no preview.
     * @method _renderDiv
     * @author João Victor Magela
     * @param {Object} node Elemento abstrado com valores associados ao elemento concreto
     * @param {Object} element Elemento concreto com propriedades atribuidas pelo usuário
     * @param {Numeber} index Índice onde se deve obter os dados.
     * @return O objeto jQuery representado a DIV.
     */
    var _renderDiv = function(node, element, index) {
        var value = _getValue(node, element, true, "value", index);
        return $('<div />')
            .append(value)
            .addClass(element.class ? element.class : "")
            .attr('style', element.style);
    };

    /**
     * Metodo responsável por renderizar um Parágrafo no preview.
     * @method _renderParagraph
     * @author João Victor Magela
     * @param {Object} node Elemento abstrado com valores associados ao elemento concreto
     * @param {Object} element Elemento concreto com propriedades atribuidas pelo usuário
     * @param {Numeber} index Índice onde se deve obter os dados.
     * @return O objeto jQuery representado o Parágrafo.
     */
    var _renderParagraph = function(node, element, index) {
        var value = _getValue(node, element, true, "value", index);
        return $('<p />').append(value)
                .addClass(element.class ? element.class : "")
                .attr('style', element.style);
    };

    /**
     * Metodo responsável por renderizar um Título no preview.
     * @method _renderHeader
     * @author João Victor Magela
     * @param {Object} node Elemento abstrado com valores associados ao elemento concreto
     * @param {Object} element Elemento concreto com propriedades atribuidas pelo usuário
     * @param {Numeber} index Índice onde se deve obter os dados.
     * @return O objeto jQuery representado o Parágrafo.
     */
    var _renderHeader = function(node, element, index) {
        var value = _getValue(node, element, true, "value", index);

        return $('<'+element.headerTag+' />')
                .append(value)
                .addClass(element.class ? element.class : "")
                .attr('style', element.style);
    };

    /**
     * Metodo responsável por renderizar um DIV no preview.
     * @method _renderLink
     * @author João Victor Magela
     * @param {Object} node Elemento abstrado com valores associados ao elemento concreto
     * @param {Object} element Elemento concreto com propriedades atribuidas pelo usuário
     * @param {Numeber} index Índice onde se deve obter os dados.
     * @return O objeto jQuery representado o Título.
     */
    var _renderLink = function(node, element, index) {
        var value = _getValue(node, element, true, "value", index);
        var href = _getValue(node, element, false, "href", index);

        return $('<a />')
            .append(value)
            .attr('href', href)
            .addClass(element.class ? element.class : "")
            .attr('style', element.style);
    };

    /**
     * Metodo responsável por renderizar um Label no preview.
     * @method _renderLabel
     * @author João Victor Magela
     * @param {Object} node Elemento abstrado com valores associados ao elemento concreto
     * @param {Object} element Elemento concreto com propriedades atribuidas pelo usuário
     * @param {Numeber} index Índice onde se deve obter os dados.
     * @return O objeto jQuery representado o Label.
     */
    var _renderLabel = function(node, element, index) {
        var value = _getValue(node, element, true, "value", index);

        return $('<label />')
                .append(value)
                .addClass(element.class ? element.class : "")
                .attr('style', element.style);
    };

    /**
     * Metodo responsável por renderizar um Span no preview.
     * @method _renderSpan
     * @author João Victor Magela
     * @param {Object} node Elemento abstrado com valores associados ao elemento concreto
     * @param {Object} element Elemento concreto com propriedades atribuidas pelo usuário
     * @param {Numeber} index Índice onde se deve obter os dados.
     * @return O objeto jQuery representado o Span.
     */
    var _renderSpan = function(node, element, index) {
        var value = _getValue(node, element, true, "value", index);

        return $('<span />').append(value)
                .addClass(element.class ? element.class : "")
                .attr('style', element.style);
    };

    /**
     * Metodo responsável por renderizar uma Lista no preview.
     * @method _renderList
     * @author João Victor Magela
     * @param {Object} node Elemento abstrado com valores associados ao elemento concreto
     * @param {Object} element Elemento concreto com propriedades atribuidas pelo usuário
     * @param {Numeber} index Índice onde se deve obter os dados.
     * @return O objeto jQuery representado a Lista.
     */
    var _renderList = function(node, element, index) {
        return $('<'+ element.listTag +' />')
            .addClass(element.class ? element.class : "")
            .attr('style', element.style)
            .attr('style', element.style);
    };

    /**
     * Metodo responsável por renderizar um Item da Lista no preview.
     * @method _renderListItem
     * @author João Victor Magela
     * @param {Object} node Elemento abstrado com valores associados ao elemento concreto
     * @param {Object} element Elemento concreto com propriedades atribuidas pelo usuário
     * @param {Numeber} index Índice onde se deve obter os dados.
     * @return O objeto jQuery representado o Item da Lista.
     */
    var _renderListItem = function(node, element, index) {
        var value = _getValue(node, element, true, "value", index);
        
        return $('<li />').append(value)
                .addClass(element.class ? element.class : "")
                .attr('style', element.style);
    };

    /**
     * Metodo responsável por renderizar uma Imagem no preview.
     * @method _renderImage
     * @author João Victor Magela
     * @param {Object} node Elemento abstrado com valores associados ao elemento concreto
     * @param {Object} element Elemento concreto com propriedades atribuidas pelo usuário
     * @param {Numeber} index Índice onde se deve obter os dados.
     * @return O objeto jQuery representado o Imagem.
     */
    var _renderImage = function(node, element, index) {
        var src = _getValue(node, element, true, "src", index);
        var alt = _getValue(node, element, false, "alt", index);
        
        return $('<img />')
            .attr('src', src)
            .attr('alt', alt)
            .addClass(element.class ? element.class : "")
            .attr('style', element.style);
    };

    /**
     * Metodo responsável por renderizar uma Galeria de Imagens no preview.
     * @method _renderCarousel
     * @author João Victor Magela
     * @param {Object} node Elemento abstrado com valores associados ao elemento concreto
     * @param {Object} element Elemento concreto com propriedades atribuidas pelo usuário
     * @param {Numeber} index Índice onde se deve obter os dados.
     * @return O objeto jQuery representado a Galeria de Imagens.
     */
    var _renderCarousel = function(node, element, index) {
        var carousel = $(getTemplate('carousel-item').clone().html());

        carousel.find('.carousel-inner').empty();
        carousel.find('.carousel-control').attr('href', '#preview-carousel');

        return carousel
            .attr('id', "preview-carousel")
            .addClass("carousel slide " + element.class ? element.class : "")
            .attr('style', element.style);
    };

    /**
     * Metodo responsável por renderizar um Item da Galeria de Imagens no preview.
     * @method _renderCarouselItem
     * @author João Victor Magela
     * @param {Object} node Elemento abstrado com valores associados ao elemento concreto
     * @param {Object} element Elemento concreto com propriedades atribuidas pelo usuário
     * @param {Numeber} index Índice onde se deve obter os dados.
     * @return O objeto jQuery representado o Item da Galeria de Imagens.
     */
    var _renderCarouselItem = function(node, element, index) {
        var src = _getValue(node, element, true, "value", index);

        var carouselItem = $(
            '<div class="item">\
                <img src="'+src+'" alt="Carousel Item" />\
            </div>');
        
        return carouselItem
            .addClass("item " + element.class ? element.class : "")
            .attr('style', element.style);
    };

    /**
     * Metodo responsável por renderizar um Menu no preview.
     * @method _renderNavigation
     * @author João Victor Magela
     * @param {Object} node Elemento abstrado com valores associados ao elemento concreto
     * @param {Object} element Elemento concreto com propriedades atribuidas pelo usuário
     * @param {Numeber} index Índice onde se deve obter os dados.
     * @return O objeto jQuery representado o Menu.
     */
    var _renderNavigation = function(node, element, index) {
        var value = _getValue(node, element, true, "value", index);
        var navigation = $(getTemplate('navigation-item').clone().html());
        navigation.find('.collapse').remove();
        navigation.find('.navbar-brand').text(value);

        
        return navigation
                .addClass("navbar navbar-default " + element.class ? element.class : "")
                .attr('style', element.style);
    };

    /**
     * Metodo responsável por renderizar uma Lista de Navegação no preview.
     * @method _renderNavigationList
     * @author João Victor Magela
     * @param {Object} node Elemento abstrado com valores associados ao elemento concreto
     * @param {Object} element Elemento concreto com propriedades atribuidas pelo usuário
     * @param {Numeber} index Índice onde se deve obter os dados.
     * @return O objeto jQuery representado a Lista de Navegação.
     */
    var _renderNavigationList = function(node, element, index) {
        var navigation = $(getTemplate('navigation-item').clone().html());
        var navigationList = navigation.find('.collapse');
        navigationList.find('ul').empty();
        
        return navigationList
                .addClass("collapse navbar-collapse " + element.class ? element.class : "")
                .attr('style', element.style);
    };

    /**
     * Metodo responsável por renderizar um Item da Lista de Navegação no preview.
     * @method _renderNavigationListItem
     * @author João Victor Magela
     * @param {Object} node Elemento abstrado com valores associados ao elemento concreto
     * @param {Object} element Elemento concreto com propriedades atribuidas pelo usuário
     * @param {Numeber} index Índice onde se deve obter os dados.
     * @return O objeto jQuery representado o Item da Lista de Navegação.
     */
    var _renderNavigationListItem = function(node, element, index) {
        var value = _getValue(node, element, true, "value", index);
        var listItem = $('<li><a href=#>'+value+'</a></li>');
        
        return listItem
                .addClass(element.class ? element.class : "")
                .attr('style', element.style);
    };

    /**
     * Metodo responsável por renderizar um Formulário no preview.
     * @method _renderForm
     * @author João Victor Magela
     * @param {Object} node Elemento abstrado com valores associados ao elemento concreto
     * @param {Object} element Elemento concreto com propriedades atribuidas pelo usuário
     * @param {Numeber} index Índice onde se deve obter os dados.
     * @return O objeto jQuery representado o Formulário.
     */
    var _renderForm = function(node, element, index) {
        var value = _getValue(node, element, true, "value", index);
        return $('<form />')
                .attr('action', value)
                .addClass(element.class ? element.class : "")
                .attr('style', element.style);
    };

    /**
     * Metodo responsável por renderizar um Campo Texto no preview.
     * @method _renderInputText
     * @author João Victor Magela
     * @param {Object} node Elemento abstrado com valores associados ao elemento concreto
     * @param {Object} element Elemento concreto com propriedades atribuidas pelo usuário
     * @param {Numeber} index Índice onde se deve obter os dados.
     * @return O objeto jQuery representado o Campo Texto.
     */
    var _renderInputText = function(node, element, index) {
        return $('<input />')
                .attr('type', 'text')
                .addClass(element.class ? element.class : "")
                .attr('style', element.style);
    };

    /**
     * Metodo responsável por renderizar um Textarea no preview.
     * @method _renderInputTextarea
     * @author João Victor Magela
     * @param {Object} node Elemento abstrado com valores associados ao elemento concreto
     * @param {Object} element Elemento concreto com propriedades atribuidas pelo usuário
     * @param {Numeber} index Índice onde se deve obter os dados.
     * @return O objeto jQuery representado o Textarea.
     */
    var _renderInputTextarea = function(node, element, index) {
        return $('<textarea />')
                .addClass(element.class ? element.class : "")
                .attr('style', element.style);
    };

    /**
     * Metodo responsável por renderizar um Radiobox ou Checkbox no preview.
     * @method _renderInputRadioCheck
     * @author João Victor Magela
     * @param {Object} node Elemento abstrado com valores associados ao elemento concreto
     * @param {Object} element Elemento concreto com propriedades atribuidas pelo usuário
     * @param {Numeber} index Índice onde se deve obter os dados.
     * @return O objeto jQuery representado o Radiobox ou Checkbox.
     */
    var _renderInputRadioCheck = function(node, element, index) {
        var value = _getValue(node, element, true, "text", index);
        return $('<input />')
            .attr('type', element.tagRadio)
            .attr('name', element.name.replaceAll(" ", "") + element.tagRadio)
            .addClass(element.class ? element.class : "")
            .attr('style', element.style)
            .after('<label>'+value+'</label>');
    };

    /**
     * Metodo responsável por renderizar um Combobox no preview.
     * @method _renderInputSelect
     * @author João Victor Magela
     * @param {Object} node Elemento abstrado com valores associados ao elemento concreto
     * @param {Object} element Elemento concreto com propriedades atribuidas pelo usuário
     * @param {Numeber} index Índice onde se deve obter os dados.
     * @return O objeto jQuery representado o Combobox.
     */
    var _renderInputSelect = function(node, element, index) {
        return $('<select />')
                .addClass(element.class ? element.class : "")
                .attr('style', element.style);
    };

    /**
     * Metodo responsável por renderizar uma Opção do Combobox no preview.
     * @method _renderInputOption
     * @author João Victor Magela
     * @param {Object} node Elemento abstrado com valores associados ao elemento concreto
     * @param {Object} element Elemento concreto com propriedades atribuidas pelo usuário
     * @param {Numeber} index Índice onde se deve obter os dados.
     * @return O objeto jQuery representado o Opção do Combobox.
     */
    var _renderInputOption = function(node, element, index) {
        var value = _getValue(node, element, true, "text", index);
        return $('<option />')
                .text(value)
                .addClass(element.class ? element.class : "")
                .attr('style', element.style);
    };

    /**
     * Metodo responsável por renderizar um Botão no preview.
     * @method _renderInputButton
     * @author João Victor Magela
     * @param {Object} node Elemento abstrado com valores associados ao elemento concreto
     * @param {Object} element Elemento concreto com propriedades atribuidas pelo usuário
     * @param {Numeber} index Índice onde se deve obter os dados.
     * @return O objeto jQuery representado o Botão.
     */
    var _renderInputButton = function(node, element, index) {
        var value = _getValue(node, element, true, "value", index);
        return $('<button />')
                .text(element.text)
                .addClass(element.class ? element.class : "")
                .attr('style', element.style);
    };

    /**
     * Método responsável por renderizar um elemento de acordo com seu tipo.
     * @method _renderElement
     * @author João Victor Magela
     * @param {Object} node Elemento abstrado com valores associados ao elemento concreto
     * @param {Object} element Elemento concreto com propriedades atribuidas pelo usuário
     * @param {Numeber} index Índice onde se deve obter os dados.
     * @return jQuery do elemento concreto.
     */
    var _renderElement = function(node, element, index) {
        switch(element.typeElement){
            case 'div': return _renderDiv(node, element, index);
            case 'p': return _renderParagraph(node,element, index);
            case 'header': return _renderHeader(node,element, index);
            case 'a': return _renderLink(node,element, index);
            case 'span': return _renderSpan(node,element, index);
            case 'label': return _renderLabel(node,element, index);
            case 'image': return _renderImage(node,element, index);
            case 'carousel': return _renderCarousel(node,element, index);
            case 'carousel-item': return _renderCarouselItem(node,element, index);
            case 'navigation': return _renderNavigation(node,element, index);
            case 'navigation-list': return _renderNavigationList(node,element, index);
            case 'navigation-list-item': return _renderNavigationListItem(node,element, index);
            case 'list': return _renderList(node,element, index);
            case 'list-item': return _renderListItem(node,element, index);
            case 'form': return _renderForm(node,element, index);
            case 'input-text': return _renderInputText(node,element, index);
            case 'input-textarea': return _renderInputTextarea(node,element, index);
            case 'input-radio': return _renderInputRadioCheck(node,element, index);
            case 'input-select': return _renderInputSelect(node,element, index);
            case 'input-option': return _renderInputOption(node,element, index);
            case 'input-button': return _renderInputButton(node,element, index);
            default: return "";
        }
    };

    /**
     * Metodo responsável por obter o índice onde serão buscadas as informações para renderização do elemento concreto.
     * @method _getCurrentIndex
     * @author João Victor Magela
     * @param {Object} rootNode Elemento abstrato que é pai de um determinado elemento abstrado.
     * @param {} parentIndex Índice associado aos dados do pai
     * @param {} loopIndex Índice associado ao loop corrente
     * @return parentIndex
     */
    var _getCurrentIndex = function(rootNode, parentIndex, loopIndex) {
        if(!rootNode) return undefined;

        if(rootNode.datasource){
            return _.any(rootNode.$data) ? loopIndex : undefined; //Pega o index que vem do pai se for um array
        }

        return parentIndex;
    }   

    /**
     * Método responsável por renderizar o preview.
     * @method _renderPreview
     * @author João Victor Magela
     * @param {Array} nodes Conjunto de Elementos abstratos
     * @param {jQuery} root Local onde serão renderizados os elementos.
     * @param {Object} rootNode Nó corrente.
     * @param {Number} index Índice onde se deve obter os dados para renderização do elemento.
     * @return O preview renderizado.
     */
    var _renderPreview = function(nodes, root, rootNode, index) {
        if(!root){
            root = $("#preview"); 
        }

        
        var numData = !rootNode || !rootNode.datasource || !rootNode.$data || !_.any(rootNode.$data) ? 1 : rootNode.$data.length;
        
        for(var j=0; j<numData; j++){
            for(var i=0; i<nodes.length; i++){
                var currentIndex = _getCurrentIndex(rootNode, index, j);
                
                var element = concreteInterfaceObj.findItem(nodes[i]);    
                var rendered = _renderElement(nodes[i], element, currentIndex);

                if(nodes[i].nodes){
                    _renderPreview(nodes[i].nodes, rendered, nodes[i], currentIndex);
                }

                switch(element.typeElement){
                    case 'navigation-list': root.find('.container-fluid').append(rendered); break;
                    case 'navigation-list-item': root.find('ul').append(rendered); break;
                    case 'carousel-item': 
                            root.addClass('carousel slide').find('.carousel-inner').append(rendered.addClass("item")); 
                            root.find('.item').first().addClass('active');
                            break;
                    case 'input-radio': root.append(rendered).append('<label> '+ element.text +'</label>'); break;
                    default: root.append(rendered); break;
                }
            }    
        }

        return root;
    };

    /**
     * Métod responsável por iniciar a operação de rendereização do preview.
     * @method _runPreview
     * @author João Victor Magela
     */
    var _runPreview = function(){
        _renderPreview(globalTree.tree);
    };

    /**
     * Método responsável por executar os testes
     * @author João Victor Magela.
     * @method tests
     * @static 
     */
    var tests = function(){
        QUnit.module("Preview");

        /**
        * Teste: Exibir Preview
        * @author João Victor Magela
        *
        * Verificar se está captando os valores de forma correta.
        * Passos:
        *1 - Testar o método _getValue.
        *2 - Verificar se o valor captado é o esperado.
        */
        QUnit.test("Exibir Preview", function(assert){
            assert.expect(2);
            var done = assert.async();

            Project.initCustom(Code.times);
            Code.initAbstract();
            setTimeout(function() {
                Code.initConcrete();
                
                globalTree.$element.empty().append(globalTree.$wrapper.empty());
                globalTree.buildTree(globalTree.tree, 0);
                globalTree.$element.trigger('treeRender', $.extend(true, {}, globalTree));


                var node = globalTree.nodes[3]; // seleciona o nó "panel-title"
                var element = concreteInterfaceObj.concreteInterfaceItems[3];
                var value = _getValue(node, element, true, "value", 0);
                assert.equal(value, "Time J", "Preview capitou o valor corretamente.");
                
                node = globalTree.nodes[8];
                value = _getValue(node, element, true, "value", 0);
                assert.equal(value, 0, "Preview captou valor igual a 0.");
                done();
            }, 1000);
        })
    }

    return {

        /**
         * Método responsável por criar a opção Tab do Bootstrap
         * @method tabBootstrap
         * @author João Victor Magela
         * @static
         */
        tabBootstrap: function(){
            $('#tab-prototype a').click(function (e) {
              e.preventDefault();

              $(this).tab('show');
              if($(this).data('mode') == 'preview'){
                $("#preview").empty();
                _runPreview();
              }
            });
        },

        tests: tests
    }
}();