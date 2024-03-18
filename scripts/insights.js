google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
  var data = new google.visualization.DataTable();

  // Todo
  // Placeholder as default upon page navigation
  // When selecting item, need a form to select which item from a list.
  // Categories will simply display all different categories in a pie chart with percentages based on total cost for whichever timeframe selected.
  // Overall spending will display trips and their costs on a bar chart. Total cost displayed.   

  data.addColumn('string', 'Month');
  data.addColumn('number', 'Butter');

  // Data set for graph.
  // Add connection to database.
  // Left will be dates and right will be the price data
  data.addRows([
    ['January', 4.64],
    ['February', 4.99],
    ['March', 5.15],
    ['April', 5.45],
    ['May', 5.99]
  ]);

  var options = {
    title: 'Item Costs',
    curveType: 'function',
    legend: { position: 'bottom' },
    backgroundColor: 'transparent',
  };

  var chart = new google.visualization.LineChart(document.getElementById('chart_div'));

  chart.draw(data, options);
}