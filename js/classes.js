"use strict"
var concreto = null;
var abstrato = null;
var elements = [];
var id = 1;

var filterClass = [
	'row',
	'container',
	'jumbotron',
	'well',
	'alert alert-success',
	'alert alert-danger',
	'alert alert-warning',
	'alert alert-info'
]

var skipClasses = function(sentence){
	for(var i=0; i< filterClass.length; i++){
		sentence.replaceAll(filterClass[i], '');
	}

	return sentence;
}

var formatterJSON = function(key, value){
    if(value instanceof Array){
    	if(value.length == 0) return undefined;

        var obj = new Object();
        for(var i in value){
            obj[i] = value[i];
        }

        return obj;
    }else if(typeof value === "string" && value.length == 0) return undefined;

    return value;
}

//clone de um array
Array.prototype.clone = function() {
	return this.slice(0);
};

var removeDuplicateWord = function(sentence){
	var uniqueList = sentence.split(' ').filter(function(item,i,allItems){
	    return i==allItems.indexOf(item);
	}).join(' ');

	return uniqueList;	
}

/*********************** Funções auxiliares para geração de html **********************************/

//geração de hmtl de um content
var generateContainer = function(htmlElement){
    var div = $('<div />');
    switch(htmlElement.attrs.type){
        case 'div' : return div.clone();
        case 'panel': return $(
        	'<div class="panel panel-default">\
  				<div class="panel-heading">\
    				<h3 class="panel-title">Título</h3>\
  				</div>\
  				<div class="panel-body"></div>\
			</div>');
    }

    return div.clone();
}

//geração de hmtl de um content
var generateImage = function(htmlElement){
    var image = $('<img />').attr('src', htmlElement.attrs.src);
    switch(htmlElement.attrs.type){
        case 'image': return image.clone();
        case 'thumbnail' : return $('<div />').addClass('thumbnail').append(image.clone());
    }

    return image.clone();
}

var generateNavigation = function(){
	return $(
			'<nav class="navbar navbar-default">\
        		<div class="container-fluid">\
        			<div class="navbar-header">\
        				<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">\
                            <span class="sr-only">Toggle navigation</span>\
                            <span class="icon-bar"></span>\
                            <span class="icon-bar"></span>\
                            <span class="icon-bar"></span>\
                        </button>\
                        <a class="navbar-brand" href="#">Título</a>\
        			</div>\
        			<div class="collapse navbar-collapse">\
        				<ul class="nav navbar-nav">\
        					<li><a href="#">Item 1</a></li>\
        					<li><a href="#">Item 2</a></li>\
        					<li><a href="#">Item 3</a></li>\
        				</ul>\
        			</div>\
        		</div>\
        	</nav>');
}

var generateList = function(){
	return $(
		'<ul>\
			<li>Item 1</li>\
			<li>Item 2</li>\
			<li>Item 3</li>\
		</ul>');

}

/***********************Design Pattern Builder **********************************/
//product
function HTMLElement() {
	var attrs = [];

	this.updateAttr = function(params){
		for(var key in params){
			this.attrs[key] = params[key];	
		}
	}

	this.isVariable = function(label){
		if(this.attrs.dataParent.length == 0) return false;
		if(_.has(this.attrs.dataParent[0], label)) return true;

		//não existe a variável
		return false;
	}

	this.generateHtml = function(){
		switch(this.attrs.type){
			//content
			case 'container':
			case 'div':
			case 'jumbotron':
			case 'panel': 
				this.attrs.html = generateContainer(this);
				break;

			//text
			case 'paragraph':
			case 'header':
				this.attrs.html = this.attrs.type == 'header' ? $('<h1 />') : $('<p />'); 
				this.attrs.html.text('Texto de exemplo'); 
				break;

			//image
			case 'image':
			case 'thumbnail':
				this.attrs.html = generateImage(this);
				break;

			//navigation
			case 'nav':
				this.attrs.html = generateNavigation();
				break

			//list
			case 'list-ordered':
			case 'list-unordered':
				this.attrs.html = generateList();
				break;

			default: 
				this.attrs.html = generateContainer(this);
				break;
		}
	}
}

//director
function Concreto() {

	//singleton
	this.builder = null;
	
	//atributos
	this.attrs = new Object();
	this.attrs.maps = []; //agregação com HTMLElementBuilder
	this.attrs.name = "";
	this.attrs.head = [];

	this.htmlElements = [];
	this.strategy = null;

	this.setStrategy = function(strategy){
		this.strategy = strategy;
	}

	this.getStrategy = function(){
		return this.strategy;
	}
	
	this.setBuilder = function(builder){
		this.builder = builder;
	};

	this.getBuilder = function(){
		return this.builder;
	};

	this.constructElement = function(){

		this.builder.buildParams(this.strategy.initParams());
		return this.builder.get();
	};

	this.getInstance = function(){
		if(concreto == null){
			concreto = new Concreto();
		}

		return concreto;
	};
}


