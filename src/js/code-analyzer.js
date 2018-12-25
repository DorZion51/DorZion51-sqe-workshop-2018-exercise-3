import * as esprima from 'esprima';
const Viz = require('viz.js');
import * as esgraph from 'esgraph';
//let lines=[];
let helpMap=new Map();
let inputv=new Map();
let conditions=new Map();


let p=0;
let c=0;


const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse);
};

function reset() {
    helpMap=new Map();
    inputv=new Map();
    conditions=new Map();
    p=0;
    c=0;
}

function checkStart(code,input) {
    start(code,input);
    let func=extractFunction(code.body);
    let cfg=esgraph(func.body);
    let ne=controlFlowGraph(cfg);
    let graph=esgraph.dot(cfg);
    let lines=graph.split('\n');
    lines=changedLines(ne,lines);
    lines=lines.join('\n');
    let some =Viz('digraph { '+lines+' }');
    return some;
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

function extractFunction(bodyArr) {
    for (let i = 0; i <bodyArr.length ; i++) {
        if(bodyArr[i].type=='FunctionDeclaration'){
            return bodyArr[i];
        }
    }
}

function controlFlowGraph(cfg) {
    let array=cfg[2];
    let newGraph=[];
    for (let i = 1; i <array.length-1 ; i++) {
        let str= getStrings(array[i]);
        newGraph.push('n'+i+'[label="'+str+',color='+conditions.get(i-1)+']');
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
        return 'return '+checkKind(node.astNode.argument)+'"'+',shape=square';
    }
}

function getVarDecString(dec) {
    let str='';
    for (let i = 0; i <dec.length ; i++) {
        str+=dec[i].id.name+'='+checkKind(dec[i].init);
    }
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


function start(code,inputvector) {
    reset();
    let func=extractFunction(code.body);
    setInputVector(func.params,inputvector);
    blockStatement1(func.body,[],true);

    let temp=0;
}



function blockStatement1(block,pre,color) {
    let locals=new Map();
    putall(locals,pre);
    for (let i = 0; i <block.body.length ; i++) {
        if(block.body[i].type=='VariableDeclaration'){
            variableDeclaration(block.body[i],locals,color);
        }
        if(block.body[i].type=='IfStatement'){
            ifStatement(block.body[i],locals,color);
        }
        if(block.body[i].type=='ExpressionStatement'){
            expressionStatement(block.body[i],locals,color);
        }
        blockStatement2(block.body[i],locals,color);
    }
}

function blockStatement2(block,locals,color) {
    if(block.type=='ReturnStatement'){
        returnStatement(block,locals,color);
    }
    if(block.type=='WhileStatement'){
        whileStatement(block,locals,color);
    }
}

function variableDeclaration(varDec,locals,color) {
    
    
    for (let i = 0; i <varDec.declarations.length ; i++) {
        variableDeclarator(varDec.declarations[i],locals,color);
    }
}

function variableDeclarator(dec,locals,color) {
    if(color){
        conditions.set(c,'green');
        c++;
    }
    else{
        conditions.set(c,'red');
        c++;
    }
    let id=dec.id.name;
    let init=dec.init;
    let rightHand=typeRoute(init,locals);
    locals.set(id,rightHand);
}

function ifStatement(state,locals,color) {
    let test=state.test;
    let condition=typeRoute(test,locals);
    let block=state.consequent;
    let alternate=state.alternate;
    if(color){ conditions.set(c,'green');c++;
        if(evalution(condition)){
            blockStatement1(block,locals,true);
            alternateStatement(alternate,locals,false);
        }
        else{
            blockStatement1(block,locals,false);
            alternateStatement(alternate,locals,true);
        }
    }
    else{conditions.set(c,'red');
        blockStatement1(block,locals,false);
        alternateStatement(alternate,locals,false);
    }
}

function expressionStatement(state,locals,color) {
    AssignmentExprssion(state.expression,locals,color);
}

function AssignmentExprssion(exp,locals,color) {
    if(color){
        conditions.set(c,'green');
        c++;
    }
    else{
        conditions.set(c,'red');
        c++;
    }
    let left=exp.left;
    let right=exp.right;
    right=typeRoute(right,locals);
    locals.set(left,right);
}

function returnStatement(state,locals,color) {
    if(color){
        conditions.set(c,'green');
        c++;
    }
    else{
        conditions.set(c,'red');
        c++;
    }
    let arg=state.argument;
    return arg;
}

function whileStatement(state,locals,color) {
    if(color){
        conditions.set(c,'green');
        c++;
    }
    else{
        conditions.set(c,'red');
        c++;
    }
    let block=state.body;
    let test=state.test;
}

function typeRoute(some,locals) {
    if(some.type=='Literal')
        return some.value;
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
    return object.name+'['+typeRoute(property,locals)+']';
}

function alternateStatement(stat,locals,color) {
    if(stat.type=='ReturnStatement'){
        returnStatement(stat,locals,color);
    }
    else if(stat.type=='IfStatement'){
        ifStatement(stat,locals,color);
    }
    else if(stat.type=='ExpressionStatement'){
        expressionStatement(stat,locals,color);
    }
    else if(stat.type=='WhileStatement'){
        whileStatement(stat,locals,color);
    }
    else
        blockStatement1(stat,locals,color); //else blockstate
}

function evalution(str) {
    return eval(str);
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
            inputv.set(helpMap.get(i),exp[i].value);
        }
        if(exp[i].type=='ArrayExpression'){
            for (let j = 0; j < exp[i].elements.length; j++) {
                inputv.set(helpMap.get(i) + '[' + j + ']', exp[i].elements[j].value);
            }
        }
    }
}

function putall(locals,pre) {
    let key='';
    for(key in pre){
        locals.set(key,pre.get(key));
    }
}

export {parseCode,checkStart};
