const fs = require('fs');
const moment = require('moment');
const html = fs.readFileSync('./test.html','utf8');

const create = require('./createPdf.js')

const options = {
    "format":'A4',
    "header":{
        "height":"10mm",
        "contents":''
    }
}
const name = '张三';
const reg = [
    {
        relus:/__name__/g,
        match:name
    },
    {
        relus:/__date__/g,
        match:moment().format('YYYY年MM月DD日')
    }
];
create.createPDFProtocolFile(html, options, reg,'./test.pdf');