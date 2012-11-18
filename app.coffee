express = require("express")
server = require("./server.js")
_ = require "underscore"
http = require("http")

app = express()

Singly = require("./lib")
querystring = require("querystring")
request = require("request")
clientID = "9c911103719a4dc018325f8a7c47355c"
clientSecret = "951e25a92aee5d81143ecb6ae03d4723"
singly = new Singly(clientID, clientSecret, "http://localhost:8044/callback")

#Require and initialize the singly module
expressSingly = require("express-singly")(app, clientID, clientSecret, "http://localhost:8044/status", "http://localhost:8044/callback")

# Pick a secret to secure your session storage
sessionSecret = "42"

# Setup for the express web framework
# Use ejs instead of jade because HTML is easy
app.configure ->
  app.set "view engine", "ejs"
  app.use(express.static(__dirname + '/web'))
  app.use express.logger()
  app.use express.bodyParser()
  app.use express.cookieParser()
  app.use express.session(secret: sessionSecret)
  expressSingly.configuration()
  app.use app.router

expressSingly.routes()
app.get "/status", (req, res, teststring) ->
  return res.send("must auth at http://localhost:8044/", 401)  unless req.session.accessToken
  qs = req.query
  qs.access_token = req.session.accessToken
  console.log qs.access_token
  qs.to = "facebook"
  test = "Found this restaurant and its cheap and food is really good"
  qs.body = test
  singly.post "/types/statuses",
    qs: qs
  , (err, resp, body) ->
    return res.send(err, 500)  if err
    res.send body


exports.start = app.get("/facebook", (req, res) ->
  res.redirect singly.getAuthorizeURL("facebook")
  console.log req.session.accessToken
)

#return req.session.accessToken;
#		getAccessToken(req,res);

#app.post('/callback', )
app.get "/all", (req, res) ->
  singly.get "/types/all",
    access_token: req.session.accessToken
  , (err, resp, body) ->
    return res.send(err, 500)  if err
    res.send body



#request.post('https://api.singly.com/types/statuses', {form:{to: 'facebook', body: 'Hello'}}, function(err, response, body) {

#})
app.post "/link", (req, res) ->
  return res.send("must auth at http://localhost:8044/", 401)  unless accessToken
  qs = req.query
  qs.access_token = accessToken
  qs.to = "facebook"
  qs.body = "test message 1"
  singly.post "/types/links",
    qs: qs
  , (err, resp, body) ->
    return res.send(err, 500)  if err
    res.send body

app.get "/reset", (req,res)->
  query = req.query
  username = query.username
  res.send
    status: "ok"

#user_id=50a8edb407e58a812800337f
app.get "/favorites", (req,res)->
  console.log "favorites", arguments
  query = req.query
  user_id = query.user_id
  server.getFavorites user_id, 0, 3, (err, favorites)->
    if err
      res.send 404
    else
      res.send favorites

app.get "/map", (req,res)->
  query = req.query
  server.getNearbyRestaurantsMap 3, 1600, 42.38, -71.03, "", (err, url)->
    res.send url

# getNearbyRestaurantsWithDiscount = (limit, within, lat, long, cb)->
#   server.getNearbyRestaurants limit, within, lat, long, (err, nearbys)->
    # nearbys

# lat = 42.38
# long = -71.03
# within = 1600
app.get "/nearbys", (req,res)->
  query = req.query
  lat = query.lat
  long = query.long
  within = query.within
  server.getNearbyRestaurants 3, within, lat, long, "", (err, nearbys)->
    console.log arguments
    if err
      res.send 404
    else
      res.send nearbys

app.get "/favoritesDish", (req,res)->
  params = req.params
  query = req.query
  res.send [
    _id: ""
    name: "Beef Taco"
    price: 5.99
  ,
    _id: ""
    name: "Chicken Burrito"
    price: 5.99
  ,
    _id: ""
    name: "Rice & Bean Plate"
    price: 5.99
  ,
    _id: ""
    name: "Steak Burrito"
    price: 5.99
  ]

# app.get "/", (req,res)->

app.listen(process.env.VCAP_APP_PORT || 3000)
