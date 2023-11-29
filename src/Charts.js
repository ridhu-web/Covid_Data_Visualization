import React from "react";

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
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Row 1 */}
      <div style={{ display: "flex", flex: 1, height: "50%" }}>
        <div style={boxStyle}>Chart 1</div>
        <div style={boxStyle}>Chart 2</div>
        <div style={boxStyle}>Chart 3</div>
      </div>

      {/* Row 2 */}
      <div style={{ display: "flex", flex: 1, height: "50%" }}>
        <div style={boxStyle}>Chart 4</div>
        <div style={boxStyle}>Chart 5</div>
        <div style={boxStyle}>Chart 6</div>
      </div>
    </div>
  );
}

export default Charts;
