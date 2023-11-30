import React, { useEffect } from "react";
import VegaChart1 from "./VegaChart1";

function Charts() {
  // Styling for the boxes
  const boxStyle = {
    flex: 1,
    width: "33.33%",
    border: "2px solid black", // add a border to visualize the box
    display: "flex",
    alignItems: "center", // center content vertically
    justifyContent: "center", // center content horizontally
  };

  return (
    <div>
      <VegaChart1 />
    </div>
  );
}

export default Charts;
