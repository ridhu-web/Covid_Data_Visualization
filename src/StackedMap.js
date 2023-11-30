import React, { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import * as topojson from "topojson";
import useSVGCanvas from "./useSVGCanvas";
import "./StackedMap.css";

function WhiteHat(props) {
  const d3Container = useRef(null);
  const [svg, height, width] = useSVGCanvas(d3Container);
  //console.log("height", height);

  //console.log("width", width);

  const [selectedDataType, setSelectedDataType] = useState(
    "below_150_percent_poverty"
  );
  const [selectedDataType2, setSelectedDataType2] = useState("new_cases");
  const [selectedDataType3, setSelectedDataType3] = useState("dose1_pct");

  const startDate = new Date("2020-01-21");
  const endDate = new Date("2023-03-23");
  const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));

  const [dayNumber, setDayNumber] = useState(0);
  const [covidData, setCovidData] = useState(null);

  const [sliderValue, setSliderValue] = useState(0); // Temporary state to hold the slider value
  const sliderTimeout = useRef(null); // Ref to store the current timeout

  const [selectedDate, setSelectedDate] = useState(
    startDate.toISOString().split("T")[0]
  );

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    // Convert the date to dayNumber or any other format as required by your application
    // Update the necessary state and data based on the new date
  };

  const handleSliderChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    setSliderValue(newValue); // Update the temporary slider value

    // Clear the existing timeout
    if (sliderTimeout.current) {
      clearTimeout(sliderTimeout.current);
    }

    // Set a new timeout
    sliderTimeout.current = setTimeout(() => {
      setDayNumber(newValue);
      //console.log("newValue", newValue);
    }, 50); // 2 seconds delay
  };

  // Function to convert day number to date string
  const formatDate = useCallback((dayNum) => {
    const date = new Date(startDate.getTime());
    date.setDate(date.getDate() + dayNum);
    return date.toISOString().split("T")[0];
  }, []);

  // Function to fetch JSON data
  const fetchJson = async (formattedDate) => {
    try {
      const response = await fetch(`/data2/data_${formattedDate}.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      //console.log("data", data);
      setCovidData(data);
    } catch (error) {
      console.error("Error fetching JSON:", error);
    }
  };

  useEffect(() => {
    if (!props.map || !props.data) {
      console.error("Map or data props are missing");
      return;
    }

    if (svg && props.map && props.data) {
      // Clear earlier drawings
      svg.selectAll("g").remove();

      // Create a map of fips codes to selected data type
      const dataMap = new Map(
        props.data.map((d) => [d.fips, d[selectedDataType]])
      );

      // Assuming `props.data` is your data array and `selectedDataType` is the selected data type
      const minMaxValue = d3.extent(props.data, (d) => d[selectedDataType]);

      // Custom color range
      const customColors = [
        "#eff3ff",
        "#c6dbef",
        "#9ecae1",
        "#6baed6",
        "#4292c6",
        "#2171b5",
        "#084594",
      ];

      // Create a linear scale for interpolating the colors
      const colorInterpolator = d3
        .scaleLinear()
        .domain(d3.range(0, 1, 1 / (customColors.length - 1)).concat([1]))
        .range(customColors);

      // Create the color scale
      const colorScale = d3
        .scaleSequential()
        .domain(minMaxValue)
        .interpolator((t) => colorInterpolator(t));

      // Assuming you have a colorScale defined as before
      // Define a legend scale (if your data is numeric, use a linear scale)
      const legendScale = d3
        .scaleLinear()
        .domain(colorScale.domain())
        .range([0, 200]); // Adjust the range based on your legend size

      // Create a legend group
      const legend = svg
        .append("g")
        .attr("class", "legend")
        .attr("transform", "translate(0, 250)"); // Replace x, y with your desired position

      // Create a gradient for the legend
      const linearGradient = legend
        .append("defs")
        .append("linearGradient")
        .attr("id", "legend-gradient");
      // Set gradient color stops
      customColors.forEach((color, i) => {
        linearGradient
          .append("stop")
          .attr("offset", `${(i / (customColors.length - 1)) * 100}%`)
          .attr("stop-color", color);
      });

      // Add the color bar for the legend
      legend
        .append("rect")
        .attr("width", 200) // Same as range of legendScale
        .attr("height", 20)
        .style("fill", "url(#legend-gradient)");

      // Add legend axis
      const legendAxis = d3.axisBottom(legendScale).ticks(5); // Adjust the number of ticks based on your preference

      legend
        .append("g")
        .attr("class", "legend-axis")
        .attr("transform", "translate(5, 20)")
        .call(legendAxis);

      legend
        .append("text")
        .attr("x", 0)
        .attr("y", -10)
        .text("SVI  Distribution")
        .attr("font-weight", "bold")
        .attr("font-size", "14px");

      // function updateLegend(newDataType) {
      //   // Update scales
      //   const minMaxValue = d3.extent(props.data, (d) => d[newDataType]);
      //   colorScale.domain(minMaxValue);
      //   legendScale.domain(minMaxValue);

      //   // Update legend axis
      //   svg
      //     .select(".legend-axis")
      //     .transition()
      //     .duration(500) // Transition for smooth updating
      //     .call(d3.axisBottom(legendScale));
      // }

      // Set up projection and path
      const projection = d3
        .geoAlbersUsa()
        .scale(1280)
        .translate([width / 2, height / 2]);
      const path = d3.geoPath().projection(projection);

      const formattedDate = formatDate(dayNumber);
      fetchJson(formattedDate);

      // const formattedDate = formatDate(selectedDate); // Assuming formatDate can handle the conversion
      // fetchJson(formattedDate);

      // Draw the map
      try {
        const usMap = props.map;
        const states = topojson.feature(usMap, usMap.objects.states);
        //console.log("states", states);
        const counties = topojson.feature(usMap, usMap.objects.counties);
        // const mapGroup = svg
        //   .append("g")
        //   .attr("class", "map-group")
        //   .attr("transform", "translate(100, 50)");
        const countyPaths = svg.selectAll(".county").data(counties.features);
        // Draw state boundaries
        svg
          .selectAll(".state")
          .data(states.features)
          .enter()
          .append("path")
          .attr("class", "state")
          .attr("d", path)
          .style("fill", "none") // No fill color for state boundaries
          .style("stroke", "#000") // Darker stroke color for better contrast
          .style("stroke-width", "2px") // Thicker stroke
          .style("stroke-opacity", "1"); // Slightly transparent

        // Enter selection
        countyPaths
          .enter()
          .append("path")
          .attr("class", "county")
          .attr("d", path);
        // Update selection
        countyPaths.attr("fill", (d) => {
          const dataValue = dataMap.get(parseInt(d.id));
          //console.log("dataValue", dataValue);
          return dataValue ? colorScale(dataValue) : "#ddd";
        });

        // (d) => d[selectedDataType]
        if (svg && covidData) {
          // Define a radius scale
          const radiusScale = d3
            .scaleSqrt()
            .domain([0, d3.max(covidData, (d) => d[selectedDataType2])]) // Assuming 'new_cases' is what you want to visualize
            .range([0, 40]); // Adjust the range based on your desired bubble sizes

          // const minDosePct = d3.min(covidData, (d) => d[selectedDataType3]);
          // const maxDosePct = d3.max(covidData, (d) => d[selectedDataType3]);

          const colorScale2 = d3
            .scaleQuantize()
            .domain([0, 100])
            .range([
              "#fef0d9",
              "#fdd49e",
              "#fdbb84",
              "#fc8d59",
              "#ef6548",
              "#d7301f",
              "#990000",
            ]);

          // covidData.forEach((d) => {
          //   if (radiusScale(d[selectedDataType2]) > 1) {
          //     console.log("hello");
          //   }
          // });

          const bubbleLegend = svg
            .append("g")
            .attr("class", "bubble-legend")
            .attr("transform", "translate(0, 320)"); // Adjust the position as needed

          bubbleLegend
            .append("rect")
            .attr("width", 200) // Adjust width as needed
            .attr("height", 20)
            .style("fill", "url(#bubble-gradient)");

          const bubbleGradient = svg
            .append("defs")
            .append("linearGradient")
            .attr("id", "bubble-gradient");

          bubbleLegend
            .append("text")
            .attr("x", 0)
            .attr("y", -10)
            .text("Vaccination Distribution")
            .attr("font-weight", "bold")
            .attr("font-size", "14px");

          colorScale2.range().forEach((color, index) => {
            bubbleGradient
              .append("stop")
              .attr(
                "offset",
                `${(index / (colorScale2.range().length - 1)) * 100}%`
              )
              .attr("stop-color", color);
          });

          const bubbleLegendScale = d3
            .scaleLinear()
            .domain([0, 100]) // Same as bubbleColorScale domain
            .range([0, 200]); // Same width as the legend rect

          bubbleLegend
            .append("g")
            .attr("class", "bubble-legend-axis")
            .attr("transform", "translate(0, 20)") // Position below the rect
            .call(d3.axisBottom(bubbleLegendScale).ticks(5));

          // Create and position bubbles
          const bubbles = svg
            .selectAll(".covid-bubble")
            .data(covidData)
            .join("circle")
            .attr("class", "covid-bubble")
            .attr("cx", (d) => {
              const coords = projection([d.lng, d.lat]);
              //console.log("coords", coords);

              return coords ? coords[0] : null;
            })
            .attr("cy", (d) => {
              const coords = projection([d.lng, d.lat]);
              return coords ? coords[1] : null;
            })
            //.attr("r", 10)
            .attr("r", (d) => {
              const radiusValue = radiusScale(d[selectedDataType2]);
              return radiusValue >= 0 ? radiusValue : 0; // Ensure non-negative radius
            })
            .attr("fill", (d) =>
              d[selectedDataType3] != null
                ? colorScale2(d[selectedDataType3])
                : "grey"
            )
            .attr("opacity", 0.6);

          // Optional: Filter out bubbles with null coordinates
          svg
            .selectAll(".covid-bubble")
            .filter(function () {
              return d3.select(this).attr("cx") === null;
            })
            .remove();

          // // Add tooltip
          // // Inside your useEffect hook, after drawing the counties

          // // Select the tooltip element
          // const tooltip = d3.select("#tooltip");

          // countyPaths
          //   .on("mouseover", function (event, d) {
          //     console.log("d", d);
          //     d3.select(this)
          //       .style("stroke", "black") // Highlight style
          //       .style("stroke-width", 2);

          //     // Get county data
          //     const countyData = covidData.find(
          //       (c) => c.fips === parseInt(d.id)
          //     );

          //     const tooltipHtml = `
          //     <strong>${countyData.area_name}, ${countyData.state}</strong><br/>
          //     ${selectedDataType}: ${countyData[selectedDataType]}<br/>
          //     ${selectedDataType2}: ${countyData[selectedDataType2]}<br/>
          //     ${selectedDataType3}: ${countyData[selectedDataType3]}%
          //   `;

          //     tooltip
          //       .html(tooltipHtml)
          //       .style("left", event.pageX + 10 + "px")
          //       .style("top", event.pageY - 28 + "px")
          //       .style("opacity", 1); // Make tooltip visible
          //   })
          //   .on("mouseout", function () {
          //     d3.select(this)
          //       .style("stroke", null) // Remove highlight style
          //       .style("stroke-width", 0);

          //     tooltip.style("opacity", 0); // Hide tooltip
          //   });

          // Add any additional bubble styling or interactions here

          // Tooltips
          const countyTooltip = d3.select("#county-tooltip");
          const bubbleTooltip = d3.select("#bubble-tooltip");

          countyPaths
            .on("mouseover", function (event, d) {
              const countyData = covidData.find(
                (c) => c.fips === parseInt(d.id)
              );
              const tooltipHtml = `<strong>${countyData.area_name}, ${countyData.state}</strong><br/>${selectedDataType2}: ${countyData[selectedDataType2]}<br/>${selectedDataType3}: ${countyData[selectedDataType3]}%`;
              countyTooltip
                .html(tooltipHtml)
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 28 + "px")
                .style("opacity", 1);
            })
            .on("mouseout", function () {
              countyTooltip.style("opacity", 0);
            });

          bubbles
            .on("mouseover", function (event, d) {
              const tooltipHtml = `<strong>${d.area_name}, ${d.state}</strong><br/>${selectedDataType2}: ${d[selectedDataType2]}<br/>${selectedDataType3}: ${d[selectedDataType3]}%`;
              bubbleTooltip
                .html(tooltipHtml)
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 28 + "px")
                .style("opacity", 1);
            })
            .on("mouseout", function () {
              bubbleTooltip.style("opacity", 0);
            });
        }
      } catch (error) {
        console.error("Error rendering map:", error);
      }
    }
  }, [
    //svg,
    dayNumber,
    covidData,
    selectedDataType,
    selectedDataType2,
    selectedDataType3,
  ]); // Make sure selectedDataType is included here

  const handleDataTypeChange = (dataType) => {
    setSelectedDataType(dataType);
  };

  const handleDataTypeChange2 = (dataType) => {
    setSelectedDataType2(dataType);
  };

  const handleDataTypeChange3 = (dataType) => {
    setSelectedDataType3(dataType);
  };

  return (
    <div className={"container"}>
      <div className={"left-nav"}>
        <div>
          <h4>SVI Data (Plotted on the map):</h4>
          <button
            className={`vis-btns ${
              selectedDataType === "below_150_percent_poverty"
                ? "selected-btn"
                : ""
            }`}
            onClick={() => handleDataTypeChange("below_150_percent_poverty")}
            title="View data related to population who are below poverty level"
          >
            Poverty Level
          </button>
          <button
            className={`vis-btns ${
              selectedDataType === "no_health_insurance" ? "selected-btn" : ""
            }`}
            onClick={() => handleDataTypeChange("no_health_insurance")}
            title="View data related to health insurance"
          >
            Health Insurance
          </button>
          <button
            className={`vis-btns ${
              selectedDataType === "aged_65_and_older" ? "selected-btn" : ""
            }`}
            onClick={() => handleDataTypeChange("aged_65_and_older")}
            title="View data related to population aged 65 and older"
          >
            Aged 65 and Older
          </button>
          <button
            className={`vis-btns ${
              selectedDataType === "single_parent_households"
                ? "selected-btn"
                : ""
            }`}
            onClick={() => handleDataTypeChange("single_parent_households")}
            title="View data related to population who are single parents"
          >
            Single Parent Households
          </button>
          <button
            className={`vis-btns ${
              selectedDataType === "hispanic_or_latino" ? "selected-btn" : ""
            }`}
            onClick={() => handleDataTypeChange("hispanic_or_latino")}
            title="View data related to race"
          >
            Hispanic or Latino
          </button>
          <button
            className={`vis-btns ${
              selectedDataType ===
              "black_and_african_american_not_hispanic_or_latino"
                ? "selected-btn"
                : ""
            }`}
            onClick={() =>
              handleDataTypeChange(
                "black_and_african_american_not_hispanic_or_latino"
              )
            }
            title="View data related to population based on race"
          >
            African American
          </button>
          <button
            className={`vis-btns ${
              selectedDataType === "crowding" ? "selected-btn" : ""
            }`}
            onClick={() => handleDataTypeChange("crowding")}
            title="View data related to crowding"
          >
            Crowding
          </button>
          <button
            className={`vis-btns ${
              selectedDataType === "no_vehicle" ? "selected-btn" : ""
            }`}
            onClick={() => handleDataTypeChange("no_vehicle")}
            title="View data related population who has no vehicles"
          >
            No Vehicle
          </button>
        </div>
        <div>
          <h4>COVID-19 Data (Size of the bubble)</h4>
          <button
            className={`vis-btns ${
              selectedDataType2 === "new_cases" ? "selected-btn" : ""
            }`}
            onClick={() => handleDataTypeChange2("new_cases")}
            title="View data related to new covid cases"
          >
            New Cases
          </button>
          <button
            className={`vis-btns ${
              selectedDataType2 === "new_deaths" ? "selected-btn" : ""
            }`}
            onClick={() => handleDataTypeChange2("new_deaths")}
            title="View data related to new covid deaths"
          >
            New Deaths
          </button>
          <button
            className={`vis-btns ${
              selectedDataType2 === "cumulative_cases" ? "selected-btn" : ""
            }`}
            onClick={() => handleDataTypeChange2("cumulative_cases")}
            title="View data related to cumulative covid 19 cases"
          >
            Cumulative Cases
          </button>
          <button
            className={`vis-btns ${
              selectedDataType2 === "cumulative_deaths" ? "selected-btn" : ""
            }`}
            onClick={() => handleDataTypeChange2("cumulative_deaths")}
            title="View data related cumulative covid 19 deaths"
          >
            Cumulative Deaths
          </button>
        </div>

        <div>
          <h4>Vaccination Data (Color of the Bubble)</h4>
          <button
            className={`vis-btns ${
              selectedDataType3 === "dose1_pct" ? "selected-btn" : ""
            }`}
            onClick={() => handleDataTypeChange3("dose1_pct")}
            title="View data related population who completed covid 19 dose 1 vaccine"
          >
            Dose 1 Completion %
          </button>
          <button
            className={`vis-btns ${
              selectedDataType3 === "dose2_pct" ? "selected-btn" : ""
            }`}
            onClick={() => handleDataTypeChange3("dose2_pct")}
            title="View data related population who completed covid 19 dose 2 vaccine"
          >
            Dose 2 Completion %
          </button>
        </div>

        <div style={{ color: "white", fontWeight: "bold" }}>
          Data for date: {formatDate(dayNumber)}
          <input
            type="range"
            min="0"
            max={totalDays}
            value={sliderValue} // Use the temporary slider value here
            onChange={handleSliderChange}
          />
        </div>

        <div style={{ color: "white", fontWeight: "bold" }}>
          Data for date:
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            min={startDate.toISOString().split("T")[0]}
            max={endDate.toISOString().split("T")[0]}
          />
        </div>
      </div>
      <div
        className={"d3-component"}
        style={{ height: "99%", width: "99%" }}
        ref={d3Container}
      >
        <div id="county-tooltip" className="tooltip"></div>
        <div id="bubble-tooltip" className="tooltip"></div>
      </div>
    </div>
  );
}

export default WhiteHat;
