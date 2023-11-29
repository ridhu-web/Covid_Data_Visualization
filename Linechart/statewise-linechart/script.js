// Set the dimensions and margins of the graph
const margin = {top: 20, right: 30, bottom: 50, left: 60},
      width = 800 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

// Append the svg object to the body of the page
const svg = d3.select("#chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

// Initialize a tooltip
const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

// Read the data
d3.csv("Alaska.csv", function(d) {
  return { date : d3.timeParse("%Y-%m-%d")(d.date), county: d.county, cases: d.cases, deaths: d.deaths }
}).then(

  // Now I can use this dataset:
  function(data) {
    // Sort data by date
    data.sort((a, b) => a.date - b.date);

    // Calculate daily values
    let prevDayCases = 0, prevDayDeaths = 0;
    const dailyData = data.map(d => {
      let dailyCases = d.cases - prevDayCases;
      let dailyDeaths = d.deaths - prevDayDeaths;
      prevDayCases = d.cases;
      prevDayDeaths = d.deaths;
      return { date: d.date, dailyCases: Math.max(0, dailyCases), dailyDeaths: Math.max(0, dailyDeaths), county: d.county };
    });

    // Add X axis --> it is a date format
    const x = d3.scaleTime()
      .domain(d3.extent(dailyData, function(d) { return d.date; }))
      .range([ 0, width ]);
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x));

    // Add Y axis
    const y = d3.scaleLinear()
      .domain([0, d3.max(dailyData, function(d) { return +d.dailyCases; })])
      .range([ height, 0 ]);
    svg.append("g")
      .call(d3.axisLeft(y));

    // Add the line
    svg.append("path")
      .datum(dailyData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return x(d.date) })
        .y(function(d) { return y(d.dailyCases) })
        )

    // Create a rect on top of the svg area: this rectangle recovers mouse position
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on('mouseover', function() { tooltip.style("display", null); })
      .on('mouseout', function() { tooltip.style("display", "none"); })
      .on('mousemove', mousemove);

    function mousemove(event) {
      const x0 = x.invert(d3.pointer(event)[0]);
      const bisectDate = d3.bisector(function(d) { return d.date; }).left;
      const i = bisectDate(dailyData, x0, 1);
      const d0 = dailyData[i - 1],
            d1 = dailyData[i],
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;
      tooltip.html(`Date: ${d3.timeFormat("%B %d, %Y")(d.date)}<br>Cases: ${d.dailyCases}<br>Deaths: ${d.dailyDeaths}<br>County: ${d.county}`)
             .style("left", (d3.pointer(event)[0]+70) + "px")
             .style("top", (d3.pointer(event)[1]) + "px")
             .style("opacity", 1);
    }
  }
);
