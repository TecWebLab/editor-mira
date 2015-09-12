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

    /* Funções do webstorage */
    var saveWebStorage = function(){
        var obj = new Object();
        obj.name = $('#nameInterface').val();
        obj.html = $('#prototype').html();
        obj.elements = JSON.stringify(elements);

        localStorage.setItem('project', JSON.stringify(obj));
    }

    var loadWebStorage = function(){
        var project = localStorage.getItem('project');

        if(project && confirm('Já existe um projeto em andamento. Deseja abrí-lo?')){
            project = JSON.parse(project);
            console.log(project);
            $('#nameInterface').val(project.name);
            $('#prototype').html(project.html);
            elements = JSON.parse(project.elements);

            updateList();
            agente.execute();
        }
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


        //atualiza o elemento
        updateWidget(currentElement.attr('data-component'), attrs);
        currentObj.updateAttr(attrs);

        //atualiza os dados de acordo com o parse
        if(attrs['parse'].length > 0 && currentObj.attrs.data[attrs['parse']]){
            currentObj.attrs.data = currentObj.attrs.data[attrs['parse']];
        }

        updateElement(currentObj);
        updateList(); //atualiza a interface abstrata
        saveWebStorage();
    }

    var radioEvent = function(){
        $(document).on('change', 'input[type=radio][name=value]', function(e){
            var value = parseInt($(this).val());
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
                    alert('error na requisição');
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
                $.sidr('open', 'sidr-sidebar');
                
                currentObj = findItem(elements, id);
                currentElement = $this.parent().parent().parent();
                if(currentObj != null){
                    $('#sidr-id-form-content').html(getForm(component, currentObj.attrs));
                }

                open = 1;
            }else {
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
            for(var i=0; i < currentObj.attrs.data.length; i++){
                ul.append('<li><a href="#">'+currentObj.attrs.data[i][params.itens[0]]+'</a></li>');
            }
        }else{
            //caso sejam itens fixos
            for(var i=0; i < params.itens.length; i++){
                ul.append('<li><a href="#">'+params.itens[i]+'</a></li>');
            }    
        }
        

        ul.removeClass().addClass('nav navbar-nav' + params.classes);
        currentObj.attrs.html = currentElement.find('.navbar');
    }

    var updateContent = function(params){
        currentElement.attr('data-name', params.name); //altera o nome do elemento no atributo data
        
        //adiciona a classe, caso necessário
        currentElement.addClass('col-md-'+params.width);
        currentElement.addClass(params.classes); //adiociona as classes adicionadas pelo usuário
    }

    var updateText = function(params){
        currentElement.attr('data-name', params.name); //altera o nome do elemento no atributo data
        
        //adiciona o texto do objeto e as classes definidas pelo usuário
        if(params.tag != undefined) {
            currentElement.find('.panel-body').addClass(params.classes).html($('<'+params.tag+' />').text(params.text)); //atualiza o elemento visual
            currentObj.attrs.html = $('<'+params.tag+' />'); //atualiza o elemento do preview
        }else {
            currentElement.find('.panel-body p').addClass(params.classes).text(params.text);
        }


        currentElement.find('.panel-body')
            .removeClass('text-normal text-center text-left text-right text-justify')
            .addClass('text-'+params.align); //adiciona a classe para alinhamento
        
        //atualiza o html do objeto
        currentObj.attrs.html
                        .removeClass('text-normal text-center text-left text-right text-justify')
                        .addClass(params.classes + ' text-'+params.align)
                        .text(params.text);
        

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

        //insere as classes
        ul.addClass(params.classes); 
        ol.addClass(params.classes);
        ul.removeClass('list-group').addClass(params.bootstrap == 0 ? '' : 'list-group');
        ol.removeClass('list-group').addClass(params.bootstrap == 0 ? '' : 'list-group');

        for(var i=0; i<params.itens.length; i++){
            if(ul.length > 0){
                ul.append($('<li />').removeClass('list-group-item')
                    .addClass(params.bootstrap == 0 ? '' : 'list-group-item')
                    .text(params.itens[i]));
            }else{
                ol.append($('<li />').removeClass('list-group-item')
                    .addClass(params.bootstrap == 0 ? '' : 'list-group-item')
                    .text(params.itens[i]));
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
                var id = $(this).parent().parent().parent().attr('data-id');
                removeElementInArray(id);
                
                //remove do protótipo
                $(this).parent().parent().parent().remove();
                
                //refaz a lista
                concreto.htmlElements = generateListItems($('#prototype')); //refaz a lista de elementos    
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

        if(data == 'pss-container' || data == 'pss-div') helper = ""; //se for um container ou div, então deixa como está
        else helper = _.template(template)({item:data}); //compila o template
        
        var item = new Object();
        item.nameComponent = nameComponent;
        item.type = type;
        item.html = helper.trim();
        
        var aux = $(_.template(base)({item:item})); //insere o elemento dentro do panel base


        if(component == 'container-div'){
            aux.addClass(component);

            //define qual a região de possível arraste
            if(data == 'pss-container' || data == 'pss-div' || data == 'pss-jumbotron') {
                aux.find('.panel-body').first().addClass('drop');
                if(data == 'pss-jumbotron') aux.find('.panel-body').first().addClass('jumbotron');
            } else {
                aux.find('.panel-body .panel-body').first().addClass('drop');
                //if(data == 'pss-jumbotron') aux.find('.panel-body').first().addClass('jumbotron');
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
            connectToSortable: '.drop',

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
                    receive: function(event, ui){
                        dropElement(ui.helper).show();
                    }
                }).droppable({
                    tolerance: 'pointer'
                });

                /*
                $('#prototype .drop').droppable({
                    drop: function(event, ui){
                        ui.draggable.removeAttr('style');                
                    }
                })*/
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
            accept: '.container-div, .component-nav',
            tolerance: 'pointer'

        }).disableSelection();

        /*
        $('#prototype').droppable({
            accept: '.container-div, .component-nav',
            drop: function(event, ui){
                dropElement(ui.helper);
            }
        })

        
        $('.drop').droppable({
            //accept: '.container-div, .component-nav'
            drop: function(event, ui){
                dropElement(ui.helper);    
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

    var initClassElement = function(obj){
        switch(obj.attrs.type){
            //content
            case 'container': obj.attrs.classes = 'container'; break;
            case 'jumbotron': obj.attrs.classes = 'jumbotron'; break;
        }

        return obj;
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

        obj = initClassElement(obj);
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
        list.datasource = abstractObj.datasource.length > 0 ?  abstractObj.datasource : undefined;
        list.parse = abstractObj.parse.length > 0 ? abstractObj.parse : undefined;
        list.children = [];

        abstractObj.datasource = undefined;
        abstractObj.parse = undefined;

        //criando os itens
        var listItem = [];
        console.log(item.attrs.value);
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
        thumbnail.datasource = abstractObj.datasource.length > 0 ? abstractObj.datasource : undefined;
        thumbnail.parse = abstractObj.parse.length > 0 ? abstractObj.parse : undefined;

        abstractObj.datasource = undefined;
        abstractObj.parse = undefined;

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
        if(item.attrs.value == 0){
            for(var i=0; i<item.attrs.itens.length; i++){
                var aux = new Object();
                aux.name = abstractObj.name + "Item" + (i+1);
                listItem.push(aux);    
            }
            
        }else {
            var aux = new Object();
            aux.name = abstractObj.name + "Item";
            listItem.push(aux);
        }

        abstractObj.children = abstractObj.children.concat(listItem);
        console.log(abstractObj);

        return abstractObj;
    }

    var setData = function(current, parent){
        if (parent == null) return current;

        if((parent.attrs.data instanceof Array && parent.attrs.data.length > 0) || parent.attrs.data instanceof Object) {
            //pega os dados do parent
            current.attrs.parentData = JSON.parse(JSON.stringify(parent.attrs.data));
        }else{
            //pega os dados do parent do parent
            console.log(current);
            current.attrs.parentData = JSON.parse(JSON.stringify(parent.attrs.dataParent));    
        }

        return current;
        
    }


    var generateListItems = function(root){
        var array = [];

        //dados do root
        var rootId = root.attr('data-id');
        var rootItem = findItem(elements, rootId);

        root.children('.panel-drag').each(function(index, element){
            var current = $(this);
            var id = current.attr('data-id');
            var type = current.attr('data-type');
            var item = findItem(elements, id);
            
            console.log(elements);
            item = setData(item, rootItem); //defino quais são os dados utilizáveis 
            
            var obj = new Object();

            obj.datasource = item.attrs.datasource.length > 0 ? item.attrs.datasource.replace('http://localhost:3000', 'url') : '';
            obj.parse =  item.attrs.parse.length > 0 ? '$data["'+ item.attrs.parse +'"]' : '';
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

            var children = $(this).children('.panel-body').children('.panel-drag');
            if(children.length > 0){
                if(type == 'panel') obj.children[1] = generateListItems($(this).children('.panel-body'));
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
        }
    }

    var updateList = function(){
        concreto.htmlElements = generateListItems($('#prototype')); //refaz a lista de elementos
    }

    var generatePreview = function(root, currentElement){
        var id = root.parent().attr('data-id');
        var rootType = root.parent().attr('data-type');
        var item = findItem(elements, id);
        var times = item == null || item.attrs.data.length == 0 ? 1 : item.attrs.data.length; //quantidade de vezes que será repetido

        var selecteds = rootType == 'panel' ? root.children('.panel').children('.panel-body').children('.panel-drag') : root.children('.panel-drag');
        
        for(var i=0; i<times; i++){
            selecteds.each(function(index, element){
                var $this = $(this); //panel drag corrente
                var currentObj = findItem(elements, $this.attr('data-id')); //elemento com as informações do objeto
                var type = $this.attr('data-type'); //tipo do elemento
                var newElement = currentObj.attrs.html.clone();
                console.log(newElement);

                //insere o novo item no preview
                if(currentElement.hasClass('panel')){
                    currentElement.children('.panel-body').append(newElement);
                }else{
                    currentElement.append(newElement);
                }

                var children = $this.find('.panel-drag')
                if(children.length > 0) generatePreview($this.children('.panel-body'), newElement);
            })    
        }        
    }


    var init = function(){
        createDrag(); //cria a propriedade de drag para todos os elementos
        installSidebar(); //cria o sidebar com as propriedades dos objetos
        removeElement(); //criar a opção de remoção dos objetos    
        saveCloseOption(); //ação ao clicar no botão salvar
        radioEvent(); //ação ao selecionar estático ou dinâmico no formulário
        tabBootstrap(); //evento para exibição do modo preview ou design
        loadWebStorage();

        //monitora de 3 em 3 segundos    
        setInterval(function(){
            agente.execute(); 
        }, 5000);
    }

    init();    
    
}());

