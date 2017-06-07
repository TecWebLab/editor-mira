"use strict";

var AppInterfaces = function(){
	//Funções que são internas
	this.internalFunctions = [ 
		"RequestFocus", "SetValue", "ConfirmForm", 
		"changeLanguage", "nextItem", "prevItem", "checkItem", "uncheckItem", "selectItem" 
	];

	//Dados gerais
	this.Name = "";
	this.Key = "";

	//Dados gerados
	this.FileJSON = "";
	this.Template = "";

	//Elementos da tela
	this.$progress = $("#progress-bar");
	this.$keyPT = $("#key_pt");
	this.$keyUS = $("#key_us");
	this.$process = $("#btn-process");
	this.$file = $("#input-json");
	this.$txtFile = $("#text-file");
	this.$codeModel = $("#code-model");
	this.$codeMira = $("#code-mira");

	this.template = '';
}

/*
	Iniciala o plugin instanciando os eventos

*/
AppInterfaces.prototype.Init = function() {
	$.ajaxSetup({async: false});

	var _this = this;
	this.InitEvents();

	$.get("js/Template/interface.txt", function(data){
		_this.template = data;
	});
};

AppInterfaces.prototype.InitEvents = function() {
	var _this = this;
	
	//define o nome do arquivo após selecionar
	this.$file.change(function(e){
		var filename = _this.$file.val().split('\\').pop();
		_this.$txtFile.val(filename);
	});

	//Evento ao clicar no botão processar
	this.$process.click(function(e){
		e.preventDefault();

		var apiTokens = {
			"pt-BR": _this.$keyPT.val(),
			"en-US": _this.$keyUS.val()
		};

		if(!apiTokens["pt-BR"] && !apiTokens["en-US"].length){
			alert("informe pelo menos um token.");
			return;
		}

		var files = _this.$file[0].files;

		if(files.length == 0)
			alert ("Nenhum arquivo foi selecionado.");

		if(files.lenght > 1)
			alert("Mais de um arquivo foi selecionado.");
		
		_this.ProcessFile(files[0], apiTokens);
	});
};

AppInterfaces.prototype.ProcessFile = function(file, apiKeys) {
	var _this = this;
	apiKeys.defaultLanguage = apiKeys["pt-BR"].length ? "pt-BR" : "en-US";
	var reader = new FileReader();
	waitingDialog.show("Processando dos do arquivo selecionado", { onHide: function(){
		//Abre a área de dados do arquivo
		$("#header-interfaces").find('a').click();
	}});
	reader.onload = (function(fileAsText) {
		
		return function(e){
			var importJSON = '';
			try{
				importJSON = JSON.parse(e.target.result);
			} catch(ex){
				throw ex;
			}

			waitingDialog.setMessage("Criando instância do API.ai.");
			//Exibe o json importado
			_this.$codeModel.html(e.target.result);

			//Cria os objetos para alimentar o template
			var interfaces = [];
			_.each(importJSON.interfaces, function(item){
				var widget = new Object();
				widget.name = item.name;
				
				//Atribui o parâmetro validation para o widget abstrato
				widget.abstrata = item;
				
				_.each(widget.abstrata.widgets, function(widgetAbstrato){
					_this.SetValidation(widgetAbstrato, importJSON.intents);
				});

				widget.concreta = _this.WidgetsToList(item.widgets);

				interfaces.push(widget);
			});

			//Exibe as interfaces do Mira de acordo com o template
			var params = {
				interfaces: interfaces,
				api: apiKeys,
				funcs: _this.GetFunctions(importJSON.intents)
			};

			var codeMira = _.template(_this.template, {variable: "params"})(params);

			//Exibe o template na view
			_this.$codeMira.html(codeMira);

			//Cadastra os dados no API.ai
			waitingDialog.setMessage("Registrando as entidades no API.ai.");
			_this.SetValueEntities(importJSON.entities, importJSON.intents);
			_this.CreateEntities(importJSON.entities, apiKeys);

			waitingDialog.setMessage("Registrando as intenções no API.ai");
			_this.CreateIntents(importJSON.intents, apiKeys);

			waitingDialog.hide();
		
		}
	})(file);

	reader.readAsText(file);
};

//Verifica se algum widget da interface abstrata tem como ação SetValue. Caso tenha, coloca o atributo validation no objeto
AppInterfaces.prototype.SetValidation = function(widget, intents){
	var _this = this;
	var intent = _.find(intents, function(x){ return x.name == widget.name; });
	if(intent && intent.action === "SetValue"){
		widget.validation = function(value){
			return { success: true }
		};

		return;
	}

	var children = widget.children || [];
	_.each(children, function(child){ 
		_this.SetValidation(child, intents);
	});
}

