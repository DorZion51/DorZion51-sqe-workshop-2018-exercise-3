import assert from 'assert';
import {parseCode,checkStart} from '../src/js/code-analyzer';

//let func1=;
//let input1='1,2';
let func1='function foo ( a , b )  {\n' +
    ' let c=1;\n' +
    ' if(b>a){\n' +
    '   return b;\n' +
    ' }\n' +
    ' while(a==2){\n' +
    '   c=2;\n' +
    ' }\n' +
    '}';
let input1='1,2';
let output1='n1[label="0 c=1",shape=square,style=filled,color=green]\n' +
    'n2[label="1 (b>a)",shape=diamond,style=filled,color=green]\n' +
    'n3[label="2 return b", shape=square,style=filled,color=green]\n' +
    'n4[label="3 (a==2)",shape=diamond]\n' +
    'n5[label="4 c=2",shape=square]\n' +
    'n1 -> n2 []\n' +
    'n2 -> n3 [label="true"]\n' +
    'n2 -> n4 [label="false"]\n' +
    '\n' +
    'n4 -> n5 [label="true"]\n' +
    '\n' +
    'n5 -> n4 []\n' +
    '\n' +
    '';

let func2='function foo ( a , b )  {\n' +
    ' if(b>a){\n' +
    '   return b;\n' +
    ' }\n' +
    ' return a;\n' +
    '}';
let input2='1,2';
let output2='n1[label="0 (b>a)",shape=diamond,style=filled,color=green]\n' +
    'n2[label="1 return b", shape=square,style=filled,color=green]\n' +
    'n3[label="2 return a", shape=square]\n' +
    'n1 -> n2 [label="true"]\n' +
    'n1 -> n3 [label="false"]\n' +
    '\n' +
    '';

let func3='function foo ( a , b )  {\n' +
    ' let c= -1;\n' +
    ' let d=b[1];\n' +
    ' if(d<a){\n' +
    '   return b;\n' +
    ' }\n' +
    ' while(a==2){\n' +
    '   c=2;\n' +
    ' }\n' +
    '}';
let input3='1,[2,5]';
let output3='n1[label="0 c=-(1)",shape=square,style=filled,color=green]\n' +
    'n2[label="1 d=b[1]",shape=square,style=filled,color=green]\n' +
    'n3[label="2 (d<a)",shape=diamond,style=filled,color=green]\n' +
    'n4[label="3 return b", shape=square]\n' +
    'n5[label="4 (a==2)",shape=diamond,style=filled,color=green]\n' +
    'n6[label="5 c=2",shape=square]\n' +
    'n1 -> n2 []\n' +
    '\n' +
    'n2 -> n3 []\n' +
    '\n' +
    'n3 -> n4 [label="true"]\n' +
    'n3 -> n5 [label="false"]\n' +
    '\n' +
    'n5 -> n6 [label="true"]\n' +
    '\n' +
    'n6 -> n5 []\n' +
    '\n' +
    '';

let func4='function foo ( a , b )  {\n' +
    ' let c= [1,2];\n' +
    ' let d=c[1];\n' +
    ' if(d<a){\n' +
    '   return b;\n' +
    ' }\n' +
    ' while(a==2){\n' +
    '   c=2;\n' +
    ' }\n' +
    '}';
let input4='1,2';
let output4='n1[label="0 c=[1,2]",shape=square,style=filled,color=green]\n' +
    'n2[label="1 d=c[1]",shape=square,style=filled,color=green]\n' +
    'n3[label="2 (d<a)",shape=diamond,style=filled,color=green]\n' +
    'n4[label="3 return b", shape=square]\n' +
    'n5[label="4 (a==2)",shape=diamond,style=filled,color=green]\n' +
    'n6[label="5 c=2",shape=square]\n' +
    'n1 -> n2 []\n' +
    'n2 -> n3 []\n' +
    '\n' +
    'n3 -> n4 [label="true"]\n' +
    'n3 -> n5 [label="false"]\n' +
    '\n' +
    'n5 -> n6 [label="true"]\n' +
    '\n' +
    'n6 -> n5 []\n' +
    '\n' +
    '';

