/**
 * Elemento concreto generalizado.
 * @class HTMLElement
 * @author João Victor Magela
 * @constructor
 * @param {Object} node Elemento abstrado contendo informações iniciais para o construtor.
 * @return O elemento concreto.
 */
var HTMLElement = function(node) {
   if(!node) return this;
   /**
    * @property id Identificador do Elemento.
    * @type {Number}
    */
    this.id = node.id;

    /**
    * @property name Nome do Elemento.
    * @type {string}
    */
    this.name = node.text;

    /**
    * @property value Valor associado ao Elemento.
    * @type {string}
    */
    this.value = node.bind ? "$bind" : undefined;

    /**
    * @property class Classes CSS associadas ao Elemento.
    * @type {string}
    */
    this.class = '';

    /**
    * @property typeElement tipo do elemento concreto.
    * @type {string}
    */
    this.typeElement = 'div';

    /**
    * @property html Objeto jQuery representado o HTML do elemento concreto.
    * @type {jQuery}
    */
    this.html = undefined;

    /**
    * @property tag Tag referente ao elemento concreto.
    * @type {string}
    */
    this.tag = undefined;

    return this;
};

/**
 * Método responsável por atualizar os valores de um HTMLElement.
 * @method updateAttr
 * @author João Victor Magela
 * @param {Object} attrs Objeto com os valores a serem atualizados.
 * @for HTMLElement
 */
HTMLElement.prototype.updateAttr = function(attrs) {
    for(var attr in attrs){
        this[attr] = attrs[attr];
    }
};

/**
 * Método responsável por obter o template de um elemento concreto.
 * @method getTemplate
 * @author João Victor Magela
 * @param {string} item Tipo do elemento concreto.
 * @for HTMLElement
 * @return {jQuery} Objeto jQuery com o HTML do elemento concreto. 
 */
HTMLElement.prototype.getTemplate = function(item){
    switch(item){
        case 'p':               return $('<div/>').append($(_.template($("#template-paragraph").html())()));
        case 'header':          return $('<div/>').append($(_.template($("#template-title").html())()));
        case 'a':               return $('<div/>').append($(_.template($("#template-link").html())()));
        case 'span':            return $('<div/>').append($(_.template($("#template-span").html())()));
        case 'label':           return $('<div/>').append($(_.template($("#template-label").html())()));
        case 'list-item':       return $('<div/>').append($(_.template($("#template-listitem").html())()));
        case 'img':             return $('<div/>').append($(_.template($("#template-img").html())()));
        case 'carousel-item':   return $('<div/>').append($(_.template($("#template-carouselitem").html())()));
        case 'navigation-item': return $('<div/>').append($(_.template($("#template-navigationitem").html())()));
        case 'input-text':      return $('<div/>').append($(_.template($("#template-inputtext").html())()));
        case 'input-textarea':  return $('<div/>').append($(_.template($("#template-inputtextarea").html())()));
        case 'input-radio':     return $('<div/>').append($(_.template($("#template-inputradio").html())()));
        case 'input-option':    return $('<div/>').append($(_.template($("#template-inputoption").html())()));
        case 'input-button':    return $('<div/>').append($(_.template($("#template-button").html())()));
        default:                return undefined;
    }
}

/**
 * Elemento concreto Div.
 * @class Div
 * @constructor
 * @extends HTMLElement
 * @param {Object} node Elemento abstrado contendo informações iniciais para o construtor.
 * @return HTMLElement com as informações padrões de um Div HTMLElement com as informações padrões de um Div
 */
var Div = function(node) {
    var htmlElement = new HTMLElement(node);
    
    htmlElement.typeElement = 'div';
    htmlElement.value = node.bind ? "$bind" : "";
    
    return htmlElement;
};

/**
 * Elemento concreto Paragraph.
 * @class Paragraph
 * @constructor
 * @extends HTMLElement
 * @param {Object} node Elemento abstrado contendo informações iniciais para o construtor.
 * @return HTMLElement com as informações padrões de um Parágrafo.
 */
