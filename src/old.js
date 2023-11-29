import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import * as topojson from "topojson";
import useSVGCanvas from "./useSVGCanvas";

function WhiteHat(props) {
  const d3Container = useRef(null);
  const [svg, height, width] = useSVGCanvas(d3Container);

  useEffect(() => {
    if (svg && props.map && props.data) {
      // Clear earlier drawings
      svg.selectAll("g").remove();

      // Create a map of fips codes to poverty levels
      const povertyMap = new Map(
        props.data.map((d) => [d.fips, d.below_150_percent_poverty])
      );

      console.log("povertyMap", povertyMap);

      // Create a color scale for poverty levels
      const colorScale = d3
        .scaleSequential()
        .domain(d3.extent(props.data, (d) => d.below_150_percent_poverty))
        .interpolator(d3.interpolateBlues);

      // Set up projection and path
      const projection = d3
        .geoAlbersUsa()
        .scale(1280)
        .translate([width / 2, height / 2]);
      const path = d3.geoPath().projection(projection);

      // Draw the map
      try {
        const usMap = props.map;
        const counties = topojson.feature(usMap, usMap.objects.counties);

        svg
          .selectAll(".county")
          .data(counties.features)
          .enter()
          .append("path")
          .attr("class", "county")
          .attr("d", path)
          // Set fill based on poverty level
          .attr("fill", (d) => {
            const povertyLevel = povertyMap.get(parseInt(d.id));
            console.log("povertyLevel", povertyLevel);
            return povertyLevel ? colorScale(povertyLevel) : "#ddd";
          });
      } catch (error) {
        console.error("Error rendering map:", error);
      }
    }
  }, [svg, props.map, props.data, height, width]);

  return (
    <>
      <div
        className={"d3-component"}
        style={{ height: "99%", width: "99%" }}
        ref={d3Container}
      ></div>
      <div>
        <button
          onClick={() => handleDataTypeChange("below_150_percent_poverty")}
        >
          Poverty Level
        </button>
        <button onClick={() => handleDataTypeChange("no_health_insurance")}>
          Health Insurance
        </button>
        {/* Add more buttons for other data types as needed */}
      </div>
    </>
  );
}

export default WhiteHat;

// import React, { useEffect, useRef, useState, useMemo } from "react";
// import * as d3 from "d3";
// import * as topojson from "topojson";
// import useSVGCanvas from "./useSVGCanvas";

// function WhiteHat(props) {
//   const d3Container = useRef(null);
//   const [svg, height, width, tTip] = useSVGCanvas(d3Container);
//   console.log("map", props.map);
//   const projection = d3
//     .geoAlbersUsa()
//     .scale(1280)
//     .translate([width / 2, height / 2]);
//   const path = d3.geoPath().projection(projection);

//   const mapGroupSelection = useMemo(() => {
//     //wait until the svg is rendered and data is loaded
//     if ((svg !== undefined) & (props.map !== undefined)) {
//       //clear earlier drawings
//       svg.selectAll("g").remove();
//       //draw the map
//       usMap = props.map;
//       const counties = topojson.feature(usMap, usMap.objects.counties);
//       console.log("Counties loaded successfully", counties);
//       let mapGroup = svg
//         .selectAll(".county")
//         .data(counties.features)
//         .enter()
//         .append("path")
//         .attr("class", "county")
//         .attr("d", path)
//         .attr("fill", "#ddd"); // Example fill, modify as needed

//       console.log("Counties created successfully");

//       //draw a color legend, automatically scaled based on data extents

//       return mapGroup;
//     }
//   }, [svg, props.map]);
//   return (
//     <div
//       className={"d3-component"}
//       style={{ height: "99%", width: "99%" }}
//       ref={d3Container}
//     ></div>
//   );
// }

// export default WhiteHat;
