import React, { useState, useEffect } from "react";
import "./App.css";

import Blackhat from "./Blackhat";
import Whitehat from "./StackedMap";
import * as d3 from "d3";
import sviData from "./svi_data.json";
import Charts from "./Charts";

function App() {
  //state deciding if we are looking at the blackhat or whitehat visualization
  const [viewToggle, setViewToggle] = useState("blackhat");

  //state for the data, since it loads asynchronously
  const [map, setMap] = useState();
  const [usMap, setUSMap] = useState();

  //load map contours
  //react looks into the '/public' folder by default
  async function loadMapData() {
    try {
      const response = await fetch(
        "https://unpkg.com/us-atlas@3/counties-10m.json"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Map data loaded successfully");
      setMap(data); // Directly using setMap assuming it's available in the scope
    } catch (error) {
      console.error("Error loading map data:", error);
      throw error; // Re-throw to handle it in the caller function
    }
  }

  async function loadUSMapData() {
    try {
      const us = await d3.json("https://unpkg.com/us-atlas@2/us/10m.json");
      console.log("Map data loaded successfully");
      setUSMap(us);
    } catch (error) {
      console.error("Error loading map data:", error);
      throw error; // Re-throw to handle it in the caller function
    }
  }

  //fetch data, called only once
  useEffect(() => {
    loadMapData();
    loadUSMapData();
    console.log("svi", sviData);
  }, []);

  // //called to draw the whitehat visualization
  function makeWhiteHat() {
    return (
      <>
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "inline-block",
          }}
        >
          <div
            style={{
              height: "100%",
              width: "100%",
              display: "inline-block",
            }}
          >
            <div style={{ fontWeight: "bold" }}>
              Stacked Choropleth Map for Covid Analysis with Health Factors and
              SVI Data
            </div>
            <div style={{ fontWeight: "bold", color: "red" }}>
              The SVI data is populated on the Map. The size of the bubble
              represents the Covid Data. The color of the bubble represents the
              Vaccination Data. The Slider is used to change the Date.
            </div>
            <div style={{ fontWeight: "bold", color: "black" }}>
              If the map is reloaded, please click on the svi data, covid data,
              Vaccination data and change the slider to see the map.
            </div>
            {/* <div style={{ fontSize: '0.8em' }}>Choropleth Map to illustrate the following factors</div> */}

            <Whitehat map={map} data={sviData} />
          </div>
        </div>
      </>
    );
  }

  //function for a simpler chloropleth map
  function makeBlackHat() {
    return (
      <>
        <div
          style={{
            width: "100vw",
            height: "calc(100vh)",
            display: "inline-block",
          }}
        >
          <div
            style={{
              height: "100%",
              width: "calc(100%)",
              display: "inline-block",
            }}
          >
            <Blackhat map={usMap} />
          </div>
        </div>
      </>
    );
  }

  //toggle which visualization we're looking at based on the "viewToggle" state
  const hat = () => {
    if (viewToggle === "Stacked Choropleth Map") {
      //return makeWhiteHat();
      return makeWhiteHat();
    } else if (viewToggle === "Grid View") {
      return makeBlackHat();
    } else if (viewToggle === "Obesity Charts") {
      return <Charts />;
    } else if (viewToggle === "Smoking Charts") {
      return <Charts />;
    } else {
      return makeWhiteHat();
    }
  };

  return (
    <div className="App">
      <div
        className={"header"}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "2em",
          width: "100vw",
        }}
      >
        <button
          onClick={() => setViewToggle("Stacked Choropleth Map")}
          className={
            viewToggle === "Stacked Choropleth Map"
              ? "inactiveButton"
              : "activeButton"
          }
        >
          {"Stacked Choropleth Map"}
        </button>
        <button
          onClick={() => setViewToggle("Grid View")}
          className={
            viewToggle === "Grid View" ? "inactiveButton" : "activeButton"
          }
        >
          {"Top 25 Counties"}
        </button>
        <button
          onClick={() => setViewToggle("Smoking Charts")}
          className={
            viewToggle === "Smoking Charts" ? "inactiveButton" : "activeButton"
          }
        >
          {"Smoking Linked Charts"}
        </button>
        <button
          onClick={() => setViewToggle("Obesity Charts")}
          className={
            viewToggle === "Obesity Charts" ? "inactiveButton" : "activeButton"
          }
        >
          {"Obesity Linked Charts"}
        </button>
      </div>
      <div
        className={"body"}
        style={{ height: "calc(100vh - 2.5em)", width: "100vw" }}
      >
        {hat()}
      </div>
    </div>
  );
}

export default App;
