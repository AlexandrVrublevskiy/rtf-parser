/*import {EMFJS, RTFJS, WMFJS} from 'rtf.js';*/
$(document).ready(function(){

    function stringToArrayBuffer(string) {
        let buffer = new ArrayBuffer(string.length);
        let bufferView = new Uint8Array(buffer);
        for (let i=0; i<string.length; i++) {
            bufferView[i] = string.charCodeAt(i);
        }
        return buffer;
    }
    
    RTFJS.loggingEnabled(false);
    WMFJS.loggingEnabled(false);
    EMFJS.loggingEnabled(false);
    
   $('#input-rtf').change(function handleFile(e) {
        try {
                let files = e.target.files;   
                for (let i = 0; i < files.length; ++i) {

                    let fileName = files[i].name;

                    if(fileName.includes('Gol')) {

                        let reader = new FileReader();
                
                        reader.onload = (function () {
                            
                            return function(e) {
                                
                                let data = e.target.result;
                                const doc = new RTFJS.Document(stringToArrayBuffer(data));
                                let doc_data = [];
                                let depList = [];
                                let zas;
                                let zasNum;
                                let zasDate;
                                let zasFull = [];
                                let projFileName = fileName;
                                for(let k = 0; k < doc._document._ins.length; k++ ){
                                    if (typeof doc._document._ins[k] === 'string' && isNaN(Number(doc._document._ins[k]))) {
                                        doc_data.push(doc._document._ins[k]);
                                    }
                                }
                                //console.log(doc_data)
                                zas = doc_data[3].replace(/ /g,"");
                                zasDate = doc_data[3].substr(doc_data[3].length -10, doc_data[3].length);
                                for(let y = 0; y < zas.length; y++) {
                                    if(zas[y].toLowerCase() === 'с') {
                                        zas.indexOf(zas[y]);
                                        zasNum = zas.substr(0, zas.indexOf(zas[y]));
                                        break;
                                    }
                                }
                                zasFull.push({zasNum: zasNum});
                                zasFull.push({zasDate: zasDate});
                                zasFull.push({proj: doc_data[6]});
                                zasFull.push({fileName: projFileName})
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
                                zasFull.depList = depList;
                                console.log(zasFull);
                            }
                        })();
                        reader.readAsBinaryString(files[i]);
                    }
                }
            } catch (err) {
                alert(`При загрузке произошла ошибка, обратитесь к системному администратору. ${err}`)
            }  
    });

});