const httpProxy = require('http-proxy');
const url = require('url');

const proxy = httpProxy.createProxy();
require('http').createServer((req, res) => {
    const pathname = url.parse(req.url).pathname;
    if (pathname.startsWith('/data/')) {
        proxy.web(req, res, {target: 'http://localhost:8888' });
    } else {
        proxy.web(req, res, {target: 'http://localhost:3000' });
    }
}).listen(80);