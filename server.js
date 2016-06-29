
var http = require('http');
var fs = require('fs');
var path = require('path');

var uploadApp = http.createServer(function(req, res) {
	var url = req.url;
	var method = req.method;

	res.writeHead(200, {
		'Content-Type': 'text/plain',
		'Access-Control-Allow-Origin': "*",
		'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, myheader',
		'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
	});

	var data = '';
	if(url === "/upload" && method.toUpperCase() === "POST") { 
		req.on('data', (chunk) => {
			console.log('fileInfo', req.headers.myheader);
			var fileInfo = decodeURIComponent(req.headers.myheader);
			fileInfo = fileInfo.split(';');

			var wstream = fs.createWriteStream('attach/' + fileInfo[0], {flags: 'a'});
			wstream.write(chunk);
			wstream.end();

			res.write('ok');
			res.end();
		});

		
	}
	else {
		res.end();
	}

});
uploadApp.listen(3004, '127.0.0.1');

console.log('Upload server is listen on port 3004');