"use strict"
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var prototype = (function(){

    //variáveis globais
    concreto = new Concreto().getInstance();
    abstrato = new Abstrato().getInstance();
    var strategyDrag = new StrategyDrag();
    var strategyInput = new StrategyInput();
    elements = [];

    var agente = new Agente();

    //Variáveis que determinam o objeto e elemento HTML selecionado
    var currentObj = null; //HTMLElement selecionado
    var currentElement = null; //HTML selecionado
    var currentProp = null; //botão de propriedade clicado por úlitmo


    var elementsDroppable = ['#prototype'];
    var base = $('#panel-base').html();
    var sidebar = null;
    var divElements = $('#elements');
    //define o tamanho de um objeto
    Object.size = function(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };

    var cloneElements = function(){
        var clone = new Object();

        for(var i=0; i < elements.length; i++){
            var aux = new Object();
            aux.attrs = new Object();
            for(var item in elements[i].attrs){
                aux.attrs[item] = item == 'html' ? $('<div />').append(elements[i].attrs[item].clone()).html() : elements[i].attrs[item];
            }

            clone[i] = aux;
        }

        return clone;
    }

    var createHtmlElement = function(attrs){
        var el = new HTMLElement();
        el.attrs = [];
        var data = [], dataParent = [], hrefs = [], itens = [];
        

        el.updateAttr(attrs);
        
        for(var i in el.attrs.data) data[i] = el.attrs.data[i];
        for(var i in el.attrs.dataParent) dataParent[i] = el.attrs.dataParent[i];
        for(var i in el.attrs.hrefs) hrefs[i] = el.attrs.hrefs[i];
        for(var i in el.attrs.itens) itens[i] = el.attrs.itens[i];
        
        el.attrs.data = data;
        el.attrs.dataParent = dataParent;
        el.attrs.hrefs = hrefs.length > 0 ? hrefs : undefined;
        el.attrs.itens = itens.length > 0 ? itens : undefined;
        return el;
    }

    var restoreElements = function(json){
        var restore = JSON.parse(json);
        var size = Object.size(restore);
        elements = [];
        
        for(var i=0; i<size; i++){
            restore[i].attrs.html = $(restore[i].attrs.html); //convert string do jquery
            elements[i] = createHtmlElement(restore[i].attrs);
        }

        id = size+1;
    }

    /* Funções do webstorage */
    var saveWebStorage = function(){
        var obj = new Object();
        obj.name = $('#nameInterface').val();
        obj.html = $('#prototype').html();
        obj.elements = JSON.stringify(cloneElements(), formatterJSON, 2);
        localStorage.setItem('project', JSON.stringify(obj, formatterJSON, 2));
    }

    var loadWebStorage = function(){
        var project = localStorage.getItem('project');

        if(project && confirm('Já existe um projeto em andamento. Deseja abrí-lo?')){
            project = JSON.parse(project);
            $('#nameInterface').val(project.name);
            $('#prototype').html(project.html);
            restoreElements(project.elements);

            //elements = JSON.parse(project.elements);
            updateList();
            agente.execute();
            
            $('#prototype .drop').sortable({
                connectWith: '.drop, #prototype',
                handle: '.btn-move',
                tolerance: 'pointer',
                helper: 'clone',
                receive: function(event, ui){
                    dropElement(ui.helper).show();
                }
            }).droppable({
                tolerance: 'pointer'
            });

        }else{
            localStorage.clear(); //limpa o localStorage    
        }
    }

    var downloadJson = function(){
        var link = $('#link-download');
        saveWebStorage();

        var data = "text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem('project'));
        link.attr('href', 'data:' + data).attr('download', 'Inteface.json');

        link[0].click();
    }

    var getExtensionFile = function(filename){
        return filename.split('.').pop();
    }

    var isJson = function(filename){
        return getExtensionFile(filename).toLowerCase() == 'json';    
    };

    var projectFunctions = function(){
        //salvando um projeto
        $('#project-save').click(function(e){
            e.preventDefault();
            downloadJson();
        });

        //abrindo um projeto existente
        $('#project-open').on('change', function(e){
            var filename = $(this).val().replace("C:\\fakepath\\", "");
            $("#upload-file-info").html(filename);
            
            if(!isJson(filename)){
                alert('O arquivo selecionado não é do formato JSON');
                return;
            }


            var files = e.target.files;
            for(var i=0; i<files.length; i++){
                var file = files[i];

                var reader = new FileReader();
                reader.onload = (function(f){
                    return function(e){
                        var obj = JSON.parse(e.target.result);
                        
                        if(obj.name == undefined || obj.html == undefined || obj.elements == undefined){
                            alert('O arquivo selecionado não está no padrão desejado.');
                        }else{
                            localStorage.setItem('project', e.target.result);
                            $('#nameInterface').val(obj.name);
                            $('#prototype').html(obj.html);
                            restoreElements(obj.elements);
                        }
                    }
                })(file);

                reader.readAsText(file);
            }
        });

        $('#project-new').click(function(e){
            e.preventDefault();

            if(confirm('Deseja realmente fechar esse projeto para iniciar outro?')){
                localStorage.clear();
                location.reload();    
            }
        })

    }

    var save = function(input){
        var dados = input.parents('form').serializeArray();
        var attrs = [];
        
        //Pega todos os dados do formulários
        $.each(dados, function(i,el){
            if(el.name == 'itens' || el.name == 'hrefs'){
                attrs[el.name] = el.value.trim().split('\n');
            }else{
                attrs[el.name] = el.value;    
            }
        });

        if(currentElement.attr('data-component') == 'component-div' && currentObj.attrs.type != 'panel'){
            var type = attrs.type != 'div' ? attrs.type : '';
            var width = '';

            if(attrs.width == 'row') width = 'row';
            else if(attrs.width != '0') width = 'col-md-' + attrs.width;
            
            attrs.classes += ' ' + type + ' ' + width;
            attrs.classes = removeDuplicateWord(attrs.classes);
        }

        //atualiza os dados de acordo com o parse
        if(attrs['parse'].length > 0 && currentObj.attrs.data[attrs['parse']]){
            currentObj.attrs.data = currentObj.attrs.dataParent = currentObj.attrs.data[attrs['parse']];
        }

        //atualiza o elemento
        updateWidget(currentElement.attr('data-component'), attrs);
        currentObj.updateAttr(attrs);


        updateElement(currentObj);
        updateList(); //atualiza a interface abstrata
        saveWebStorage();
        console.log(elements);
    }

    var radioEvent = function(){
        $(document).on('change', 'input[type=radio][name=value]', function(e){
            console.log('change');
            var value = parseInt($(this).val());
            console.log($(this).parents('form'));
            var controlStatic = $(this).parents('form').find('#control-static');
            var controlDynamic =  $(this).parents('form').find('#control-dynamic');
            if(value == 0){
                controlStatic.show();
                controlDynamic.hide();
            }else{
                controlStatic.hide();
                controlDynamic.show();
            }
        })
    }

    var tabBootstrap = function(){
        $('#tab-prototype a').click(function (e) {
          e.preventDefault();

          $(this).tab('show');
          if($(this).data('mode') == 'preview'){
            $("#preview").empty();
            generatePreview($('#prototype'), $("#preview"));
          }
        })
    }

    var saveCloseOption = function(){
        //ao clicar no botão salvar
        $(document).on('click', '#btnSalvar', function(e){
            e.preventDefault();
            save($(this));
            
        });

        //ao clicar no botão fechar
        $(document).on('click', '#btnFechar', function(e){
            e.preventDefault();
            currentProp.click();           
        });

        $(document).on('click', '.btn-datasource', function(e){
            e.preventDefault();

            var url = $(this).parent().parent().find('input').val();
            $.ajax({
                type: 'GET',
                dataType: 'json',
                url: url,
                success: function(data){
                    //caso obtenha sucesso na requisição, joga insere os dados
                    currentObj.attrs.data = data;
                    currentObj.attrs.dataParent = data;

                },

                error: function(error){
                    if(Object.is(currentObj.attrs.data, currentObj.attrs.dataParent)){
                        currentObj.attrs.dataParent = currentObj.attrs.data = [];    
                    }else{
                        currentObj.attrs.data = [];    
                    }
                },

                complete: function(){
                    updateList();
                }
            });
        })

    }
    
    //install sidebar
    var installSidebar = function(){
        sidebar = $('.btn-prop').sidr({
            name: 'sidr-sidebar',
            side: 'right',
            source: "#title-property, #content-property"

        })

        $(document).on('click', '.btn-prop', function(e){
            currentProp = $(this);  
            e.preventDefault();
            var $this = $(this);

            var open = $this.data('open');
            var id = $this.parent().parent().parent().attr('data-id');
            var component = $this.parent().parent().parent().attr('data-component');

            if(open == 0) {
                console.log(divElements);
                divElements.css('left', '-350px');
                $.sidr('open', 'sidr-sidebar');
                
                currentObj = findItem(elements, id);
                currentElement = $this.parent().parent().parent();
                if(currentObj != null){
                    $('#sidr-id-form-content').html(getForm(component, currentObj.attrs));
                }

                open = 1;
            }else {
                divElements.css('left', '0');
                $.sidr('close', 'sidr-sidebar');
                open = 0;
            }

            $this.data('open', open);
        });
    }

    var updateWidget = function(component,params){
        switch(component){
            case 'component-nav': updateNavigation(params); break;
            case 'component-div': updateContent(params); break;
            case 'component-text': updateText(params); break;
            case 'component-image': updateImage(params); break;
            case 'component-list': updateListElement(params); break;
        }
    }

    var updateNavigation = function(params){
        var ul = currentElement.find('.nav.navbar-nav');
        var header = currentElement.find('.navbar-brand');

        header.text(params.title);

        if(params.itens.length == 1 && currentObj.isVariable(params.itens[0])){
            ul.empty();
            for(var i=0; i < currentObj.attrs.data.length; i++){
                ul.append('<li><a href="#">'+currentObj.attrs.data[i][params.itens[0]][0]+'</a></li>');
            }
        }else{
            //caso sejam itens fixos
            for(var i=0; i < params.itens.length; i++){
                ul.append('<li><a href="#">'+params.itens[i]+'</a></li>');
            }    
        }
        
        ul.removeClass().addClass('nav navbar-nav ' + params.classes);
        currentObj.attrs.html = currentElement.find('.navbar');
    }

    var updateContent = function(params){
        currentElement.attr('data-name', params.name); //altera o nome do elemento no atributo data
        var pss = params.type == undefined ? "pss-panel" : "pss-div";
        var classWidth = '';

        if(params.width == 'row' || params.width == '0') classWidth = 'col-md-12';
        else classWidth = 'col-md-' + params.width;

        var classes = 'panel panel-default panel-drag container-div helper '+ classWidth +' '+ pss;
        //adiciona a classe, caso necessário
        currentElement.removeClass().addClass(removeDuplicateWord(skipClasses(classes)));
        //currentElement.addClass(params.classes); //adiociona as classes adicionadas pelo usuário
        
        if(params.type != undefined ){
            currentElement.children('.panel-body').removeClass().addClass('panel-body drop ui-sortable ui-droppable ' + (params.type != 'div' ? params.type : ""));
        }
    }

    var updateText = function(params){
        currentElement.attr('data-name', params.name); //altera o nome do elemento no atributo data

        var text = params.text;
        if(_.any(currentObj.attrs.dataParent) && currentObj.isVariable(params.text) ){
            text = currentObj.attrs.dataParent[0][params.text];
        }
        
        
        //adiciona o texto do objeto e as classes definidas pelo usuário
        if(params.tag != undefined) {
            currentElement.find('.panel-body').addClass(params.classes).html($('<'+params.tag+' />').text(text)); //atualiza o elemento visual
            currentObj.attrs.html = $('<'+params.tag+' />'); //atualiza o elemento do preview
        }else {
            currentElement.find('.panel-body p').addClass(params.classes).text(text);
        }


        currentElement.find('.panel-body')
            .removeClass('text-normal text-center text-left text-right text-justify')
            .addClass('text-'+params.align); //adiciona a classe para alinhamento
        
        //atualiza o html do objeto
        currentObj.attrs.html
                        .removeClass('text-normal text-center text-left text-right text-justify')
                        .addClass(params.classes + ' text-'+params.align)
                        .text(text);
    }

    var updateImage = function(params){
        currentElement.attr('data-name', params.name); //altera o nome do elemento no atributo data
        currentElement.find('img').attr('src', params.src).addClass(params.classes) //alterar o src da imagem e insere as classes
            .prop('width', params.width)
            .prop('height', params.height);

        if (currentObj.attrs.type == 'image') {
            currentObj.attrs.html
                            .attr('src', params.src)
                            .attr('width', params.width)
                            .attr('height', params.height)
                            .removeClass()
                            .addClass(params.classes);
        }else {
            currentObj.attrs.html
                            .removeClass()
                            .addClass('thumbnail' + params.classes)
                            .find('img')
                                .attr('src', params.src)
                                .attr('width', params.width)
                                .attr('height', params.height);
        }
    }

    var updateListElement = function(params){
        currentElement.attr('data-name', params.name); //altera o nome do elemento no atributo data
        var ul = currentElement.find('ul').empty();
        var ol = currentElement.find('ol').empty();

        // Define os itens do menu com respectivos links, caso necessário
        var itens = [], links = [];
        if(params.value == 1){
            var variable = params.itens;
            var label = params.label;

            if(currentObj.isVariable(variable)){
                if(label.length > 0){
                    for(var i=0; i<currentObj.attrs.dataParent.length; i++){
                        if(currentObj.attrs.dataParent[i][variable][label]) itens.push(currentObj.attrs.dataParent[i][variable][label]);
                        if(currentObj.attrs.dataParent[i][variable][params.hrefs[0]]) links.push(currentObj.attrs.dataParent[i][variable][params.hrefs[0]]);

                    }
                }else{
                    for(var i=0; i<currentObj.attrs.dataParent.length; i++){
                        if(currentObj.attrs.dataParent[i][variable]) itens.push(currentObj.attrs.dataParent[i][variable]);
                        if(currentObj.attrs.dataParent[i][params.hrefs[0]]) links.push(currentObj.attrs.dataParent[i][params.hrefs[0]]);
                    }
                }
            }
        }else{
            itens = params.itens;
        }

        //insere as classes
        ul.addClass(params.classes); 
        ol.addClass(params.classes);
        ul.removeClass('list-group').addClass(params.bootstrap == 0 ? '' : 'list-group');
        ol.removeClass('list-group').addClass(params.bootstrap == 0 ? '' : 'list-group');

        for(var i=0; i<itens.length; i++){
            //monta a lista
            if(ul.length > 0){
                //insere o link, se necessário
                if(links.length == 0){
                    ul.append($('<li />').removeClass('list-group-item')
                        .addClass(params.bootstrap == 0 ? '' : 'list-group-item')
                        .text(itens[i]));    
                }else{
                    ul.append($('<li />').removeClass('list-group-item')
                        .addClass(params.bootstrap == 0 ? '' : 'list-group-item')
                        .append('<a href="#">'+ itens[i] +'</a>'));
                }
                
            }else{
                if(links.length == 0){
                    ol.append($('<li />').removeClass('list-group-item')
                        .addClass(params.bootstrap == 0 ? '' : 'list-group-item')
                        .text(itens[i]));
                }else{
                    ol.append($('<li />').removeClass('list-group-item')
                        .addClass(params.bootstrap == 0 ? '' : 'list-group-item')
                        .append('<a href="#">'+ itens[i] +'</a>'));
                }
            }
        }

        currentObj.attrs.html = ul.length > 0 ? ul : ol;
    }

    var getForm = function(component, attrs){
        switch(component){
            case 'component-nav': return _.template($('#form-nav').html())({item:attrs});
            case 'component-div': return _.template($('#form-container').html())({item:attrs});
            case 'component-text': return _.template($('#form-text').html())({item:attrs});
            case 'component-image': return _.template($('#form-image').html())({item:attrs});
            case 'component-list': return _.template($('#form-list').html())({item:attrs});
        }
    }

    var removeElement = function(){
        $(document).on('click', '.btn-remove', function(e){
            e.preventDefault();
            if(confirm("Deseja realmente excluir esse item?")){
                if($('#sidr-sidebar').is(':visible')) currentProp.click(); //fecha as propriedades antes de excluir
                //remove o objeto do array de elementos
                var panel = $(this).parent().parent().parent();
                var id = panel.attr('data-id');
                removeElementInArray(id);
                
                //remove os filhos do elemento
                panel.find('.panel-drag').each(function(index, element){
                    var children = $(this).attr('data-id');
                    removeElementInArray(children);
                });

                //remove do protótipo
                $(this).parent().parent().parent().remove();
                
                //refaz a lista
                concreto.htmlElements = generateListItems($('#prototype')); //refaz a lista de elementos
                saveWebStorage();
            }
        })
    }

    var removeElementInArray = function(id){
        var index = null;
        for(var i=0; i<elements.length; i++){
            if(elements[i].attrs.id == parseInt(id)) {
                index = i;
                break;
            }
        }

        if(index != null) elements.splice(index,1);
    }

    
    //remove o style inline dos elementos
    var removeStyle = function(){
        $('*').removeAttr('style');
    }

    var getHelper = function(el){
        var current  = $(el); //DOM do elemento que foi arrastado

        var component = current.data('component'); //define qual a categoria do item arrastado
        var template = $('#'+component).html(); //pega o template da categoria
        var data = current.data('item'); //define qual o item arrastado
        var type = current.data('type'); //define o tipo de cada elemento
        var nameComponent = current.data('name')
        var helper;

        if(data == 'pss-div' || data == 'pss-form') helper = ""; //se for um container ou div, então deixa como está
        else helper = _.template(template)({item:data}); //compila o template
        
        var item = new Object();
        item.nameComponent = nameComponent;
        item.type = type;
        item.html = helper.trim();
        
        var aux = $(_.template(base)({item:item})); //insere o elemento dentro do panel base


        if(component == 'container-div' || component == 'form-form'){
            aux.addClass(component);

            //define qual a região de possível arraste
            if(data == 'pss-div' || data == 'pss-form') {
                aux.find('.panel-body').first().addClass('drop');
            } else {
                aux.find('.panel-body .panel-body').first().addClass('drop');
            }

            aux.addClass(data);
        }else if(component == 'container-text' || component == 'component-nav'){
            aux.addClass(component);   
        }

        //determina que tipo de componente o objeto é
        var dataComponent = current.attr('class').split(' ')[1];        
        aux.attr('data-component', dataComponent);

        return aux.addClass('helper col-md-12');
    }
    
    var createDrag = function(){
        $('.element-item').draggable({
            connectToSortable: '.drop, #prototype',

            helper: function(){
                return getHelper(this);
            }
        });

        $('.element-item-form').draggable({
            connectToSortable: '.drop, #prototype',

            helper: function(){
                return getHelper(this);
            }
        });

        $('.component-nav').draggable({
            connectToSortable: '#prototype',

            helper: function(){
                return getHelper(this);
            }
        });

        $('.element-item-div').draggable({
            connectToSortable: '#prototype, #prototype .drop',

            helper: function(){
                return getHelper(this);
            },

            stop: function(event, ui){
                $('#prototype .drop').sortable({
                    connectWith: '.drop, #prototype',
                    handle: '.btn-move',
                    tolerance: 'pointer',
                    helper: 'clone',
                    
                    stop: function(event, ui){
                        var current = $(this).parents('.panel-drag').first();
                        var type = ui.item.data('type');

                        if(current.hasClass('pss-form') && type != 'input'){
                            ui.item.remove();
                        }
                    },

                    receive: function(event, ui){
                        var current = $(this).parents('.panel-drag').first();
                        var type = ui.item.data('type');
                        
                        if(current.hasClass('pss-form') && type != 'input'){
                            ui.item.remove();
                        }else{
                            console.log(type, current.hasClass('pss-form'));    
                            dropElement(ui.helper).show();    
                        }
                    }

                }).droppable({
                    tolerance: 'pointer'
                });

                /*
                $('.pss-form .drop').droppable({
                    accept: function(el){
                        var component = el.data('component');
                        console.log(component == 'component-form');
                        return component == 'component-form';
                    }    
                });*/
            }
        });

        $('#prototype').sortable({
            connectWith: '.drop',
            handle:'.btn-move',
            tolerance: 'pointer',
            helper: 'clone',
            receive: function(event, ui){
                dropElement(ui.helper).show();
                //return true;
            }

        }).droppable({
            //accept: '.container-div, .component-nav',
            tolerance: 'pointer'
        });

        /*
        $('.pss-form .drop').droppable({
            accept: function(el){
                console.log(el);
                return true;
            }
        })*/

    }

    var dropElement = function(el){
        el.removeAttr('style'); 
        var id = el.data('id');
        
        if(id.length > 0){
            updateList();
        }else{
            createEl(el);
        }

        saveWebStorage();
        return el;
    }

    var updateElement = function(el){
        for(var i=0; i<elements.length; i++){
            if(elements[i].attrs.id == el.attrs.id) {
                elements[i] = el; 
                return;
            }
        }
    }
    

    var createEl = function(el){
        concreto.setStrategy(strategyDrag); //inicia com a estratégia default
        var builder = selectBuilder(el.data('component')); //seleciona o construtor do elemento
        concreto.setBuilder(builder); //

        var obj = concreto.constructElement(); //constroi os elementos - Função do Diretor
        el.attr('data-id', obj.attrs.id);
        el.attr('data-name', obj.attrs.name);
        
        obj.attrs.type = el.data('type');
        obj.generateHtml();

        elements.push(obj); //insere na lista de objetos
        concreto.htmlElements = generateListItems($('#prototype')); //refaz a lista de elementos
        
    };

    var findItem = function(array, id){
        for(var i=0; i<array.length; i++){
            if(array[i].attrs.id == id) return array[i];
        }

        return null;
    }

    var generateAbstractNavigation = function(abstractObj, item){
        //cria a lista
        var list = new Object();
        list.name = abstractObj.name + "List";
        list.datasource = abstractObj.datasource;
        list.parse = abstractObj.parse;
        list.children = [];

        //criando os itens
        var listItem = [];
        //se for estático, gera um lista com todos os itens
        if(item.attrs.value == 0){
            for(var i=0; i<item.attrs.itens.length; i++){
                var aux = new Object();
                aux.name = abstractObj.name + "ListItem" + (i+1);
                listItem.push(aux);
            }
        }else{
            var aux = new Object();
            aux.name = abstractObj.name + "ListItem";
            listItem.push(aux);
        }

        abstractObj.children.push(list);
        abstractObj.children[0].children = abstractObj.children[0].children.concat(listItem);

        return abstractObj;
    }

    var generateAbstractThumbnail = function(abstractObj, item){
        var thumbnail = new Object();
        thumbnail.name = abstractObj.name + 'Thumbnail';
        thumbnail.datasource = abstractObj.datasource;
        thumbnail.parse = abstractObj.parse;

        thumbnail.children = [];
        thumbnail.children.push(abstractObj);

        return thumbnail; 

    }

    var generateAbstractPanel = function(abstractObj, item){
        var panel = new Object();
        panel.name = abstractObj.name + 'Panel';
        panel.children = [];

        var title = new Object();
        title.name = abstractObj.name + 'PanelTitle';

        panel.children.push(title);
        panel.children.push(abstractObj);

        return panel;
    }

    var generateAbstractList = function(abstractObj, item){
        var listItem = [];
        var listLinks = [];
        if(item.attrs.value == 0){
            for(var i=0; i<item.attrs.itens.length; i++){
                var aux = new Object();
                aux.name = abstractObj.name + "Item" + (i+1);

                var link = new Object();
                link.name = abstractObj.name + "Item" + (i+1) + "ItemLink";

                aux.children = [];
                aux.children.push(link);
                listItem.push(aux);    
            }
            
        }else {
            var aux = new Object();
            aux.name = abstractObj.name + "Item";
            
            var link = new Object();
            link.name = abstractObj.name + "ItemLink";

            aux.children = [];
            aux.children.push(link);

            listItem.push(aux);
        }

        abstractObj.children = abstractObj.children.concat(listItem);

        return abstractObj;
    }

    var setData = function(current, parent){
        /*
        console.log(current);
        console.log(parent);
        console.log('');*/
        if (parent == null) return current;

        if(_.any(current.attrs.data)){
            //se o objeto data estiver setado com algo, então dataParent passa a ser os seus dados
            current.attrs.dataParent = JSON.parse(JSON.stringify(current.attrs.data));
        }else if(_.any(parent.attrs.dataParent)) {
            //se o pai do elemento conter dados, então os dados são passados para o filho 
            current.attrs.dataParent = JSON.parse(JSON.stringify(parent.attrs.dataParent));
        }else{
            //não existem dados
            current.attrs.dataParent = [];
        }

        return current;
    }


    var generateListItems = function(root){
        var array = [];

        var panel = root.closest('.panel-drag');
        
        //dados do root
        var rootId = panel.length > 0 ? panel.attr('data-id') : undefined;
        var rootItem = findItem(elements, rootId);
        
        root.children('.panel-drag').each(function(index, element){
            var current = $(this);
            var id = current.attr('data-id');
            var type = current.attr('data-type');
            var item = findItem(elements, id);

            if(item == null) return true; //continue
            
            item = setData(item, rootItem); //defino quais são os dados utilizáveis 
            
            var obj = new Object();
            obj.datasource = item.attrs.datasource == undefined || item.attrs.datasource.length == 0 ? '': item.attrs.datasource.replace('http://localhost:3000', 'url:');
            obj.parse =  item.attrs.parse == undefined || item.attrs.parse.length == 0  ? '' : '$data["'+ item.attrs.parse +'"]';
            obj.name = $(this).attr('data-name');
            obj.children = [];

            //caso seja um menu de navegação tem que criar a hierarquia de Nav > List > Item
            switch(type){
                case 'nav': obj = generateAbstractNavigation(obj, item); break;
                case 'thumbnail': obj = generateAbstractThumbnail(obj, item); break;
                case 'panel': obj = generateAbstractPanel(obj, item); break;
                case 'list-ordered':
                case 'list-unordered': obj = generateAbstractList(obj, item);
            }

            var children = [];
            if(type == 'panel'){
                children = $(this).children('.panel-body').children('.panel').children('.panel-body').children('.panel-drag');
            }else{
                children = $(this).children('.panel-body').children('.panel-drag');    
            }
            
            if(children.length > 0){
                if(type == 'panel') obj.children[1] = generateListItems($(this).children('.panel-body').children('.panel').children('.panel-body'));
                else obj.children = generateListItems($(this).children('.panel-body'));
            }

            if(obj.children.length == 0) obj.children = undefined;

            array.push(obj);
        });

        return array;
    };

    var selectBuilder = function(component){
        
        switch(component){
            case 'component-nav': return new Navigation();
            case 'component-div': return new Content();
            case 'component-text': return new Text();
            case 'component-image': return new Image();
            case 'component-list': return new List();
            case 'component-form' : return new Form();
        }
    }

    var updateList = function(){
        concreto.htmlElements = generateListItems($('#prototype')); //refaz a lista de elementos
    }

    var previewDiv = function(currentObj, newElement){
        //width
        if(currentObj.attrs.width == 'row'){
            newElement.addClass('row');
        }else if(currentObj.attrs.width != '0'){
            newElement.addClass('col-md-' + currentObj.attrs.width);    
        }

        //type
        if(currentObj.attrs.type != 'panel' && currentObj.attrs.type != 'div'){
            newElement.addClass(currentObj.attrs.type);
        }

        return newElement;
    }

    var previewText = function(currentObj, newElement, index){
        if(_.any(currentObj.attrs.dataParent) && _.has(currentObj.attrs.dataParent[0], currentObj.attrs.text) && index != undefined){
            newElement.text(currentObj.attrs.dataParent[index][currentObj.attrs.text]);
        }

        return newElement;
    }

    var previewImage = function(currentObj, newElement, index){
        if(_.any(currentObj.attrs.dataParent) && _.has(currentObj.attrs.dataParent[0], currentObj.attrs.text) && index != undefined){
            var img = newElement.find('img');
            newElement = img.length > 0 ? img : newElement;

            newElement.attr('src', currentObj.attrs.dataParent[index][currentObj.attrs.src]);
        }

        return newElement;    
    }

    var generatePreview = function(root, currentElement){
        var id = root.parent().attr('data-id');
        var rootType = root.parent().attr('data-type');
        var item = findItem(elements, id);
        var times = item == null || !item.attrs.data.length || item.attrs.data.length == 0 ? 1 : item.attrs.data.length; //quantidade de vezes que será repetido

        var selecteds = rootType == 'panel' ? root.children('.panel').children('.panel-body').children('.panel-drag') : root.children('.panel-drag');
        
        for(var i=0; i<times; i++){
            selecteds.each(function(index, element){
                var $this = $(this); //panel drag corrente
                var currentObj = findItem(elements, $this.attr('data-id')); //elemento com as informações do objeto
                var component = $this.attr('data-component'); //tipo do elemento
                var newElement = currentObj.attrs.html.clone();

                switch(component){
                    case 'component-div': newElement = previewDiv(currentObj, newElement); break;
                    case 'component-text': newElement = previewText(currentObj, newElement, i); break;
                    case 'component-image': newElement = previewImage(currentObj, newElement, i); break;

                }
                
                //insere o novo item no preview
                if(currentElement.hasClass('panel')){
                    currentElement.children('.panel-body').append(newElement);
                }else{
                    currentElement.append(newElement);
                }

                var children = $this.find('.panel-drag');
                if(children.length > 0) generatePreview($this.children('.panel-body'), newElement);
            })    
        }        
    }

    var concreteInterfaceNodes = [];
    var concreteInterfaceItems = [];
    //geração de interface concreta
    var generateConcreteInterface = function(){

    }

    var init = function(){
        installSidebar(); //cria o sidebar com as propriedades dos objetos
        removeElement(); //criar a opção de remoção dos objetos    
        saveCloseOption(); //ação ao clicar no botão salvar
        radioEvent(); //ação ao selecionar estático ou dinâmico no formulário
        tabBootstrap(); //evento para exibição do modo preview ou design
        loadWebStorage(); //carrega os dados do web storage
        projectFunctions(); //insere a funcionalidades para criação, download e importação de um projeto.
        createDrag(); //cria a propriedade de drag para todos os elementos
        /*
        //monitora de 3 em 3 segundos    
        setInterval(function(){
            updateList();
            agente.execute(); 
        }, 3000);*/
    }

    init();    
    
}());