//abstract builder
function HTMLElementBuilder(){

	var strategy;

	this.setStrategy = function(strategy){
		this.strategy = strategy;
	}

	this.getStrategy = function(){
		return strategy;
	}

	this.createNewHTMLElement = function() {
			
	}
	
}

//concrete builder
function Content(){
	this.htmlElement = new HTMLElement();

	
	this.buildParams = function(params){
		this.htmlElement.attrs = params; 
		this.htmlElement.attrs.width = '0';
		this.htmlElement.attrs.context = 'default';
	}


	this.get = function(){
		return this.htmlElement;
	}
}

//concrete builder
function Text(){
	this.htmlElement = new HTMLElement();
	
	this.buildParams = function(params){
		this.htmlElement.attrs = params; 
		this.htmlElement.attrs.text = 'Texto de Exemplo';
		this.htmlElement.attrs.align = 'normal';
		
	}

	this.get = function(){
		return this.htmlElement;
	}
}

//concrete builder
function Image(){
	this.htmlElement = new HTMLElement();

	this.buildParams = function(params){
		params.width = '400'; 
		params.height = '300';
		params.src = 'http://placehold.it/400x300';

		this.htmlElement.attrs = params;
		
	}

	this.get = function(){
		return this.htmlElement;
	}
}

//concrete builder
function Form(){
	this.htmlElement = null;

	this.buildParams = function(params){
		if(params == null){
			//caso venha alguma parâmetro, indica que foi lido de algum input

			this.htmlElement = new HTMLElement();
			for(var key in params){
				this.htmlElement[key] = params[key]; 
			}	
		}else{
			//caso contrário, inicializa com os valores default
		}
		
	}

	this.get = function(){
		return this.htmlElement;
	}
}

//concrete builder
function Navigation(){
	this.htmlElement = new HTMLElement();

	this.buildParams = function(params){
		this.htmlElement.attrs = params;
		this.htmlElement.attrs.itens = ["Item 1", "Item 2", "Item 3"];;

		this.htmlElement.attrs.hrefs = ["#","#","#"];
		this.htmlElement.attrs.value = 0; //estático
		this.htmlElement.attrs.title = "Título";
	}

	this.get = function(){
		return this.htmlElement;
	}
}

//concrete builder
function List(){
	this.htmlElement = new HTMLElement();

	this.buildParams = function(params){
		params.bootstrap = '0';
		
		params.itens = ["Item 1", "Item 2", "Item 3"];;;
		this.htmlElement.attrs = params;
		this.htmlElement.attrs.value = 0; //estático
	}

	this.get = function(){
		return this.htmlElement;
	}
}

function mapNavigation(el){
	var navigation = new Object();
	navigation.name = el.attrs.name;
	navigation.widget = "BootstrapNavigation";

	navigation.value = el.attrs.title.length > 0 ? el.attrs.title : undefined;

	var list = new Object();
	list.name = el.attrs.name + "List";
	list.widget = "BootstrapNavigationList";

	var result = [navigation,list];

	var items = [];
	if(el.attrs.value == 1){
		var item = new Object();
		item.name = el.attrs.name + 'ListItem';
		item.value = '$data["'+el.attrs.itens[0]+'"][0]';
		item.widget = "BootstrapNavigationListItem";
		item.href = 'navigate("/rest/resource/", {s:$data["'+el.attrs.hrefs[0] +'"].replace("#", "%23")})';
		items.push(item);
	}else{
		for(var i in el.attrs.itens){
			var item = new Object();
			item.name = el.attrs.name + 'ListItem' + (parseInt(i)+1);
			item.value = el.attrs.itens[i];
			item.widget = "BootstrapNavigationListItem";
			item.href = el.attrs.hrefs[i] ? el.attrs.hrefs[i] : '#';
			items.push(item);
		}	
	}
	

	result = result.concat(items);

	return result;
}


function mapDiv(el){
	var content = new Object();
	content.name = el.attrs.name;
	var aux = el.attrs.type != 'div' ? + el.attrs.type : '';
	content.class = el.attrs.classes == undefined ? aux : el.attrs.classes + ' ' + aux;

	return content;
}

function mapPanel(el){
	//panel
	var panel = new Object();
	panel.name = 'panel';
	panel.class = 'panel panel-' + el.attrs.context;

	//panel body
	var body = new Object();
	body.name = el.attrs.name;
	body.class = el.attrs.classes.length > 0 ? el.attrs.classes : undefined;
	body.widget = "BootstrapPanelBody";

	return [panel,body];
}

function mapParagraph(el){
	var paragraph = new Object();
	paragraph.name = el.attrs.name;
	paragraph.class = el.attrs.classes;
	paragraph.tag = 'p';
	paragraph.value = el.isVariable(el.attrs.text) ? '$data["'+el.attrs.text+'"]' : el.attrs.text;

	return paragraph;
}

