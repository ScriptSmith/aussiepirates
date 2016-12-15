const DHT = require('bittorrent-dht')
const magnet = require('magnet-uri')
const geoip = require('geoip-lite');
const jsonfile = require('jsonfile')

const cheerio = require("cheerio");
const request = require("request");

var db = {}
db.locations = []
db.oldLocations = []

var jsonServer = require('json-server')
var server = jsonServer.create()
var router = jsonServer.router(db)
var middlewares = jsonServer.defaults()

server.use(middlewares)
server.use(router)
server.listen(process.env.PORT, function () {
  console.log('JSON Server is running')
})

var dht = new DHT()

dht.listen(20000, function () {
  console.log('now listening')
})

function scrapeTop100(categoryNumber, callback) {
  let url = "https://thepiratebay.org/top/" + categoryNumber;

  request(url, (err, resp, body) => {
    let $;
    let torrents = [];

    if (err || resp.statusCode !== 200) {
      return callback(new Error("Couldn't scrape data from", url + ". The website might be down :("));
    }

    $ = cheerio.load(body);
    torrents = [];

    $("table#searchResult tr").not(":first-child").each(function() {
      let name = $(this).find(".detName a").text();
      let size = $(this).find(".detDesc").text().split(",")[1].split(" ")[2];
      let url = $(this).find("td ").not(":first-child").find("a").not(":first-child").attr("href");
      let infoHash = magnet(url).infoHashBuffer;
      let seeds = $(this).find("td[align=\"right\"]").first().text();
      let leeches = $(this).find("td[align=\"right\"]").last().text();

      torrents.push({ name, size, url, infoHash, seeds, leeches });
    });
    return callback(torrents);
  });
}

scrapeTop100("all", function(torrents){
  db.torrents = torrents;

  db.torrents.forEach(function(el){
    dht.lookup(el.infoHash)
  })
})


// Delete old locations every 10 minutes
setInterval(function(){
  db.locations.filter( function( el ) {
    return !db.oldLocations.includes( el );
  });
  db.oldLocations = db.locations
}, 600000)

dht.on('peer', function (peer, infoHash, from) {
  var location = geoip.lookup(peer.host)
  if(location && location['country'] == "AU"){
    console.log('Found ' + peer.host + " at " + location['city'] + ', ' + location['country'])

    infoHashIndex = -1;
   
    db.torrents.forEach(function(el, index){
      if (el.infoHash == infoHash){
        infoHashIndex = index
      }
    })

    var details = {"ip": peer.host,
                   "ll": location["ll"],
                   "infoHash": infoHashIndex
                  };

    if (!(details in db.locations)){
      db.locations.push(details);
    }
  }
})
