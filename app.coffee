express = require("express")
server = require("./server.js")
_ = require "underscore"
http = require("http")

app = express()
app.use(express.static(__dirname + '/web'))

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

app.get "/", (req,res)->

app.listen(process.env.VCAP_APP_PORT || 3000)
