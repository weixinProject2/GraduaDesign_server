var http = require('http')
var spawn = require('child_process').spawn
var createHandler = require('github-webhook-handler')
var handler = createHandler({
  path: '/pushCode',
  secret: 'woaini'
})
http.createServer(function (req, res) {
  handler(req, res, function (err) {
    res.statusCode = 404;
    res.end('no such location')
  })
}).listen(4000)
handler.on('error', function (err) {
  console.error('Error:', err.message)
})

handler.on('push', function (event) {
  
    event.payload.repository.name,
    event.payload.ref)
  rumCommand('sh', ['./deployed.sh'], function (txt) {
    
  })
})

function rumCommand(cmd, args, callback) {
  var child = spawn(cmd, args)
  var response = ''
  child.stdout.on('data', function (buffer) {
    response += buffer.toString()
  })
  child.stdout.on('end', function () {
    callback(response)
  })
}