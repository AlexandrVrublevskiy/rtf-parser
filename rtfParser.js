/*import {EMFJS, RTFJS, WMFJS} from 'rtf.js';*/
$(document).ready(function(){

    function stringToBinaryArray(string) {
        var buffer = new ArrayBuffer(string.length);
        var bufferView = new Uint8Array(buffer);
        for (var i=0; i<string.length; i++) {
            bufferView[i] = string.charCodeAt(i);
        }
        return buffer;
    }
    function displayRtfFile(blob) {
        try {
            var legacyPictures = $("#legacypicts").prop("checked");
            var showPicBorder = $("#showpicborder").prop("checked");
            var warnHttpLinks = $("#warnhttplink").prop("checked");
            var settings = {
                onPicture: function(isLegacy, create) {
                    // isLegacy is null if it's the only available picture (e.g. legacy rtf)
                    if (isLegacy == null || isLegacy == legacyPictures) {
                        var elem = create().attr("class", "rtfpict"); // WHY does addClass not work on <svg>?!
                        return setPictBorder(elem, showPicBorder);
                    }
                },
                onHyperlink: function(create, hyperlink) {
                    var url = hyperlink.url();
                    var lnk = create();
                    if (url.substr(0, 7) == "http://") {
                        // Wrap http:// links into a <span>
                        var span = setUnsafeLink($("<span>").addClass("unsafelink").append(lnk), warnHttpLinks);
                        span.click(function(evt) {
                            if ($("#warnhttplink").prop("checked")) {
                                evt.preventDefault();
                                alert("Unsafe link: " + url);
                                return false;
                            }
                        });
                        return {
                            content: lnk,
                            element: span
                        };
                    } else {
                        return {
                            content: lnk,
                            element: lnk
                        };
                    }
                },
            };
            var doc = new RTFJS.Document(blob, settings);
            var haveMeta = false;
            var meta = doc.metadata();
            for (var prop in meta) {
                $("#meta").append($("<div>").append($("<span>").text(prop + ": ")).append($("<span>").text(meta[prop].toString())));
                haveMeta = true;
            }
            if (haveMeta)
                $("#havemeta").show();
            doc.render().then(html => {
                $("#content").empty().append(html);
                $("#closed_doc").hide();
                $("#opened_doc").show();
                $("#tools").show();
                console.log("All done!");
            }).catch(e => {
                if (e instanceof RTFJS.Error) {
                    $("#content").text("Error: " + e.message);
                    throw e;
                }
                else {
                    throw e;
                }
            });
        } catch(e) {
            if (e instanceof RTFJS.Error)
                $("#content").text("Error: " + e.message);
            else
                throw e;
        }
    }

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
    
    /*const doc = new RTFJS.Document(stringToArrayBuffer(rtf));
    
    const meta = doc.metadata();
    doc.render().then(function(htmlElements) {
        console.log(meta);
        console.log(htmlElements);
    }).catch(error => console.error(error))*/
    
    $('#input-rtf').change(function handleFile(e) {
        //console.log('data')
        var files = e.target.files;
        var i, f;

        for (i = 0, f = files[i]; i != files.length; ++i) {
        var reader = new FileReader();
        var name = f.name;

        reader.onload = (function (fileName) { 
            return function(e) {
                var data = e.target.result;
                const doc = new RTFJS.Document(stringToArrayBuffer(data));
                const meta = doc.metadata();
                doc.render().then(function(htmlElements) {
                    console.log(meta);
                    console.log(htmlElements);
                }).catch(error => console.error(error))
                /*console.log(displayRtfFile(stringToBinaryArray(data))); */  
            }
        })(name);
        reader.readAsBinaryString(f);
        }
    });

});