const http = require('http')
const fs = require('fs')
const { resolve } = require('node:path/win32')

const server = http.createServer()

server.on('request', (req, res) => {
    if (req.url !== '/favicon.ico') {
        const url = req.url

        if (/\.html/.test(url)) {
            const content = fs.readFileSync('./index.html', 'utf-8')
            res.write(content)
            res.end()
        } else if (/\.txt/.test(url)) {
            const content = fs.readFileSync('./test.txt')
            res.write(content)
            res.end()
        }
    }
})

server.listen('8080')