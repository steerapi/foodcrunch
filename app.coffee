express = require("express")

app = express()
app.use(express.static(__dirname + '/web'))
app.listen(process.env.VCAP_APP_PORT || 3000)
