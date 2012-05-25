var fs = require('fs');

if(phantom.args.length < 2){
    console.log("Invalid arguments");
    phantom.exit(1);
}

var page = new WebPage();

page.settings.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.7; rv:8.0.1) Gecko/20100101 Firefox/8.0.1';

page.onConsoleMessage = function(msg) {
    try{
        var data = JSON.parse(msg);
        if(data.body){
            fs.write(phantom.args[1], encodeURIComponent(JSON.stringify(data)), "w");
            phantom.exit();
        }else{
            console.log(msg);
        }
    }catch(E){
        console.log(msg);
    }
};

page.open(phantom.args[0], function (status) {
    setTimeout(function(){
        console.log("Timeout");
        phantom.exit(2);
    },10000); // 10 sec.

    page.evaluate(sanitizeDOM);

    page.evaluate(function(){
        console.log(JSON.stringify({
            body: document.body.innerHTML
        }));
    });
    
});

function sanitizeDOM(){
    
    var element = document.body;

    //remove script tags
    var elements = element.getElementsByTagName("script");
    for(var i=elements.length-1; i>=0; i--){
        try{
            elements[i].parentNode.removeChild(elements[i]);
        }catch(E){}
    }
    
    //remove style tags
    var elements = element.getElementsByTagName("style");
    for(var i=elements.length-1; i>=0; i--){
        try{
            elements[i].parentNode.removeChild(elements[i]);
        }catch(E){}
    }
    
    //remove meta tags
    var elements = element.getElementsByTagName("meta");
    for(var i=elements.length-1; i>=0; i--){
        try{
            elements[i].parentNode.removeChild(elements[i]);
        }catch(E){}
    }
    
    //remove tracking images
    var elements = element.getElementsByTagName("img");
    for(var i=elements.length-1; i>=0; i--){
        try{
            if(!isNaN(elements[i].width) && !isNaN(elements[i].height) && elements[i].width < 5 && elements[i].height < 5){
                elements[i].parentNode.removeChild(elements[i]);
            }
        }catch(E){}
    }
    
    // remove related posts
    var elements = element.getElementsByTagName(".related_post_title");
    for(var i=elements.length-1; i>=0; i--){
        try{
            elements[i].parentNode.removeChild(elements[i]);
        }catch(E){}
    }
    var elements = element.getElementsByTagName(".related_post");
    for(var i=elements.length-1; i>=0; i--){
        try{
            elements[i].parentNode.removeChild(elements[i]);
        }catch(E){}
    }
    
    // sanitize nodes by removing all attributes except for href
    var elements = Array.prototype.slice.call(element.querySelectorAll("*")),
        attr, href,
        removeList = [];
        
    for(var i=0, len = elements.length; i<len; i++){
        
        for(j = elements[i].attributes.length-1; j>=0; j--){
            attr = (elements[i].attributes.item(j).nodeName || "").toString();
            if(attr){
                
                // lingid
                if(elements[i].tagName == "A" && attr.toLowerCase() == "href"){
                    href = (elements[i].href || "").toString().trim();
                    if(href.match(/^(javascript|about)\s*\:/)){
                        elements[i].href = "#";
                    }else{
                        elements[i].href = href;
                    }
                
                // pildid
                }else if(elements[i].tagName == "IMG"){
                    if(attr.toLowerCase() == "alt"){
                        // keep
                    }else if(attr.toLowerCase() == "src"){
                        var src = (elements[i].src || "").toString().trim();
                        if(src.match(/^(javascript|about)\s*\:/)){
                            elements[i].removeAttribute(attr);
                        }else{
                            elements[i].src = src;
                        }
                    }else{
                        elements[i].removeAttribute(attr);
                    }
                }else{
                    // eemalda vaikimisi
                    elements[i].removeAttribute(attr);
                }
            }
        }
    }
    
    //remove empty tags
    var elements = element.getElementsByTagName("*");
    for(var i=elements.length-1; i>=0; i--){
        try{
            if(!elements[i].innerHTML.replace(/&nbsp;/gi, "").trim()){
                elements[i].parentNode.removeChild(elements[i]);
            }
        }catch(E){}
    }
}