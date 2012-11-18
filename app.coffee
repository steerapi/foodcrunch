express = require("express")

app = express()
app.use(express.static(__dirname + '/web'))
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

app.listen(process.env.VCAP_APP_PORT || 3000)
