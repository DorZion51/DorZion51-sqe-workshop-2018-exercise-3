import * as esprima from 'esprima';
//const Viz = require('viz.js');
import * as esgraph from 'esgraph';
//let lines=[];
let helpMap=new Map();
let inputv=new Map();


let cfg=[];
let p=0;
let counter=0;


const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse);
};
function reset() {
    helpMap=new Map();
    inputv=new Map();
    cfg=[];
    p=0;
    counter=0;
}

function checkStart(code,input) {
    reset();
    let func=code.body[0];
    setInputVector(func.params,input);
    cfg=esgraph(func.body);
    setColors(cfg);
    Numbering(cfg,cfg[2]);
    let ne=controlFlowGraph(cfg);
    let graph=esgraph.dot(cfg);
    let lines=graph.split('\n');
    lines=changedLines(ne,lines);
    lines=lines.join('\n');
    let some =lines;
    return some;
}

function Numbering(cfg,start) {

    for (let i = 0; i <start.length ; i++) {
        if(start[i].astNode!=undefined&&start[i].astNode.type!='BlockStatement'&&start[i].astNode.counter==undefined){
            start[i].astNode.counter=counter;
            counter++;
            idle(cfg,start[i]);
        }
    }

}
function idle(cfg,node) {
    if(node.astNode.type=='BinaryExpression'){
        if(node.true.astNode.counter==undefined){
            node.true.astNode.counter=counter;
            counter++;
        }
        if(node.false.astNode.counter==undefined){
            node.false.astNode.counter=counter;
            counter++;
        }
    }

}



function changedLines(n,p) {
    for (let i = 1; i <n.length+1 ; i++) {
        p[i]=n[i-1];
    }
    for (let i = 0; i <p.length ; i++) {
        if(p[i].indexOf('[color="red", label="exception"]')!=-1){
            p[i]='';
        }
    }
    p=deleteStartEnd(p,n.length+1);
    return p;
}

function deleteStartEnd(p,line) {
    let start_label=p[0].split('[')[0];
    let end_label=p[line].split('[')[0];
    let newp=[];
    for (let i = 0; i <p.length ; i++) {
        if(p[i].indexOf(start_label)==-1&&p[i].indexOf(end_label)==-1){
            newp.push(p[i]);
        }
    }
    return newp;
}

function controlFlowGraph(cfg) {
    let array=cfg[2];
    let newGraph=[];
    for (let i = 1; i <array.length-1 ; i++) {
        let str= getStrings(array[i]);
        if(array[i].astNode.color==='green'){
            newGraph.push('n'+i+'[label="'+array[i].astNode.counter+' '+str+',style=filled,color='+array[i].astNode.color+']');
        }
        else{
            newGraph.push('n'+i+'[label="'+array[i].astNode.counter+' '+str+']');
        }//style=filled
    }
    return newGraph;
}

function getStrings(node) {
    if(node.astNode.type=='VariableDeclaration'){
        return getVarDecString(node.astNode.declarations)+'"'+',shape=square';
    }
    else if(node.parent.type=='IfStatement'){
        return checkKind(node.astNode)+'"'+',shape=diamond';
    }
    else if(node.parent.type=='WhileStatement'){
        return checkKind(node.astNode)+'"'+',shape=diamond' ;
    }
    else if(node.astNode.type=='AssignmentExpression'){
        return checkKind(node.astNode.left)+'='+checkKind(node.astNode.right)+'"'+',shape=square';
    }
    else{
        return 'return '+checkKind(node.astNode.argument)+'"'+', shape=square';
    }
}

function getVarDecString(dec) {
    let str='';
    for (let i = 0; i <dec.length ; i++) {
        if(dec[i].init.type=='ArrayExpression'){
            str+=dec[i].id.name+'='+getArrayString(dec[i].init.elements);
        }
        else{
            str+=dec[i].id.name+'='+checkKind(dec[i].init);
        }
    }
    return str;
}

function getArrayString(elements) {
    let str='[';
    for (let i = 0; i <elements.length ; i++) {
        str+=checkKind(elements[i])+',';
    }
    str=str.substring(0,str.length-1)+']';
    return str;
}

function checkKind(some) {
    if(some.type=='Literal')
        return some.value;
    else if(some.type=='Identifier'){
        return some.name;
    }
    else if(some.type=='UnaryExpression'){
        return getUnaryString(some);
    }
    else if(some.type=='BinaryExpression'){
        return getBinaryString(some);
    }
    else{ //member ship
        return getMembershipString(some);
    }
}

function getUnaryString(unary) {
    return unary.operator+'('+checkKind(unary.argument)+')';
}

function getBinaryString(binary) {
    return '('+checkKind(binary.left)+binary.operator+checkKind(binary.right)+')';
}

