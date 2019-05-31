$(document).ready(function(){

    function stringToArrayBuffer(string) {
        let buffer = new ArrayBuffer(string.length);
        let bufferView = new Uint8Array(buffer);
        for (let i=0; i<string.length; i++) {
            bufferView[i] = string.charCodeAt(i);
        }
        return buffer;
    }

    function fileRreader(e) {
        return new Promise(resolve => {
             let files = e.target.files;
                let item = {};
                item.zas = [];
                let fl = files.length;
                let endMark = 0;  
                for (let i = 0; i < fl; ++i) {
                    let fileName = files[i].name;
                    if(fileName.includes('Gol')) {
                        let reader = new FileReader();
                        reader.onload = (function () {
                            return function(e) {
                                let data = e.target.result;
                                const doc = new RTFJS.Document(stringToArrayBuffer(data));
                                let doc_data = [];
                                let zas;
                                let zasNum;
                                let zasDate;
                                let zasFull = {};
                                zasFull.depList = []
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

                                for(let i = 0; i < doc_data.length; i++ ){
                                    
                                    if(doc_data[i].replace(/ /g,"") === 'Вибір') {
                                        
                                        for(let j = i + 1; j < doc_data.length; j += 2){

                                            if (doc_data[j].replace(/ /g,"") !== 'УСЬОГО:'){
                                                let dep = {};
                                                dep.name = doc_data[j];
                                                dep.rez = doc_data[j+1];
                                                zasFull.depList.push(dep);

                                            } else {
                                                break;
                                            }
                                        }
                                    }
                                }

                                if (zasFull.depList.length < 100) {
                                    zasFull.zasNum = zasNum;
                                    zasFull.zasDate = zasDate;
                                    zasFull.project = doc_data[6];
                                    zasFull.fileName = projFileName;
                                    item.zas.push(zasFull);
                                    //console.log(zasFull);
                                    //console.log(JSON.stringify(item));
                                    endMark++
                                    resolve(item)
                                }
                                
                                /*if (endMark === 103){
                                   
                                    resolve(item)
                                }   */
                            }
                        })();
                        reader.readAsBinaryString(files[i]);
                        
                    }
                    
                }
                
               
        })
    }
    
    RTFJS.loggingEnabled(false);
    
   $('#input-rtf').change(function handleFile(e) {
        try {
            async function showZas(){
                let zas = await fileRreader(e);
                //console.log(JSON.stringify(zas));
                //console.log(zas);
                $('#P4_JSON').val(JSON.stringify(zas))
                console.log($('#P4_JSON').val());
            }
            showZas();
                //setTimeout(() => console.log(JSON.stringify(item)), 2000);

            } catch (err) {
                alert(`При загрузке произошла ошибка, обратитесь к системному администратору. ${err}`)
            }  
    });

});

