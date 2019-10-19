const pdf = require('html-pdf');
exports.createPDFProtocolFile = function (template, options, reg, filename) {
    if (reg && Array.isArray(reg)) {
        reg.forEach(item => {
            console.log(item.relus);
            template = template.replace(item.relus, item.match);
        })
    }
    pdf.create(template, options).toFile(filename, function(err, res){
        if (err) {
            return console.log(err);
        } 
        console.log(res);
    })
}