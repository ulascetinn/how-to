import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import page components
import Home from "./pages/Home";
import Calculator from "./pages/Calculator";
import FlowRate from "./pages/FlowRate";
import FlowSpeed from "./pages/FlowSpeed";
import PressureLoss from "./pages/PressureLoss";
import FlowGraphs from "./pages/FlowGraphs";
import TechnicalDrawings from "./pages/TechnicalDrawings";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/calculator/flow-rate" element={<FlowRate />} />
        <Route path="/calculator/flow-speed" element={<FlowSpeed />} />
        <Route path="/calculator/pressure-loss" element={<PressureLoss />} />
        <Route path="/flow-graphs" element={<FlowGraphs />} />
        <Route path="/technical-drawings" element={<TechnicalDrawings />} />
      </Routes>
    </Router>
  );
}

export default App;
