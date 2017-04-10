"use strict";

var rules = [
    
];

var selection = [
    <%=selection%>
];

var GeralHead = [
    {name: 'main_css', widget:'Head', href:'css/bootstrap.css', tag: 'style'},
    {name: 'fontawesone_css', widget:'Head', href:'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css', tag: 'style'},
    {name: 'viewport', widget:'Meta', content:'width=device-width, initial-scale=1'}
];


<% _each(interfaces, function(interface){ %>
//---------------------------------------------------------------------------------------- <%=interface.name ----------------------------------------------------------------------------------------
var <%=interface.name%>Abstrata = 
<%=interface%>;

<%= var itensConcretos = app.GetDeepPropertiesValue(interface.widgets); %>
var <%=interface.name%>Concreta = 
{
    name: '<%=interface.name%>', 
    head: GeralHead.concat([
        {name: 'title', widget:'Title', value: 'Página Inicial'}
    ]),
    strucuture: [],
    maps: [
    <% _each(itensConcretos, function(itemConcreto){ %>    
        { name: '<%=itemConcreto%>' },
    <% } %>    
    ]
};

<% }) %>

//---------------------------------------------------------------------------------------- Fim das Interfaces  ----------------------------------------------------------------------------------------

var interface_abstracts = [
<% _each(interfaces, function(interface){ %>
    <%=interface.name%>Abstrata, 
<% } %>
];

var concrete_interface = [
    <% _each(interfaces, function(interface){ %>
    <%=interface.name%>Concreta, 
<% } %>
];

var ajaxSetup = {

};

var configAPIAi = {
    
    SERVER_PROTO : 'wss',
    SERVER_DOMAIN:  'api-ws.api.ai',
    SERVER_PORT:  '4435',
    ACCESS_TOKEN:  '<%=key%>',
    SERVER_VERSION:  '20150910',
    LANG:  'pt-BR',
    TIME_ZONE : 'GMT+3',
    READING_INTERVAL: 1000
}

if(typeof define === 'function') {
    define([
        "jquery",
        "bootstrap",
        'mira/init'
    ], function ($, $bootstrap, Mira) {

        return function BookingMira() {
            var app = new Mira.Application(interface_abstracts, concrete_interface, rules, selection, configAPIAi);
            Mira.Widget.setDefault('BootstrapSimple');
        };
    });
} else {
    exports.ajaxSetup = ajaxSetup;
    exports.abstracts = interface_abstracts;
    exports.mapping = concrete_interface;
    exports.selection = selection;
    exports.rules = rules;
}