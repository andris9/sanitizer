var spawn = require("child_process").spawn,
    pathlib = require("path"),
    http = require("http"),
    fs = require("fs"),
    config = require("../config/app.json"),
    contentCache = {};

// expose to the world
module.exports.initialize = initialize;
module.exports.shutdown = shutdown;
module.exports.sanitize = sanitize;

var idgen = 0;

var server = http.createServer(function (req, res) {
    if(contentCache[req.url]){
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(contentCache[req.url]);
    }else{
        res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
        res.end('<h1>Not found</h1>');
    }
});

function initialize(callback){
    server.listen(config.http_port, config.http_ip, callback);
};

function shutdown(callback){
    server.once("close", callback);
    server.close();
};

function sanitize(html, callback){
    
    var id = "sanitize-"+(++idgen),
        outfile = pathlib.join((process.env.SANITIZER_TEMP_DIR || config.tmp_dir), "phantomjs_"+id+".json"),
        params = [
            "--config=" + pathlib.join(__dirname, "..", "config/phantomjs.json"),
            pathlib.join(__dirname,"..", "scripts/sanitize.js"),
            "http://" + config.http_ip + ":" + config.http_port + "/" + id,
            outfile
        ],
        output = "",
        cmd;
    
    contentCache["/"+id] = html;
    
    cmd  = spawn("phantomjs", params, {env: {'DISPLAY': ':0'}});
    
    cmd.stdout.on('data', function (data) {
        output += (data || "").toString();
        console.log('stdout: ' + (data || "").toString().trim());
    });
    
    cmd.stderr.on('data', function (data) {
        console.log('stderr: ' + (data || "").toString().trim());
    });
    
    cmd.on('exit', function (code) {
        if(code){
            fs.unlink(outfile);
            return callback(new Error("Child exited with "+code+"\n"+(output || "").trim()));
        }
        
        fs.readFile(outfile, "utf-8", function(err, data){
            if(err){
                fs.unlink(outfile);
                return callback(err);
            }else{
                try{
                    data = JSON.parse(decodeURIComponent(data));
                }catch(E){
                    return callback(E);
                }
                return callback(null, data);
            }
        });
        
    });
}
