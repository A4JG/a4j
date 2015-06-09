var socket = io("http://" + location.hostname + ":8088");

var now = Math.round(Date.now() / 1000)

var chartData = [
  {
    "label": "Alcohol",
    values: [{time: now, y: 0}]
  },
  {
    "label": "Methane",
    values: [{time: now, y: 0}]
  },
  {
    "label": "Air Quality",
    values: [{time: now, y: 0}]
  },
  {
    "label": "Carbon Monoxide",
    values: [{time: now, y: 0}]
  }
]

var chart2Data = [
  {
    "label": "Pressure",
    values: []
  }
]

var chart3Data = [
  {
    "label": "Degrees Celsius",
    values: []
  }
]

var table = document.querySelectorAll(".table")[0]


var chart = $("#graph").epoch({
  type: "time.line",
  data: chartData,
  axes: ["left", "right", "bottom"]
})

var chart2 = $("#graph2").epoch({
  type: "time.line",
  data: chart2Data,
  axes: ["left", "right", "bottom"]
})

var chart3 = $("#graph3").epoch({
  type: "time.line",
  data: chart3Data,
  axes: ["left", "right", "bottom"]
})

socket.on("data", function(data) {
  console.log(data)
  var date = Math.round(Date.now() / 1000)

  var newChartData = []

  if (data.mq3 && data.mq135 && data.mq7 && data.mq4) {
    newChartData.push({time: date, y: data.mq3})
    newChartData.push({time: date, y: data.mq135})
    newChartData.push({time: date, y: data.mq7})
    newChartData.push({time: date, y: data.mq4})
  }

  chart.push(newChartData);

  if (data.pressure) {
    chart2.push([{time: date, y: data.pressure}])
  }

  if (data.temperature) {
    chart3.push([{time: date, y: data.temperature}])
  }

  var str = "";
  Object.keys(data).forEach(function(key) {
    if (key !== null)
      str += key + ": " + data[key] + "<br />";
  })
  table.innerHTML = "<div class='row'>" + str + "</div>";
})
