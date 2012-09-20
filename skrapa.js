var request = require('request'),
    jsdom = require('jsdom'),
    http = require('http'),
    fs = require('fs'),
    argv = require('optimist').argv;

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
			var answerWithError = function(msg) {
				log(msg);
				answer(null, msg);
			};
			request({
				uri : url
			}, function(error, response, body) {
				log('Requesting url ' + url);
				if (error && response.statusCode !== 200) {
					answerWithError('Error when contacting ' + url);
				} else {
					jsdom.env({
						html : url,
						src : jQuery,
						done: function(error, window) {
							if(!error) {
								try {
									var scraped = scrape(window.$, format);
									answer(scraped);
								} catch(e) {
									answerWithError('Error while scraping: ' + e.toString());
								}
							} else {
								answerWithError('Error setting up jsdom environment');
							}
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
			var json = undefined;
			try {
				json = JSON.parse(body);
			} catch (e) {
				badRequest("The request body: " + body + ", is not a well-formed JSON string");
			}
			if(json) {
				var url = json.url;
				var format = json.scrape;
				log('Request body is: ' + body);
				if (url != undefined && format != undefined) {
					Scrapper.scrapeUrlWithFormat(url, format, function(scraped, error) {
						if(!error) {
							ok(JSON.stringify({ scraped: scraped }));
						} else {
							badRequest(error);
						}
					});
				} else {
					badRequest('The request JSON does not have fields "url" and "scrape"');
				}
			}
		});
	} else {
		badRequest('Error, request should be POST');
	}
}).listen(argv.port ? argv.port : 8000);
