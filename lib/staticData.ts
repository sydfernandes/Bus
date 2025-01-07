// This file will contain static data for GitHub Pages deployment
export const staticBusData = {
  lines: [],  // Add your static bus line data here
  stops: [],  // Add your static bus stop data here
};

export const getStaticBusLines = () => {
  return staticBusData.lines;
};

export const getStaticBusStops = () => {
  return staticBusData.stops;
};
