

// Event listener for the categories pie chart.
document.getElementById('categories').addEventListener('click', function() {
  // Hide placeholder image and other charts
  document.getElementById('placeholderImage').style.display = 'none';
  //document.getElementById('chart2_div').style.display = 'none';
  //document.getElementById('chart3_div').style.display = 'none';
  // Show chart container
  //document.getElementById('chart1_div').style.display = 'block';

  const chart1 = document.getElementById('chart1_div');
  chart1.classList.toggle("d-none", false); //shows the div for categories
  document.getElementById('chart2_div').classList.toggle("d-none", true);
  document.getElementById('chart3_div').classList.toggle("d-none", true);

  // Load Google Charts
  google.charts.load('current', {'packages':['corechart']});
  google.charts.setOnLoadCallback(drawChart);

  function drawChart() {

    var data = new google.visualization.DataTable();

    data.addColumn('string', 'Category');
    data.addColumn('number', 'Totals');

    data.addRows([
      ['Protein', 700],
      ['Carbohydrates', 200],
      ['Produce', 100],
      ['Fats', 150],
      ['Snacks', 300],
      ['Drinks', 400],
      ['Misc', 1000]
    ]);

    var options = {
      title: 'Category Spending',
      curveType: 'function',
      legend: { position: 'bottom' },
      backgroundColor: 'transparent',
    };

    var chart = new google.visualization.PieChart(chart1);

    $(window).resize(function(){
      chart.draw(data, options);
    });

    chart.draw(data, options);
  }
});

// Event listener for the overall total. 
document.getElementById('overall').addEventListener('click', function() {
  // Hide placeholder image and other charts
  document.getElementById('placeholderImage').style.display = 'none';
  //document.getElementById('chart2_div').style.display = 'none';
  //document.getElementById('chart3_div').style.display = 'none';
  // Show chart container
  //document.getElementById('chart1_div').style.display = 'block';

  const chart2 = document.getElementById('chart2_div');
  chart2.classList.toggle("d-none", false); //shows the div for categories
  document.getElementById('chart1_div').classList.toggle("d-none", true);
  document.getElementById('chart3_div').classList.toggle("d-none", true);

  // Load Google Charts
  google.charts.load('current', {'packages':['corechart']});
  google.charts.setOnLoadCallback(drawChart);

  function drawChart() {

    var data = new google.visualization.DataTable();

    data.addColumn('string', 'Category');
    data.addColumn('number', 'Totals');

    data.addRows([
      ['Total', 2850]
    ]);

    var options = {
      title: 'Overall Spending',
      curveType: 'function',
      legend: { position: 'bottom' },
      backgroundColor: 'transparent',
      pieSliceText: 'value'
    };

    var chart = new google.visualization.PieChart(chart2);

    $(window).resize(function(){
      chart.draw(data, options);
    });

    chart.draw(data, options);
  }
});