var Paragraph = function (node) {
    var htmlElement = new HTMLElement(node);
    /**
    * @property tag Tag referente ao elemento concreto.
    * @type {string}
    */
    htmlElement.tag = 'p';
    htmlElement.value = node.bind ? "$bind" : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas laoreet, sem sit amet tempor luctus, erat lorem cursus turpis, nec condimentum est leo eu massa. Integer tincidunt sodales enim in interdum. Nam ac elit enim. Mauris neque quam, viverra eu magna quis, suscipit fermentum ligula. Vestibulum tempor tortor ac lacus egestas lobortis. Praesent placerat porttitor ante, a maximus tellus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.";
    htmlElement.typeElement = 'p';
    htmlElement.html = htmlElement.getTemplate('p');
    return htmlElement;
};

/**
 * Elemento concreto Header.
 * @class Header
 * @constructor
 * @extends HTMLElement
 * @param {Object} node Elemento abstrado contendo informações iniciais para o construtor.
 * @return HTMLElement com as informações padrões de um Título.
 */
var Header = function (node) {
    var htmlElement = new HTMLElement(node);
    
    htmlElement.tag = 'h1';
    htmlElement.typeElement = 'header';
    htmlElement.value = node.bind ? "$bind" : "Valor de exemplo";
    htmlElement.html = htmlElement.getTemplate('header');

    /**
    * @property headerTag Determina qual a tag do título (h1-h6).
    * @type {string}
    * @default "h1"
    */
    htmlElement.headerTag = 'h1';

    return htmlElement;
};

/**
 * Elemento concreto Link.
 * @class Link
 * @constructor
 * @extends HTMLElement
 * @param {Object} node Elemento abstrado contendo informações iniciais para o construtor.
 * @return HTMLElement com as informações padrões de um Link.
 */
var Link = function (node) {
    var htmlElement = new HTMLElement(node);
    
    htmlElement.tag = 'a';
    htmlElement.typeElement = 'a';
    htmlElement.value = node.bind ? "$bind" : "Valor de exemplo";
    htmlElement.html = htmlElement.getTemplate('a');

    /**
    * @property href Caminho do link.
    * @type {string}
    */
    htmlElement.href = '#';
    
    return htmlElement;
};

/**
 * Elemento concreto Span.
 * @class Span
 * @constructor
 * @extends HTMLElement
 * @param {Object} node Elemento abstrado contendo informações iniciais para o construtor.
 * @return HTMLElement com as informações padrões de um Span.
 */
var Span = function (node) {
    var htmlElement = new HTMLElement(node);
    
    htmlElement.tag = 'span';
    htmlElement.typeElement = 'span';
    htmlElement.value = node.bind ? "$bind" : "Texto de exemplo do span";
    htmlElement.html = htmlElement.getTemplate('span');

    return htmlElement;    
};

/**
 * Elemento concreto Label.
 * @class Label
 * @constructor
 * @extends HTMLElement
 * @param {Object} node Elemento abstrado contendo informações iniciais para o construtor.
 * @return HTMLElement com as informações padrões de um Label.
 */
var Label = function (node) {
    var htmlElement = new HTMLElement(node);
    
    htmlElement.tag = 'label';
    htmlElement.typeElement = 'label';
    htmlElement.value = node.bind ? "$bind" : "Texto de exemplo do label";
    htmlElement.html = htmlElement.getTemplate('label');

    return htmlElement;    
};

/**
 * Elemento concreto List.
 * @class List
 * @constructor
 * @extends HTMLElement
 * @param {Object} node Elemento abstrado contendo informações iniciais para o construtor.
 * @return HTMLElement com as informações padrões de uma Lista.
 */
var List = function (node) {
    var htmlElement = new HTMLElement(node);
    
    htmlElement.tag = 'ul';
    htmlElement.typeElement = 'list';
    
    /**
    * @property listTag Determina o tipo da lista("ul" ou "ol").
    * @type {string}
    */
    htmlElement.listTag = 'ul';

    return htmlElement;
};

/**
 * Elemento concreto ListItem.
 * @class ListItem
 * @constructor
 * @extends HTMLElement
 * @param {Object} node Elemento abstrado contendo informações iniciais para o construtor.
 * @return HTMLElement com as informações padrões de um item da Lista.
 */
