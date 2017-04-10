var AppInterfaces = function(){
	//Dados gerais
	this.Name = "";
	this.Key = "";

	//Dados gerados
	this.FileJSON = "";
	this.Template = "";

	//Elementos da tela
	this.$progress = $("#progress-bar");
	this.$name = $("#key");
	this.$key = $("#nome");
	this.$process = $("#btn-process");
	this.$file = $("#input-json");
	this.$txtFile = $("#text-file");
	this.$codeModel = $("#pre-model");
	this.$codeMira = $("#pre-mira");

}

/*
	Iniciala o plugin instanciando os eventos

*/
AppInterfaces.prototype.Init = function() {
	this.InitEvents();
};

AppInterfaces.prototype.InitEvents = function() {
	var _this = this;

	this.$file.change(function(e){
		var filename = _this.$file.val().split('\\').pop();
		_this.$txtFile.val(filename);
	});

	this.$process.click(function(e){
		e.preventDefault();

		var files = _this.$file[0].files;

		if(files.lenght == 0)
			alert ("Nenhum arquivo foi selecionado.");

		if(files.lenght > 1)
			alert("Mais de um arquivo foi selecionado.");
		
		_this.ProcessFile(files[0]);
	});
};

AppInterfaces.prototype.ProcessFile = function(file) {
	var _this = this;
	var reader = new FileReader();
	reader.onload = (function(fileAsText) {
		return function(e){
			var import = JSON.parse(e.target.result, function(key, value){
				//Converte o validation de string para function
				return key == "validation" ? new Function(value) : value;
			});

			//Exibe o json importado
			_this.$codeModel.html(e.target.result);

			//Exibe as interfaces do Mira de acordo com o template

			//Cadastra os dados no API.ai
		}
	})(file);

	reader.readAsText(file);
};

AppInterfaces.prototype.CreateMiraInterfaces = function(import) {

};

AppInterfaces.AppInterfaces.prototype.GetDeepPropertiesValue = function(widgtes){
    var titles = [];
    var findName = function(list){
    	if(_.isString(list)){
    		titles.push(list);
    	}
    	else{
    		for(var key in list){
	            if(_.isString(list[key].name) && list[key].name.length)
	                titles.push(list[key].name);

	            
	            if(typeof(list[key].children) != 'undefined'){
	            	if(list[key].children)
	            	findName(list[key].attributes.children.models);
	            }
	            
	        }	
    	}
    };

    findName(widgtes);
    return titles;
}
