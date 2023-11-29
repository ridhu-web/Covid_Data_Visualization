// Set the dimensions and margins of the graph
var margin = {top: 50, right: 30, bottom: 70, left: 90},
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// Append the svg object to the body of the page
var svg = d3.select("#chart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Chart title
svg.append("text")
    .attr("x", width / 2)
    .attr("y", 0 - (margin.top / 2))
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .style("text-decoration", "underline")
    .text("COVID-19 Cases and Deaths Over Time");

// Initialize a tooltip
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Parse the date / time
var parseDate = d3.timeParse("%Y-%m-%d");

// Read the data from the Ada.csv file
d3.csv("Ada.csv").then(function(data) {

  // Format the data
  data.forEach(function(d) {
      d.date = parseDate(d.date);
      d.new_cases = +d.new_cases;
      d.new_deaths = +d.new_deaths;
  });

  // Scale the range of the data
  var x = d3.scaleTime().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);

  x.domain(d3.extent(data, function(d) { return d.date; }));
  y.domain([0, d3.max(data, function(d) { return d.new_cases; })]);

  // Add the X Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
    // X-axis title
    .append("text")
      .attr("class", "axis-title")
      .attr("y", 40)
      .attr("x", width / 2)
      .attr("text-anchor", "middle")
      .style("fill", "black")
      .text("Date");

  // Add the Y Axis
  svg.append("g")
      .call(d3.axisLeft(y))
    // Y-axis title
    .append("text")
      .attr("class", "axis-title")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .style("fill", "black")
      .text("Number of Cases");

  // Add the cases line
  svg.append("path")
    .data([data])
    .attr("fill", "none")
    .attr("stroke", "blue")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.new_cases); })
    );

  // Create a rect on top of the svg area: this rectangle recovers mouse position
  svg.append('rect')
    .style("fill", "none")
    .style("pointer-events", "all")
    .attr('width', width)
    .attr('height', height)
    .on('mouseover', mouseover)
    .on('mousemove', mousemove)
    .on('mouseout', mouseout);

  // What happens when the mouse move -> show the annotations at the right positions.
  function mouseover() {
    tooltip.style("opacity", 1);
  }

  function mousemove() {
    var x0 = x.invert(d3.mouse(this)[0]);
    var bisectDate = d3.bisector(function(d) { return d.date; }).left;
    var i = bisectDate(data, x0, 1);
    var selectedData = data[i]
    tooltip
      .html("Date: " + d3.timeFormat("%Y-%m-%d")(selectedData.date) + "<br/>" + "Cases: " + selectedData.new_cases + "<br/>" + "Deaths: " + selectedData.new_deaths)
      .style("left", (d3.event.pageX + 15) + "px")
      .style("top", (d3.event.pageY - 28) + "px");
  }

  function mouseout() {
    tooltip.style("opacity", 0);
  }

});
