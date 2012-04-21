var request = require('request'),
    jsdom = require('jsdom'),
    http = require('http'),
    fs = require('fs');
var argv = require('optimist').argv;

var log = function(msg) {
	if(argv.log) {
		console.log(msg);
	}
};

var Scrapper = (function() {
	
	var jQuery = fs.readFileSync("./jquery.min.js").toString();
	
	function scrape($, format) {
		var parsed = {};
		Object.keys(format).forEach(function(key) {
			log('Selecting key: ' + key + ' to ' + format[key]);
			var htmls = [];
			$(format[key]).each(function() {
				htmls.push($(this).html());
			});
			parsed[key] = htmls;
		});
		return parsed;
	}

	return {
		scrapeUrlWithFormat : function(url, format, answer) {
			request({
				uri : url
			}, function(error, response, body) {
				log('Requesting url ' + url);
				if (error && response.statusCode !== 200) {
					console.log('Error when contacting ' + url);
					answer({});
				} else {
					jsdom.env({
						html : url,
						src : jQuery,
						done: function(err, window) {
							log(err);
							var scraped = scrape(window.$, format);
							answer(scraped);
						}
					});
				}
			});
		}
	};
})();

http.createServer(function(req, res) {
	var badRequest = function(msg) {
		res.writeHead(400, {
			'Content-Type' : 'text/plain'
		});
		res.end(msg);
	};
	var ok = function(body) {
		res.writeHead(200, {
			'Content-Type' : 'application/json'
		});
		res.end(body);
	};

	log('Incoming request of type ' + req.method);
	if (req.method == 'POST') {
		var body = '';
		req.on('data', function(data) {
			body += data;
			if (body.length > 1e6) {
				req.connection.destroy();
			}
		});
		req.on('end', function() {
			var json = JSON.parse(body);
			var url = json.url;
			var format = json.format;
			log('Response format is: ' + JSON.stringify(json));
			if (url != undefined && format != undefined) {
				Scrapper.scrapeUrlWithFormat(url, format, function(scraped) {
					ok(JSON.stringify(scraped));
				});
			} else {
				badRequest('Error parsing json');
			}
		});
	} else {
		badRequest('Error, request should be POST');
	}
}).listen(argv.port ? argv.port : 8000);

// curl --header "Content-type: application/json" --request POST --data '{"url": "http://github.com/blog", "format": {"first_header": "li.post:first h2 a"}}' http://localhost:8000