function getMembershipString(member) {
    return member.object.name+'['+checkKind(member.property)+']';
}

function setColors(cfg) {
    let color='green';
    let locals=new Map();
    for (let i = 0; i <cfg[2].length ; i++) {
        if(cfg[2][i].astNode!=undefined){
            if(cfg[2][i].astNode.color==undefined){
                let str =route(cfg[2][i],color,locals);
                if(str==='cut')
                    return;
            }
        }
    }
}

function route(node,color,locals) {
    if(node.astNode!=undefined){
        if(node.astNode.type=='VariableDeclaration'){
            declarations(node,color,locals);
        }
        if(node.astNode.type=='BinaryExpression'){
            return binaryAsNNode(node,color,locals);
        }
        if(node.astNode.type=='AssignmentExpression'){
            assDec(node,color,locals);
        }
        return continueR(node,color);
    }
}

function continueR(node,color) {
    if(node.astNode.type=='ReturnStatement'){
        return returnNode(node,color);
    }
}

function declarations(node,color,locals) {
    node.astNode.color=color;
    for (let i = 0; i <node.astNode.declarations.length ; i++) {
        varDec(node.astNode.declarations[i],color,locals);
    }
}

function varDec(node,color,locals) {
    if(node.init.type=='ArrayExpression'){
        array(node,locals);
    }
    else {
        locals.set(typeRoute(node.id, locals), typeRoute(node.init, locals));
    }
}

function assDec(node,color,locals) {
    node.astNode.color=color;
    locals.set(typeRoute(node.astNode.left,locals),typeRoute(node.astNode.right,locals));
}

function returnNode(node,color) {
    node.astNode.color=color;
    if(color)
        return 'cut';
}

function binaryAsNNode(node,color,locals) {
    let str=typeRoute(node.astNode,locals);let ans='';
    if(color=='red'){
        ans=route(node.false,'red',locals);
        ans=route(node.true,'red',locals);
    }
    else {
        if(eval(str)){
            ans=route(node.false,'red',locals);
            ans=route(node.true,'green',locals);
        }
        else{
            ans=route(node.true,'red',locals);
            ans=route(node.false,'green',locals);
        }
    }
    node.astNode.color=color;
    return ans;
}

function typeRoute(some,locals) {
    if(some.type=='Literal')
        return literal(some);
    else if(some.type=='Identifier'){
        return identifier(some,locals);
    }
    else if(some.type=='UnaryExpression'){
        return unaryExpression(some,locals);
    }
    else if(some.type=='BinaryExpression'){
        return binaryExpression(some,locals);
    }
    else{ //member ship
        return memberExpression(some,locals);
    }
}

function literal(literal) {
    if(isNaN(literal.value)){
        return literal.raw;
    }
    else{
        return literal.value;
    }
}

function array(node,locals){
    let name=typeRoute(node.id,locals);
    for(let i=0;i<node.init.elements.length;i++){
        locals.set(name+'['+i+']',typeRoute(node.init.elements[i],locals));
    }
}

function identifier(id,locals) {
    if(locals.has(id.name))
        return locals.get(id.name);
    if(inputv.has(id.name))
        return inputv.get(id.name);
    return id.name;
}

function unaryExpression(unary,locals) {
    let arg=unary.argument;
    let operator=unary.operator;
    return operator+'('+typeRoute(arg,locals)+')';
}

function binaryExpression(binary,locals) {
    let left=binary.left;
    let right=binary.right;
    let operator=binary.operator;
    return '('+ typeRoute(left,locals)+operator+typeRoute(right,locals)+')';
}

function memberExpression(exp,locals) {
    let object=exp.object;
    let property=exp.property;
    let str= object.name+'['+typeRoute(property,locals)+']';
    if(locals.has(str))
        return locals.get(str);
    if(inputv.has(str))
        return inputv.get(str);
}



//set params in input vector
function setInputVector(params,input) {
    setParams(params);
    setParamsInputVector(input);
}

function setParams(params) {
    for (let i = 0; i <params.length ; i++) {
        helpMap.set(p,params[i].name);
        p++;
    }
}

function setParamsInputVector(input) {
    let exp = input.body[0].expression.expressions;
    for (let i = 0; i <exp.length ; i++) {
        if(exp[i].type=='Literal'){
            inputv.set(helpMap.get(i),typeRoute(exp[i],[]));
        }
        if(exp[i].type=='ArrayExpression'){
            for (let j = 0; j < exp[i].elements.length; j++) {
                inputv.set(helpMap.get(i) + '[' + j + ']', exp[i].elements[j].value);
            }
        }
    }
}


export {parseCode,checkStart};