let func5='function foo(x, y, z){\n' +
    '    let a = x + 1;\n' +
    '    let b = a + y;\n' +
    '    let c = 0;\n' +
    '    \n' +
    '    if (b < z) {\n' +
    '        c = c + 5;\n' +
    '    } else if (b < z * 2) {\n' +
    '        c = c + x + 5;\n' +
    '    } else {\n' +
    '        c = c + z + 5;\n' +
    '    }\n' +
    '    \n' +
    '    return c;\n' +
    '}\n';
let input5='1,2,3';
let output5='n1[label="0 a=(x+1)",shape=square,style=filled,color=green]\n' +
    'n2[label="1 b=(a+y)",shape=square,style=filled,color=green]\n' +
    'n3[label="2 c=0",shape=square,style=filled,color=green]\n' +
    'n4[label="3 (b<z)",shape=diamond,style=filled,color=green]\n' +
    'n5[label="4 c=(c+5)",shape=square]\n' +
    'n6[label="6 return c", shape=square,style=filled,color=green]\n' +
    'n7[label="5 (b<(z*2))",shape=diamond,style=filled,color=green]\n' +
    'n8[label="7 c=((c+x)+5)",shape=square,style=filled,color=green]\n' +
    'n9[label="8 c=((c+z)+5)",shape=square]\n' +
    'n1 -> n2 []\n' +
    '\n' +
    'n2 -> n3 []\n' +
    '\n' +
    'n3 -> n4 []\n' +
    'n4 -> n5 [label="true"]\n' +
    'n4 -> n7 [label="false"]\n' +
    '\n' +
    'n5 -> n6 []\n' +
    '\n' +
    'n7 -> n8 [label="true"]\n' +
    'n7 -> n9 [label="false"]\n' +
    '\n' +
    'n8 -> n6 []\n' +
    '\n' +
    'n9 -> n6 []\n' +
    '\n' +
    '';

let func6='function foo(x, y, z){\n' +
    '    let a = x + 1;\n' +
    '    let b = a + y;\n' +
    '    let c = 0;\n' +
    '    \n' +
    '    if (b < z) {\n' +
    '        c = c + 5;\n' +
    '    } else if (b < z * 2) {\n' +
    '        c = c + x + 5;\n' +
    '    } else {\n' +
    '        c = c + z + 5;\n' +
    '    }\n' +
    '    \n' +
    '    return c;\n' +
    '}\n';
let input6='3,2,1';
let output6='n1[label="0 a=(x+1)",shape=square,style=filled,color=green]\n' +
    'n2[label="1 b=(a+y)",shape=square,style=filled,color=green]\n' +
    'n3[label="2 c=0",shape=square,style=filled,color=green]\n' +
    'n4[label="3 (b<z)",shape=diamond,style=filled,color=green]\n' +
    'n5[label="4 c=(c+5)",shape=square]\n' +
    'n6[label="6 return c", shape=square,style=filled,color=green]\n' +
    'n7[label="5 (b<(z*2))",shape=diamond,style=filled,color=green]\n' +
    'n8[label="7 c=((c+x)+5)",shape=square]\n' +
    'n9[label="8 c=((c+z)+5)",shape=square,style=filled,color=green]\n' +
    'n1 -> n2 []\n' +
    '\n' +
    'n2 -> n3 []\n' +
    '\n' +
    'n3 -> n4 []\n' +
    'n4 -> n5 [label="true"]\n' +
    'n4 -> n7 [label="false"]\n' +
    '\n' +
    'n5 -> n6 []\n' +
    '\n' +
    'n7 -> n8 [label="true"]\n' +
    'n7 -> n9 [label="false"]\n' +
    '\n' +
    'n8 -> n6 []\n' +
    '\n' +
    'n9 -> n6 []\n' +
    '\n' +
    '';

let func7='function foo(x, y, z){\n' +
    '    let a = x + 1;\n' +
    '    let b = a + y;\n' +
    '    let c = 0;\n' +
    '    \n' +
    '    if (b < z) {\n' +
    '        c = c + 5;\n' +
    '    } else if (b < z * 2) {\n' +
    '        c = c + x + 5;\n' +
    '    } else {\n' +
    '        c = c + z + 5;\n' +
    '    }\n' +
    '    \n' +
    '    return c;\n' +
    '}\n';