function mapHeader(el){
	var header = new Object();
	header.name = el.attrs.name;
	header.class = el.attrs.classes;
	header.tag = el.attrs.tag;
	header.value = el.isVariable(el.attrs.text) ? '$data["'+el.attrs.text+'"]' : el.attrs.text;

	return header;
}

function mapImage(el){
	var image = new Object();
	image.name = el.attrs.name;
	image.class = el.attrs.classes;
	image.tag = 'img';
	image.src = el.isVariable(el.attrs.src) ? '$data["'+el.attrs.src+'"]' : el.attrs.src;
	image.alt = el.attrs.alt != undefined ? el.attrs.alt : "";

	return image;
}

function mapThumbnail(el){
	var thumbnail = new Object();
	thumbnail.name = el.attrs.name + "Thumbnail";
	thumbnail.class = "thumbnail";

	var image = new Object();
	image.name = el.attrs.name;
	image.class = el.attrs.classes.length > 0 ? el.attrs.classes : undefined;
	image.tag = 'img';
	image.src = el.isVariable(el.attrs.src) ? '$data["'+el.attrs.src+'"]' : el.attrs.src;
	image.alt = el.attrs.alt != undefined ? el.attrs.alt : "";

	return [thumbnail, image];
}

function mapList(el){
	var list = new Object();
	list.name = el.attrs.name;
	list.class = el.attrs.classes.length > 0 ? el.attrs.classes : undefined;


	var listItem = [];
	if(el.attrs.value == 1){
		var li = new Object();
		li.name = el.attrs.name + "Item";
		li.class = el.attrs.bootstrap ? 'list-group-item' : undefined;
		li.value = '$data["'+el.attrs.itens['0']+'"]';
		listItem = li;

	}else{
		for (var i in el.attrs.itens) {
			var li = new Object();
			li.name = el.attrs.name + "Item" + (parseInt(i)+1);
			li.class = el.attrs.bootstrap == 1 ? 'list-group-item' : undefined;
			li.value = el.attrs.itens['0'];
			listItem.push(li);

		}
	}

	if(el.attrs.type == 'list-ordered') list.tag = 'ol';
	else list.tag = 'ul';

	return [list, listItem];
}


function Agente(){
	var mapElement = function(el){
		switch(el.attrs.type){
			//navigation
			case 'nav': return mapNavigation(el);

			//container
			case "div": return mapDiv(el);
			case "panel": return mapPanel(el);

			//text
			case 'paragraph': return mapParagraph(el);
			case 'header': return mapHeader(el);

			//image
			case 'image': return mapImage(el);
			case 'thumbnail': return mapThumbnail(el);

			//pagination TODO

			//list
			case 'list-ordered':
			case 'list-unordered': return mapList(el);

			default: return mapDiv(el);
		}
	}

	this.generateAbstractInterface = function(){
		abstrato.attrs.name = $('#nameInterface').val();
		abstrato.attrs.widgets = concreto.htmlElements;
		$('#abstract-code pre').html(
			cleanString(JSON.stringify(abstrato.attrs, function(key, value){
				if(key == 'name' || key == 'widgets') return value;

				if(typeof value === "string") value = value.trim();

				if((typeof value === "string"  || typeof value === "object") && value.length == 0) return undefined;
				return value;
			}, 2))
		); 
	}

	this.generateConcreteInterface = function(){
		var maps = []
		
		for(var i=0; i<elements.length; i++) {
			var map = mapElement(elements[i]);
			if(map.length) maps = maps.concat(map);
			else maps.push(map);
		}

		concreto.attrs.maps = maps; 
		concreto.attrs.name = $('#nameInterface').val();
		concreto.attrs.head = [];

		$('#concrete-code pre').html(
			cleanString(JSON.stringify(concreto.attrs, function(key, value){
				if(key == 'name' || key == "head" || key == "maps") return value;

				if(typeof value === "string") value = value.trim();

				if((typeof value === "string"  || typeof value === "object") && value.length == 0) return undefined;
				return value;
			}, 2))
		); 	
	}

	this.execute = function(){
		this.generateAbstractInterface();
		this.generateConcreteInterface();
	}
}

function Abstrato(){
	this.instance = null;
	this.attrs = new Object();
	this.attrs.name = "";
	this.attrs.widgets = new Object();

	this.getInstance = function(){
		if(abstrato == null){
			abstrato = new Abstrato();
		}

		return abstrato;
	};
}

function StrategyDrag(){
	this.initParams = function(){
		var params = []
		params.datasource = '';
		params.id = id;
		params.name = 'obj' + id; id++;
		params.classes = '';
		params.parse = "";
		params.data = params.dataParent = [];

		return params;
	}
}

function StrategyInput(){

}


//função auxiliar para remover aspas de strings
function cleanString(string){
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
	.replaceAll('\\\"', '\'')
}

String.prototype.replaceAll = function(de, para){
    var str = this;
    var pos = str.indexOf(de);
    while (pos > -1){
		str = str.replace(de, para);
		pos = str.indexOf(de);
	}
    return (str);
}