AppInterfaces.prototype.GetFunctions = function(intents) {
	var _this = this;
	var funcs = _.reduce(intents, function(memory, intent){
		var func = intent.action;
		//Verifica se tem "." na ação. Caso tenha, indica que é um comando javascript, logo não precisa ser criado uma função
		if(func.indexOf(".") > -1)
			return memory;

		//Adiciona o nome da função a ser criada
		if(!_.contains(memory, func) && !_.contains(_this.internalFunctions, func))
			memory.push(intent.action);

		return memory;
	}, []);

	console.log(funcs);
	return funcs;

}
/*
	Passa por todas as frases usadas nas intenções, buscando os valores das entidades.
	@entities: Entidades buscadas no modelo
	@intents: Intenções buscadas no modelo, onde cada intenção poderá ter valores de entidades em suas frases
*/
AppInterfaces.prototype.SetValueEntities = function(entities, intents){
	//Busca os valores usados nas intenções para cada entidade
	var getValues = function(entity, lang){
		return _.reduce(intents, function(memory, intent){
			//retorna todas as frases que usam entidades
			var phrasesLang = _.filter(intent.phrases[lang], function(x){ return x.entities && x.entities.length; });

			//retorna todas a entidades das frases
			var entitiesInPhrases = _.map(phrasesLang, function(x){ return x.entities; });

			_.each(entitiesInPhrases, function(phrases){
				//Cada frase pode possuir um array de entidades
				_.each(phrases, function(phrase){
					//Caso for a entideade desejada, busca o nome
					if(phrase.type != entity.name)
						return;
					
					//Verifica se o valor adicionado já existe na lista a ser retornada 
					var exists = _.find(memory, function(m){
						var valueToUpper = m.value.toUpperCase();

						return phrase.principal ? valueToUpper == phrase.principal.toUpperCase() :
													valueToUpper == phrase.value.toUpperCase();
					});

					//Se já existe, coloca com sinônimo, se necessário
					if(exists){
						if(phrase.principal && !_.contains(exists.synonyms, phrase.value))
							exists.synonyms.push(phrase.value);

						return;
					}

					//Caso não tenha na lista de itens a serem adicionados, cria um novo objeto
					var entityValue = {
						value: phrase.value,
						synonyms:[phrase.value]
					}

					memory.push(entityValue);	
				});
			});

			return memory;
		}, []);
	};

	_.each(entities, function(entity){
		//Busca nas intenções, valores contidos no atributo "phrases"
		entity.values = { 
			"pt-BR": [], 
			"en-US": [] 
		};

		for(var key in entity.values){
			entity.values[key] = getValues(entity, key);
		}
	});
};

AppInterfaces.prototype.CreateEntities = function(entities, tokens) {
	var _this = this;

	var entitiesToSave = { "pt-BR": [], "en-US": [] };
	_.each(entities, function(entity){

		var entityToSavePT = {
			name: entity.name,
			entries: entity.values["pt-BR"]
		};
		entitiesToSave["pt-BR"].push(entityToSavePT);

		var entityToSaveEn = {
			name: entity.name,
			entries: entity.values["en-US"]
		};
		entitiesToSave["en-US"].push(entityToSaveEn);
	});

	//Fazer a chamada do API.ai
	var url = "https://api.api.ai/v1/entities?v=20150910";
	if(tokens["pt-BR"])
		_this.AjaxCurl(url, "PUT", tokens["pt-BR"], entitiesToSave["pt-BR"]);

	if(tokens["en-US"])
		_this.AjaxCurl(url, "PUT", tokens["en-US"], entitiesToSave["en-US"]);		
	
};

AppInterfaces.prototype.ConvertPhraseIntent = function(item){
	var data = [];
	if(!item.entities){
		data.push({
			text: item.phrase
		});
		return data;
	}

	//Define o conteúdo do RegEx
	var itemRegex = _.reduce(item.entities, function(memory, current){ 
		memory += memory.length ? "|(" + current.value + ")" : "(" + current.value + ")";

		return memory; 
	}, "");

	var reg = new RegExp(itemRegex, 'g');

	//Devide a frase de acordo com o RegEx
	var splitPhrase = item.phrase.split(reg);
	return _.map(splitPhrase, function(part){
		//Verifica se a parte do texto deve ser convertida em um tipo do API
		var entity = _.find(item.entities, function(x){ return x.value == part });

		//Se tiver, cria um objeto informando o alias e o tipo. Caso contrário só repassa o texto
		return entity ? { text: part, alias: entity.alias, meta: "@"+entity.type } : { text : part };
	});

}

AppInterfaces.prototype.ConvertParamsIntent = function(params, userSays){
	var paramsMapped = _.reduce(userSays, function(memory, say){
		//Percorre o atributos data, buscando objetos que tenha o atributo meta
		var variables = _.filter(say.data, function(x){ return !_.isUndefined(x.meta) });

		_.each(variables, function(text){
			//cria o elemento
			var param = {
				name: text.alias,
				value: '$' + text.alias,
				dataType: text.meta,
				isList: false
			};

			//Adiciona, se ainda não está presente na lista
			if(!_.find(memory, function(p){ return p.name == param.name }))
				memory.push(param);
				
		});
		
		return memory;
	}, []);

	var paramsToAdd = _.filter(params, function(x){ 
		return _.isUndefined(_.find(paramsMapped, function(p){ return p.name == x.name; }));
	});

	_.each(paramsToAdd, function(p){
		var toAdd = {
			name: p.name,
			value: p.value,
			isList: false
		}

		paramsMapped.push(toAdd);
	});

	return paramsMapped;
}