var ListItem = function (node) {
    var htmlElement = new HTMLElement(node);
    
    htmlElement.tag = 'li';
    htmlElement.typeElement = 'list-item';
    htmlElement.value = node.bind ? "$bind" : "Item da lista";
    htmlElement.html = htmlElement.getTemplate('list-item');

    return htmlElement;
};

/**
 * Elemento concreto SimpleHtml.
 * @class SimpleHtml
 * @constructor
 * @extends HTMLElement
 * @param {Object} node Elemento abstrado contendo informações iniciais para o construtor.
 * @return HTMLElement com as informações padrões de um elemento HTML qualquer.
 */
var SimpleHtml = function (node) {
    var htmlElement = new HTMLElement(node);
    
    htmlElement.tag = '';
    htmlElement.value = '';
    htmlElement.typeElement = 'simple-html';

    /**
    * @property simpleHtmlTag Valor da tag referente ao elemento concreto.
    * @type {string}
    */
    htmlElement.simpleHtmlTag = '';

    return htmlElement;
};

/**
 * Elemento concreto ImageHtml.
 * @class ImageHtml
 * @constructor
 * @extends HTMLElement
 * @param {Object} node Elemento abstrado contendo informações iniciais para o construtor.
 * @return HTMLElement com as informações padrões de uma Imagem.
 */
var ImageHtml = function (node) {
    var htmlElement = new HTMLElement(node);
    
    htmlElement.tag = 'img';
    htmlElement.value = undefined;
    htmlElement.typeElement = 'image';
    htmlElement.html = htmlElement.getTemplate('img');

    /**
    * @property alt Texto alternativo para a imagem.
    * @type {string}
    */
    htmlElement.alt = 'Valor de Exemplo';

    /**
    * @property src Caminho físico da imagem.
    * @type {string}
    */
    htmlElement.src = node.bind ? "$bind" : "img/template-img.png";
    
    /**
    * @property width largura da imagem.
    * @type {string}
    */
    htmlElement.width = '';

    /**
    * @property height Altura da imagem.
    * @type {string}
    */
    htmlElement.height = '';

    return htmlElement;
};

/**
 * Elemento concreto Carousel.
 * @class Carousel
 * @constructor
 * @extends HTMLElement
 * @param {Object} node Elemento abstrado contendo informações iniciais para o construtor.
 * @return HTMLElement com as informações padrões de uma galeria de fotos.
 */
var Carousel = function (node) {
    var htmlElement = new HTMLElement(node);
    
    htmlElement.value = undefined;
    htmlElement.typeElement = 'carousel';

    /**
    * @property widget Determina a qual classe pertence elemento concreto.
    * @type {string}
    */
    htmlElement.widget = 'BootstrapCarousel';
    
    return htmlElement;
};

/**
 * Elemento concreto CarouselItem.
 * @class CarouselItem
 * @constructor
 * @extends HTMLElement
 * @param {Object} node Elemento abstrado contendo informações iniciais para o construtor.
 * @return HTMLElement com as informações padrões de um item da galeria de fotos.
 */
var CarouselItem = function (node) {
    var htmlElement = new HTMLElement(node);
    
    htmlElement.typeElement = 'carousel-item';
    htmlElement.value = node.bind ? "$bind" : "img/carousel-item.jpg";
    htmlElement.html = htmlElement.getTemplate('carousel-item');

    /**
    * @property widget Determina a qual classe pertence elemento concreto.
    * @type {string}
    */
    htmlElement.widget = 'BootstrapCarouselItem';

    return htmlElement;
};

/**
 * Elemento concreto BootstrapNavigation.
 * @class BootstrapNavigation
 * @constructor
 * @extends HTMLElement
 * @param {Object} node Elemento abstrado contendo informações iniciais para o construtor.
 * @return HTMLElement com as informações padrões de um Bootstrap Menu.
 */
