var ModelViews = (function({
	var HTMLElementModel = Backbone.Model.Extend({
		defaults: {
			attrs: []
		},

		updateAttr: function(params){
			var temp = this.get("attrs");
			for(var key in params){
				temp[key] = params[key];	
			}

			this.set("attrs", temp);
		}
	});

	var ConcretoModel = Backbone.Model.Extend({
		defaults: {
			//singleton
			builder: null,

			//atributos
			attrs: {
				maps = [], //agregação com HTMLElementBuilder
				attrs = {
					name: "",
					head: [],
				}

			},

			
			htmlElements: [],
			strategy: null
		},
		
		

		setStrategy:function(strategy){
			this.set({strategy: strategy});
		},

		getStrategy: function(){
			return this.get("strategy");
		},
		
		setBuilder: function(builder){
			this.set({builder: builder});
		},

		getBuilder: function(){
			return this.get("builder");
		},

		constructElement: function(){
			var builder = this.get('builder');

			builder.buildParams(this.strategy.initParams());
			return builder.getElement();
		},

		getInstance: function(){
			if(concreto == null){
				concreto = new Concreto();
			}

			return concreto;
		},

	})

	//abstract builder
	var HTMLElementBuilderModel = Backbone.Model.Extend({
		var defaults: {
			strategy: null
		},

		setStrategy: function(strategy){
			this.set({strategy: strategy});
		},

		getStrategy: function(){
			return this.get('strategy');
		},

		createNewHTMLElement: function() {
				
		}

	})

	//concrete builder
	var ContentModel = Backbone.Model.Extend({
		defaults: {
			htmlElement: new HTMLElementModel()
		},

		buildParams = function(params){
			var temp = this.get('htmlElement');

			temp.attrs = params; 
			temp.attrs.width = 12;

			this.set('htmlElement', temp);
		},

		getElement = function(){
			return this.get('htmlElement');
		}

	})

	//concrete builder
	var TextModel = Backbone.Model.Extend({
		defaults: {
			htmlElement: new HTMLElementModel()
		},
		
		buildParams = function(params){
			var temp = this.get('htmlElement');
			
			temp.attrs = params; 
			temp.attrs.text = 'Texto de Exemplo';
			temp.attrs.align = 'normal';

			this.set('htmlElement', temp);
		},

		getElement = function(){
			return this.get('htmlElement');
		}
	})

	//concrete builder
	var ImageModel = Backbone.Model.Extend({
		defaults: {
			htmlElement: new HTMLElementModel()
		},
		
		buildParams = function(params){
			var temp = this.get('htmlElement');

			params.width = '400'; 
			params.height = '300';
			params.src = 'http://placehold.it/400x300';
			temp.attrs = params;

			this.set('htmlElement', temp);
		},

		getElement = function(){
			return this.get('htmlElement');
		}
	})

	//concrete builder
	/*
	var FormModel = Backbone.Model.Extend({
		defaults: {
			htmlElement: new HTMLElementModel()
		},
		
		buildParams = function(params){
			if(params == null){
				//caso venha alguma parâmetro, indica que foi lido de algum input

				temp = new HTMLElement();
				for(var key in params){
					temp[key] = params[key]; 
				}	
			}else{
				//caso contrário, inicializa com os valores default
			}
			
		},

		getElement = function(){
			return this.get('htmlElement');
		}	
	})*/

	//concrete builder
	var NavigationModel = Backbone.Model.Extend({
		defaults: {
			htmlElement: new HTMLElementModel()
		},
		
		buildParams = function(params){
			var temp = this.get('htmlElement');

			temp.attrs = params;
			temp.attrs.itens = ['Item 1','Item 2','Item 3'];

			this.set('htmlElement', temp);
		},

		getElement = function(){
			return this.get('htmlElement');
		}
	})

	//concrete builder
	var NavigationModel = Backbone.Model.Extend({
		defaults: {
			htmlElement: new HTMLElementModel()
		},
		
		buildParams = function(params){
			var temp = this.get('htmlElement');
			
			params.bootstrap = '0';
			params.itens = ['Item 1','Item 2','Item 3'];
			temp.attrs = params;

			this.set('htmlElement', temp);
		},

		getElement = function(){
			return this.get('htmlElement');
		}
	})

	//função auxiliar para remover aspas de strings
	var cleanString = function(string){
		return string.replaceAll('\"name\":', 'name:')
		.replaceAll('\"widgets\":', 'widgets:')
		.replaceAll('\"datasource\":', 'datasource:')
		.replaceAll('\"children\":', 'children:')
		.replaceAll('\"head\":', 'head:')
		.replaceAll('\"maps\":', 'maps:')

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

})())



