const http = require('http')

const server = http.createServer()

server.on('request', (req, res) => {
    setInterval(() => {
        res.write('hello\r\n')
        res.end('world')
    }, 3000);
})

server.listen('8080')