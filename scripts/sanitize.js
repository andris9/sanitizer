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
        fs.write(phantom.args[1], encodeURIComponent(JSON.stringify(data)), "w");
        phantom.exit();
    }catch(E){}
};

page.open(phantom.args[0], function (status) {
    setTimeout(function(){
        console.log("Timeout");
        phantom.exit(2);
    },10000); // 10 sec.

    page.evaluate(function(){
        console.log(JSON.stringify({
            body: document.body.innerHTML
        }));
    });
    
});