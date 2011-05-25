
if(!Array.prototype.indexOf)
{Array.prototype.indexOf=function(elt)
{var len=this.length;var from=Number(arguments[1])||0;from=(from<0)?Math.ceil(from):Math.floor(from);if(from<0){from+=len;}
for(;from<len;from++)
{if(from in this&&this[from]===elt){return from;}}
return-1;};}
var PHPParser=Editor.Parser=(function(){var atomicTypes={"atom":true,"number":true,"variable":true,"string":true};function PHPLexical(indented,column,type,align,prev,info){this.indented=indented;this.column=column;this.type=type;if(align!==null){this.align=align;}
this.prev=prev;this.info=info;}
function indentPHP(lexical){return function(firstChars){var firstChar=firstChars&&firstChars.charAt(0),type=lexical.type;var closing=firstChar==type;if(type=="form"&&firstChar=="{"){return lexical.indented;}
else if(type=="stat"||type=="form"){return lexical.indented+indentUnit;}
else if(lexical.info=="switch"&&!closing){return lexical.indented+(/^(?:case|default)\b/.test(firstChars)?indentUnit:2*indentUnit);}
else if(lexical.align){return lexical.column-(closing?1:0);}
else{return lexical.indented+(closing?0:indentUnit);}};}
function parsePHP(input,basecolumn){var tokens=tokenizePHP(input);var cc=[statements];var lexical=new PHPLexical((basecolumn||0)-indentUnit,0,"block",false);var column=0;var indented=0;var consume,marked;var parser={next:next,copy:copy};function next(){while(cc[cc.length-1].lex){cc.pop()();}
var token=tokens.next();if(token.type=="whitespace"&&column==0){indented=token.value.length;}
column+=token.value.length;if(token.content=="\n"){indented=column=0;if(!("align"in lexical)){lexical.align=false;}
token.indentation=indentPHP(lexical);}
if(token.type=="whitespace"||token.type=="comment"||token.type=="string_not_terminated"){return token;}
if(!("align"in lexical)){lexical.align=true;}
while(true){consume=marked=false;var action=cc.pop();action(token);if(consume){if(marked)
token.style=marked;return token;}}
return 1;}
function copy(){var _lexical=lexical,_cc=cc.concat([]),_tokenState=tokens.state;return function copyParser(input){lexical=_lexical;cc=_cc.concat([]);column=indented=0;tokens=tokenizePHP(input,_tokenState);return parser;};}
function push(fs){for(var i=fs.length-1;i>=0;i--)
cc.push(fs[i]);}
function cont(){push(arguments);consume=true;}
function pass(){push(arguments);consume=false;}
function mark(style){marked=style;}
function mark_add(style){marked=marked+' '+style;}
function pushlex(type,info){var result=function pushlexing(){lexical=new PHPLexical(indented,column,type,null,lexical,info)};result.lex=true;return result;}
function poplex(){lexical=lexical.prev;}
poplex.lex=true;function expect(wanted){return function expecting(token){if(token.type==wanted)cont();else{cont(arguments.callee);}};}
function require(wanted,execute){return function requiring(token){var ok;var type=token.type;if(typeof(wanted)=="string")
ok=(type==wanted)-1;else
ok=wanted.indexOf(type);if(ok>=0){if(execute&&typeof(execute[ok])=="function")
execute[ok](token);cont();}
else{if(!marked)mark(token.style);mark_add("syntax-error");cont(arguments.callee);}};}
function statements(token){return pass(statement,statements);}
function statement(token){var type=token.type;if(type=="keyword a")cont(pushlex("form"),expression,statement,poplex);else if(type=="keyword b")cont(pushlex("form"),statement,poplex);else if(type=="{")cont(pushlex("}"),block,poplex);else if(type=="function")funcdef();else if(type=="class")cont(require("t_string"),expect("{"),pushlex("}"),block,poplex);else if(type=="foreach")cont(pushlex("form"),require("("),pushlex(")"),expression,require("as"),require("variable"),expect(")"),poplex,statement,poplex);else if(type=="for")cont(pushlex("form"),require("("),pushlex(")"),expression,require(";"),expression,require(";"),expression,require(")"),poplex,statement,poplex);else if(type=="modifier")cont(require(["modifier","variable","function"],[null,null,funcdef]));else if(type=="switch")cont(pushlex("form"),require("("),expression,require(")"),pushlex("}","switch"),require([":","{"]),block,poplex,poplex);else if(type=="case")cont(expression,require(":"));else if(type=="default")cont(require(":"));else if(type=="catch")cont(pushlex("form"),require("("),require("t_string"),require("variable"),require(")"),statement,poplex);else if(type=="const")cont(require("t_string"));else if(type=="namespace")cont(namespacedef,require(";"));else pass(pushlex("stat"),expression,require(";"),poplex);}
function expression(token){var type=token.type;if(atomicTypes.hasOwnProperty(type))cont(maybeoperator);else if(type=="<<<")cont(require("string"),maybeoperator);else if(type=="t_string")cont(maybe_double_colon,maybeoperator);else if(type=="keyword c")cont(expression);else if(type=="(")cont(pushlex(")"),commasep(expression),require(")"),poplex,maybeoperator);else if(type=="operator")cont(expression);}
function maybeoperator(token){var type=token.type;if(type=="operator"){if(token.content=="?")cont(expression,require(":"),expression);else cont(expression);}
else if(type=="(")cont(pushlex(")"),expression,commasep(expression),require(")"),poplex,maybeoperator);else if(type=="[")cont(pushlex("]"),expression,require("]"),maybeoperator,poplex);}
function maybe_double_colon(token){if(token.type=="t_double_colon")
cont(require(["t_string","variable"]),maybeoperator);else{pass(expression)}}
function funcdef(){cont(require("t_string"),require("("),pushlex(")"),commasep(funcarg),require(")"),poplex,block);}
function commasep(what){function proceed(token){if(token.type==",")cont(what,proceed);}
return function commaSeparated(){pass(what,proceed);};}
function block(token){if(token.type=="}")cont();else pass(statement,block);}
function maybedefaultparameter(token){if(token.content=="=")cont(expression);}
function funcarg(token){if(token.type=="t_string")cont(require("variable"),maybedefaultparameter);else if(token.type=="variable")cont(maybedefaultparameter);}
function maybe_double_colon_def(token){if(token.type=="t_double_colon")
cont(namespacedef);}
function namespacedef(token){pass(require("t_string"),maybe_double_colon_def);}
return parser;}
return{make:parsePHP,electricChars:"{}:"};})();var JSParser=Editor.Parser=(function(){var atomicTypes={"atom":true,"number":true,"variable":true,"string":true,"regexp":true};var json=false;function JSLexical(indented,column,type,align,prev,info){this.indented=indented;this.column=column;this.type=type;if(align!=null)
this.align=align;this.prev=prev;this.info=info;}
function indentJS(lexical){return function(firstChars){var firstChar=firstChars&&firstChars.charAt(0),type=lexical.type;var closing=firstChar==type;if(type=="vardef")
return lexical.indented+4;else if(type=="form"&&firstChar=="{")
return lexical.indented;else if(type=="stat"||type=="form")
return lexical.indented+indentUnit;else if(lexical.info=="switch"&&!closing)
return lexical.indented+(/^(?:case|default)\b/.test(firstChars)?indentUnit:2*indentUnit);else if(lexical.align)
return lexical.column-(closing?1:0);else
return lexical.indented+(closing?0:indentUnit);};}
function parseJS(input,basecolumn){var tokens=tokenizeJavaScript(input);var cc=[json?singleExpr:statements];var context=null;var lexical=new JSLexical((basecolumn||0)-indentUnit,0,"block",false);var column=0;var indented=0;var consume,marked;var parser={next:next,copy:copy};function next(){while(cc[cc.length-1].lex)
cc.pop()();var token=tokens.next();if(token.type=="whitespace"&&column==0)
indented=token.value.length;column+=token.value.length;if(token.content=="\n"){indented=column=0;if(!("align"in lexical))
lexical.align=false;token.indentation=indentJS(lexical);}
if(token.type=="whitespace"||token.type=="comment")
return token;if(!("align"in lexical))
lexical.align=true;while(true){consume=marked=false;cc.pop()(token.type,token.content);if(consume){if(marked)
token.style=marked;else if(token.type=="variable"&&inScope(token.content))
token.style="js-localvariable";return token;}}}
function copy(){var _context=context,_lexical=lexical,_cc=cc.concat([]),_tokenState=tokens.state;return function copyParser(input){context=_context;lexical=_lexical;cc=_cc.concat([]);column=indented=0;tokens=tokenizeJavaScript(input,_tokenState);return parser;};}
function push(fs){for(var i=fs.length-1;i>=0;i--)
cc.push(fs[i]);}
function cont(){push(arguments);consume=true;}
function pass(){push(arguments);consume=false;}
function mark(style){marked=style;}
function pushcontext(){context={prev:context,vars:{"this":true,"arguments":true}};}
function popcontext(){context=context.prev;}
function register(varname){if(context){mark("js-variabledef");context.vars[varname]=true;}}
function inScope(varname){var cursor=context;while(cursor){if(cursor.vars[varname])
return true;cursor=cursor.prev;}
return false;}
function pushlex(type,info){var result=function(){lexical=new JSLexical(indented,column,type,null,lexical,info)};result.lex=true;return result;}
function poplex(){lexical=lexical.prev;}
poplex.lex=true;function expect(wanted){return function expecting(type){if(type==wanted)cont();else cont(arguments.callee);};}
function statements(type){return pass(statement,statements);}
function singleExpr(type){return pass(expression,statements);}
function statement(type){if(type=="var")cont(pushlex("vardef"),vardef1,expect(";"),poplex);else if(type=="keyword a")cont(pushlex("form"),expression,statement,poplex);else if(type=="keyword b")cont(pushlex("form"),statement,poplex);else if(type=="{")cont(pushlex("}"),block,poplex);else if(type=="function")cont(functiondef);else if(type=="for")cont(pushlex("form"),expect("("),pushlex(")"),forspec1,expect(")"),poplex,statement,poplex);else if(type=="variable")cont(pushlex("stat"),maybelabel);else if(type=="switch")cont(pushlex("form"),expression,pushlex("}","switch"),expect("{"),block,poplex,poplex);else if(type=="case")cont(expression,expect(":"));else if(type=="default")cont(expect(":"));else if(type=="catch")cont(pushlex("form"),pushcontext,expect("("),funarg,expect(")"),statement,poplex,popcontext);else pass(pushlex("stat"),expression,expect(";"),poplex);}
function expression(type){if(atomicTypes.hasOwnProperty(type))cont(maybeoperator);else if(type=="function")cont(functiondef);else if(type=="keyword c")cont(expression);else if(type=="(")cont(pushlex(")"),expression,expect(")"),poplex,maybeoperator);else if(type=="operator")cont(expression);else if(type=="[")cont(pushlex("]"),commasep(expression,"]"),poplex,maybeoperator);else if(type=="{")cont(pushlex("}"),commasep(objprop,"}"),poplex,maybeoperator);}
function maybeoperator(type){if(type=="operator")cont(expression);else if(type=="(")cont(pushlex(")"),expression,commasep(expression,")"),poplex,maybeoperator);else if(type==".")cont(property,maybeoperator);else if(type=="[")cont(pushlex("]"),expression,expect("]"),poplex,maybeoperator);}
function maybelabel(type){if(type==":")cont(poplex,statement);else pass(maybeoperator,expect(";"),poplex);}
function property(type){if(type=="variable"){mark("js-property");cont();}}
function objprop(type){if(type=="variable")mark("js-property");if(atomicTypes.hasOwnProperty(type))cont(expect(":"),expression);}
function commasep(what,end){function proceed(type){if(type==",")cont(what,proceed);else if(type==end)cont();else cont(expect(end));}
return function commaSeparated(type){if(type==end)cont();else pass(what,proceed);};}
function block(type){if(type=="}")cont();else pass(statement,block);}
function vardef1(type,value){if(type=="variable"){register(value);cont(vardef2);}
else cont();}
function vardef2(type,value){if(value=="=")cont(expression,vardef2);else if(type==",")cont(vardef1);}
function forspec1(type){if(type=="var")cont(vardef1,forspec2);else if(type==";")pass(forspec2);else if(type=="variable")cont(formaybein);else pass(forspec2);}
function formaybein(type,value){if(value=="in")cont(expression);else cont(maybeoperator,forspec2);}
function forspec2(type,value){if(type==";")cont(forspec3);else if(value=="in")cont(expression);else cont(expression,expect(";"),forspec3);}
function forspec3(type){if(type==")")pass();else cont(expression);}
function functiondef(type,value){if(type=="variable"){register(value);cont(functiondef);}
else if(type=="(")cont(pushcontext,commasep(funarg,")"),statement,popcontext);}
function funarg(type,value){if(type=="variable"){register(value);cont();}}
return parser;}
return{make:parseJS,electricChars:"{}:",configure:function(obj){if(obj.json!=null)json=obj.json;}};})();var CSSParser=Editor.Parser=(function(){var tokenizeCSS=(function(){function normal(source,setState){var ch=source.next();if(ch=="@"){source.nextWhileMatches(/\w/);return"css-at";}
else if(ch=="/"&&source.equals("*")){setState(inCComment);return null;}
else if(ch=="<"&&source.equals("!")){setState(inSGMLComment);return null;}
else if(ch=="="){return"css-compare";}
else if(source.equals("=")&&(ch=="~"||ch=="|")){source.next();return"css-compare";}
else if(ch=="\""||ch=="'"){setState(inString(ch));return null;}
else if(ch=="#"){source.nextWhileMatches(/\w/);return"css-hash";}
else if(ch=="!"){source.nextWhileMatches(/[ \t]/);source.nextWhileMatches(/\w/);return"css-important";}
else if(/\d/.test(ch)){source.nextWhileMatches(/[\w.%]/);return"css-unit";}
else if(/[,.+>*\/]/.test(ch)){return"css-select-op";}
else if(/[;{}:\[\]]/.test(ch)){return"css-punctuation";}
else{source.nextWhileMatches(/[\w\\\-_]/);return"css-identifier";}}
function inCComment(source,setState){var maybeEnd=false;while(!source.endOfLine()){var ch=source.next();if(maybeEnd&&ch=="/"){setState(normal);break;}
maybeEnd=(ch=="*");}
return"css-comment";}
function inSGMLComment(source,setState){var dashes=0;while(!source.endOfLine()){var ch=source.next();if(dashes>=2&&ch==">"){setState(normal);break;}
dashes=(ch=="-")?dashes+1:0;}
return"css-comment";}
function inString(quote){return function(source,setState){var escaped=false;while(!source.endOfLine()){var ch=source.next();if(ch==quote&&!escaped)
break;escaped=!escaped&&ch=="\\";}
if(!escaped)
setState(normal);return"css-string";};}
return function(source,startState){return tokenizer(source,startState||normal);};})();function indentCSS(inBraces,inRule,base){return function(nextChars){if(!inBraces||/^\}/.test(nextChars))return base;else if(inRule)return base+indentUnit*2;else return base+indentUnit;};}
function parseCSS(source,basecolumn){basecolumn=basecolumn||0;var tokens=tokenizeCSS(source);var inBraces=false,inRule=false;var iter={next:function(){var token=tokens.next(),style=token.style,content=token.content;if(style=="css-identifier"&&inRule)
token.style="css-value";if(style=="css-identifier"&&!inBraces)
token.style="css-selector";if(style=="css-hash")
token.style=inRule?"css-colorcode":"css-selector";if(content=="\n")
token.indentation=indentCSS(inBraces,inRule,basecolumn);if(content=="{")
inBraces=true;else if(content=="}")
inBraces=inRule=false;else if(inBraces&&content==";")
inRule=false;else if(inBraces&&style!="css-comment"&&style!="whitespace")
inRule=true;return token;},copy:function(){var _inBraces=inBraces,_inRule=inRule,_tokenState=tokens.state;return function(source){tokens=tokenizeCSS(source,_tokenState);inBraces=_inBraces;inRule=_inRule;return iter;};}};return iter;}
return{make:parseCSS,electricChars:"}"};})();var XMLParser=Editor.Parser=(function(){var Kludges={autoSelfClosers:{"br":true,"img":true,"hr":true,"link":true,"input":true,"meta":true,"col":true,"frame":true,"base":true,"area":true},doNotIndent:{"pre":true,"!cdata":true}};var NoKludges={autoSelfClosers:{},doNotIndent:{"!cdata":true}};var UseKludges=Kludges;var alignCDATA=false;var tokenizeXML=(function(){function inText(source,setState){var ch=source.next();if(ch=="<"){if(source.equals("!")){source.next();if(source.equals("[")){if(source.lookAhead("[CDATA[",true)){setState(inBlock("xml-cdata","]]>"));return null;}
else{return"xml-text";}}
else if(source.lookAhead("--",true)){setState(inBlock("xml-comment","-->"));return null;}
else{return"xml-text";}}
else if(source.equals("?")){source.next();source.nextWhileMatches(/[\w\._\-]/);setState(inBlock("xml-processing","?>"));return"xml-processing";}
else{if(source.equals("/"))source.next();setState(inTag);return"xml-punctuation";}}
else if(ch=="&"){while(!source.endOfLine()){if(source.next()==";")
break;}
return"xml-entity";}
else{source.nextWhileMatches(/[^&<\n]/);return"xml-text";}}
function inTag(source,setState){var ch=source.next();if(ch==">"){setState(inText);return"xml-punctuation";}
else if(/[?\/]/.test(ch)&&source.equals(">")){source.next();setState(inText);return"xml-punctuation";}
else if(ch=="="){return"xml-punctuation";}
else if(/[\'\"]/.test(ch)){setState(inAttribute(ch));return null;}
else{source.nextWhileMatches(/[^\s\u00a0=<>\"\'\/?]/);return"xml-name";}}
function inAttribute(quote){return function(source,setState){while(!source.endOfLine()){if(source.next()==quote){setState(inTag);break;}}
return"xml-attribute";};}
function inBlock(style,terminator){return function(source,setState){while(!source.endOfLine()){if(source.lookAhead(terminator,true)){setState(inText);break;}
source.next();}
return style;};}
return function(source,startState){return tokenizer(source,startState||inText);};})();function parseXML(source){var tokens=tokenizeXML(source),token;var cc=[base];var tokenNr=0,indented=0;var currentTag=null,context=null;var consume;function push(fs){for(var i=fs.length-1;i>=0;i--)
cc.push(fs[i]);}
function cont(){push(arguments);consume=true;}
function pass(){push(arguments);consume=false;}
function markErr(){token.style+=" xml-error";}
function expect(text){return function(style,content){if(content==text)cont();else{markErr();cont(arguments.callee);}};}
function pushContext(tagname,startOfLine){var noIndent=UseKludges.doNotIndent.hasOwnProperty(tagname)||(context&&context.noIndent);context={prev:context,name:tagname,indent:indented,startOfLine:startOfLine,noIndent:noIndent};}
function popContext(){context=context.prev;}
function computeIndentation(baseContext){return function(nextChars,current){var context=baseContext;if(context&&context.noIndent)
return current;if(alignCDATA&&/<!\[CDATA\[/.test(nextChars))
return 0;if(context&&/^<\//.test(nextChars))
context=context.prev;while(context&&!context.startOfLine)
context=context.prev;if(context)
return context.indent+indentUnit;else
return 0;};}
function base(){return pass(element,base);}
var harmlessTokens={"xml-text":true,"xml-entity":true,"xml-comment":true,"xml-processing":true};function element(style,content){if(content=="<")cont(tagname,attributes,endtag(tokenNr==1));else if(content=="</")cont(closetagname,expect(">"));else if(style=="xml-cdata"){if(!context||context.name!="!cdata")pushContext("!cdata");if(/\]\]>$/.test(content))popContext();cont();}
else if(harmlessTokens.hasOwnProperty(style))cont();else{markErr();cont();}}
function tagname(style,content){if(style=="xml-name"){currentTag=content.toLowerCase();token.style="xml-tagname";cont();}
else{currentTag=null;pass();}}
function closetagname(style,content){if(style=="xml-name"){token.style="xml-tagname";if(context&&content.toLowerCase()==context.name)popContext();else markErr();}
cont();}
function endtag(startOfLine){return function(style,content){if(content=="/>"||(content==">"&&UseKludges.autoSelfClosers.hasOwnProperty(currentTag)))cont();else if(content==">"){pushContext(currentTag,startOfLine);cont();}
else{markErr();cont(arguments.callee);}};}
function attributes(style){if(style=="xml-name"){token.style="xml-attname";cont(attribute,attributes);}
else pass();}
function attribute(style,content){if(content=="=")cont(value);else if(content==">"||content=="/>")pass(endtag);else pass();}
function value(style){if(style=="xml-attribute")cont(value);else pass();}
return{indentation:function(){return indented;},next:function(){token=tokens.next();if(token.style=="whitespace"&&tokenNr==0)
indented=token.value.length;else
tokenNr++;if(token.content=="\n"){indented=tokenNr=0;token.indentation=computeIndentation(context);}
if(token.style=="whitespace"||token.type=="xml-comment")
return token;while(true){consume=false;cc.pop()(token.style,token.content);if(consume)return token;}},copy:function(){var _cc=cc.concat([]),_tokenState=tokens.state,_context=context;var parser=this;return function(input){cc=_cc.concat([]);tokenNr=indented=0;context=_context;tokens=tokenizeXML(input,_tokenState);return parser;};}};}
return{make:parseXML,electricChars:"/",configure:function(config){if(config.useHTMLKludges!=null)
UseKludges=config.useHTMLKludges?Kludges:NoKludges;if(config.alignCDATA)
alignCDATA=config.alignCDATA;}};})();var SqlParser=Editor.Parser=(function(){function wordRegexp(words){return new RegExp("^(?:"+words.join("|")+")$","i");}
var functions=wordRegexp(["abs","acos","adddate","aes_encrypt","aes_decrypt","ascii","asin","atan","atan2","avg","benchmark","bin","bit_and","bit_count","bit_length","bit_or","cast","ceil","ceiling","char_length","character_length","coalesce","concat","concat_ws","connection_id","conv","convert","cos","cot","count","curdate","current_date","current_time","current_timestamp","current_user","curtime","database","date_add","date_format","date_sub","dayname","dayofmonth","dayofweek","dayofyear","decode","degrees","des_encrypt","des_decrypt","elt","encode","encrypt","exp","export_set","extract","field","find_in_set","floor","format","found_rows","from_days","from_unixtime","get_lock","greatest","group_unique_users","hex","ifnull","inet_aton","inet_ntoa","instr","interval","is_free_lock","isnull","last_insert_id","lcase","least","left","length","ln","load_file","locate","log","log2","log10","lower","lpad","ltrim","make_set","master_pos_wait","max","md5","mid","min","mod","monthname","now","nullif","oct","octet_length","ord","password","period_add","period_diff","pi","position","pow","power","quarter","quote","radians","rand","release_lock","repeat","reverse","right","round","rpad","rtrim","sec_to_time","session_user","sha","sha1","sign","sin","soundex","space","sqrt","std","stddev","strcmp","subdate","substring","substring_index","sum","sysdate","system_user","tan","time_format","time_to_sec","to_days","trim","ucase","unique_users","unix_timestamp","upper","user","version","week","weekday","yearweek"]);var keywords=wordRegexp(["alter","grant","revoke","primary","key","table","start","transaction","select","update","insert","delete","create","describe","from","into","values","where","join","inner","left","natural","and","or","in","not","xor","like","using","on","order","group","by","asc","desc","limit","offset","union","all","as","distinct","set","commit","rollback","replace","view","database","separator","if","exists","null","truncate","status","show","lock","unique"]);var types=wordRegexp(["bigint","binary","bit","blob","bool","char","character","date","datetime","dec","decimal","double","enum","float","float4","float8","int","int1","int2","int3","int4","int8","integer","long","longblob","longtext","mediumblob","mediumint","mediumtext","middleint","nchar","numeric","real","set","smallint","text","time","timestamp","tinyblob","tinyint","tinytext","varbinary","varchar","year"]);var operators=wordRegexp([":=","<","<=","==","<>",">",">=","like","rlike","in","xor","between"]);var operatorChars=/[*+\-<>=&|:\/]/;var tokenizeSql=(function(){function normal(source,setState){var ch=source.next();if(ch=="@"||ch=="$"){source.nextWhileMatches(/[\w\d]/);return"sql-var";}
else if(ch=="\""||ch=="'"||ch=="`"){setState(inLiteral(ch));return null;}
else if(ch==","||ch==";"){return"sql-separator"}
else if(ch=='-'){if(source.peek()=="-"){while(!source.endOfLine())source.next();return"sql-comment";}
else if(/\d/.test(source.peek())){source.nextWhileMatches(/\d/);if(source.peek()=='.'){source.next();source.nextWhileMatches(/\d/);}
return"sql-number";}
else
return"sql-operator";}
else if(operatorChars.test(ch)){source.nextWhileMatches(operatorChars);return"sql-operator";}
else if(/\d/.test(ch)){source.nextWhileMatches(/\d/);if(source.peek()=='.'){source.next();source.nextWhileMatches(/\d/);}
return"sql-number";}
else if(/[()]/.test(ch)){return"sql-punctuation";}
else{source.nextWhileMatches(/[_\w\d]/);var word=source.get(),type;if(operators.test(word))
type="sql-operator";else if(keywords.test(word))
type="sql-keyword";else if(functions.test(word))
type="sql-function";else if(types.test(word))
type="sql-type";else
type="sql-word";return{style:type,content:word};}}
function inLiteral(quote){return function(source,setState){var escaped=false;while(!source.endOfLine()){var ch=source.next();if(ch==quote&&!escaped){setState(normal);break;}
escaped=!escaped&&ch=="\\";}
return quote=="`"?"sql-word":"sql-literal";};}
return function(source,startState){return tokenizer(source,startState||normal);};})();function indentSql(context){return function(nextChars){var firstChar=nextChars&&nextChars.charAt(0);var closing=context&&firstChar==context.type;if(!context)
return 0;else if(context.align)
return context.col-(closing?context.width:0);else
return context.indent+(closing?0:indentUnit);}}
function parseSql(source){var tokens=tokenizeSql(source);var context=null,indent=0,col=0;function pushContext(type,width,align){context={prev:context,indent:indent,col:col,type:type,width:width,align:align};}
function popContext(){context=context.prev;}
var iter={next:function(){var token=tokens.next();var type=token.style,content=token.content,width=token.value.length;if(content=="\n"){token.indentation=indentSql(context);indent=col=0;if(context&&context.align==null)context.align=false;}
else if(type=="whitespace"&&col==0){indent=width;}
else if(!context&&type!="sql-comment"){pushContext(";",0,false);}
if(content!="\n")col+=width;if(type=="sql-punctuation"){if(content=="(")
pushContext(")",width);else if(content==")")
popContext();}
else if(type=="sql-separator"&&content==";"&&context&&!context.prev){popContext();}
return token;},copy:function(){var _context=context,_indent=indent,_col=col,_tokenState=tokens.state;return function(source){tokens=tokenizeSql(source,_tokenState);context=_context;indent=_indent;col=_col;return iter;};}};return iter;}
return{make:parseSql,electricChars:")"};})();var HTMLMixedParser=Editor.Parser=(function(){if(!(CSSParser&&JSParser&&XMLParser))
throw new Error("CSS, JS, and XML parsers must be loaded for HTML mixed mode to work.");XMLParser.configure({useHTMLKludges:true});function parseMixed(stream){var htmlParser=XMLParser.make(stream),localParser=null,inTag=false;var iter={next:top,copy:copy};function top(){var token=htmlParser.next();if(token.content=="<")
inTag=true;else if(token.style=="xml-tagname"&&inTag===true)
inTag=token.content.toLowerCase();else if(token.content==">"){if(inTag=="script")
iter.next=local(JSParser,"</script");else if(inTag=="style")
iter.next=local(CSSParser,"</style");inTag=false;}
return token;}
function local(parser,tag){var baseIndent=htmlParser.indentation();localParser=parser.make(stream,baseIndent+indentUnit);return function(){if(stream.lookAhead(tag,false,false,true)){localParser=null;iter.next=top;return top();}
var token=localParser.next();var lt=token.value.lastIndexOf("<"),sz=Math.min(token.value.length-lt,tag.length);if(lt!=-1&&token.value.slice(lt,lt+sz).toLowerCase()==tag.slice(0,sz)&&stream.lookAhead(tag.slice(sz),false,false,true)){stream.push(token.value.slice(lt));token.value=token.value.slice(0,lt);}
if(token.indentation){var oldIndent=token.indentation;token.indentation=function(chars){if(chars=="</")
return baseIndent;else
return oldIndent(chars);}}
return token;};}
function copy(){var _html=htmlParser.copy(),_local=localParser&&localParser.copy(),_next=iter.next,_inTag=inTag;return function(_stream){stream=_stream;htmlParser=_html(_stream);localParser=_local&&_local(_stream);iter.next=_next;inTag=_inTag;return iter;};}
return iter;}
return{make:parseMixed,electricChars:"{}/:"};})();var PHPHTMLMixedParser=Editor.Parser=(function(){if(!(PHPParser&&CSSParser&&JSParser&&XMLParser))
throw new Error("PHP, CSS, JS, and XML parsers must be loaded for PHP+HTML mixed mode to work.");XMLParser.configure({useHTMLKludges:true});function parseMixed(stream){var htmlParser=XMLParser.make(stream),localParser=null,inTag=false,phpParserState=null;var iter={next:top,copy:copy};function top(){var token=htmlParser.next();if(token.content=="<")
inTag=true;else if(token.style=="xml-tagname"&&inTag===true)
inTag=token.content.toLowerCase();else if(token.type=="xml-processing"){if(token.content=="<?php")
iter.next=local(PHPParser,"?>");}
else if(token.content==">"){if(inTag=="script")
iter.next=local(JSParser,"</script");else if(inTag=="style")
iter.next=local(CSSParser,"</style");inTag=false;}
return token;}
function local(parser,tag){var baseIndent=htmlParser.indentation();if(parser==PHPParser&&phpParserState)
localParser=phpParserState(stream);else
localParser=parser.make(stream,baseIndent+indentUnit);return function(){if(stream.lookAhead(tag,false,false,true)){if(parser==PHPParser)phpParserState=localParser.copy();localParser=null;iter.next=top;return top();}
var token=localParser.next();var lt=token.value.lastIndexOf("<"),sz=Math.min(token.value.length-lt,tag.length);if(lt!=-1&&token.value.slice(lt,lt+sz).toLowerCase()==tag.slice(0,sz)&&stream.lookAhead(tag.slice(sz),false,false,true)){stream.push(token.value.slice(lt));token.value=token.value.slice(0,lt);}
if(token.indentation){var oldIndent=token.indentation;token.indentation=function(chars){if(chars=="</")
return baseIndent;else
return oldIndent(chars);}}
return token;};}
function copy(){var _html=htmlParser.copy(),_local=localParser&&localParser.copy(),_next=iter.next,_inTag=inTag,_php=phpParserState;return function(_stream){stream=_stream;htmlParser=_html(_stream);localParser=_local&&_local(_stream);phpParserState=_php;iter.next=_next;inTag=_inTag;return iter;};}
return iter;}
return{make:parseMixed,electricChars:"{}/:"};})();