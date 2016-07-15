/**
 * Created by zibx on 08.07.16.
 */
module.exports = (function() {
    'use strict';
    var QObject = require('../../Base/QObject'),
        parser = require('../Parse/Parser'),
        shadow = require('../Shadow');
    
    var compiler = new QObject({
        compile: function(metadata){

            var source = [],
                vars = {_known: 'QObject._knownComponents', cls: void 0},
                varDefs = [], i;

            for(i in metadata)
                source = source.concat(this.compileClass(metadata, i, vars));

            for( i in vars )
                varDefs.push(vars[i] === void 0 ? i : i+' = '+vars[i]);
            return '\nvar '+varDefs.join(',\n\t')+';\n\n'+
                source.join('\n');
        },
        compileClass: function(metadata, name, vars){
            var item = metadata[name],
                source;
            vars[item.type] ='_known[\''+item.type+'\']';

            source = [

                'var '+ name +' = '+ item.type+'.extend(\''+name+'\', {}, function(){',
                '    '+item.type+'.apply(this, arguments);',
                '    var tmp, eventManager = this._eventManager, mutatingPipe;',
                '',
                item.children.map(this.compileChild.bind(this)).join(''),
                this.makePublic(item.public),
                '    this._init();',
                '});'
            ];
            return source;
        },
        makePublic: function(props){
            var i, prop, pipes, out = '', propVal;
            for( i in props ){
                prop = props[i];
                pipes = prop.value;
                if(pipes.isPipe){
                    //var pipe = this.getPipe(pipes[i]);
                    out += '\tmutatingPipe = new Base.Pipes.MutatingPipe(\n'+
                        '\t    ['+
                        pipes.vars.map(function(name){return 'this.id + \'.'+name+'\'';}).join(',')+
                        '],\n'+
                        '\t    {component: this.id, property: \''+ i +'\'}\n'+
                        '\t);\n'+
                        '\tmutatingPipe.addMutator(function ('+pipes.vars.join(',')+') {\n'+
                        '\t    return '+pipes.fn+';\n'+
                        '\t});\n'+
                        '\teventManager.registerPipe(mutatingPipe);\n';

                    //out += '\tPIPEtmp.set(\'' + i + '\', '+ prop +')\n';
                }else {
                    propVal = this.propertyGetter(prop);
                    out += '\tthis.set(\'' + i + '\', '+ propVal +')\n';
                }
            }
            return out;
        },
        compileChild: function(child){
            var type = child.type;

            if(!QObject._knownComponents[type] ||
               !(QObject._knownComponents[type].prototype instanceof QObject._knownComponents.AbstractComponent) )
                return '';

            var out = '\ttmp = (function(parent){\n'+
                    '\t\teventManager.registerComponent(this.id, this);\n',
                i, prop, propVal,
                pipes;
            for(i in child.prop){

                prop = child.prop[i];
                pipes = prop.value;
                if(pipes.isPipe){
                    //var pipe = this.getPipe(pipes[i]);
                    out += '\t\tmutatingPipe = new Base.Pipes.MutatingPipe(\n'+
                    '\t\t    ['+
                        pipes.vars.map(function(name){return 'parent.id + \'.'+name+'\'';}).join(',')+
                        '],\n'+
                    '\t\t    {component: this.id, property: \''+ i +'\'}\n'+
                    '\t\t);\n'+
                    '\t\tmutatingPipe.addMutator(function ('+pipes.vars.join(',')+') {\n'+
                    '\t\t    return '+pipes.fn+';\n'+
                    '\t\t});\n'+
                    '\t\teventManager.registerPipe(mutatingPipe);\n';

                    //out += '\t\tPIPEtmp.set(\'' + i + '\', '+ prop +')\n';
                }else {
                    propVal = this.propertyGetter(prop);
                    out += '\t\tthis.set(\'' + i + '\', '+ propVal +')\n';
                }
            }
            out += '\t\tparent._ownComponents.push(this);\n\n';
            out += '\t\treturn this;\n' +
                '\t}).call( new _known[\''+child.type/*TODO: escape*/+'\']({'+
                    (child.name ? 'id: \''+child.name+'\'':'')+'}), this );\n';

            return out;

        },
        getPipe: function(items){
            return items[0];
        },
        propertyGetter: function(prop){
            console.log('****',prop, prop.value[0] && prop.value[0].items)
            return '\''+prop.value+'\'';
        }
    });

    /*var tokens = parser.tokenizer(
    ),
        tree = parser.treeBuilder(tokens),
        linked = compiler.linker(tree);
    console.log(tree);
    console.log(JSON.stringify(linked,null,2));*/


    return compiler;
})();