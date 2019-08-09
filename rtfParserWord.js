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
                let endMax = 0;
                let projID = 1;
                //let voteID = 1;
                for (let i = 0; i < fl; ++i) {
                    let fileName = files[i].name;
                    if(fileName.includes('Gol') && fileName.includes('.rtf')) {
                        endMax++;
                        let reader = new FileReader();
                        reader.onload = (function () {
                            return function(e) {
                                let data = e.target.result;
                                const doc = new RTFJS.Document(stringToArrayBuffer(data));

                                /*doc.render().then(function(htmlElements) {
                                    console.log(htmlElements);
                                }).catch(error => console.error(error));*/

                                let doc_data = [];
                                let zas;
                                let zasNum;
                                let zasDate;
                                let zasFull = {};
                                zasFull.za = 0;
                                zasFull.proty = 0;
                                zasFull.utr = 0;
                                zasFull.vids = 0;
                                zasFull.ne_gol = 0;
                                zasFull.result = '';
                                zasFull.depList = [];
                                let projFileName = fileName;
                                let projData= '';
                                let markProjTextEnd = 0;
                                let votingType = '';
                                
                                for(let k = 0; k < doc._document._ins.length; k++ ){
                                    if (typeof doc._document._ins[k] === 'string' && isNaN(Number(doc._document._ins[k]))) {
                                        doc_data.push(doc._document._ins[k]);
                                    }
                                }

                               let bigData = '';
                               for (let p = 0; p < doc_data.length; p++ ) {
                                 bigData = bigData + doc_data[p];
                               }
                               console.log(bigData);
                              
             
                               
                                //console.log(doc_data);
                                zas = doc_data[3].replace(/ /g,"");
                                zasDate = doc_data[3].substring(doc_data[3].length -10, doc_data[3].length);
                                for(let y = 0; y < zas.length; y++) {
                                    if(zas[y].toLowerCase() === 'с') {
                                        zas.indexOf(zas[y]);
                                        switch (zas.substring(0, zas.indexOf(zas[y]))) {
                                            case 'ДРУГА':
                                                zasNum = '2';
                                              break;
                                            default:
                                                zasNum = zas.substring(0, zas.indexOf(zas[y]));
                                          }
                                        //zasNum = zas.substring(0, zas.indexOf(zas[y]));
                                        break;
                                    }
                                } 
                                
                                for(let i = 0; i < doc_data.length; i++ ){
                                   if (doc_data[i].toLowerCase().includes('рішення ухвалює') && markProjTextEnd === 0){
                                         markProjTextEnd = i;
                                    }
                             
                                    
                                    if (doc_data[i].trim() === 'РІШЕННЯ ПРИЙНЯТО'){
                                        zasFull.result = '+'
                                    } else if (doc_data[i].trim() === 'РІШЕННЯ НЕ ПРИЙНЯТО') {
                                        zasFull.result = '-'
                                    };
                              
                                    if(doc_data[i].replace(/ /g,"") === 'Вибір') {
                                        
                                        for(let j = i + 1; j < doc_data.length; j += 2){

                                            if (!doc_data[j].replace(/ /g,"").includes('УСЬОГО:') && !doc_data[j].replace(/ /g,"").includes('ВСЬОГО:')){
                                                let dep = {};
                                                //dep.voteID = voteID++;
                                                dep.name = doc_data[j] + doc_data[j+1] + doc_data[j]+2;
                                                //dep.vote = doc_data[j+3].toLowerCase().trim();
                                                //console.log(doc_data[j+3])
                                                /*if (doc_data[j+3].toLowerCase().trim() === 'не'){
                                                    dep.vote = 'не голосував';
                                                    j = j+4;
                                                }*/
                                                zasFull.depList.push(dep);
                                                 switch (dep.vote) {
                                                    case 'за': 
                                                        zasFull.za++;
                                                        break;
                                                    case 'проти':
                                                        zasFull.proty++;
                                                        break;
                                                    case 'утримався':
                                                        zasFull.utr++;
                                                        break;
                                                    case 'відсутній': 
                                                        zasFull.vids++;
                                                        break;
                                                    case 'не голосував': 
                                                        zasFull.ne_gol++;
                                                    break;
                                                }

                                            } else {
                                                break;
                                            }
                                        }
                                    }
                                }
                                for (let n = 6; n < markProjTextEnd; n++){
                                    projData = projData + doc_data[n];
                                }
                                function nthIndex(str, pat, n){
                                    var L= str.length, i= -1;
                                    while(n-- && i++ < L){
                                        i= str.indexOf(pat, i);
                                        if (i < 0) break;
                                    }
                                    return i;
                                }
                                if (projData.includes('В ЦІЛОМУ')){
                                    votingType = 'в цілому';
                                    projData = projData.substring(0, projData.indexOf('В ЦІЛОМУ'));
                                } else if (projData.includes('ЗА ОСНОВУ')) {
                                    votingType = 'за основу';
                                    projData = projData.substring(0, projData.indexOf('ЗА ОСНОВУ'));
                                } else if (projData.toLowerCase().includes('правка') || projData.toLowerCase().includes('правки')) {
                                    votingType = 'правка';
                                } else if (projData.toLowerCase().includes('вкл.д.п')) {
                                    votingType = 'вкл.д.п.';
                                    if (nthIndex(projData.toLowerCase(), 'вкл.д.п', 2) !== -1){
                                        projData = projData.substring(0, nthIndex(projData.toLowerCase(), 'вкл.д.п', 2));
                                    }
                                } else if (projData.toLowerCase().includes('блочне')) {
                                    votingType = 'блок';
                                } else if (projData.toLowerCase().includes('виключити')) {
                                    votingType = 'виключення';
                                }    
                                    zasFull.votingType = votingType;
                                    zasFull.projID = projID++;
                                    zasFull.zasNum = zasNum;
                                    zasFull.zasDate = zasDate;
                                    zasFull.project = projData.trim();//doc_data[6];
                                    zasFull.fileName = projFileName;
                                    console.log(zasFull)
                                    item.zas.push(zasFull);
                                    endMark++;
                                
                                if (endMark === endMax){
                                   
                                    resolve(item)
                                }  
                             
                            }
                        })();
                        reader.readAsBinaryString(files[i]);
                        
                    }
                    
                }     
               
        })
    }
    
    RTFJS.loggingEnabled(false);
    
   $('#input-rtf').change(function handleFile(e) {
            fileRreader(e).then(zasObj => {
                //console.log(zasObj);
            }).catch(err => alert(`При загрузке произошла ошибка, обратитесь к системному администратору. ${err}`))

            //async function showZas(){
                //let zasObj = await fileRreader(e);
                //zasObj = JSON.stringify(zasObj);
               // console.log(zasObj);
                /*let start = 0
                for(let i = 8000; i < zasObj.length + 8000; i += 8000){
                    //console.log(start, i, zasObj.length)
                    console.log(zasObj.substr(start, i));
                    start = i;
                }*/

                /*for (let i = 0; i < zasObj.zas.length; i++) {
                    console.log(JSON.stringify(zasObj.zas[i]));
                }*/
                //console.log(JSON.stringify(zasObj));
                //console.log(zas);
                //$('#P4_JSON').val(JSON.stringify(zas))
                //console.log($('#P4_JSON').val());

            //}
            //showZas();

                //setTimeout(() => console.log(JSON.stringify(item)), 2000);

          
    });

});

