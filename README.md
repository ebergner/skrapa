# Skrapa
_Scrape any website using CSS selectors and a simple RESTful API___Skrapa__ allows you to easily setup a server that exposes an API, which can be used to extract (aka scrape) information contained in websites. This is all possible by relying on Node.js and several Node.js libraries, most notably jsdom.
## Design
* Use CSS to select HTML elements to scrape, since we all know it.* Use Node.js because it features jsdom, which is a javascript implementation of the W3C DOM, where we can load any given url, inject a proven javascript library such as jQuery into it, and use that javascript library to select HTML tags.* Node.js event-driven model is also not a bad fit since we'll be waiting for page urls to load.* Make it language agnostic by wrapping it all up in a web server that exposes a simple REST API, which takes a JSON request that defines entirely what should be scraped, i.e. the server is not preconfigured with this in any way (URL and CSS selectors).## Installation
Make sure you have Node.js installed or install it from [nodejs.org](http://nodejs.org/).Download the project [source](https://github.com/ebergner/skrapa/zipball/master) and extract it.    cd <extracted directory>

Install Skrapa's dependencies with node's npm:
    npm install jsdom request optimistNow start the server with:         node skrapa.js### Options
Pass --log to display logging messages:
    node skrapa.js --log
Pass --port <portnr> to listen to another port than 8000:
    node skrapa.js --port 8001
## Usage
The server, which  by default listens on port 8000, will expect a POST request with a JSON body. It will complain if the request is not POST, or if the body is not a JSON string.
The server also expects the JSON string to have at least two fields, url and scrape:

``` javascript{  "url": "http://github.com/blog",  "scrape": {}}```Any other fields will be discarded. The url field obviously gives the url that should be scraped, and the scrape field specifies what should be scraped.
### Scrape Examples
Extract the header of the first entry in the github blog:``` javascript{  "url": "http://github.com/blog",  "scrape": {    "first_header": "li.post:first h2 a"  }}```So the scrape field does not only specify what to parse, it also defines the response. The response is always a JSON string with one field (might be extended in the future) "scraped" that contains an object with the same fields as those that were contained in the scrape object in the request. But instead of CSS selectors, there will be arrays of the text or HTML that was extracted (one entry per tag that was selected).
For the example above, the response (at the time of writing) would be:

``` javascript{  "scraped": {
    "first_header": ["Akavache is now open source"]
  }}
```
Removing the ":first" from the selector would result in an array that contains the titles of all blog posts (on the first page):``` javascript{
  "scraped": {    "all_headers": ["Akavache is now open source", "Introducing the New GitHub Graphs",
        "Fileserver Maintenance Wednesday Night","Rob Sanheim is a GitHubber",
        "Ben Straub is a GitHubber","David Calavera is a GitHubber",
        "An easier way to create repositories","Credential Caching for Wrist-Friendly Git Usage",
        "Ten Years of farbrausch Productions on GitHub","GitHub for Mac: Easier Updates",
        "SF Drinkup #36","Take Over The Galaxy with GitHub",
        "GitHub Drinkup in Portland, OR","Jason Salaz is a GitHubber",
        "Sean Bryant is a GitHubber"]
  }}
```
## Tips
If you're on something Unix-like, use curl to try out your scraping queries:
    
    curl --header "Content-type: application/json" --request POST \
    --data '{"url": "http://github.com/blog", "scrape": {"headers": "li.post h2 a"}}' http://localhost:8000<sub>_Skrapa means 'to scrape' in Swedish. So there's that._</sub>
## License

Copyright (c) 2012 Emil Bergner

Licensed under the MIT license.