let input7='3,1,2';
let output7='n1[label="0 a=(x+1)",shape=square,style=filled,color=green]\n' +
    'n2[label="1 b=(a+y)",shape=square,style=filled,color=green]\n' +
    'n3[label="2 c=0",shape=square,style=filled,color=green]\n' +
    'n4[label="3 (b<z)",shape=diamond,style=filled,color=green]\n' +
    'n5[label="4 c=(c+5)",shape=square]\n' +
    'n6[label="6 return c", shape=square,style=filled,color=green]\n' +
    'n7[label="5 (b<(z*2))",shape=diamond,style=filled,color=green]\n' +
    'n8[label="7 c=((c+x)+5)",shape=square]\n' +
    'n9[label="8 c=((c+z)+5)",shape=square,style=filled,color=green]\n' +
    'n1 -> n2 []\n' +
    '\n' +
    'n2 -> n3 []\n' +
    '\n' +
    'n3 -> n4 []\n' +
    'n4 -> n5 [label="true"]\n' +
    'n4 -> n7 [label="false"]\n' +
    '\n' +
    'n5 -> n6 []\n' +
    '\n' +
    'n7 -> n8 [label="true"]\n' +
    'n7 -> n9 [label="false"]\n' +
    '\n' +
    'n8 -> n6 []\n' +
    '\n' +
    'n9 -> n6 []\n' +
    '\n' +
    '';

let func8='function foo(x, y, z){\n' +
    '    let a = x + 1;\n' +
    '    let b = a + y;\n' +
    '    let c = 0;\n' +
    '    \n' +
    '    if (b < z) {\n' +
    '        c = c + 5;\n' +
    '    } else if (b < z * 2) {\n' +
    '        c = c + x + 5;\n' +
    '    } else {\n' +
    '        c = c + z + 5;\n' +
    '    }\n' +
    '    \n' +
    '    return c;\n' +
    '}\n';
let input8='1,3,2';
let output8='n1[label="0 a=(x+1)",shape=square,style=filled,color=green]\n' +
    'n2[label="1 b=(a+y)",shape=square,style=filled,color=green]\n' +
    'n3[label="2 c=0",shape=square,style=filled,color=green]\n' +
    'n4[label="3 (b<z)",shape=diamond,style=filled,color=green]\n' +
    'n5[label="4 c=(c+5)",shape=square]\n' +
    'n6[label="6 return c", shape=square,style=filled,color=green]\n' +
    'n7[label="5 (b<(z*2))",shape=diamond,style=filled,color=green]\n' +
    'n8[label="7 c=((c+x)+5)",shape=square]\n' +
    'n9[label="8 c=((c+z)+5)",shape=square,style=filled,color=green]\n' +
    'n1 -> n2 []\n' +
    '\n' +
    'n2 -> n3 []\n' +
    '\n' +
    'n3 -> n4 []\n' +
    'n4 -> n5 [label="true"]\n' +
    'n4 -> n7 [label="false"]\n' +
    '\n' +
    'n5 -> n6 []\n' +
    '\n' +
    'n7 -> n8 [label="true"]\n' +
    'n7 -> n9 [label="false"]\n' +
    '\n' +
    'n8 -> n6 []\n' +
    '\n' +
    'n9 -> n6 []\n' +
    '\n' +
    '';

let func9='function foo(x, y, z){\n' +
    '    let a = x + 1;\n' +
    '    let b = a + y;\n' +
    '    let c = \'helo\';\n' +
    '    \n' +
    '    if (\'hello\'==z) {\n' +
    '        c = c + 5;\n' +
    '    } else if (c == z) {\n' +
    '        c = c + x + 5;\n' +
    '    } else {\n' +
    '        c = c  + 5;\n' +
    '    }\n' +
    '    \n' +
    '    return c;\n' +
    '}\n';