var BootstrapNavigation = function (node) {
    var htmlElement = new HTMLElement(node);
    htmlElement.typeElement = 'navigation';
    htmlElement.value = node.bind ? "$bind" : "Brand";

    /**
    * @property widget Determina a qual classe pertence elemento concreto.
    * @type {string}
    */
    htmlElement.widget = 'BootstrapNavigation';
    
    return htmlElement;
};

/**
 * Elemento concreto BootstrapNavigationList.
 * @class BootstrapNavigationList
 * @constructor
 * @extends HTMLElement
 * @param {Object} node Elemento abstrado contendo informações iniciais para o construtor.
 * @return HTMLElement com as informações padrões de uma lista do Bootstrap Menu.
 */
var BootstrapNavigationList = function (node) {
    var htmlElement = new HTMLElement(node);
    
    htmlElement.typeElement = 'navigation-list';
    htmlElement.value = undefined;

    /**
    * @property widget Determina a qual classe pertence elemento concreto.
    * @type {string}
    */
    htmlElement.widget = 'BootstrapNavigationList';
    
    return htmlElement;
};

/**
 * Elemento concreto BootstrapNavigationListItem.
 * @class BootstrapNavigationListItem
 * @constructor
 * @extends HTMLElement
 * @param {Object} node Elemento abstrado contendo informações iniciais para o construtor.
 * @return HTMLElement com as informações padrões de um item da lista do Bootstrap Menu.
 */
var BootstrapNavigationListItem = function (node) {
    var htmlElement = new HTMLElement(node);
    
    htmlElement.typeElement = 'navigation-list-item';
    htmlElement.html = htmlElement.getTemplate('navigation-item');
    htmlElement.value = node.bind ? "$bind" : "Item do Menu";
    
    /**
    * @property href Link para o item da lista.
    * @type {string}
    */
    htmlElement.href = '#';

    /**
    * @property widget Determina a qual classe pertence elemento concreto.
    * @type {string}
    */
    htmlElement.widget = 'BootstrapNavigationListItem';
    
    
    return htmlElement;
};

//Formulário
/**
 * Elemento concreto Formulario.
 * @class Formulario
 * @constructor
 * @extends HTMLElement
 * @param {Object} node Elemento abstrado contendo informações iniciais para o construtor.
 * @return HTMLElement com as informações padrões de um formulário.
 */
var Formulario = function (node) {
    var htmlElement = new HTMLElement(node);
    
    htmlElement.tag = 'form';
    htmlElement.typeElement = 'form';
    htmlElement.action = node.bind ? "$bind" : "";
  

    return htmlElement;
};

/**
 * Elemento concreto InputText.
 * @class InputText
 * @constructor
 * @extends HTMLElement
 * @param {Object} node Elemento abstrado contendo informações iniciais para o construtor.
 * @return HTMLElement com as informações padrões de um input do tipo texto.
 */
var InputText = function (node) {
    var htmlElement = new HTMLElement(node);
    
    htmlElement.tag = 'input';
    htmlElement.typeElement = 'input-text';
    htmlElement.html = htmlElement.getTemplate('input-text');
    
    /**
    * @property type Determina o tipo do input (text, file e etc.).
    * @type {string}
    */
    htmlElement.type = 'text';
    
    return htmlElement;
};

/**
 * Elemento concreto InputTextarea.
 * @class InputTextarea
 * @constructor
 * @extends HTMLElement
 * @param {Object} node Elemento abstrado contendo informações iniciais para o construtor.
 * @return HTMLElement com as informações padrões de uma caixa de texto.
 */
var InputTextarea = function (node) {
    var htmlElement = new HTMLElement(node);
    
    htmlElement.tag = 'input';
    htmlElement.typeElement = 'input-textarea';
    htmlElement.html = htmlElement.getTemplate('input-textarea');

    return htmlElement;
};

/**
 * Elemento concreto InputRadioCheck.
 * @class InputRadioCheck
 * @constructor
 * @extends HTMLElement
 * @param {Object} node Elemento abstrado contendo informações iniciais para o construtor.
 * @return HTMLElement com as informações padrões de um radiobox ou checkbox.
 */
