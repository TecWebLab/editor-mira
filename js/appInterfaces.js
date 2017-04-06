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
}

/*
	Iniciala o plugin instanciando os eventos

*/
AppInterfaces.prototype.Init = function() {
	
};

AppInterfaces.prototype.InitEvents = function() {
	var _this = this;

	this.$process.click(function(e){
		e.preventDefault();

		//TODO: validar o arquivo
		_this.ProcessFile(file);
	});
};

AppInterfaces.prototype.ProcessFile = function(file) {
	// body...
};
