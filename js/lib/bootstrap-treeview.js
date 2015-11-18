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

	var Tree = function (element, options) {

		this.$element = $(element);
		this.elementId = element.id;
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

	Tree.prototype.setId = function(){
		this.id++;
		return this.id;
	}

	//cria filhos para um determinado nó.
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

	Tree.prototype.createAbstractInterface = function(nodes){
		var abstractInterface = []; 
		for(var i = 0; i<nodes.length; i++){
			var element = new Object();
			element.name = nodes[i].text;
			
			element.datasource = nodes[i].datasource && nodes[i].datasource.length > 0 ? nodes[i].datasource.replace("http://localhost:3000", "url:") : undefined;
			element.parse = nodes[i].parse && nodes[i].parse.length > 0 ? '$data["' + nodes[i].parse + '"]' : undefined;
			element.bind = nodes[i].bind && nodes[i].bind.length > 0 ? nodes[i].bind : undefined;

			if(nodes[i].nodes) element.children = this.createAbstractInterface(nodes[i].nodes);
			abstractInterface.push(element);
		}

		return abstractInterface;
	}

	Tree.prototype.reloadData = function(tree, nodes){
		this.tree = tree;
		this.nodes = nodes;
	}

	Tree.prototype.initModalAndEvents = function(){
		var _this = this;
		var values; //valores baixados
		var currentData = [];

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
										<span id="msg-error-download" class="help-block" style="display:none">Erro ao obter informações. Observe se o link está correto</span>\
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

		/* Eventos dos botões */
		//editar
		$(document).on('click', '#btn-tree-edit', function(e){
			var item = $(this).parent().parent();
			var node = _this.findNode(item);
			node.state.editable = true;
			node.state.disabled = true;

			item.contents().filter(function() {
				return this.nodeType === 3;
			}).remove();

			item.append($(_this.template.text)
						.focus()
						.val(node.text)
						.keyup(function(e){
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

		//adicionar
		$(document).on('click', '#btn-tree-add', function(e){
			var node = _this.findNode($(this).parents('li'));
			if(!node) return;

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

		//download
		$(document).on('click', '#btn-tree-download', function(e){
			var node = _this.findNode($(this).parents('li'));
			$('#modal-tree-download').data('id', $(this).parents('li').data('nodeid'));

			$('#field-bind').val(node.bind ?  node.bind : '');

			if(node.datasource){
				values = getValue(node.$data);
				$('#field-datasource').val(node.datasource ? node.datasource : '');
				$('#field-parse').val(node.parse ? node.parse : '');

				refreshTable($('#table-fields tbody'), values)

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

		//remover
		$(document).on('click', '#btn-tree-remove', function(e){
			//TODO: fazer o modal de confirmação

			var node = _this.findNode($(this).parents('li'));
			if(!node) return;
			_this.tree = _this.removeNodes(_this.tree, [node.nodeId]);
			_this.$element.empty().append(_this.$wrapper.empty());
			_this.buildTree(_this.tree, 0);
			_this.$element.trigger('treeRender', $.extend(true, {}, _this));
		});

		//remover todos
		$(document).on('click', '#btn-tree-removeall', function(e){
			//TODO: fazer o modal de confirmação

			var node = _this.findNode($(this).parents('li'));
			if(!node) return;

			//verifica quais os filhos estão selecionados
			var ids = [];
			for(var i = 0; i < node.nodes.length; i++){
				if(node.nodes[i].state.checked) ids.push(node.nodes[i].nodeId);
			}

			_this.tree = _this.removeNodes(_this.tree, ids);
			_this.$element.empty().append(_this.$wrapper.empty());
			_this.buildTree(_this.tree, 0);
			_this.$element.trigger('treeRender', $.extend(true, {}, _this));
		});

		var getValue = function(data){
			return data[0] ? data[0] : data;
		}

		var refreshTable = function(table, data) {
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

		var getDataFromDatasource = function(data){
			values = getValue(data);
			currentData = data;
				
			$('#msg-error-download').hide();
			$('#group-parse').show();
			
			var panel = $('#panel-download-fields');
			var table = panel.find('table tbody');
			
			panel.show();
			refreshTable(table, values);
		}

		var getDataFromDatasourceFail = function(button){
			currentData = [];
			button.parents('.form-group').addClass('has-error');
			$('#msg-error-download').show();
			$('#group-parse').hide();
			$('#panel-download-fields').hide();
		}

		//download informações
		$(document).on('click', '#btn-download-information', function(e){
			var link = $(this).parents('.form-group').find('input').val().trim();
			var button = $(this);
			var node = _this.findNode(button.parents('#modal-tree-download').data('id'));

			if(node.$data){

				try {
					var data = eval('node.' + link);
					
					if(data){
						getDataFromDatasource(data);		
					}else{
						getDataFromDatasourceFail(button);
					}
				} catch (e){
					$.get(link, function(data){
						getDataFromDatasource(data);
					}).fail(function(){
						getDataFromDatasourceFail(button);
					});					
				}
			} else{
				$.get(link, function(data){
					getDataFromDatasource(data);
				}).fail(function(){
					getDataFromDatasourceFail(button);
				});

			}
		});

		$(document).on('click', '#btn-process-parse', function(e){
			var parse = $(this).parents('.form-group').find('input').val().trim();
			if(parse.length > 0){
				if(values[parse]){
					currentData = values[parse];
					values = getValue(values[parse]);
					refreshTable($('#panel-download-fields tbody'), values);
				}else{
					alert('Não existe o campo "'+ parse + '" nos dados');
				}
			}else{
				alert('Insira um valor.');
			}
		});

		var broadcastData = function(node, data){
			if(!node) return node;

			if(!node.$data) node.$data = data;
			if(node.nodes){
				for(var i=0; i<node.nodes.length;i++) node.nodes[i] = broadcastData(node.nodes[i], data);
			}

			return node;
		}

		$(document).on('click', '#btn-confirm-download', function(e){
			//if(!values && !bind.length && parse.) return;

			var id = $('#modal-tree-download').data('id');
			var node = _this.findNode(id);
			
			//insere os dados no nó
			//node.data = values;
			if(values != null) node = broadcastData(node, currentData);
			
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
	}

	Tree.prototype.remove = function () {
		this.destroy();
		$.removeData(this, pluginName);
		$('#' + this.styleId).remove();
	};

	Tree.prototype.destroy = function () {

		if (!this.initialized) return;

		this.$wrapper.remove();
		this.$wrapper = null;

		// Switch off events
		this.unsubscribeEvents();

		// Reset this.initialized flag
		this.initialized = false;
	};

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

	/*
		Recurse the tree structure and ensure all nodes have
		valid initial states.  User defined states will be preserved.
		For performance we also take this opportunity to
		index nodes in a flattened structure
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

	// Looks up the DOM for the closest parent list item to retrieve the
	// data attribute nodeid, which is used to lookup the node in the flattened structure.
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

	Tree.prototype.findNodeById = function (id) {
		var items = $.grep(this.nodes, function(item){
			return item.id == id;
		})

		var node = items.length > 0 ? items[0] : undefined;

		if (!node) {
			console.log('Error: node does not exist');
		}

		return node;
	};

	Tree.prototype.refreshTree = function (nodes, node) {
		if (!node) return nodes;
		
		for(var i=0; i < nodes.length; i++){
			if(nodes[i].id == node.id) nodes[i] = node;
			if(nodes[i].nodes) nodes[i].nodes = this.refreshTree(nodes[i].nodes, node);
		}

		this.nodes[node.nodeId] = node;
		return nodes;
	};

	/*
		Remove um ou mais nós
		@nodes array de nós
		@ids array de identificadores a serem removidos
		@return lista com itens removidos
	*/
	Tree.prototype.removeNodes = function(nodes, ids){
		if(!ids || ids.length == 0) {
			console.log('Identificadores inválidos')
			return nodes;
		}

		for(var i = nodes.length-1; i >= 0; i--){
			if($.inArray(nodes[i].nodeId, ids) > -1) {
				this.nodes.splice(nodes[i].nodeId); //remove da lista de nós
				nodes.splice(i,1); //remove da lista aninhada
				continue;
			}

			if(nodes[i].nodes) nodes[i].nodes = this.removeNodes(nodes[i].nodes, ids); 
		}

		return nodes.length > 0 ? nodes : undefined;
	}

	Tree.prototype.toggleExpandedState = function (node, options) {
		if (!node) return;
		this.setExpandedState(node, !node.state.expanded, options);
	};

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

	Tree.prototype.toggleSelectedState = function (node, options) {
		if (!node) return;
		this.setSelectedState(node, !node.state.selected, options);
	};

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

	Tree.prototype.toggleCheckedState = function (node, options) {
		if (!node) return;
		this.setCheckedState(node, !node.state.checked, options);
	};

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

	// Starting from the root node, and recursing down the
	// structure we build the tree one node at a time
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
								.keyup(function(e){
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
										_this.tree = _this.removeNodes(_this.tree, [node.nodeId]);

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

	// Define any node level style override for
	// 1. selectedNode
	// 2. node|data assigned color overrides
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

	// Add inline style into head
	Tree.prototype.injectStyle = function () {

		if (this.options.injectStyle && !document.getElementById(this.styleId)) {
			$('<style type="text/css" id="' + this.styleId + '"> ' + this.buildStyle() + ' </style>').appendTo('head');
		}
	};

	// Construct trees style based on user options
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
					<button class="btn btn-primary btn-xs btn-tree" id="btn-tree-edit"><i class="fa fa-pencil"></i></button>\
					<button class="btn btn-success btn-xs btn-tree" id="btn-tree-add"><i class="fa fa-plus"></i></button>\
					<button class="btn btn-success btn-xs btn-tree" id="btn-tree-download"data-toggle="modal" data-target="#modal-tree-download"><i class="fa fa-download"></i></button>\
					<button class="btn btn-danger btn-xs btn-tree" id="btn-tree-remove"><i class="fa fa-trash"></i></button>\
					<button class="btn btn-danger btn-xs btn-tree" id="btn-tree-removeall"><i class="fa fa-times"></i> <i class="fa fa-list"></i></button>\
				</div>',
		text: '<input type="text" class="form-control tree-text" data-id="" />'
	};

	Tree.prototype.css = '.treeview .list-group-item{cursor:pointer}.treeview span.indent{margin-left:10px;margin-right:10px}.treeview span.icon{width:12px;margin-right:5px}.treeview .node-disabled{color:silver;cursor:not-allowed}'


	/**
		Returns a single node object that matches the given node id.
		@param {Number} nodeId - A node's unique identifier
		@return {Object} node - Matching node
	*/
	Tree.prototype.getNode = function (nodeId) {
		return this.nodes[nodeId];
	};

	Tree.prototype.addElement = function(node){
		this.tree.push(node);
		this.nodes.push(node);
		this.id++;
	}

	Tree.prototype.removeElements = function(ids){
		this.tree = this.removeNodes(this.tree, ids);
	}

	/**
		Returns the parent node of a given node, if valid otherwise returns undefined.
		@param {Object|Number} identifier - A valid node or node id
		@returns {Object} node - The parent node
	*/
	Tree.prototype.getParent = function (identifier) {
		var node = this.identifyNode(identifier);
		return this.nodes[node.parentId];
	};

	/**
		Returns an array of sibling nodes for a given node, if valid otherwise returns undefined.
		@param {Object|Number} identifier - A valid node or node id
		@returns {Array} nodes - Sibling nodes
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
		Returns an array of selected nodes.
		@returns {Array} nodes - Selected nodes
	*/
	Tree.prototype.getSelected = function () {
		return this.findNodes('true', 'g', 'state.selected');
	};

	/**
		Returns an array of unselected nodes.
		@returns {Array} nodes - Unselected nodes
	*/
	Tree.prototype.getUnselected = function () {
		return this.findNodes('false', 'g', 'state.selected');
	};

	/**
		Returns an array of expanded nodes.
		@returns {Array} nodes - Expanded nodes
	*/
	Tree.prototype.getExpanded = function () {
		return this.findNodes('true', 'g', 'state.expanded');
	};

	/**
		Returns an array of collapsed nodes.
		@returns {Array} nodes - Collapsed nodes
	*/
	Tree.prototype.getCollapsed = function () {
		return this.findNodes('false', 'g', 'state.expanded');
	};

	/**
		Returns an array of checked nodes.
		@returns {Array} nodes - Checked nodes
	*/
	Tree.prototype.getChecked = function () {
		return this.findNodes('true', 'g', 'state.checked');
	};

	/**
		Returns an array of unchecked nodes.
		@returns {Array} nodes - Unchecked nodes
	*/
	Tree.prototype.getUnchecked = function () {
		return this.findNodes('false', 'g', 'state.checked');
	};

	/**
		Returns an array of disabled nodes.
		@returns {Array} nodes - Disabled nodes
	*/
	Tree.prototype.getDisabled = function () {
		return this.findNodes('true', 'g', 'state.disabled');
	};

	/**
		Returns an array of enabled nodes.
		@returns {Array} nodes - Enabled nodes
	*/
	Tree.prototype.getEnabled = function () {
		return this.findNodes('false', 'g', 'state.disabled');
	};


	/**
		Set a node state to selected
		@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
		@param {optional Object} options
	*/
	Tree.prototype.selectNode = function (identifiers, options) {
		this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
			this.setSelectedState(node, true, options);
		}, this));

		this.render();
	};

	/**
		Set a node state to unselected
		@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
		@param {optional Object} options
	*/
	Tree.prototype.unselectNode = function (identifiers, options) {
		this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
			this.setSelectedState(node, false, options);
		}, this));

		this.render();
	};

	/**
		Toggles a node selected state; selecting if unselected, unselecting if selected.
		@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
		@param {optional Object} options
	*/
	Tree.prototype.toggleNodeSelected = function (identifiers, options) {
		this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
			this.toggleSelectedState(node, options);
		}, this));

		this.render();
	};


	/**
		Collapse all tree nodes
		@param {optional Object} options
	*/
	Tree.prototype.collapseAll = function (options) {
		var identifiers = this.findNodes('true', 'g', 'state.expanded');
		this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
			this.setExpandedState(node, false, options);
		}, this));

		this.render();
	};

	/**
		Collapse a given tree node
		@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
		@param {optional Object} options
	*/
	Tree.prototype.collapseNode = function (identifiers, options) {
		this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
			this.setExpandedState(node, false, options);
		}, this));

		this.render();
	};

	/**
		Expand all tree nodes
		@param {optional Object} options
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
		Expand a given tree node
		@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
		@param {optional Object} options
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
		Reveals a given tree node, expanding the tree from node to root.
		@param {Object|Number|Array} identifiers - A valid node, node id or array of node identifiers
		@param {optional Object} options
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
		Toggles a nodes expanded state; collapsing if expanded, expanding if collapsed.
		@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
		@param {optional Object} options
	*/
	Tree.prototype.toggleNodeExpanded = function (identifiers, options) {
		this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
			this.toggleExpandedState(node, options);
		}, this));
		
		this.render();
	};


	/**
		Check all tree nodes
		@param {optional Object} options
	*/
	Tree.prototype.checkAll = function (options) {
		var identifiers = this.findNodes('false', 'g', 'state.checked');
		this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
			this.setCheckedState(node, true, options);
		}, this));

		this.render();
	};

	/**
		Check a given tree node
		@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
		@param {optional Object} options
	*/
	Tree.prototype.checkNode = function (identifiers, options) {
		this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
			this.setCheckedState(node, true, options);
		}, this));

		this.render();
	};

	/**
		Uncheck all tree nodes
		@param {optional Object} options
	*/
	Tree.prototype.uncheckAll = function (options) {
		var identifiers = this.findNodes('true', 'g', 'state.checked');
		this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
			this.setCheckedState(node, false, options);
		}, this));

		this.render();
	};

	/**
		Uncheck a given tree node
		@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
		@param {optional Object} options
	*/
	Tree.prototype.uncheckNode = function (identifiers, options) {
		this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
			this.setCheckedState(node, false, options);
		}, this));

		this.render();
	};

	/**
		Toggles a nodes checked state; checking if unchecked, unchecking if checked.
		@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
		@param {optional Object} options
	*/
	Tree.prototype.toggleNodeChecked = function (identifiers, options) {
		this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
			this.toggleCheckedState(node, options);
		}, this));

		this.render();
	};


	/**
		Disable all tree nodes
		@param {optional Object} options
	*/
	Tree.prototype.disableAll = function (options) {
		var identifiers = this.findNodes('false', 'g', 'state.disabled');
		this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
			this.setDisabledState(node, true, options);
		}, this));

		this.render();
	};

	/**
		Disable a given tree node
		@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
		@param {optional Object} options
	*/
	Tree.prototype.disableNode = function (identifiers, options) {
		this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
			this.setDisabledState(node, true, options);
		}, this));

		this.render();
	};

	/**
		Enable all tree nodes
		@param {optional Object} options
	*/
	Tree.prototype.enableAll = function (options) {
		var identifiers = this.findNodes('true', 'g', 'state.disabled');
		this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
			this.setDisabledState(node, false, options);
		}, this));

		this.render();
	};

	/**
		Enable a given tree node
		@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
		@param {optional Object} options
	*/
	Tree.prototype.enableNode = function (identifiers, options) {
		this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
			this.setDisabledState(node, false, options);
		}, this));

		this.render();
	};

	/**
		Toggles a nodes disabled state; disabling is enabled, enabling if disabled.
		@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
		@param {optional Object} options
	*/
	Tree.prototype.toggleNodeDisabled = function (identifiers, options) {
		this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
			this.setDisabledState(node, !node.state.disabled, options);
		}, this));

		this.render();
	};


	/**
		Common code for processing multiple identifiers
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

	/*
		Identifies a node from either a node id or object
	*/
	Tree.prototype.identifyNode = function (identifier) {
		return ((typeof identifier) === 'number') ?
						this.nodes[identifier] :
						identifier;
	};

	/**
		Searches the tree for nodes (text) that match given criteria
		@param {String} pattern - A given string to match against
		@param {optional Object} options - Search criteria options
		@return {Array} nodes - Matching nodes
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
		Clears previous search results
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
		Find nodes that match a given criteria
		@param {String} pattern - A given string to match against
		@param {optional String} modifier - Valid RegEx modifiers
		@param {optional String} attribute - Attribute to compare pattern against
		@return {Array} nodes - Nodes that match your criteria
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
		Recursive find for retrieving nested attributes values
		All values are return as strings, unless invalid
		@param {Object} obj - Typically a node, could be any object
		@param {String} attr - Identifies an object property using dot notation
		@return {String} value - Matching attributes string representation
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
