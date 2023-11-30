import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson";
import stateMap from "./stateMap";
import "./StackedMap.css";
import "./Blackhat.css";

function BlackHat(props) {
  const d3Container = useRef(null);

  const [jsonData, setJsonData] = useState(null);

  const startDate = new Date("2020-01-21");
  const endDate = new Date("2023-03-23");
  const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));

  const [selectedState, setSelectedState] = useState(null);

  const [selectedDataType, setSelectedDataType] = useState("new_deaths");

  const [plotType, setPlotType] = useState("density"); // Default to 'density'

  const handlePlotTypeChange = (type) => {
    setPlotType(type);
  };

  const [selectedDate, setSelectedDate] = useState(
    startDate.toISOString().split("T")[0]
  );

  const us = props.map;

  async function loadJsonData(url) {
    try {
      const data = await d3.json(url);
      console.log("data", data);
      setJsonData(data);
    } catch (error) {
      console.error("Error fetching JSON data:", error);
      throw error;
    }
  }

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    console.log("newDate", newDate);
    // Convert the date to dayNumber or any other format as required by your application
    // Update the necessary state and data based on the new date
  };

  // Function to add/subtract days, months, years
  const adjustDate = (amount, unit) => {
    const currentDate = new Date(selectedDate);
    if (unit === "day") {
      currentDate.setDate(currentDate.getDate() + amount);
    } else if (unit === "month") {
      currentDate.setMonth(currentDate.getMonth() + amount);
    } else if (unit === "year") {
      currentDate.setFullYear(currentDate.getFullYear() + amount);
    }

    if (currentDate >= startDate && currentDate <= endDate) {
      setSelectedDate(currentDate.toISOString().split("T")[0]);
    } else {
      alert("Selected date is out of range.");
    }
  };

  useEffect(() => {
    // const formattedDate = formatDate(dayNumber);
    const dataUrl = `/data2/data_${selectedDate}.json`;
    loadJsonData(dataUrl);
  }, [selectedDate]);

  useEffect(() => {
    if (!us || !jsonData || !d3Container.current) {
      return;
    }

    d3.select(d3Container.current).selectAll("svg").remove();

    const height = 625;
    //const counties = topojson.feature(us, us.objects.counties);

    //console.log("counties", counties);

    const stateBoundaries = topojson.mesh(
      us,
      us.objects.states,
      (a, b) => a !== b
    );

    //console.log("stateBoundaries", stateBoundaries);

    function getStates(us) {
      const states = topojson.feature(us, us.objects.states);
      const geoPath = d3.geoPath(); // Ensure you have defined geoPath properly

      states.features.forEach((feature) => {
        const [x, y] = geoPath.centroid(feature);
        feature.properties = { ...feature.properties, x, y };
      });

      return states;
    }

    const states = getStates(us);

    //console.log("states", states);

    const nation = topojson.mesh(us, us.objects.nation);

    // const parseRow = (row) => {
    //   for (let key in row) {
    //     if (key === "name") {
    //       const [county, state] = row.name.split(", ");
    //       row.state = state;
    //       row.county = county;
    //       delete row.name;
    //     } else if (key !== "geoid") {
    //       row[key] = Number(row[key]);
    //     }
    //   }
    //   return row;
    // };

    //const jsonData = loadJsonData("data_2021-01-23.json");

    //console.log("data", jsonData);

    const jdataByState = d3.group(jsonData, (d) => d.state);

    //console.log("jdataByState", jdataByState);
    const width = 960;
    //const STATE_CIRCLE_RADIUS = 30;
    const NODE = { MIN_RADIUS: 3, MAX_RADIUS: 10, PADDING: 1 };
    const packSiblings = (values) => d3.packSiblings(values);
    const packEnclose = (values) => d3.packEnclose(values);
    const scheme = d3.schemeGnBu;

    // const perPopulation = (d) => {
    //   if (!d.population || d.population === 0 || plotType === "value") {
    //     return d[selectedDataType];
    //   }
    //   return (d[selectedDataType] / d.population) * 100000; // Density calculation
    // };

    const perPopulation = (d) => {
      if (!d.population || d.population === 0) {
        return 0;
      } else if (plotType === "value") {
        return d[selectedDataType];
      }
      return (d[selectedDataType] / d.population) * 100000;
    };

    // const color = d3
    //   .scaleQuantize()
    //   .domain(
    //     d3.extent(jsonData, (d) => {
    //       //console.log("population", perPopulation(d));
    //       //return d[selectedDataType];
    //       return perPopulation(d);
    //     })
    //   )
    //   .range(scheme[8]);

    const color = d3
      .scaleSequential()
      .interpolator(d3.interpolateBlues)
      .domain(d3.extent(jsonData, (d) => perPopulation(d)));

    const radius = d3
      .scaleSqrt()
      .domain(
        d3.extent(jsonData, (d) => {
          //return d[selectedDataType];
          return perPopulation(d);
        })
      )
      .range([NODE.MIN_RADIUS, NODE.MAX_RADIUS]);

    const geoPath = d3.geoPath();

    const createBaseMap = () => {
      const svg = d3
        .create("svg")
        .attr("viewBox", `0 0 ${width} ${height}`) // Adjust viewBox if necessary
        .style("width", "80%") // Make SVG responsive
        .style("height", "100%");

      svg
        .append("rect")
        .attr("width", 960)
        .attr("height", height)
        .attr("fill", "#333333");

      svg
        .append("path")
        .classed("state-boundaries", true)
        .datum(stateBoundaries)
        .attr("fill", "none")
        .attr("stroke", "lightgray")
        .attr("stroke-width", 1)
        .attr("stroke-linejoin", "round")
        .attr("d", geoPath);

      svg
        .append("path")
        .classed("nation-boundary", true)
        .datum(nation)
        .attr("fill", "none")
        .attr("stroke", "gray")
        .attr("stroke-linejoin", "round")
        .attr("d", geoPath);

      return svg.node();
    };

    // const map1 = createBaseMap();
    // console.log("map1", map1);

    const createStatePacks = (data) => {
      const statesPacked = new Map();
      for (let [k, v] of data) {
        v.sort((a, b) => perPopulation(b) - perPopulation(a)); // step 0
        v = v.slice(0, 25);
        v = v.map((d) => ({ data: d, r: radius(perPopulation(d)) })); // step 1
        //console.log(k, " : v", v);
        const nodes = packSiblings(v); // step 1
        const { r } = packEnclose(nodes); // step 2
        const state = states.features.find(
          (d) => d.properties.name === stateMap[k]
        ); // step 3
        const name = stateMap[k];
        // console.log("state", state);
        const { x, y } = state.properties; // step 3
        statesPacked.set(k, { nodes, r, x, y, name }); // step 4
      }

      return statesPacked;
    };

    const applySimulation = (nodes) => {
      const simulation = d3
        .forceSimulation(nodes)
        .force(
          "cx",
          d3
            .forceX()
            .x((d) => width / 2)
            .strength(0.02)
        )
        .force(
          "cy",
          d3
            .forceY()
            .y((d) => height / 2)
            .strength(0.02)
        )
        .force(
          "x",
          d3
            .forceX()
            .x((d) => d.x)
            .strength(0.3)
        )
        .force(
          "y",
          d3
            .forceY()
            .y((d) => d.y)
            .strength(0.3)
        )
        .force("charge", d3.forceManyBody().strength(-1))
        .force(
          "collide",
          d3
            .forceCollide()
            .radius((d) => d.r + NODE.PADDING)
            .strength(1)
        )
        .stop();

      while (simulation.alpha() > 0.01) {
        simulation.tick();
      }

      return simulation.nodes();
    };

    const map5 = () => {
      const map = createBaseMap();
      const svg = d3.select(map);
      const statesPacked = createStatePacks(jdataByState);
      //console.log("statesPacked", statesPacked);
      let values = [...new Map(statesPacked).values()];
      values = applySimulation(values);
      const ZOOM_SCALE_FACTOR = 1.5;

      svg.select(".state-boundaries").attr("stroke", "#fff");

      const statePacks = svg
        .append("g")
        .classed("state-packs", true)
        .selectAll(".state-pack")
        .data(values)
        .enter()
        .append("g")
        .classed("state-pack", true)
        .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
        // .on("click", (event, d) => {
        //   setSelectedState(d.name); // Assuming 'name' is the property for state name
        // });

        .on("click", (event, d) => {
          if (selectedState === d.name) {
            // If the state is already selected, deselect it
            setSelectedState(null);
          } else {
            // Otherwise, select the new state
            setSelectedState(d.name);
          }
        });

      console.log("statePacks", statePacks);

      // statePacks
      //   .append("circle")
      //   .attr("r", (d) => d.r)
      //   .attr("fill", "#e2e2e2")
      //   .attr("stroke", "#333");

      statePacks
        .append("circle")
        .attr("r", (d) =>
          selectedState === d.name ? d.r * ZOOM_SCALE_FACTOR : d.r
        )
        .attr("fill", (d) => (selectedState === d.name ? "#CCCCCC" : "#FFCC00"))
        .attr("stroke", "#333");

      const counties = statePacks
        .selectAll(".county-centroid")
        .data((d) => d.nodes.filter((node) => perPopulation(node.data) !== 0))

        .enter()
        .append("circle")
        .classed("county-centroid", true)
        .attr("r", (d) => d.r)
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
        .attr("fill", (d) => color(perPopulation(d.data)));

      counties.append("title").text((d) => {
        return `${d.data.area_name}, ${d.data.state}\n New Cases: ${d.data["new_cases"]}\n New Deaths: ${d.data["new_deaths"]}\n Cumulative Cases: ${d.data["cumulative_cases"]}\n Cumulative Deaths: ${d.data["cumulative_deaths"]} `;
      });

      return map;
    };

    const mapNode = map5();
    d3Container.current.appendChild(mapNode);

    //d3.select(d3Container.current).appendChild(map3);

    return () => {
      d3.select(d3Container.current).select("svg").remove();
    };
  }, [jsonData, us, selectedDataType, selectedState, plotType]);

  const handleDataTypeChange = (dataType) => {
    setSelectedDataType(dataType);
  };

  return (
    <div className={"container"}>
      <div className={"left-nav"}>
        <div className="state-name-display" style={{ color: "white" }}>
          {selectedState && <h2> State: {selectedState}</h2>}
        </div>

        <h4> Kind of Data </h4>
        <button
          className={`vis-btns ${plotType === "density" ? "selected-btn" : ""}`}
          onClick={() => handlePlotTypeChange("density")}
        >
          Plot Density (per 100K)
        </button>
        <button
          className={`vis-btns ${plotType === "value" ? "selected-btn" : ""}`}
          onClick={() => handlePlotTypeChange("value")}
        >
          Plot Values
        </button>
        <h4> Covid Attribute to Analyze</h4>
        <button
          className={`vis-btns ${
            selectedDataType === "cumulative_cases" ? "selected-btn" : ""
          }`}
          onClick={() => handleDataTypeChange("cumulative_cases")}
          title="cumulative_cases"
        >
          Cumulative Cases
        </button>
        <button
          className={`vis-btns ${
            selectedDataType === "cumulative_deaths" ? "selected-btn" : ""
          }`}
          onClick={() => handleDataTypeChange("cumulative_deaths")}
          title="cumulative_deaths"
        >
          Cumulative Deaths
        </button>
        <button
          className={`vis-btns ${
            selectedDataType === "new_cases" ? "selected-btn" : ""
          }`}
          onClick={() => handleDataTypeChange("new_cases")}
          title="new_cases"
        >
          New Cases
        </button>
        <button
          className={`vis-btns ${
            selectedDataType === "new_deaths" ? "selected-btn" : ""
          }`}
          onClick={() => handleDataTypeChange("new_deaths")}
          title="new_deaths"
        >
          New deaths
        </button>

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

        <div>
          <button className="date-btns" onClick={() => adjustDate(-1, "day")}>
            Previous Day
          </button>
          <button className="date-btns" onClick={() => adjustDate(1, "day")}>
            Next Day
          </button>
          <button className="date-btns" onClick={() => adjustDate(-1, "month")}>
            Previous Month
          </button>
          <button className="date-btns" onClick={() => adjustDate(1, "month")}>
            Next Month
          </button>
          <button className="date-btns" onClick={() => adjustDate(-1, "year")}>
            Previous Year
          </button>
          <button className="date-btns" onClick={() => adjustDate(1, "year")}>
            Next Year
          </button>
        </div>

        <div style={{ color: "red", fontWeight: "bold", fontSize: 20 }}>
          <br />
          <br />
          The circles represent the states. Top 25 counties with higher{" "}
          {selectedDataType} per 100K is populated on each state
          <br />
          <br />
          Use the slider to change the date.
        </div>
      </div>
      <div
        className={"d3-component"}
        style={{ height: "99%", width: "99%" }}
        ref={d3Container}
      ></div>
    </div>
  );
}

export default BlackHat;
