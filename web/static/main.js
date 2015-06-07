var socket = io("http://localhost:8088");

var chartData = [
  {
    "label": "Alcohol",
    values: []
  },
  {
    "label": "Methan",
    values: []
  },
  {
    "label": "Air Quality",
    values: []
  },
  {
    "label": "Carbon Monoxide",
    values: []
  }
]

var table = document.querySelectorAll(".table")[0]


var chart = $("#graph").epoch({
  type: "time.line",
  data: chartData
})

socket.on("data", function(data) {
  var date = Date.now()

  if (data.alcohol) {
    chartData[0].values.push({time: date, y: data.alcohol})
  }


  if (data.air_quality) {
    chartData[1].values.push({time: date, y: data.air_quality})
  }


  if (data.carbon_monoxide) {
    chartData[2].values.push({time: date, y: data.carbon_monoxide})
  }


  if (data.mq4) {
    chartData[3].values.push({time: date, y: data.mq4})
  }

  chart.push(data)

  var str = ""
  Object.keys(data).forEach(function(key) {
    if (key !== null)
      str += key + ": " + data[key] + "<br />"
  })
  table.innerHTML = "<div class='row'>" + str + "</div>";
})