AppInterfaces.prototype.MapFallback = function(intentToSave, lang){
	if(!intentToSave.error)
		return null;

	var fallback = {
		name: intentToSave.error.name,
		auto: true,
		contexts: intentToSave.context ? intentToSave.context.out : undefined,
		responses:
		[
			{
				action: "Fallback",
				speech: intentToSave.error.messages[lang]
			}
		],
		
		fallbackIntent: true
	};

	return fallback;
}

AppInterfaces.prototype.MapIntent = function(intentToSave, lang){
	var _this = this;
	
	var intent = {
		name: intentToSave.name,
		auto: true,
		userSays: _.map(intentToSave.phrases[lang], function(item){
			var userSay = { data: _this.ConvertPhraseIntent(item), isTemplate: false, count: 0 };
			return userSay;	
		}),
		responses: 
		[
			{
				action: intentToSave.action,
				affectedContexts: intentToSave.context ? _.map(intentToSave.context.out, function(x){
					var context = {
						name: x,
						lifespan: 5,
						parameters: {}
					};

					return context;
				}) : undefined
			}
		],
		priority: 5000
	};
	if(intentToSave.responses){
		intent.responses[0].speech = intentToSave.responses[lang];
	}
	
	intent.responses[0].parameters = _this.ConvertParamsIntent(intentToSave.params, intent.userSays);

	return intent;
}

AppInterfaces.prototype.ConvertIntentsToSaveByLanguage = function(lang, intents, data){
	var _this = this;
	
	//Retorna as intenções do modelo que devem ser transformadas em intenções do API.ai
	var intentsToSave = _.filter(intents, function(intent){ 
		return _.isUndefined(_.find(data, function(x){ return x.name == intent.name}))
	});

	return _.reduce(intentsToSave, function(memory, intentToSave){
		memory.push(_this.MapIntent(intentToSave, lang));
		if(intentToSave.error){
			var fallback = _.find(data, function(x){ return x.name == intentToSave.error.name });
			if(!fallback){
				var exists = _.find(memory, function(f){ return f.name == intentToSave.error.name })
				if(!exists)
					memory.push(_this.MapFallback(intentToSave, lang));
			}
		}

		return memory
	}, []);
}

AppInterfaces.prototype.CreateIntents = function(intents, tokens) {
	var _this = this;
	//Carrega as intenções e depois determina quem tem que atualizar e quem tem que criar
	var urlIntent = "https://api.api.ai/v1/intents?v=20150910";
	if(tokens["pt-BR"].length){
		_this.AjaxCurl(urlIntent, "GET", tokens["pt-BR"], null, function(data){		
			var intentsToSave = _this.ConvertIntentsToSaveByLanguage("pt-BR", intents, data);
			_.each(intentsToSave, function(intentToSave){
				_this.AjaxCurl(urlIntent, "POST", tokens["pt-BR"], intentToSave);
			});
		});
	}

	if(tokens["en-US"].length){
		_this.AjaxCurl(urlIntent, "GET", tokens["en-US"], null, function(data){		
			var intentsToSave = _this.ConvertIntentsToSaveByLanguage("en-US", intents, data);
			
			_.each(intentsToSave, function(intentToSave){
				_this.AjaxCurl(urlIntent, "POST", tokens["en-US"], intentToSave);
			});
		});
	}

};

AppInterfaces.prototype.WidgetsToList = function(widgets){
	var _this = this;
	var list = [];

	_.each(widgets, function(widget){
		list = _this.GetMapWidgets(widget, list);
	});

	return list;
}

//Converte uma lista hierárquica de itens numa lista simples
AppInterfaces.prototype.GetMapWidgets = function(widget, added){
    var _this = this;
    if(_.isString(widget)){
    	var item = new Object();
    	item.name = widget;
    	item.widget = "WaiContent";

    	added.push(item);
    	return added;
    }

	var item = new Object();
	item.name = widget.name;
	item.widget = "WaiContent";    
    added.push(item);


    if(!_.isUndefined(widget.children)){
    	_.each(widget.children, function(subItem){
    		added = _this.GetMapWidgets(subItem, added);	
    	})
    }

    return added;
}

AppInterfaces.prototype.AjaxCurl = function(url, type, token, data, callback){
    var _this = this;
    return $.ajax({
        url: url,
        beforeSend: function(xhr) { 
          xhr.setRequestHeader("Authorization", "Bearer " + token);
        },
        type: type,
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        processData: false,
        data: data != null ? JSON.stringify(data) : undefined,
        success: callback,
        
        error: function(err){
          console.log(err);
        }
    });
}
