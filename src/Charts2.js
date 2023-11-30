import React, { useEffect } from "react";
import VegaChart2 from "./VegaChart2";

function Charts2() {
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
      <VegaChart2 />
    </div>
  );
}

export default Charts2;
