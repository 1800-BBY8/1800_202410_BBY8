import { getTrips } from "./firestore-utils/trip-helpers.js";
import { promptForItems } from "./popup-utils/item-prompt.js";
import { getItem, getItemRef } from './firestore-utils/item-helpers.js';
import {
  deleteList,
  getList,
  getListWithResolvedItems,
  resolveListItemEntry,
  updateList,
} from './firestore-utils/list-helpers.js';


// Event listener for the categories pie chart.
document.getElementById('categories').addEventListener('click', function () {
  // Hide placeholder image and other charts
  document.getElementById('placeholderImage').style.display = 'none';

  const chart1 = document.getElementById('chart1_div');
  chart1.classList.toggle("d-none", false); //shows the div for categories
  document.getElementById('chart2_div').classList.toggle("d-none", true);
  document.getElementById('chart3_div').classList.toggle("d-none", true);

  // Load Google Charts
  google.charts.load('current', { 'packages': ['corechart'] });
  google.charts.setOnLoadCallback(drawChart);

  async function drawChart() {

    var data = new google.visualization.DataTable();

    data.addColumn('string', 'Category');
    data.addColumn('number', 'Totals');

    //  this is where we are pulling the trip data from firebase. Uses trip-helpers.js
    var trips = await getTrips();

    const categories = new Map();
    //Iterating through the database to retrive category names and totals
    for (var trip of trips) {
      for (var { total, category } of trip.categoryTotals) {
        console.log(total, category)
        if (categories.has(category)) {
          var currentTotal = categories.get(category)
          categories.set(category, total + currentTotal)
        }
        else {
          categories.set(category, total)
        }

      }
    }
    console.log(categories);

    var total = trips.reduce(function (acc, trip) {
      return acc + trip.categoryTotals
    }, 0);

    console.log(total);
    console.log(getTrips());
    data.addRows(
      Array.from(categories)
    );

    var options = {
      title: 'Category Spending',
      curveType: 'function',
      legend: { position: 'bottom' },
      backgroundColor: 'transparent',
    };

    var chart = new google.visualization.PieChart(chart1);

    $(window).resize(function () {
      chart.draw(data, options);
    });

    chart.draw(data, options);
  }
});

// Event listener for the overall total. 
document.getElementById('overall').addEventListener('click', function () {
  // Hide placeholder image and other charts
  document.getElementById('placeholderImage').style.display = 'none';

  const chart2 = document.getElementById('chart2_div');
  chart2.classList.toggle("d-none", false); //shows the div for categories
  document.getElementById('chart1_div').classList.toggle("d-none", true);
  document.getElementById('chart3_div').classList.toggle("d-none", true);

  // Load Google Charts
  google.charts.load('current', { 'packages': ['corechart'] });
  google.charts.setOnLoadCallback(drawChart);

  async function drawChart() {

    var data = new google.visualization.DataTable();

    data.addColumn('string', 'Overall Total');
    data.addColumn('number', 'Overall Total');

    var trips = await getTrips();
    var total = trips.reduce(function (acc, trip) {
      return acc + trip.completeTotal
    }, 0);
    console.log(total)

    data.addRows([
      ['Total', total]
    ]);

    var options = {
      title: 'Overall Spending',
      curveType: 'function',
      legend: { position: 'bottom' },
      backgroundColor: 'transparent',
      pieSliceText: 'value'
    };

    var chart = new google.visualization.PieChart(chart2);

    $(window).resize(function () {
      chart.draw(data, options);
    });

    chart.draw(data, options);
  }
});

const itemCosts = document.getElementById('itemCosts');

// Event listener for the Items data.
document.getElementById('itemCosts').addEventListener('click', async function () {
  // Hide placeholder image and other charts
  document.getElementById('placeholderImage').style.display = 'none';

  const chart3 = document.getElementById('chart3_div');
  chart3.classList.toggle("d-none", false); //shows the div for categories
  document.getElementById('chart2_div').classList.toggle("d-none", true);
  document.getElementById('chart1_div').classList.toggle("d-none", true);
  //popup
  const selectedItem = await promptForItems(false, false);
  // Load Google Charts
  google.charts.load('current', { 'packages': ['corechart'] });
  google.charts.setOnLoadCallback(drawChart)

  console.log(selectedItem);

  var whichItem = selectedItem.id;

  async function drawChart() {

    //  this is where we are pulling the trip data from firebase. Uses trip-helpers.js
    var trips = await getTrips();
    console.log(trips);

    let boughtAtPriceTotal = 0;
    let quantityTotal = 0;
    const itemDetails = [boughtAtPriceTotal, quantityTotal];
    //Iterating through the database to retrive category names and totals
    for (var trip of trips) {
      for (var { boughtAtPrice, quantity, item } of trip.boughtItems) {

        //Checks to see if the item id matches and then adds the price and quantity from that trip to the total. Then moves on to the next trip.
        if (item.id == whichItem) {
          if (typeof boughtAtPrice == "number") {
            boughtAtPriceTotal += boughtAtPrice;
            quantityTotal += quantity;
          }
          break;
        }
      }
    }
    console.log(itemDetails);

    // Display the item details in a table
    var itemDetailsHTML = `
    <table class="table caption-top">
        <h3>${selectedItem.itemName}</h3>
        <thead>
            <tr>
                <th scope="col">Total Spent</th>
                <th scope="col">Total Quantity</th>
            </tr>
        </thead>
        <tbody>
            <tr>
            <td>${boughtAtPriceTotal}</td>
            <td>${quantityTotal}</td>
            </tr>
        </tbody>
    </table>
  `;

    // Set the inner HTML of a div to display the item details
    document.getElementById('chart3_div').innerHTML = itemDetailsHTML;
  
  }
});
