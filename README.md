# Project Documentation

## Overview

This project presents an interactive data visualization tool designed to analyze and display the distribution of COVID-19 data across the United States from March 2020 to January 2023. Utilizing React.js and NPM, the tool features a stacked choropleth map and a cartogram to visualize various COVID-19 related metrics, such as Social Vulnerability Index (SVI), case counts, death tolls, and vaccination rates, as well as obesity and smoking data across counties and states.

## Setup Instructions

To set up and run the project locally, follow these steps:

1. **Clone the Repository:**
'''
<p>Replace `<repository-url>` with the actual URL of the GitHub repository.</p>
'''
2. **Navigate to the Project Directory:**
Replace `<project-name>` with the name of the folder created by the cloning process.

3. **Install Dependencies:**
Using NPM, install the project's dependencies.

4. **Run the Application:**
This command will launch the application in your default web browser. If it doesn't open automatically, you can manually visit `http://localhost:3000` in your web browser.

Ensure you have Node.js and NPM installed on your system before proceeding with the setup instructions.

## Key Features

### Stacked Choropleth Map

- **Interactive Visualization**: Showcases the distribution of COVID-19 metrics and SVI across the USA, with user-friendly filters for specific features and timeframes.
- **Enhanced User Interaction**: Includes a left navigation bar with categorized, adaptive buttons for selecting data features. Selected options are highlighted for clarity.
- **Dynamic Time Selection**: Replaces the slider with a calendar for date selection, supplemented by navigation buttons for moving between days, months, and years.
- **Informative Tooltips**: Provide detailed information about counties, including name, state, and selected COVID-19 metrics.

### Cartogram (Top 25 View)

- **Focused Analysis**: Visualizes the top 25 counties based on selected parameters like cumulative/new cases and deaths per 100K population. States are represented by larger circles, with counties shown as smaller, size- and color-coded circles within.
- **Accessibility**: Updated color schemes to be color-blind friendly, enhancing accessibility.
- **Flexible Data Representation**: Allows users to toggle between absolute COVID-19 data values and density metrics (cases or deaths per 100K population).

### Interactive Charts

- **Obesity and Smoking Data Visualization**: Introduces scatter plots displaying the distribution of obesity and smoking rates, integrated with detailed state-specific charts upon selection.
- **Integration with React**: Utilizes Vega Lite for chart creation, seamlessly integrated into the React application for dynamic data exploration.

## Improvements from Beta Release

- **User Interface Enhancements**: Improved navigation and interaction within the stacked choropleth map by introducing a calendar-based date picker and adaptive button arrangement.
- **Color Scheme Revision**: Updated the cartogram to include color-blind friendly palettes, improving data accessibility and interpretation.

## Limitations and Future Scope

- **Generalized Data Input**: The initial goal to process user-provided JSON input for broader data analysis was not achieved due to time constraints, highlighting a potential area for future development.
- **Chart and Popup Integration**: Integration of charts and popups directly within the main views remains a future goal, with current implementations offered in additional views.
- **Initial Loading Bug**: A minor issue requiring user interaction to initialize the map view at first load is identified for future resolution.

## Conclusion

Hosted on GitHub, this project offers a comprehensive and accessible platform for COVID-19 data analysis, emphasizing user interaction and data visualization advancements. While achieving significant progress, identified limitations and future scopes provide avenues for ongoing development and enhancement.


### Project Details

* Project Title : Visualizing the Influence of Health Factors, Social Vulnerability, and COVID-19 Outcomes in the United States
* Team Members: Kavya Rama Nandana Sidda, Ridhuparan Kungumaraju, Chandhu Bhumireddy
* Project Manager: Kavya Rama Nandana Sidda
* Client name: Prof. Samantha Bond, Visiting Clinical Assistant Professor, Department of Physical Therapy and the Biomedical Visualization (BVIS), UIC
