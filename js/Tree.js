/* =========================================================
 * bootstrap-treeview.js v1.2.0
 * =========================================================
 * Copyright 2013 Jonathan Miles
 * Project URL : http://www.jondmiles.com/bootstrap-treeview
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */

;(function ($, window, document, undefined) {

	/*global jQuery, console*/

	'use strict';

	var pluginName = 'treeview';

	var _default = {};

	_default.settings = {

		injectStyle: true,

		levels: 6,

		expandIcon: 'fa fa-chevron-right',
		collapseIcon: 'fa fa-chevron-down',
		emptyIcon: 'fa',
		nodeIcon: '',
		selectedIcon: '',
		checkedIcon: 'fa fa-check-square-o',
		uncheckedIcon: 'fa fa-square-o',

		color: undefined, // '#000000',
		backColor: undefined, // '#FFFFFF',
		borderColor: undefined, // '#dddddd',
		onhoverColor: '#F5F5F5',
		selectedColor: '#FFFFFF',
		selectedBackColor: '#428bca',
		searchResultColor: '#D9534F',
		searchResultBackColor: undefined, //'#FFFFFF',

		enableLinks: false,
		highlightSelected: true,
		highlightSearchResults: true,
		showBorder: true,
		showIcon: true,
		showCheckbox: false,
		showTags: false,
		multiSelect: false,

		// Event handlers
		onNodeChecked: undefined,
		onNodeCollapsed: undefined,
		onNodeDisabled: undefined,
		onNodeEnabled: undefined,
		onNodeExpanded: undefined,
		onNodeSelected: undefined,
		onNodeUnchecked: undefined,
		onNodeUnselected: undefined,
		onSearchComplete: undefined,
		onSearchCleared: undefined,
		onTreeRender: undefined
	};

	_default.options = {
		silent: false,
		ignoreChildren: false
	};

	_default.searchOptions = {
		ignoreCase: true,
		exactMatch: false,
		revealResults: true
	};

	/**
	 * Módulo reponsável por gerenciar a TreeView representando a interface abstrata. Isso é uma adaptação do Plugin BootstrapTreeView,
	 * desenvolvido por Jonathan Miles.
	 * @class Tree
	 * @author Jonathan Miles
	 * @param {Selector} element Seletor jQuery onde o plugin irá atuar.
	 * @param {Object} options Conjunto de opções de inicialização do plugin.
	 * @return Uma instância do plugin BootstrapTreeView.
	 */
	var Tree = function (element, options) {
		/**
	    * @property $element Objeto jQuery onde o plugin irá atuar.
	    * @type {jQuery}
	    */
		this.$element = $(element);

		/**
	    * @property elementId Identificador do item da lista.
	    * @type {Selector}
	    */
		this.elementId = element.id;

		/**
	    * @property id classe inicial para identificação do item da lista.
	    * @type {string}
	    */
		this.styleId = this.elementId + '-style';
		this.id = 0;

		this.init(options);

		return {

			// Options (public access)
			options: this.options,

			// Initialize / destroy methods
			init: $.proxy(this.init, this),
			remove: $.proxy(this.remove, this),

			// Get methods
			getNode: $.proxy(this.getNode, this),
			getParent: $.proxy(this.getParent, this),
			getSiblings: $.proxy(this.getSiblings, this),
			getSelected: $.proxy(this.getSelected, this),
			getUnselected: $.proxy(this.getUnselected, this),
			getExpanded: $.proxy(this.getExpanded, this),
			getCollapsed: $.proxy(this.getCollapsed, this),
			getChecked: $.proxy(this.getChecked, this),
			getUnchecked: $.proxy(this.getUnchecked, this),
			getDisabled: $.proxy(this.getDisabled, this),
			getEnabled: $.proxy(this.getEnabled, this),

			// Select methods
			selectNode: $.proxy(this.selectNode, this),
			unselectNode: $.proxy(this.unselectNode, this),
			toggleNodeSelected: $.proxy(this.toggleNodeSelected, this),

			// Expand / collapse methods
			collapseAll: $.proxy(this.collapseAll, this),
			collapseNode: $.proxy(this.collapseNode, this),
			expandAll: $.proxy(this.expandAll, this),
			expandNode: $.proxy(this.expandNode, this),
			toggleNodeExpanded: $.proxy(this.toggleNodeExpanded, this),
			revealNode: $.proxy(this.revealNode, this),

			// Expand / collapse methods
			checkAll: $.proxy(this.checkAll, this),
			checkNode: $.proxy(this.checkNode, this),
			uncheckAll: $.proxy(this.uncheckAll, this),
			uncheckNode: $.proxy(this.uncheckNode, this),
			toggleNodeChecked: $.proxy(this.toggleNodeChecked, this),

			//Custom Methods
			addElement: $.proxy(this.addElement, this),
			removeElements: $.proxy(this.removeElements, this),

			// Disable / enable methods
			disableAll: $.proxy(this.disableAll, this),
			disableNode: $.proxy(this.disableNode, this),
			enableAll: $.proxy(this.enableAll, this),
			enableNode: $.proxy(this.enableNode, this),
			toggleNodeDisabled: $.proxy(this.toggleNodeDisabled, this),

			// Search methods
			search: $.proxy(this.search, this),
			clearSearch: $.proxy(this.clearSearch, this)
		};
	};

	/**
	 * Método responsável por iniciar o plugin com os opões informadas
	 * @method init
	 * @author Jonathan Miles
	 * @param {Object} options Conjunto de opções desejadas.
	 * @for Tree
	 */
	Tree.prototype.init = function (options) {

		this.tree = [];
		this.nodes = [];

		if (options.data) {
			if (typeof options.data === 'string') {
				options.data = $.parseJSON(options.data);
			}

			this.tree = $.extend(true, [], options.data);
			delete options.data;
		}
		this.options = $.extend({}, _default.settings, options);

		this.destroy();
		this.subscribeEvents();
		this.setInitialStates({ nodes: this.tree }, 0);
		this.initModalAndEvents();
		this.render();
	};

	/**
	 * Dertermina o identificador de um elemento gerado pelo plugin.
	 * @method setId
	 * @author Jonathan Miles
	 * @return O idenficador do elemento gerado.
	 * @for Tree
	 */
	Tree.prototype.setId = function(){
		this.id++;
		return this.id;
	}

	/**
	 * Método responsável por criar filhos para um determinado nó.
	 * @method createNodes
	 * @author João Victor Magela
	 * @param {Object} node Nó que será o pai no novo nó.
	 * @param {Object} values Valores a serem inseridos no novo elemento.
	 * @return node Nó pai atualizado.
	 */
	Tree.prototype.createNodes = function(node, values){
		for(var item in values){
			var newItem = new Object();
			newItem.text = item;
			newItem.state = [];
			newItem.checked = false;
			newItem.nodeId = this.nodes.length;
			newItem.id = this.setId();
			newItem.selectable = true;
			newItem.parentId = node.nodeId;

			if(node.$data) newItem.$data = node.$data;

			node.state.editable = false;
			node.state.disabled = false;
			node.state.added = false;

			node.nodes.push(newItem);
			this.nodes.push(newItem);
		}

		return node;
	}

	/**
	 * Método reponsável por gerar os widgets abstratos.
	 * @method createAbstractInterface
	 * @author João Victor Magela
	 * @param {Array} nodes Conjuntos de nós do BootstrapTreeView
	 * @for Tree
	 * @return Conjuto de elementos abstratos aninhados, caso necessário.
	 */
	Tree.prototype.createAbstractInterface = function(nodes){
		var abstractInterface = []; 
		for(var i = 0; i<nodes.length; i++){
			var element = new AbstractElement(nodes[i]);
			/*
			element.name = nodes[i].text;
			
			element.datasource = nodes[i].datasource && nodes[i].datasource.length > 0 ? nodes[i].datasource.replace("http://localhost:3000", "url:") : undefined;
			element.parse = nodes[i].parse && nodes[i].parse.length > 0 ? '$data["' + nodes[i].parse + '"]' : undefined;
			element.bind = nodes[i].bind && nodes[i].bind.length > 0 ? nodes[i].bind : undefined;*/

			if(nodes[i].nodes) element.children = this.createAbstractInterface(nodes[i].nodes);
			abstractInterface.push(element);
		}

		return abstractInterface;
	}

	/**
	 * Método responsável por sincronizar os dados da TreeView com dados externos ao plugin.
	 * @method reloadData
	 * @author João Victor Magela
	 * @param {Elementos da TreeView aninhados} tree
	 * @param {Elementos da TreeView como uma lista linear} nodes
	 * @for Tree 
	 */
	Tree.prototype.reloadData = function(tree, nodes){
		this.tree = tree;
		this.nodes = nodes;
	}

	Tree.prototype.getChidrenNode = function(node, ids) {
		ids.push(node.id);
		if(node.nodes) {
			for(var i=0; i < node.nodes.length; i++) {
				ids = this.getChidrenNode(node.nodes[i], ids);
			}
		}

		return ids;
	};

	/**
	 * Método responsável por iniciar as operações com modal e eventos do botões.
	 * @method initModalAndEvents
	 * @author João Victor Magela
	 * @for Tree
	 */
	Tree.prototype.initModalAndEvents = function(){
		var _this = this;
		var values; //valores baixados
		var currentData = [];

		/**
		 * Método responsável por fazer o parse dos dados de acordo com um determinado atributo
		 * @method initModalAndEvents
		 * @author João Victor Magela
		 * @for Tree
		 */
		Tree.prototype.processParse = function(parse){
			if(parse.length > 0) {
				if(values[parse]) {
					currentData = values[parse];
					values = _getValue(values[parse]);
					_refreshTable($('#panel-download-fields tbody'), values);
					return {error: false, currentData: currentData};
				}
				
				return {error: true, message: 'Não existe o campo "'+ parse + '" nos dados'};
			}
			
			return {error: true, message: "Insira um parse"};
		};

		//Modal
		var modalDownload = 
			'<div class="modal fade" id="modal-tree-download" data-id="">\
				<div class="modal-dialog">\
					<div class="modal-content">\
						<div class="modal-header">\
							<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>\
							<h4 class="modal-title">Baixar Informações</h4>\
						</div>\
						<div class="modal-body">\
							<form class="form-horizontal" role="form">\
								<div class="form-group">\
									<label class="control-label col-sm-2">Bind</label>\
									<div class="col-sm-10">\
										<div class="input-group">\
											<input type="text" class="form-control" id="field-bind" placeholder="Insira a expressão">\
										</div>\
									</div>\
								</div>\
								<div class="form-group">\
									<label class="control-label col-sm-2">Link</label>\
									<div class="col-sm-10">\
										<div class="input-group">\
											<input type="text" class="form-control" id="field-datasource" placeholder="Insira o Link">\
											<span class="input-group-btn">\
												<button class="btn btn-success" id="btn-download-information" type="button"><i class="fa fa-download"></i></button>\
											</span>\
										</div>\
										<span id="msg-error-download" class="help-block" style="display:none">Erro ao obter informações. Observe se o link está correto</span>\
									</div>\
								</div>\
								<div class="form-group" id="group-parse" style="display:none">\
									<label class="control-label col-sm-2">Parse</label>\
									<div class="col-sm-4">\
										<div class="input-group">\
											<input type="text" class="form-control" name="parse" id="parse"/>\
											<span class="input-group-btn">\
												<button class="btn btn-success" id="btn-process-parse" type="button"><i class="fa fa-refresh"></i></button>\
											</span>\
										</div>\
									</div>\
								</div>\
							</form>\
							<hr />\
							<div class="panel panel-default" id="panel-download-fields" style="display:none">\
								<div class="panel-heading">\
									Campos\
								</div>\
								<table class="table table-bordered" id="table-fields">\
									<thead>\
										<tr>\
											<th>Nome</th>\
										</tr>\
									</thead>\
									<tbody></tbody>\
  								</table>\
							</div>\
						</div>\
						<div class="modal-footer">\
							<button type="button" class="btn btn-default" data-dismiss="modal">Fechar</button>\
							<button type="button" class="btn btn-success" data-dismiss="modal" id="btn-confirm-download">Confirmar</button>\
						</div>\
					</div>\
				</div>\
			</div>';

		var modalConfirm = 
			'<div class="modal fade" id="modal-tree-confirm" data-confirm="">\
				<div class="modal-dialog">\
					<div class="modal-content">\
						<div class="modal-header">\
							<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>\
							<h4 class="modal-title">Confirmação</h4>\
						</div>\
						<div class="modal-body"></div>\
						<div class="modal-footer">\
							<button type="button" class="btn btn-default" data-dismiss="modal">Cancelar</button>\
							<button type="button" class="btn btn-danger" data-dismiss="modal">Confirmar</button>\
						</div>\
					</div>\
				</div>\
			</div>';

		/**
		 * Evento disparado ao clicar no botão de editar a partir de algum nó da TreeView. Com isso o elemento fica editável.
		 * @event Editar nó
		 * @for Tree
		 */
		$(document).on('click', '#btn-tree-edit', function(e){
			var item = $(this).parent().parent();
			var node = _this.findNode(item);

			//impede que seja adicionado mais de um campo input
			if(item.find('input').length > 0) return false;

			node.state.editable = true;
			node.state.disabled = true;

			_this.refreshTree(_this.tree, node);

			item.contents().filter(function() {
				return this.nodeType === 3;
			}).remove();

			item.append($(_this.template.text)
						.focus()
						.val(node.text)
						.keydown(function(e){
							if(e.which == 13 || e.which == 9 ){
								node.state.editable = false;
								node.state.disabled = false;
								node.text = $(this).val();

								_this.tree = _this.refreshTree(_this.tree, node);

								_this.$element.empty().append(_this.$wrapper.empty());
								_this.buildTree(_this.tree, 0);
								_this.$element.trigger('treeRender', $.extend(true, {}, _this));
							} else if(e.which == 27) {
								
								node.state.editable = false;
								node.state.disabled = false;

								_this.tree = _this.refreshTree(_this.tree, node);
								_this.$element.empty().append(_this.$wrapper.empty());
								_this.buildTree(_this.tree, 0);
								_this.$element.trigger('treeRender', $.extend(true, {}, _this));
							}
						}));
		});

		/**
		 * Evento disparado ao clicar no botão de adicionar um filho a partir de algum nó da TreeView. Com isso um novo elemento é inserido como filho do
		 * nó correspondente.
		 * @event Adicionar um filho.
		 * @for Tree
		 */
		$(document).on('click', '#btn-tree-add', function(e){
			var node = _this.findNode($(this).parents('li'));
			if(!node) {
				return;
			}

			//cria um novo objeto
			var newItem = new Object();
			newItem.text = "Novo Item";
			newItem.state = new Object();
			newItem.state.added = true;
			newItem.state.disabled = true;
			newItem.nodeId = _this.nodes.length;
			newItem.id = _this.setId();
			newItem.selectable = false;
			newItem.parentId = node.nodeId;

			if(!node.nodes) node.nodes = [];
			if(node.$data) newItem.$data = node.$data;
			
			//insere como filho do nó corrente
			node.nodes.push(newItem);

			//insere a fila de nós
			_this.nodes.push(newItem);

			//muda o estado do nó corrente para expandido
			node.state.expanded = true;

			//atualiza a tree
			_this.tree = _this.refreshTree(_this.tree, node);
			_this.$element.empty().append(_this.$wrapper.empty());
			_this.buildTree(_this.tree, 0);

			_this.$element.trigger('treeRender', $.extend(true, {}, _this));
		});

		/**
		 * Evento disparado ao clicar no botão de baixar informações a partir de algum nó da TreeView. Com isso um modal é exibindo podendo inserir as
		 * informações "bind", "datasource" e "parse" (caso haja um datasource válido).
		 * @author João Victor Magela
		 * @event Baixar informações para um nó.
		 * @for Tree
		 */
		$(document).on('click', '#btn-tree-download', function(e){
			var node = _this.findNode($(this).parents('li'));
			$('#modal-tree-download').data('id', $(this).parents('li').data('nodeid'));

			$('#field-bind').val(node.bind ?  node.bind : '');

			if(node.datasource){
				values = _getValue(node.$data);
				$('#field-datasource').val(node.datasource ? node.datasource : '');
				$('#field-parse').val(node.parse ? node.parse : '');

				_refreshTable($('#table-fields tbody'), values)

				$('#group-parse').show();
				$('#panel-download-fields').show();
			}else {
				values = null;

				$('#field-datasource').val('');
				$('#field-parse').hide().val('');

				$('#table-fields tbody').empty();

				$('#group-parse').hide();
				$('#panel-download-fields').hide();
			}
		});


		/**
		 * Evento disparado ao clicar no botão de remover um nó da TreeView. Com isso o nó e seus filhos são excluídos.
		 * @event Adicionar um filho.
		 * @author João Victor Magela
		 * @for Tree
		 */
		$(document).on('click', '#btn-tree-remove', function(e) {
			var node = _this.findNode($(this).parents('li'));
			if(!node) return;

			_this.removeElements(_this.getChidrenNode(node, []));

			_this.$element.empty().append(_this.$wrapper.empty());
			_this.buildTree(_this.tree, 0);
			_this.$element.trigger('treeRender', $.extend(true, {}, _this));
		});

		/**
		 * Evento disparado ao clicar no botão de remover nós selecionados a partir de algum nó da TreeView. Com isso os nós filhos que estão selecionados são
		 * excluídos, bem como seus filhos.
		 * @event Remover filhos selecionados.
		 * @author João Victor Magela
		 * @for Tree
		 */
		$(document).on('click', '#btn-tree-removeall', function(e){
			var node = _this.findNode($(this).parents('li'));
			if(!node) return;

			//verifica quais os filhos estão selecionados
			var ids = [];
			for(var i = 0; i < node.nodes.length; i++) {
				if(node.nodes[i].state.checked) ids = _this.getChidrenNode(node.nodes[i], ids);
			}

			_this.removeElements(ids);

			_this.$element.empty().append(_this.$wrapper.empty());
			_this.buildTree(_this.tree, 0);
			_this.$element.trigger('treeRender', $.extend(true, {}, _this));
		});

		/**
		 * Métodos responsável por filtrar os atributos de um conjunto de valores.
		 * @method _getValue
		 * @author João Victor Magela
		 * @param {Object | Array} data Conjunto de valores ou um simples objeto.
		 * @return Caso seja um array, retorna um Objeto presente na primeira posição, caso contrário retorna o objeto inteiro.
		 * @for Tree.initModalAndEvents
		 */
		var _getValue = function(data){
			return data[0] ? data[0] : data;
		}

		/**
		 * Métodos responsável por atualizar a tabela que informa os valores da tabela.
		 * @method _refreshTable
		 * @author João Victor Magela
		 * @param {jQuery} Corpo da tabela.
		 * @param {Object} data Atributos a serem inseridos na tabela.
		 * @for Tree.initModalAndEvents
		 */
		var _refreshTable = function(table, data) {
			//linha da tabela
			var line = $(
					'<tr>\
						<td class="name-item"></td>\
					</tr>'
				);

			table.empty(); //limpa previamente a tabela

			for(var item in data){
				var aux = line.clone();
				aux.find('.name-item').text(item);
				table.append(aux);
			}
		}

		/**
		 * Método responsável por obter os dados a partir de um determinado datasource e atualzar a tabela de atributos.
		 * @method _getDataFromDatasource
		 * @author João Victor Magela
		 * @param {Object | Array} data Dados obtidos a partir de um datasource
		 * @for Tree.initModalAndEvents
		 */
		var _getDataFromDatasource = function(data){
			values = _getValue(data);
			currentData = data;
				
			$('#msg-error-download').hide();
			$('#group-parse').show();
			
			var panel = $('#panel-download-fields');
			var table = panel.find('table tbody');
			
			panel.show();
			_refreshTable(table, values);
		}

		/**
		 * Método responsável por informar que foi possível obter os dados a partir do datasource informado.
		 * @method _getDataFromDatasourceFail
		 * @author João Victor Magela
		 * @param {jQuery} button Botão que gerou a operação.
		 * @for Tree.initModalAndEvents
		 */
		var _getDataFromDatasourceFail = function(button){
			currentData = [];
			button.parents('.form-group').addClass('has-error');
			$('#msg-error-download').show();
			$('#group-parse').hide();
			$('#panel-download-fields').hide();
		}

		/**
		 * Evento disparado ao clicar no botão baixar informações a partir de um datasource. Caso seja um datasource válido será possível inserir um parse para 
		 * obter dados internos aos já obtidos.
		 * @event Remover baixar informações a partir de um datasource.
		 * @for Tree
		 */
		$(document).on('click', '#btn-download-information', function(e){
			var link = $(this).parents('.form-group').find('input').val().trim();
			var button = $(this);
			var node = _this.findNode(button.parents('#modal-tree-download').data('id'));

			if(node.$data){

				try {
					var data = eval('node.' + link);
					
					if(data){
						_getDataFromDatasource(data);		
					}else{
						_getDataFromDatasourceFail(button);
					}
				} catch (e){
					$.ajax({
						url: link,
						type: 'GET',
						success: function(data){
							data = $.parseJSON($(data.responseText)[0].data);
							_getDataFromDatasource(data);	
						},

						error: function(){
							_getDataFromDatasourceFail(button);	
						}
					})					
				}
			} else{
				$.ajax({
					url: link,
					type: 'GET',
					success: function(data){
						data = $.parseJSON($(data.responseText)[0].data);
						_getDataFromDatasource(data);	
					},

					error: function(){
						_getDataFromDatasourceFail(button);	
					}
				})

			}
		});

		/**
		 * Evento disparado ao clicar no botão parse. Exibe os atributos referentes aos novos dados obtidos. 
		 * obter dados internos aos já obtidos.
		 * @author João Victor Magela
		 * @event Parse dos dados obtidos.
		 * @for Tree
		 */
		$(document).on('click', '#btn-process-parse', function(e){
			var parse = $(this).parents('.form-group').find('input').val().trim();

			var process = _this.processParse(parse);
			if(process.error) alert(process.message);
		});


		/**
		 * Evento disparado ao confirmar os dados informados no formulário do modal.
		 * @author João Victor Magela
		 * @event Confirmar dados do modal.
		 * @for Tree
		 */
		$(document).on('click', '#btn-confirm-download', function(e){
			//if(!values && !bind.length && parse.) return;

			var id = $('#modal-tree-download').data('id');
			var node = _this.findNode(id);
			
			//insere os dados no nó
			//node.data = values;
			if(values != null) {
				node.$data = undefined;
				node = _this.setDataToChildren(node, currentData);
			}
			
			node.datasource = $('#field-datasource').val().trim();
			node.bind = $('#field-bind').val().trim().length > 0 ? $('#field-bind').val().trim() : undefined;
			node.parse = $('#parse').is(':visible') && $('#parse').val().trim().length ? $('#parse').val().trim() : undefined;

			//insere o novos dados no modelo
			//node = _this.createNodes(node, values);

			//refaz a tree
			_this.tree = _this.refreshTree(_this.tree, node);
			_this.$element.empty().append(_this.$wrapper.empty());
			_this.buildTree(_this.tree, 0);
			_this.$element.trigger('treeRender', $.extend(true, {}, _this));
		})

		$('body').append(modalDownload).append(modalConfirm);
	};

	/**
	 * Método responsável por repassar os dados do pai pro filho, se necessário em toda a Tree.
	 * @method broadcastData
	 * @author João Victor Magela
	 * @for Tree
	 */
	Tree.prototype.broadcastData = function(){
		for(var i=0; i< this.tree.length; i++){
			this.tree[i] = this.setDataToChildren(this.tree[i], this.tree[i].$data);
			this.nodes[this.tree[i].nodeId] = this.tree[i];
		}
	}

	/**
	 * Método responsável por passar os dados de pai para filho, se necessário
	 * @method setDataToChildren
	 * @author João Victor Magela
	 * @param {Object} node Nó corrente
	 * @param {Object | Array} data Dados associados ao nó corrente.
	 * @return node Nó com os dados obtidos do pai.
	 * @for Tree
	 */
	Tree.prototype.setDataToChildren = function(node, data){
		// Caso o nó tenha um datasource, então não passa os dados do pai para seus filhos.
		if(!node || (node.$data && node.datasource)) return node;

		node.$data = data;

		if(node.nodes){
			for(var i=0; i<node.nodes.length;i++) {
				node.nodes[i] = this.setDataToChildren(node.nodes[i], data);
				this.nodes[node.nodes[i].nodeId] = node.nodes[i];
			}
		}

		return node;
	}

	/**
	 * Método responsável por remover os dados do plugin.
	 * @method remove
	 * @author Jonathan Miles
	 * @for Tree 
	 */
	Tree.prototype.remove = function () {
		this.destroy();
		$.removeData(this, pluginName);
		$('#' + this.styleId).remove();
	};

	/**
	 * Método responsável por destruir a instancia da Tree.
	 * @method destroy
	 * @author Jonathan Miles
	 * @for Tree
	 */
	Tree.prototype.destroy = function () {

		if (!this.initialized) return;

		this.$wrapper.remove();
		this.$wrapper = null;

		// Switch off events
		this.unsubscribeEvents();

		// Reset this.initialized flag
		this.initialized = false;
	};

	/**
	 * Método responsável por desativar todos os eventos da Tree.
	 * @method unsubscribeEvents
	 * @author Jonathan Miles
	 * @for Tree
	 */
	Tree.prototype.unsubscribeEvents = function () {

		this.$element.off('click');
		this.$element.off('nodeChecked');
		this.$element.off('nodeCollapsed');
		this.$element.off('nodeDisabled');
		this.$element.off('nodeEnabled');
		this.$element.off('nodeExpanded');
		this.$element.off('nodeSelected');
		this.$element.off('nodeUnchecked');
		this.$element.off('nodeUnselected');
		this.$element.off('searchComplete');
		this.$element.off('searchCleared');
		this.$element.off('treeRender');
	};

	/**
	 * Método responsável por ativar os eventos da Tree.
	 * @method subscribeEvents
	 * @author Jonathan Miles
	 * @for Tree
	 */
	Tree.prototype.subscribeEvents = function () {

		this.unsubscribeEvents();

		this.$element.on('click', $.proxy(this.clickHandler, this));

		if (typeof (this.options.onNodeChecked) === 'function') {
			this.$element.on('nodeChecked', this.options.onNodeChecked);
		}

		if (typeof (this.options.onNodeCollapsed) === 'function') {
			this.$element.on('nodeCollapsed', this.options.onNodeCollapsed);
		}

		if (typeof (this.options.onNodeDisabled) === 'function') {
			this.$element.on('nodeDisabled', this.options.onNodeDisabled);
		}

		if (typeof (this.options.onNodeEnabled) === 'function') {
			this.$element.on('nodeEnabled', this.options.onNodeEnabled);
		}

		if (typeof (this.options.onNodeExpanded) === 'function') {
			this.$element.on('nodeExpanded', this.options.onNodeExpanded);
		}

		if (typeof (this.options.onNodeSelected) === 'function') {
			this.$element.on('nodeSelected', this.options.onNodeSelected);
		}

		if (typeof (this.options.onNodeUnchecked) === 'function') {
			this.$element.on('nodeUnchecked', this.options.onNodeUnchecked);
		}

		if (typeof (this.options.onNodeUnselected) === 'function') {
			this.$element.on('nodeUnselected', this.options.onNodeUnselected);
		}

		if (typeof (this.options.onSearchComplete) === 'function') {
			this.$element.on('searchComplete', this.options.onSearchComplete);
		}

		if (typeof (this.options.onSearchCleared) === 'function') {
			this.$element.on('searchCleared', this.options.onSearchCleared);
		}

		if (typeof (this.options.onTreeRender) === 'function') {
			this.$element.on('treeRender', this.options.onTreeRender);
		}

	};

	/**
	 * Define o estado inicial de cada nó da árvore (valores padrões) 
	 * @method setInitialStates
	 * @author Jonathan Miles
	 * @param {Object} node Elemento da Tree.
	 * @param {Number} level Nível na qual o nó se encontra.
	 * @for Tree
	 */
	Tree.prototype.setInitialStates = function (node, level) {

		if (!node.nodes) return;
		level += 1;

		var parent = node;
		var _this = this;
		$.each(node.nodes, function checkStates(index, node) {

			// nodeId : unique, incremental identifier
			node.nodeId = _this.nodes.length;
			node.id = _this.setId();

			// parentId : transversing up the tree
			node.parentId = parent.nodeId;

			// if not provided set selectable default value
			if (!node.hasOwnProperty('selectable')) {
				node.selectable = true;
			}

			// where provided we should preserve states
			node.state = node.state || {};

			// set checked state; unless set always false
			if (!node.state.hasOwnProperty('checked')) {
				node.state.checked = false;
			}

			// set enabled state; unless set always false
			if (!node.state.hasOwnProperty('disabled')) {
				node.state.disabled = false;
			}

			// set enabled state; unless set always false
			if (!node.state.hasOwnProperty('editable')) {
				node.state.editable = false;
			}

			// set enabled state; unless set always false
			if (!node.state.hasOwnProperty('added')) {
				node.state.added = false;
			}

			// set expanded state; if not provided based on levels
			if (!node.state.hasOwnProperty('expanded')) {
				if (!node.state.disabled &&
						(level < _this.options.levels) &&
						(node.nodes && node.nodes.length > 0)) {
					node.state.expanded = true;
				}
				else {
					node.state.expanded = false;
				}
			}

			// set selected state; unless set always false
			if (!node.state.hasOwnProperty('selected')) {
				node.state.selected = false;
			}

			// index nodes in a flattened structure for use later
			_this.nodes.push(node);

			// recurse child nodes and transverse the tree
			if (node.nodes) {
				_this.setInitialStates(node, level);
			}
		});
	};

	/**
	 * Método responsável por definir como será o clique em cada item da lista
	 * @method clickHandler
	 * @author Jonathan Miles
	 * @param {Object} event Dados do evento.
	 * @return 
	 */
	Tree.prototype.clickHandler = function (event) {
		if (!this.options.enableLinks) event.preventDefault();

		var target = $(event.target);
		var node = this.findNode(target);
		if (target.parent().is(':button') || target.is(':button') || !node || node.state.disabled) return;
		
		var classList = target.attr('class') ? target.attr('class').split(' ') : [];
		if ((classList.indexOf('expand-icon') !== -1)) {

			this.toggleExpandedState(node, _default.options);
			this.render();
		}
		else if ((classList.indexOf('check-icon') !== -1)) {
			
			this.toggleCheckedState(node, _default.options);
			this.render();
		}
		else {
			
			if (node.selectable) {
				this.toggleSelectedState(node, _default.options);
			} else {
				this.toggleExpandedState(node, _default.options);
			}

			this.render();
		}
	};

	
	/**
	 * Método responsável por procurar um nó na Tree. 
	 * @method findNode
	 * @author Jonathan Miles
	 * @param {Number | jQuery} target
	 * @return node Nó da Tree.
	 * @for Tree
	 */
	Tree.prototype.findNode = function (target) {
		if( parseInt(target).toString() == 'NaN' && 
			(target.parent().is(':button') || target.is(':button') 
				|| target.is(':input'))) target = target.parents('li');

		var nodeId = parseInt(target).toString() == 'NaN' ? target.closest('li.list-group-item').attr('data-nodeid') : parseInt(target);
		
		//var nodeId = target.closest('li.list-group-item').attr('data-nodeid');
		var node = this.nodes[nodeId];

		if (!node) {
			console.log('Error: node does not exist');
		}
		return node;
	};

	/**
	 * Método responsável por procurar um nó pelo seu idenficador
	 * @method findNodeById
	 * @author João Victor Magela
	 * @param {Number} id Identificador do nó.
	 * @return node Nó da Tree.
	 * @for Tree
	 */
	Tree.prototype.findNodeById = function (id) {
		var items = $.grep(this.nodes, function(item){
			return item.id == id;
		})

		var node = items.length > 0 ? items[0] : undefined;

		if (!node) {
			//console.log('Error: node does not exist');
		}

		return node;
	};

	/**
	 * Método responsável por atualizar um nó e seus filhos.
	 * @method refreshTree
	 * @author João Victor Magela
	 * @param {Array} nodes Conjunto de nós
	 * @param {Object} node Nó com novas informações.
	 * @return nodes Retorna o conjunto de nós atualizados.
	 * @for Tree
	 */
	Tree.prototype.refreshTree = function (nodes, node) {
		if (!node) return nodes;
		
		for(var i=0; i < nodes.length; i++){
			if(nodes[i].id == node.id) nodes[i] = node;
			if(nodes[i].nodes) nodes[i].nodes = this.refreshTree(nodes[i].nodes, node);
		}

		this.nodes[node.nodeId] = node;
		return nodes;
	};

	/**
	 * Método responsável por remover um ou mais nós da lista de elementos.
	 * @method removeNodesInNodes
	 * @author João Victor Magela
	 * @param {Árray} nodes Conjunto de nós para pesquisa
	 * @param {Array} ids Conjunto de identificadores dos nós a serem removidos.
	 * @return Conjunto de nós com os nós removidos.
	 * @for Tree
	 */
	Tree.prototype.removeNodesInNodes = function(ids) {
		for(var i = this.nodes.length -1 ; i >= 0; i--) {
			if($.inArray(this.nodes[i].id, ids) > -1){
				this.nodes.splice(i,1);
				continue;
			}
		}
	}

	
	/**
	 * Método responsável por remover um ou mais nós da Tree.
	 * @method removeNodesInTree
	 * @author João Victor Magela
	 * @param {Árray} nodes Conjunto de nós para pesquisa
	 * @param {Array} ids Conjunto de identificadores dos nós a serem removidos.
	 * @return Conjunto de nós com os nós removidos.
	 * @for Tree
	 */
	Tree.prototype.removeNodesInTree = function(nodes, ids){
		if(!ids || ids.length == 0) {
			//console.log('Identificadores inválidos')
			return nodes;
		};

		for(var i = nodes.length-1; i >= 0; i--){
			if($.inArray(nodes[i].id, ids) > -1) {
				nodes.splice(i,1);
				continue;
			}

			if(nodes[i].nodes) nodes[i].nodes = this.removeNodesInTree(nodes[i].nodes, ids); 
		}

		return nodes.length > 0 ? nodes : undefined;
	}

	/**
	 * Método responsável por atualizar o identificador dos nós.
	 * @method refreshIds
	 * @author João Victor Magela
	 * @for Tree
	 */
	Tree.prototype.refreshIds = function(){
		var _refreshParentId = function(node){
			if(!node.nodes) return node;

			for(var i=0; i<node.nodes.length; i++) {
				node.nodes[i].parentId = node.nodeId;
			}

			return node;
		};

		for(var i=0; i<this.nodes.length; i++) {
			var node = this.findNodeById(this.nodes[i].id);
			node.nodeId = i;
			this.nodes[i] = _refreshParentId(this.nodes[i]);

			this.tree = this.refreshTree(this.tree, node);
		}
	}

	/**
	 * Método responsável por trocar o modo e expansão do nó (expandido ou não)
	 * @method toggleExpandedState
	 * @author Jonathan Miles
	 * @param {Object} node Nó corrente.
	 * @param {Object} options Conjunto de opções do plugin.
	 * @for Tree
	 */
	Tree.prototype.toggleExpandedState = function (node, options) {
		if (!node) return;
		this.setExpandedState(node, !node.state.expanded, options);
	};

	/**
	 * Método responsável por deixar um nó como expandido ou não
	 * @method setExpandedState
	 * @author Jonathan Miles
	 * @param {Object} node Nó alvo.
	 * @param {boolean} state Estado de expansão (true para expandido) .
	 * @param {Object} options Conjunto de opções do plugin.
	 * @for Tree
	 */
	Tree.prototype.setExpandedState = function (node, state, options) {

		if (state === node.state.expanded) return;

		if (state && node.nodes) {

			// Expand a node
			node.state.expanded = true;
			if (!options.silent) {
				this.$element.trigger('nodeExpanded', $.extend(true, {}, node));
			}
		}
		else if (!state) {

			// Collapse a node
			node.state.expanded = false;
			if (!options.silent) {
				this.$element.trigger('nodeCollapsed', $.extend(true, {}, node));
			}

			// Collapse child nodes
			if (node.nodes && !options.ignoreChildren) {
				$.each(node.nodes, $.proxy(function (index, node) {
					this.setExpandedState(node, false, options);
				}, this));
			}
		}
	};

	/**
	 * Método responsável por trocar o estado de seleção do nó.
	 * @method toggleSelectedState
	 * @author Jonathan Miles
	 * @param {Object} node Nó alvo.
	 * @param {Object} options Conjunto de opções do plugin.
	 * @for Tree
	 */
	Tree.prototype.toggleSelectedState = function (node, options) {
		if (!node) return;
		this.setSelectedState(node, !node.state.selected, options);
	};

	/**
	 * Método responsável por determinar o estado de seleção do nó (selecionado ou não)
	 * @method setSelectedState
	 * @author Jonathan Miles
	 * @param {Object} node Nó alvo.
	 * @param {} state Estado de seleção do nó (true, para selecionado).
	 * @param {Object} options Conjunto de opções do plugin.
	 * @for Tree
	 */
	Tree.prototype.setSelectedState = function (node, state, options) {

		if (state === node.state.selected) return;

		if (state) {

			// If multiSelect false, unselect previously selected
			if (!this.options.multiSelect) {
				$.each(this.findNodes('true', 'g', 'state.selected'), $.proxy(function (index, node) {
					this.setSelectedState(node, false, options);
				}, this));
			}

			// Continue selecting node
			node.state.selected = true;
			if (!options.silent) {
				this.$element.trigger('nodeSelected', $.extend(true, {}, node));
			}
		}
		else {

			// Unselect node
			node.state.selected = false;
			if (!options.silent) {
				this.$element.trigger('nodeUnselected', $.extend(true, {}, node));
			}
		}
	};

	/**
	 * Método responsável por trocar o estado de checagem do nó
	 * @method toggleCheckedState
	 * @author Jonathan Miles
	 * @param {Object} node Nó alvo.
	 * @param {Object} options Conjunto de opções do plugin.
	 * @for Tree
	 */
	Tree.prototype.toggleCheckedState = function (node, options) {
		if (!node) return;
		this.setCheckedState(node, !node.state.checked, options);
	};

	/**
	 * Método responsável por determinar o estado de checagem do nó.
	 * @method setCheckedState
	 * @author Jonathan Miles
	 * @param {Object} node Nó alvo.
	 * @param {} state Estado de checagem do nó (true, para marcado).
	 * @param {Object} options Conjunto de opções do plugin.
	 * @for Tree
	 */
	Tree.prototype.setCheckedState = function (node, state, options) {

		if (state === node.state.checked) return;

		if (state) {

			// Check node
			node.state.checked = true;

			if (!options.silent) {
				this.$element.trigger('nodeChecked', $.extend(true, {}, node));
			}
		}
		else {

			// Uncheck node
			node.state.checked = false;
			if (!options.silent) {
				this.$element.trigger('nodeUnchecked', $.extend(true, {}, node));
			}
		}
	};

	/**
	 * Método responsável por determinar o estado de ativação do nó.
	 * @method setDisabledState
	 * @author Jonathan Miles
	 * @param {Object} node Nó alvo.
	 * @param {} state Estado de ativação do no (true, para desativado).
	 * @param {Object} options Conjunto de opções do plugin.
	 * @for Tree
	 */
	Tree.prototype.setDisabledState = function (node, state, options) {

		if (state === node.state.disabled) return;

		if (state) {

			// Disable node
			node.state.disabled = true;

			// Disable all other states
			this.setExpandedState(node, false, options);
			this.setSelectedState(node, false, options);
			this.setCheckedState(node, false, options);

			if (!options.silent) {
				this.$element.trigger('nodeDisabled', $.extend(true, {}, node));
			}
		}
		else {

			// Enabled node
			node.state.disabled = false;
			if (!options.silent) {
				this.$element.trigger('nodeEnabled', $.extend(true, {}, node));
			}
		}
	};

	/**
	 * Método responsável por renderizar a TreeView.
	 * @method render
	 * @author Jonathan Miles
	 * @for Tree
	 */
	Tree.prototype.render = function () {

		if (!this.initialized) {

			// Setup first time only components
			this.$element.addClass(pluginName);
			this.$wrapper = $(this.template.list);

			this.injectStyle();

			this.initialized = true;
		}

		this.$element.empty().append(this.$wrapper.empty());

		// Build tree
		this.buildTree(this.tree, 0);
		this.$element.trigger('treeRender', $.extend(true, {}, this));
	};

	/**
	 * Método responsável por contruir a TreeView.
	 * @method buildTree
	 * @author Jonathan Miles | João Victor Magela
	 * @param {Array} nodes Conjunto de nós.
	 * @param {Number} level Nível corrente.
	 * @return A instância atual da Tree.
	 * @for Tree
	 */
	Tree.prototype.buildTree = function (nodes, level) {
		this.abstractInterface = this.createAbstractInterface(this.tree);
		if (!nodes) return;
		level += 1;

		var _this = this;
		$.each(nodes, function addNodes(id, node) {
			var treeItem = $(_this.template.item)
				.addClass('node-' + _this.elementId)
				.addClass(node.state.checked ? 'node-checked' : '')
				.addClass(node.state.disabled ? 'node-disabled': '')
				.addClass(node.state.selected ? 'node-selected' : '')
				.addClass(node.searchResult ? 'search-result' : '') 
				.attr('data-nodeid', node.nodeId)
				.attr('style', _this.buildStyleOverride(node));

			//caso seja um nó editável, apenas insere um campo texto
			if(node.state.added) {
				// cria um novo item editavel
				treeItem.append($(_this.template.text)
								.data('id', node.nodeId)
								.val(node.text)
								.css('margin-left', ((level) * 20) + 'px')
								.focus()
								.keydown(function(e){
									
									/*
										Para um item que foi adicionando, caso aperte tab(9) ou enter(13), confirma o nome atual.
										Caso aperte ESC(27), apenas remove o item;
									*/
									if(e.which == 13 || e.which == 9 ){

										node.state.added = false;
										node.state.disabled = false;
										node.text = $(this).val();

										_this.tree = _this.refreshTree(_this.tree, node);

										_this.$element.empty().append(_this.$wrapper.empty());
										_this.buildTree(_this.tree, 0);
										_this.$element.trigger('treeRender', $.extend(true, {}, _this));
									} else if(e.which == 27) {
										_this.removeElements([node.id]);

										_this.$element.empty().append(_this.$wrapper.empty());
										_this.buildTree(_this.tree, 0);
										_this.$element.trigger('treeRender', $.extend(true, {}, _this));
									}
								}));
				
				// Add item to the tree
				_this.$wrapper.append(treeItem);

				// Recursively add child ndoes
				if (node.nodes && node.state.expanded && !node.state.disabled) {
					return _this.buildTree(node.nodes, level);
				}

				//vai para o próximo item
				return true; 
			}

			// Add indent/spacer to mimic tree structure
			for (var i = 0; i < (level - 1); i++) {
				treeItem.append(_this.template.indent);
			}

			// Add expand, collapse or empty spacer icons
			var classList = [];
			if (node.nodes) {
				classList.push('expand-icon');
				if (node.state.expanded) {
					classList.push(_this.options.collapseIcon);
				}
				else {
					classList.push(_this.options.expandIcon);
				}
			}
			else {
				classList.push(_this.options.emptyIcon);
			}

			treeItem
				.append($(_this.template.icon)
					.addClass(classList.join(' '))
				);


			// Add node icon
			if (_this.options.showIcon) {
				
				var classList = ['node-icon'];

				classList.push(node.icon || _this.options.nodeIcon);
				if (node.state.selected) {
					classList.pop();
					classList.push(node.selectedIcon || _this.options.selectedIcon || 
									node.icon || _this.options.nodeIcon);
				}

				treeItem
					.append($(_this.template.icon)
						.addClass(classList.join(' '))
					);
			}

			// Add check / unchecked icon
			if (_this.options.showCheckbox) {

				var classList = ['check-icon'];
				if (node.state.checked) {
					classList.push(_this.options.checkedIcon); 
				}
				else {
					classList.push(_this.options.uncheckedIcon);
				}

				treeItem
					.append($(_this.template.icon)
						.addClass(classList.join(' '))
					);
			}

			// Add text
			if (_this.options.enableLinks) {
				// Add hyperlink
				treeItem
					.append($(_this.template.link)
						.attr('href', node.href)
						.append(node.state.editable ? $(_this.template.text).val(node.text) : node.text)
						.append(_this.template.buttons)
					);
			}
			else {
				// otherwise just text
				treeItem
					.append(node.state.editable ? $(_this.template.text).val(node.text) : node.text)
					.append(_this.template.buttons);
			}



			// Add tags as badges
			if (_this.options.showTags && node.tags) {
				$.each(node.tags, function addTag(id, tag) {
					treeItem
						.append($(_this.template.badge)
							.append(tag)
						);
				});
			}

			// Add item to the tree
			_this.$wrapper.append(treeItem);

			// Recursively add child ndoes
			if (node.nodes && node.state.expanded && !node.state.disabled) {
				return _this.buildTree(node.nodes, level);
			}
		});

		return _this.tree;
	};

	/**
	 * Método responsável por definir o estilo (CSS) do nó.
	 * @method buildStyleOverride
	 * @author Jonathan Miles
	 * @param {Object} node No corrente.
	 * @return A expressão CSS para o nó da TreeView.
	 * @for Tree
	 */
	Tree.prototype.buildStyleOverride = function (node) {

		if (node.state.disabled) return '';

		var color = node.color;
		var backColor = node.backColor;

		if (this.options.highlightSelected && node.state.selected) {
			if (this.options.selectedColor) {
				color = this.options.selectedColor;
			}
			if (this.options.selectedBackColor) {
				backColor = this.options.selectedBackColor;
			}
		}

		if (this.options.highlightSearchResults && node.searchResult && !node.state.disabled) {
			if (this.options.searchResultColor) {
				color = this.options.searchResultColor;
			}
			if (this.options.searchResultBackColor) {
				backColor = this.options.searchResultBackColor;
			}
		}

		return 'color:' + color +
			';background-color:' + backColor + ';';
	};

	/**
	 * Método responsável por injetar o estilo de acordo com a identificação do nó.
	 * @method injectStyle
	 * @author Jonathan Miles
	 * @for Tree
	 */
	Tree.prototype.injectStyle = function () {

		if (this.options.injectStyle && !document.getElementById(this.styleId)) {
			$('<style type="text/css" id="' + this.styleId + '"> ' + this.buildStyle() + ' </style>').appendTo('head');
		}
	};

	/**
	 * Método responsável por definir a estilização do no de acordo com as opções passadas para o plugin.
	 * @method buildStyle
	 * @author Jonathan Miles
	 * @return Expressão CSS padrões de acordo com as opções passadas.
	 * @for Tree
	 */
	Tree.prototype.buildStyle = function () {

		var style = '.node-' + this.elementId + '{';

		if (this.options.color) {
			style += 'color:' + this.options.color + ';';
		}

		if (this.options.backColor) {
			style += 'background-color:' + this.options.backColor + ';';
		}

		if (!this.options.showBorder) {
			style += 'border:none;';
		}
		else if (this.options.borderColor) {
			style += 'border:1px solid ' + this.options.borderColor + ';';
		}
		style += '}';

		if (this.options.onhoverColor) {
			style += '.node-' + this.elementId + ':not(.node-disabled):hover{' +
				'background-color:' + this.options.onhoverColor + ';' +
			'}';
		}

		return this.css + style;
	};

	/**
	 * Template para a renderização da TreeView.
	 *
	 * @property template
	 * @type Object
	 * @for Tree
	 */
	Tree.prototype.template = {
		list: '<ul class="list-group"></ul>',
		item: '<li class="list-group-item"></li>',
		indent: '<span class="indent"></span>',
		icon: '<span class="icon"></span>',
		link: '<a href="#" style="color:inherit;"></a>',
		badge: '<span class="badge"></span>',

		// TODO inserir tooltip
		buttons: 
				'<div class="pull-right">\
					<button class="btn btn-primary btn-xs btn-tree" data-container="body" data-trigger="hover" data-toggle="popover" data-placement="top" data-content="Edita o nome do elemento abstrato." id="btn-tree-edit"><i class="fa fa-pencil"></i></button>\
					<button class="btn btn-success btn-xs btn-tree" id="btn-tree-add" data-container="body" data-trigger="hover" data-toggle="popover" data-placement="top" data-content="Adiciona um elemento como seu filho."><i class="fa fa-plus"></i></button>\
					<button class="btn btn-success btn-xs btn-tree" id="btn-tree-download"data-toggle="modal" data-target="#modal-tree-download" data-container="body" data-trigger="hover" data-toggle="popover" data-placement="top" data-content="Define as informações Bind, Datasource e Parse."><i class="fa fa-download"></i></button>\
					<button class="btn btn-danger btn-xs btn-tree" id="btn-tree-remove" data-container="body" data-trigger="hover" data-toggle="popover" data-placement="top" data-content="Remove o elemento."><i class="fa fa-trash"></i></button>\
					<button class="btn btn-danger btn-xs btn-tree" id="btn-tree-removeall"><i class="fa fa-times" data-container="body" data-trigger="hover" data-toggle="popover" data-placement="top" data-content="Remove os filhos que estão selecionados."></i> <i class="fa fa-list"></i></button>\
				</div>',
		text: '<input type="text" class="form-control tree-text" data-id="" />'
	};

	/**
	 * Estilo padrão para os nós da TreeView.
	 *
	 * @property css
	 * @type string
	 * @for Tree
	 */
	Tree.prototype.css = '.treeview .list-group-item{cursor:pointer}.treeview span.indent{margin-left:10px;margin-right:10px}.treeview span.icon{width:12px;margin-right:5px}.treeview .node-disabled{color:silver;cursor:not-allowed}'


	/**
	 * Método responsável por retornar um nó da TreeView a partir do identificador interno do plugin
	 * @method getNode
	 * @author Jonathan Miles
	 * @param {Number} nodeId - Identificador interno do nó.
	 * @return Nó da TreeView.
	 * @for Tree
	 */
	Tree.prototype.getNode = function (nodeId) {
		return this.nodes[nodeId];
	};

	/**
	 * Método responsável por adicionar um nó na raiz da TreeView.
	 * @method addElement
	 * @author João Victor Magela
	 * @param {Object} node Nó a ser adicionado.
	 * @for Tree
	 */
	Tree.prototype.addElement = function(node){
		this.tree.push(node);
		this.nodes.push(node);
		this.id++;

		this.$element.empty().append(this.$wrapper.empty());
        this.buildTree(this.tree, 0);
        this.$element.trigger('treeRender', $.extend(true, {}, this));
	};

	/**
	 * Método responsável por remover um conjunto de nós da Tree.
	 * @method removeElements
	 * @author João Victor Magela
	 * @param {Array} ids Conjunto de identificadores do nós a serem removidos.
	 * @for Tree
	 */
	Tree.prototype.removeElements = function(ids){
		this.tree = this.removeNodesInTree(this.tree, ids);
		this.removeNodesInNodes(ids);
		this.refreshIds();
		this.broadcastData();
	}

	/**
	 * Método responsável por obter o pai de um determinado nó
	 * @method getParent
	 * @author Jonathan Miles
	 * @param {jQuery | Number | Selector} identifier Identificador do nó filho.
	 * @return O pai do nó informado.
	 * @for Tree
	 */
	Tree.prototype.getParent = function (identifier) {
		var node = this.identifyNode(identifier);
		return this.nodes[node.parentId];
	};

	/**
	 * Método responsável por obter os irmãos de um nó
	 * @method getSiblings
	 * @author Jonathan Miles
	 * @param {jQuery | Number | Selector} identifier Identificador do nó
	 * @return Os irmãos de um determinado nó.
	 * @for Tree
	 */
	Tree.prototype.getSiblings = function (identifier) {
		var node = this.identifyNode(identifier);
		var parent = this.getParent(node);
		var nodes = parent ? parent.nodes : this.tree;
		return nodes.filter(function (obj) {
				return obj.nodeId !== node.nodeId;
			});
	};

	/**
	 * Método responsável por obter todos os nós selecionados.
	 * @method getSelected
	 * @author Jonathan Miles
	 * @return Conjunto do nós selecionados.
	 * @for Tree
	 */
	Tree.prototype.getSelected = function () {
		return this.findNodes('true', 'g', 'state.selected');
	};

	/**
	 * Método responsável por obter todos os nós não selecionados.
	 * @method getUnselected
	 * @author Jonathan Miles
	 * @return Conjunto de nós não selecionados.
	 * @for Tree
	 */
	Tree.prototype.getUnselected = function () {
		return this.findNodes('false', 'g', 'state.selected');
	};

	/**
	 * Método responsável por obter todos os nós expandidos.
	 * @method getExpanded
	 * @author Jonathan Miles
	 * @return Conjunto de nós expandidos.
	 * for Tree
	 */
	Tree.prototype.getExpanded = function () {
		return this.findNodes('true', 'g', 'state.expanded');
	};

	/**
	 * Método responsável por obter todos os nós não expandidos.
	 * @method getCollapsed
	 * @author Jonathan Miles
	 * @return Conjunto de nós não expandidos.
	 * @for Tree
	 */
	Tree.prototype.getCollapsed = function () {
		return this.findNodes('false', 'g', 'state.expanded');
	};

	/**
	 * Método responsável por obter todos os nós marcados.
	 * @method getChecked
	 * @author Jonathan Miles
	 * @return Conjunto de nós marcados.
	 * @for Tree
	 */
	Tree.prototype.getChecked = function () {
		return this.findNodes('true', 'g', 'state.checked');
	};

	/**
	 * Método responsável por obter todos os nós não marcados.
	 * @method getUnchecked
	 * @author Jonathan Miles
	 * @return Conjunto de nós não marcados.
	 * @for Tree
	 */
	Tree.prototype.getUnchecked = function () {
		return this.findNodes('false', 'g', 'state.checked');
	};

	/**
	 * Método responsável por obter todos os nós desativados.
	 * @method getDisabled
	 * @author Jonathan Miles
	 * @return Conjunto de nós desativados.
	 * @for Tree
	 */
	Tree.prototype.getDisabled = function () {
		return this.findNodes('true', 'g', 'state.disabled');
	};

	/**
	 * Método responsável por obter todos os nós desativados.
	 * @method getEnabled
	 * @author Jonathan Miles
	 * @return Conjunto de nós desativados.
	 * @for Tree
	 */
	Tree.prototype.getEnabled = function () {
		return this.findNodes('false', 'g', 'state.disabled');
	};


	/**
	 * Método responsável por selecionar um conjunto de nós.
	 * @method selectNode
	 * @author Jonathan Miles
	 * @param {Array} identifiers Conjunto de nós a serem selecionados.
	 * @param {Object} options Conjunto de opções do plugin.
	 * @for Tree
	 */
	Tree.prototype.selectNode = function (identifiers, options) {
		this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
			this.setSelectedState(node, true, options);
		}, this));

		this.render();
	};

	/**
	 * Método responsável por não selecionar um conjunto de nós.
	 * @method unselectNode
	 * @author Jonathan Miles
	 * @param {Array} identifiers Conjunto de nós
	 * @param {Object} options Conjunto de opções do plugin.
	 * @for Tree
	 */
	Tree.prototype.unselectNode = function (identifiers, options) {
		this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
			this.setSelectedState(node, false, options);
		}, this));

		this.render();
	};

	/**
	 * Método responsável por trocar a seleção de um conjunto de nós.
	 * @method toggleNodeSelected
	 * @author Jonathan Miles
	 * @param {Array} identifiers Conjunto de nós.
	 * @param {Object} options Conjunto de opções do plugin.
	 * @for Tree
	 */
	Tree.prototype.toggleNodeSelected = function (identifiers, options) {
		this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
			this.toggleSelectedState(node, options);
		}, this));

		this.render();
	};


	/**
	 * Método responsável por retrair todos os nós.
	 * @method collapseAll
	 * @author Jonathan Miles
	 * @param {Object} options Conjunto de opções do plugin.
	 * @for Tree
	 */
	Tree.prototype.collapseAll = function (options) {
		var identifiers = this.findNodes('true', 'g', 'state.expanded');
		this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
			this.setExpandedState(node, false, options);
		}, this));

		this.render();
	};

	/**
	 * Método responsável por retrair un conjunto de nós.
	 * @method collapseNode
	 * @author Jonathan Miles
	 * @param {Array} identifiers Conjunto de nós.
	 * @param {Object} options Conjunto de opções do plugin.
	 * @for Tree
	 */
	Tree.prototype.collapseNode = function (identifiers, options) {
		this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
			this.setExpandedState(node, false, options);
		}, this));

		this.render();
	};

	/**
	 * Método responsável por expandir todos os nós.
	 * @method expandAll
	 * @author Jonathan Miles
	 * @param {Object} options Conjunto de opções do plugin.
	 * @for Tree 
	 */
	Tree.prototype.expandAll = function (options) {
		options = $.extend({}, _default.options, options);

		if (options && options.levels) {
			this.expandLevels(this.tree, options.levels, options);
		}
		else {
			var identifiers = this.findNodes('false', 'g', 'state.expanded');
			this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
				this.setExpandedState(node, true, options);
			}, this));
		}

		this.render();
	};

	/**
	 * Método responsável por expandir um conjunto de nós.
	 * @method expandNode
	 * @author Jonathan Miles
	 * @param {Array} identifiers Conjunto de nós.
	 * @param {Object} options Conjunto de opções do plugin.
	 * @for Tree
	 */
	Tree.prototype.expandNode = function (identifiers, options) {
		this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
			this.setExpandedState(node, true, options);
			if (node.nodes && (options && options.levels)) {
				this.expandLevels(node.nodes, options.levels-1, options);
			}
		}, this));

		this.render();
	};

	/**
	 * Método responsável por expandir um conjunto de nós de um determinado nível.
	 * @method expandLevels
	 * @author Jonathan Miles
	 * @param {Array} nodes Conjunto de nós
	 * @param {Number} level Nível que permite expansão
	 * @param {Object} options Conjunto de opções do plugin.
	 * @for Tree
	 */
	Tree.prototype.expandLevels = function (nodes, level, options) {
		options = $.extend({}, _default.options, options);

		$.each(nodes, $.proxy(function (index, node) {
			this.setExpandedState(node, (level > 0) ? true : false, options);
			if (node.nodes) {
				this.expandLevels(node.nodes, level-1, options);
			}
		}, this));
	};

	/**
	 * Método responsável por expandir o pai de um conjunto de nós
	 * @method revealNode
	 * @author Jonathan Miles
	 * @param {Array} identifiers Conjunto de nós.
	 * @param {Object} options Conjunto de opções do plugin.
	 * @for Tree
	 */
	Tree.prototype.revealNode = function (identifiers, options) {
		this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
			var parentNode = this.getParent(node);
			while (parentNode) {
				this.setExpandedState(parentNode, true, options);
				parentNode = this.getParent(parentNode);
			};
		}, this));

		this.render();
	};

	/**
	 * Método responsável por trocar o modo de expansão de um conjunto de nós
	 * @method toggleNodeExpanded
	 * @author Jonathan Miles
	 * @param {Array} identifiers Conjunto de nós.
	 * @param {Object} options Conjunto de opções do plugin.
	 * @for Tree
	 */
	Tree.prototype.toggleNodeExpanded = function (identifiers, options) {
		this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
			this.toggleExpandedState(node, options);
		}, this));
		
		this.render();
	};


	/**
	 * Método responsável por marcar todos os nós;
	 * @method checkAll
	 * @author Jonathan Miles
	 * @param {Object} options Conjunto de opções do plugin.
	 * @for Tree
	 */
	Tree.prototype.checkAll = function (options) {
		var identifiers = this.findNodes('false', 'g', 'state.checked');
		this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
			this.setCheckedState(node, true, options);
		}, this));

		this.render();
	};

	/**
	 * Método responsável por marcar um conjunto de nós.
	 * @method checkNode
	 * @author Jonathan Miles
	 * @param {Array} identifiers Conjunto de nós.
	 * @param {Object} options Conjunto de opções do plugin.
	 * @for Tree
	 */
	Tree.prototype.checkNode = function (identifiers, options) {
		this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
			this.setCheckedState(node, true, options);
		}, this));

		this.render();
	};

	/**
	 * Método responsável por desmarcar todos os nós
	 * @method uncheckAll
	 * @author Jonathan Miles
	 * @param {Object} options Conjunto de opções do plugin.
	 * @return 
	 */
	Tree.prototype.uncheckAll = function (options) {
		var identifiers = this.findNodes('true', 'g', 'state.checked');
		this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
			this.setCheckedState(node, false, options);
		}, this));

		this.render();
	};

	/**
	 * Método responsável por desmarcar um conjunto de nós
	 * @method uncheckNode
	 * @author Jonathan Miles
	 * @param {Array} identifiers Conjunto de nós.
	 * @param {Object} options Conjunto de opções do plugin.
	 * @for Tree
	 */
	Tree.prototype.uncheckNode = function (identifiers, options) {
		this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
			this.setCheckedState(node, false, options);
		}, this));

		this.render();
	};

	/**
	 * Método responsável por trocar o estado de marcação de um conjunto de nós.
	 * @method toggleNodeChecked
	 * @author Jonathan Miles
	 * @param {Array} identifiers Conjunto de nós.
	 * @param {Object} options Conjunto de opções do plugin.
	 * @for Tree
	 */
	Tree.prototype.toggleNodeChecked = function (identifiers, options) {
		this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
			this.toggleCheckedState(node, options);
		}, this));

		this.render();
	};


	/**
	 * Método responsável por desativar todos os nós
	 * @method disableAll
	 * @author Jonathan Miles
	 * @param {Object} options Conjunto de opções do plugin.
	 * @for Tree
	 */
	Tree.prototype.disableAll = function (options) {
		var identifiers = this.findNodes('false', 'g', 'state.disabled');
		this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
			this.setDisabledState(node, true, options);
		}, this));

		this.render();
	};

	/**
	 * Método responsável por desativar um conjunto de nós
	 * @method disableNode
	 * @author Jonathan Miles
	 * @param {Array} identifiers Conjunto de nós.
	 * @param {Object} options Conjunto de opções do plugin.
	 * @for Tree
	 */
	Tree.prototype.disableNode = function (identifiers, options) {
		this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
			this.setDisabledState(node, true, options);
		}, this));

		this.render();
	};

	/**
	 * Método responsável por ativar todos os nós
	 * @method enableAll
	 * @author Jonathan Miles
	 * @param {Object} options Conjunto de opções do plugin.
	 * @for Tree
	 */
	Tree.prototype.enableAll = function (options) {
		var identifiers = this.findNodes('true', 'g', 'state.disabled');
		this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
			this.setDisabledState(node, false, options);
		}, this));

		this.render();
	};

	/**
	 * Método responsável por ativar um conjunto de nós
	 * @method enableNode
	 * @author Jonathan Miles
	 * @param {Array} identifiers Conjunto de nós.
	 * @param {Object} options Conjunto de opções do plugin.
	 * @for Tree
	 */
	Tree.prototype.enableNode = function (identifiers, options) {
		this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
			this.setDisabledState(node, false, options);
		}, this));

		this.render();
	};

	/**
	 * Método responsável por trocar o estado de ativação de um conjunto de nós
	 * @method toggleNodeDisabled
	 * @author Jonathan Miles
	 * @param {Array} identifiers Conjunto de nós.
	 * @param {Object} options Conjunto de opções do plugin.
	 * @for Tree
	 */
	Tree.prototype.toggleNodeDisabled = function (identifiers, options) {
		this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
			this.setDisabledState(node, !node.state.disabled, options);
		}, this));

		this.render();
	};


	/**
	 * Método responsável por identificar um conjunto de seletores.
	 * @method forEachIdentifier
	 * @author Jonathan Miles
	 * @param {Array} identifiers Conjunto de nós.
	 * @param {Object} options Conjunto de opções do plugin.
	 * @param {Function} callback Função a ser executada para cada nó.
	 * @for Tree
	 */
	Tree.prototype.forEachIdentifier = function (identifiers, options, callback) {

		options = $.extend({}, _default.options, options);

		if (!(identifiers instanceof Array)) {
			identifiers = [identifiers];
		}

		$.each(identifiers, $.proxy(function (index, identifier) {
			callback(this.identifyNode(identifier), options);
		}, this));	
	};

	/**
	 * Método responsável por identificar um seletor
	 * @method identifyNode
	 * @author Jonathan Miles
	 * @param {Selector | Number} identifier
	 * @return Nó da TreeView.
	 */
	Tree.prototype.identifyNode = function (identifier) {
		return ((typeof identifier) === 'number') ?
						this.nodes[identifier] :
						identifier;
	};

	/**
	 * Método responsável por buscar por um item na TreeView (Caso a opção de busca esteja ativada).
	 * @method search
	 * @author Jonathan Miles
	 * @param {String} pattern Termo a ser pesquisado.
	 * @param {Object} options Conjunto de opções do plugin.
	 * @return Conjunto de nós.
	 * @for Tree
	 */
	Tree.prototype.search = function (pattern, options) {
		options = $.extend({}, _default.searchOptions, options);

		this.clearSearch({ render: false });

		var results = [];
		if (pattern && pattern.length > 0) {

			if (options.exactMatch) {
				pattern = '^' + pattern + '$';
			}

			var modifier = 'g';
			if (options.ignoreCase) {
				modifier += 'i';
			}

			results = this.findNodes(pattern, modifier);

			// Add searchResult property to all matching nodes
			// This will be used to apply custom styles
			// and when identifying result to be cleared
			$.each(results, function (index, node) {
				node.searchResult = true;
			})
		}

		// If revealResults, then render is triggered from revealNode
		// otherwise we just call render.
		if (options.revealResults) {
			this.revealNode(results);
		}
		else {
			this.render();
		}

		this.$element.trigger('searchComplete', $.extend(true, {}, results));

		return results;
	};

	/**
	 * Método responsável por limpar o campo de busca.
	 * @method clearSearch
	 * @author Jonathan Miles
	 * @param {Object} options Conjunto de opções do plugin.
	 * @for Tree
	 */
	Tree.prototype.clearSearch = function (options) {

		options = $.extend({}, { render: true }, options);

		var results = $.each(this.findNodes('true', 'g', 'searchResult'), function (index, node) {
			node.searchResult = false;
		});

		if (options.render) {
			this.render();	
		}
		
		this.$element.trigger('searchCleared', $.extend(true, {}, results));
	};

	/**
	 * Método responsável por procurar um conjunto de nós segundo um critério (atributo).
	 * @method findNodes
	 * @author Jonathan Miles
	 * @param {String} pattern Termo a ser pesquisado
	 * @param {String} modifier Opção para o Regex.
	 * @param {String} attribute Atributo a ser pesquisado o termo
	 * @return Conjunto de nós.
	 * @for Tree
	 */
	Tree.prototype.findNodes = function (pattern, modifier, attribute) {

		modifier = modifier || 'g';
		attribute = attribute || 'text';

		var _this = this;
		return $.grep(this.nodes, function (node) {
			var val = _this.getNodeValue(node, attribute);
			if (typeof val === 'string') {
				return val.match(new RegExp(pattern, modifier));
			}
		});
	};

	/**
	 * Método responsável por obter o valor de um determinado atributo de um nó.
	 * @method getNodeValue
	 * @author Jonathan Miles
	 * @param {Object} obj Nó ou um objeto qualquer.
	 * @param {String} attr Atributo no qual deseja-se obter o valor.
	 * @return O valor do atributo do objeto.
	 * @for Tree
	 */
	Tree.prototype.getNodeValue = function (obj, attr) {
		var index = attr.indexOf('.');
		if (index > 0) {
			var _obj = obj[attr.substring(0, index)];
			var _attr = attr.substring(index + 1, attr.length);
			return this.getNodeValue(_obj, _attr);
		}
		else {
			if (obj.hasOwnProperty(attr)) {
				return obj[attr].toString();
			}
			else {
				return undefined;
			}
		}
	};

	var logError = function (message) {
		if (window.console) {
			window.console.error(message);
		}
	};

	// Prevent against multiple instantiations,
	// handle updates and method calls
	$.fn[pluginName] = function (options, args) {

		var result;

		this.each(function () {
			var _this = $.data(this, pluginName);
			if (typeof options === 'string') {
				if (!_this) {
					logError('Not initialized, can not call method : ' + options);
				}
				else if (!$.isFunction(_this[options]) || options.charAt(0) === '_') {
					logError('No such method : ' + options);
				}
				else {
					if (!(args instanceof Array)) {
						args = [ args ];
					}
					result = _this[options].apply(_this, args);
				}
			}
			else if (typeof options === 'boolean') {
				result = _this;
			}
			else {
				$.data(this, pluginName, new Tree(this, $.extend(true, {}, options)));
			}
		});

		return result || this;
	};

})(jQuery, window, document);
