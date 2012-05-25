var testCase = require('nodeunit').testCase,
    sanitizer = require("../lib/sanitizer");
    
module.exports["general tests"] = {
    setUp: function (callback) {
        sanitizer.initialize(callback);
    },
    tearDown: function (callback) {
        sanitizer.shutdown(callback);
    },
    "simple html": function(test){
        var simpleHTML = "<h1>test</h1>";
        sanitizer.sanitize("<h1>test</h1>", function(err, data){
            console.log(err || data)
            test.ifError(err);
            test.ok(data);
            test.equal(data && data.body, simpleHTML);
            test.done();
        });
    }
}