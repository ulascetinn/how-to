import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import page components
import Home from "./pages/Home";
import Calculator from "./pages/Calculator";
import FlowRate from "./pages/FlowRate";
import FlowSpeed from "./pages/FlowSpeed";
import PressureLoss from "./pages/PressureLoss";
import AirReleaseValvePlacement from "./pages/AirReleaseValvePlacement";
import FlowGraphs from "./pages/FlowGraphs";
import Other from "./pages/Other";
import TechnicalDrawings from "./pages/TechnicalDrawings";
import NeedleValve from "./pages/NeedleValve"; // Import the new page

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/calculator/flow-rate" element={<FlowRate />} />
        <Route path="/calculator/flow-speed" element={<FlowSpeed />} />
        <Route path="/calculator/pressure-loss" element={<PressureLoss />} />
        <Route path="/calculator/other" element={<Other />} />
        <Route path="/flow-graphs" element={<FlowGraphs />} />
        <Route
          path="/air-release-valve-placement"
          element={<AirReleaseValvePlacement />}
        />
        <Route path="/technical-drawings" element={<TechnicalDrawings />} />
        <Route path="/needle-valve" element={<NeedleValve />} /> {/* Add the new route */}
      </Routes>
    </Router>
  );
}

export default App;
