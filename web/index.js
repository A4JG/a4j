var gpsd = require("node-gpsd");
var fs = require("fs");
var spawn = require("child_process").spawn

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
  alcohol: null,
  air_quality: null,
  carbon_monoxide: null,
  mq4: null
}

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

  if (tpv.lon)
    data.lon = tpv.lon

  if (tpv.alt)
    data.alt = tpv.alt
})

setInterval(function() {
  fs.readFile("/sys/bus/i2c/drivers/bmp085/1-0077/pressure0_input", function(err, buffer) {
    data.pressure = parseInt(buffer.toString()) / 100
  })

  fs.readFile("/sys/bus/i2c/drivers/bmp085/1-0077/temp0_input", function(err, buffer) {
    data.temperature = parseInt(buffer.toString()) / 10
  })
}, 1000)

var sensors = spawn("./sensors")

sensors.stdout.on("data", function(json) {
  try {
    var sensorData = JSON.parse(json)

    data.alcohol = sensorData.channel_0;
    data.air_quality = sensorData.channel_1;
    data.carbon_monoxide = sensorData.channel_2;
    data.smoke = sensorData.channel_3;
  }

  catch (err) {

  }
})

gpsListener.on("INFO", function(info) { console.log(info) })

io.on("connection", function(socket) { 
  setInterval(function() {
    socket.emit("data", data);
    console.log(data)
  }, 1000);
});
