## Skrapa
__Skrapa__ allows you to easily setup a server that exposes an API, which can be used to extract (aka scrape) information contained in websites. This is all possible by relying on Node.js and several Node.js libraries, most notably jsdom.
Motivation
======
Use CSS to select HTML elements to scrape, since we all know it.
Use Node.js since it features jsdom, which is a javascript implementation of the W3C DOM, where we can load any given url, inject a proven javascript library such as jQuery into it, and use that javascript library to select HTML tags.
Node.js event-driven model is also not a bad fit since we will be waiting for page urls to load.
Make it language agnostic by wrapping it all up in a web server that exposes a simple REST API, which takes a JSON request that defines entirely what should be scraped, i.e. the server is not preconfigured with what should be scraped (URL and CSS selectors).
Installation
======
Make sure you have Node.js installed or install it from ...
Download the project sources and do: node skrapa.js
*dependecies
-log etc.
Usage
The server, which as mentioned runs on port 8000 or whichever port you configured it for, will expect a POST request with a JSON body. It will complain if the request is not POST, or if the body is not a JSON string.
The server expects the request body to be a JSON string with at least two fields, url and format:
{

"url": "http://github.com/blog",

"format": {}

}

Any other fields will be discarded. The url field obviously gives the url that should be scraped, and the format field specifies what should be scraped.
Format Examples
Extract the header of the first entry in the github blog:
{

"url": "http://github.com/blog",

"format": {


"first_header": "li.post:first h2 a"


}

}

It is important to note that the format field does not only specify what to parse, it also specifies the response. The response is always a JSON string with the same fields as those that were contained in the format object in the request. But instead of CSS selectors, there will be arrays of the text or HTML that was extracted (one entry per tag that was selected). For the example above, the response (at the time of writing) would be:
{

"first_header": ["An easier way to create repositories"]

}
Removing the ":first" from the selector would result in an array for "first_header" that contains the titles of all blog posts (on the first page):
...



Skrapa means 'to scrape' in Swedish. So there's that.