var InputRadioCheck = function (node) {
    var htmlElement = new HTMLElement(node);
    
    htmlElement.tag = 'input';
    htmlElement.typeElement = 'input-radio';
    htmlElement.html = htmlElement.getTemplate('input-radio');
    
    /**
    * @property type Determina o tipo do input (radio ou check).
    * @type {string}
    */
    htmlElement.type = 'radio';
    
    /**
    * @property tagRadio Determina qual o tipo do elemento concreto no momento (radio ou check).
    * @type {string}
    */
    htmlElement.tagRadio = 'radio';

    /**
    * @property text Determina o texto apresentado na label.
    * @type {string}
    */
    htmlElement.text =  node.bind ? "$bind" : "Opção";
    
    return htmlElement;
};

/**
 * Elemento concreto InputSelect.
 * @class InputSelect
 * @constructor
 * @extends HTMLElement
 * @param {Object} node Elemento abstrado contendo informações iniciais para o construtor.
 * @return HTMLElement com as informações padrões de um combobox.
 */
var InputSelect = function (node) {
    var htmlElement = new HTMLElement(node);
    htmlElement.tag = 'select';
    htmlElement.typeElement = 'input-select';
    
    return htmlElement;
};

/**
 * Elemento concreto InputOption.
 * @class InputOption
 * @constructor
 * @extends HTMLElement
 * @param {Object} node Elemento abstrado contendo informações iniciais para o construtor.
 * @return HTMLElement com as informações padrões de uma opção do combobox.
 */
var InputOption = function (node) {
    var htmlElement = new HTMLElement(node);
    htmlElement.tag = 'option';
    htmlElement.typeElement = 'input-option';
    htmlElement.html = htmlElement.getTemplate('input-option');

    /**
    * @property text Determina o texto da opção.
    * @type {string}
    */
    htmlElement.text =  node.bind ? "$bind" : "Opção";
    
    return htmlElement;
};

/**
 * Elemento concreto Button.
 * @class Button
 * @constructor
 * @extends HTMLElement
 * @param {Object} node Elemento abstrado contendo informações iniciais para o construtor.
 * @return HTMLElement com as informações padrões de um botão.
 */
var Button = function (node) {
    var htmlElement = new HTMLElement(node);
    htmlElement.tag = 'button';
    htmlElement.typeElement = 'input-button';
    htmlElement.html = htmlElement.getTemplate('input-button');
    
    /**
    * @property type Determina o tipo do botão.
    * @type {string}
    */
    htmlElement.type = 'submit';
    
    /**
    * @property text Determina o texto apresentado no botão.
    * @type {string}
    */
    htmlElement.text =  node.bind ? "$bind" : "Opção";
    
    return htmlElement;
};

/**
 * Classe que representa um elemento abstrato.
 * @class AbstractElement
 * @param {Object} node Elemento do plugin BootstrapTreeView.
 * @constructor
 */
var AbstractElement = function(node){
    /**
    * @property name Determina o nome do elemento abstrato.
    * @type {string}
    */
    this.name = node.text;

    /**
    * @property datasource Link onde se encontram as informações a serem baixadas.
    * @type {string}
    */
    this.datasource = node.datasource && node.datasource.length > 0 ? node.datasource.replace("http://localhost:3000", "url:") : undefined;

    /**
    * @property bind Expressão para obter informação a partir dos dados a partir do datasource.
    * @type {string}
    */
    this.bind = node.bind && node.bind.length > 0 ? node.bind : undefined;

    /**
    * @property parse Expressão para obter dados internos aos dados já obtidos no datasource.
    * @type {string}
    */
    this.parse = node.parse && node.parse.length > 0 ? '$data["' + node.parse + '"]' : undefined;

    /**
    * @property children Determina o nome da interface abstrata.
    * @type {Array}
    */
    this.children = undefined;
}

/**
 * Classe que representa um conjunto de widgets abstratos.
 * @class AbstractInterface
 * @constructor
 */
var AbstractInterface = function () {
    /**
    * @property name Determina o nome da interface abstrata.
    * @type {string}
    */
    this.name = "";

    /**
    * @property widgets Conjunto de elementos abstratos.
    * @type {Array}
    */
    this.widgets = [];
};

