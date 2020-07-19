/* chart.js chart examples */
function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return JSON.parse(xmlHttp.responseText);
}

// chart colors
var colors = ['#007bff','#28a745','#333333','#c3e6cb','#dc3545','#6c757d'];
/* bar chart */
var chBar = document.getElementById("chBar");
if (chBar) {
  const data = httpGet('/api/graph')
  new Chart(chBar, {
    type: 'bar',
    data: {
      labels: data["labels"],
      datasets: [{
        data: data["data"],
        backgroundColor: colors[1]
      }]
    },
    options: {
      legend: {
        display: false
      },
      scales: {
        xAxes: [{
          barPercentage: 0.4,
          categoryPercentage: 0.5
        }],
        yAxes: [{
          ticks: {
            beginAtZero: true,
            callback: function(value) {if (value % 1 === 0) {return value;}}
          }
        }]
      }
    }
  });
}