var gpsd = require("node-gpsd");
var fs = require("fs");
var spawn = require("child_process").spawn

var FILENAME = "data.csv"

var data = {
  lat: null,
  lon: null,
  alt: null,
  temperature: null,
  pressure: null,
  humidity: null,
  light: null,
  ir_light: null,
  uv_light: null,
  mq3: null,
  mq135: null,
  mq7: null,
  mq4: null
}

var CSV_HEADER = "date," + Object.keys(data).join(",")

fs.writeFile(FILENAME, CSV_HEADER + "\n", function(err) {
  if (err) console.log("error writing csv file")
})

var nodeStatic = require("node-static")
var static = new nodeStatic.Server("./static");

var app = require("http").createServer(function(req, res) {
  req.addListener("end", function() {
    static.serve(req, res);
  }).resume();
}).listen(8088);

var io = require("socket.io")(app);

var gpsListener = new gpsd.Listener({
  port: 2947,
  hostname: "localhost",
  parse: true
})

gpsListener.connect(function() {
 console.log("GPSd connected") 
})

gpsListener.watch();

gpsListener.on("error.connection", function() {
  console.error("connection error, failed to start. Maybe GPS is down.")
  process.exit(1)
})

gpsListener.on("error.socket", function() {
  console.error("GPSd socket error")
})


gpsListener.on("TPV", function(tpv) {
  if (tpv.lat)
    data.lat = tpv.lat

  if (tpv.epx)
    data.epx = tpv.epx

  if (tpv.lon)
    data.lon = tpv.lon

  if (tpv.epy)
    data.epy = tpv.epy

  if (tpv.alt)
    data.alt = tpv.alt

  if (tpv.epv)
    data.epv = tpv.epv
})

setInterval(function() {
  fs.readFile("/sys/bus/i2c/drivers/bmp085/1-0077/pressure0_input", function(err, buffer) {
    if (err) console.log(err)
    else data.pressure = parseInt(buffer.toString()) / 100
  })

  fs.readFile("/sys/bus/i2c/drivers/bmp085/1-0077/temp0_input", function(err, buffer) {
    if (err) console.log(err)
    else data.temperature = parseInt(buffer.toString()) / 10
  })
}, 200)

var sensors = spawn("./sensors")

sensors.stdout.on("data", function(json) {
  try {
    var sensorData = JSON.parse(json)

    data.mq3 = sensorData.channel_0;
    data.mq135 = sensorData.channel_1;
    data.mq7 = sensorData.channel_2;
    data.mq4 = sensorData.channel_3;
  }
  catch (err) {

  }
})

gpsListener.on("INFO", function(info) { console.log(info) })

io.on("connection", function(socket) { 
  setInterval(function() {
    socket.emit("data", data);
    console.log(data)
  }, 200);
});

setInterval(function() {
  fs.appendFile(FILENAME, Date.now() + "," + Object.keys(data).map(function(key) { return data[key] }).join(",") + "\n", function(err) {
    if (err) console.log("error writing to file")
  })
}, 200)