let input9='1,2,\'helo\'';
let output9='n1[label="0 a=(x+1)",shape=square,style=filled,color=green]\n' +
    'n2[label="1 b=(a+y)",shape=square,style=filled,color=green]\n' +
    'n3[label="2 c=helo",shape=square,style=filled,color=green]\n' +
    'n4[label="3 (hello==z)",shape=diamond,style=filled,color=green]\n' +
    'n5[label="4 c=(c+5)",shape=square]\n' +
    'n6[label="6 return c", shape=square,style=filled,color=green]\n' +
    'n7[label="5 (c==z)",shape=diamond,style=filled,color=green]\n' +
    'n8[label="7 c=((c+x)+5)",shape=square,style=filled,color=green]\n' +
    'n9[label="8 c=(c+5)",shape=square]\n' +
    'n1 -> n2 []\n' +
    '\n' +
    'n2 -> n3 []\n' +
    '\n' +
    'n3 -> n4 []\n' +
    'n4 -> n5 [label="true"]\n' +
    'n4 -> n7 [label="false"]\n' +
    '\n' +
    'n5 -> n6 []\n' +
    '\n' +
    'n7 -> n8 [label="true"]\n' +
    'n7 -> n9 [label="false"]\n' +
    '\n' +
    'n8 -> n6 []\n' +
    '\n' +
    'n9 -> n6 []\n' +
    '\n' +
    '';

let func10='function foo(x, y, z){\n' +
    '    let a = x + 1;\n' +
    '    let b = a + y;\n' +
    '    let c = 0;\n' +
    '    \n' +
    '    if (b < z) {\n' +
    '        c = c + 5;\n' +
    '    } else if (b < z * 2) {\n' +
    '        c = c + x + 5;\n' +
    '    } else {\n' +
    '        c = c + z + 5;\n' +
    '    }\n' +
    '    \n' +
    '    return c;\n' +
    '}\n';
let input10='7,11,12';
let output10='n1[label="0 a=(x+1)",shape=square,style=filled,color=green]\n' +
    'n2[label="1 b=(a+y)",shape=square,style=filled,color=green]\n' +
    'n3[label="2 c=0",shape=square,style=filled,color=green]\n' +
    'n4[label="3 (b<z)",shape=diamond,style=filled,color=green]\n' +
    'n5[label="4 c=(c+5)",shape=square]\n' +
    'n6[label="6 return c", shape=square,style=filled,color=green]\n' +
    'n7[label="5 (b<(z*2))",shape=diamond,style=filled,color=green]\n' +
    'n8[label="7 c=((c+x)+5)",shape=square,style=filled,color=green]\n' +
    'n9[label="8 c=((c+z)+5)",shape=square]\n' +
    'n1 -> n2 []\n' +
    '\n' +
    'n2 -> n3 []\n' +
    '\n' +
    'n3 -> n4 []\n' +
    'n4 -> n5 [label="true"]\n' +
    'n4 -> n7 [label="false"]\n' +
    '\n' +
    'n5 -> n6 []\n' +
    '\n' +
    'n7 -> n8 [label="true"]\n' +
    'n7 -> n9 [label="false"]\n' +
    '\n' +
    'n8 -> n6 []\n' +
    '\n' +
    'n9 -> n6 []\n' +
    '\n' +
    '';

describe('The javascript parser', () => {
    it('test1', () => {
        assert.equal(checkStart(parseCode(func1),parseCode(input1)),
            output1
        );
    });
    it('test2', () => {
        assert.equal(checkStart(parseCode(func2),parseCode(input2)),
            output2
        );
    });
    it('test3', () => {
        assert.equal(checkStart(parseCode(func3),parseCode(input3)),
            output3
        );
    });
    it('test4', () => {
        assert.equal(checkStart(parseCode(func4),parseCode(input4)),
            output4
        );
    });
    it('test5', () => {
        assert.equal(checkStart(parseCode(func5),parseCode(input5)),
            output5
        );
    });
    it('test6', () => {
        assert.equal(checkStart(parseCode(func6),parseCode(input6)),
            output6
        );
    });
    it('test7', () => {
        assert.equal(checkStart(parseCode(func7),parseCode(input7)),
            output7
        );
    });
    it('test8', () => {
        assert.equal(checkStart(parseCode(func8),parseCode(input8)),
            output8
        );
    });
    it('test9', () => {
        assert.equal(checkStart(parseCode(func9),parseCode(input9)),
            output9
        );
    });
    it('test10', () => {
        assert.equal(checkStart(parseCode(func10),parseCode(input10)),
            output10
        );
    });
});
