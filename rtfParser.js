/*import {EMFJS, RTFJS, WMFJS} from 'rtf.js';*/
$(document).ready(function(){

    function stringToArrayBuffer(string) {
        var buffer = new ArrayBuffer(string.length);
        var bufferView = new Uint8Array(buffer);
        for (var i=0; i<string.length; i++) {
            bufferView[i] = string.charCodeAt(i);
        }
        return buffer;
    }
    
    RTFJS.loggingEnabled(false);
    WMFJS.loggingEnabled(false);
    EMFJS.loggingEnabled(false);
    
   $('#input-rtf').change(function handleFile(e) {
        
        var files = e.target.files;
        var i, f;

        for (i = 0, f = files[i]; i != files.length; ++i) {
        var reader = new FileReader();
        var name = f.name;

        reader.onload = (function () { 
            return function(e) {
                var data = e.target.result;
                const doc = new RTFJS.Document(stringToArrayBuffer(data));
                let doc_data = [];
                let depList = [];
                for(let i = 0; i < doc._document._ins.length; i++ ){
                    if (typeof doc._document._ins[i] === 'string' && isNaN(Number(doc._document._ins[i]))) {
                        doc_data.push(doc._document._ins[i]);
                    }
                }
                for(let i = 0; i < doc_data.length; i++ ){
                     
                    if(doc_data[i].replace(/ /g,"") === 'Вибір') {
                        
                        for(let j = i + 1; j < doc_data.length; j += 2){

                            if (doc_data[j].replace(/ /g,"") !== 'УСЬОГО:'){
                                let dep = {};
                                dep.name = doc_data[j];
                                dep.rez = doc_data[j+1];
                                depList.push(dep);

                            } else {
                                break;
                            }
                        }
                    }
                }
                console.log(depList)
            }
        })(name);
        reader.readAsBinaryString(f);
        }
    });

});