/**
 * Método responsável por gerar o código da interface abstrata.
 * @method generateAbstractInterface
 * @author João Victor Magela
 * @param {Object} widgets Conjunto de elementos abstratos.
 * @for AbstractInterface
 * @return Código formatado referente a interface abstrata.
 */
AbstractInterface.prototype.generateAbstractInterface = function(widgets){
    this.widgets = widgets;
    this.name = $('#nameInterface').val();

    return stringify(this, {maxWidth: 120, indent: 2});
};

/**
 * Classe que representa um conjunto de widgets concretos.
 * @class ConcreteInterface
 * @constructor
 */
var ConcreteInterface = function(){
    /**
    * @property name Determina o nome da interface concreta.
    * @type {string}
    */
    this.name = "";
    
    /**
    * @property maps Conjunto de elementos concretos da aplicação mapeados.
    * @type {Array}
    */
    this.maps = [];
    
    /**
    * @property head Conjunto de elementos concretos para o cabeçalho da página.
    * @type {Array}
    */
    this.head = [];

    /**
    * @property concreteInterfaceItems Conjunto de elementos concretos da aplicação.
    * @type {Array}
    */
    this.concreteInterfaceItems = [];
};

/**
 * Método responsável por gerar o código da interface concreta.
 * @method generateConcreteInterface
 * @author João Victor Magela
 * @for ConcreteInterface
 * @return Código no formato JSON referente a interface concreta.
 */
ConcreteInterface.prototype.generateConcreteInterface = function () {
    // Lista com propriedades que não devem ser mapeadas no código gerado.
    var invalidKeys = [
      'id', 'typeElement', 'componentWidth', 'html', 'listTag', 'headerTag', 'simpleHtmlTag', 'bind'
    ];

    this.maps = [];
    for(var i = 0; i < this.concreteInterfaceItems.length; i++){
        var item = new Object();
        for(var attr in this.concreteInterfaceItems[i]){
            if(invalidKeys.indexOf(attr) > -1) continue;
            item[attr] = this.concreteInterfaceItems[i][attr]; 
        }

        this.maps.push(item);
    }

    this.name = $('#nameInterface').val();
    this.head = [];

    var result = $.extend(true,{}, this);
    result.concreteInterfaceItems = undefined;

    return stringify(result, {maxLength: 120, indent: 2});
};

/**
 * Método responsável por procurar um determinado elemento concreto na interface concreta
 * @method findItem
 * @author João Victor Magela
 * @param {Object} node Elemento abstrado.
 * @for ConcreteInterface
 * @return Elemento concreto ou um elemento vazio (caso não seja encontrado).
 */
ConcreteInterface.prototype.findItem = function(node) {
    var items = $.grep(this.concreteInterfaceItems, function(obj){
        return obj.id == node.id;
    });
    return items.length > 0 ? items[0] : new Object();
};

/**
 * Método responsável por atualizar um determinado elemento concreto na interface concreta
 * @method replaceItem
 * @author João Victor Magela
 * @param {Object} item Elemento concreto.
 * @for ConcreteInterface
 */
ConcreteInterface.prototype.replaceItem = function(item) {
    var finded = false;
    for(var i=0; i < this.concreteInterfaceItems.length; i++) {
        if(this.concreteInterfaceItems[i].id == item.id) {
            finded = true;
            this.concreteInterfaceItems[i] = item;
            break;
        }
    }

    if(!finded) this.concreteInterfaceItems.push(item);
};

/**
 * Método responsável por limpar a lista de elementos concretos.
 * @method cleanConcreteInterface
 * @author João Victor Magela
 * @for ConcreteInterface
 */
ConcreteInterface.prototype.cleanConcreteInterface = function(){
    for(var i = this.concreteInterfaceItems.length-1; i >= 0; i--){
        var node = globalTree.findNodeById(this.concreteInterfaceItems[i].id);
        if(!node) this.concreteInterfaceItems.splice(i,1);    
    }
}

Array.prototype.clone = function(){
    return this.slice(0);
}