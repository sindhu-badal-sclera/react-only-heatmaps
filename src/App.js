import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CameraCoverageView from "./components/camera_coverage_container/CameraCoverageView";
import WifiHeatmapVisualizer from "./components/wifiheatmap_container/WifiHeatmapVisualizer";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("wifi");

  function handleClick(tab) {
    setActiveTab(tab);
  }

  return (
    <Router>
      <div className="app-container">
        {/* Navigation bar */}
        <nav className="navbar">
          <Link
            to="/"
            className={`nav-link ${activeTab === "wifi" ? "active-tab" : ""}`}
            onClick={() => handleClick("wifi")}
          >
            WiFi Heatmaps
          </Link>

          <Link
            to="/cctv"
            className={`nav-link ${activeTab === "cctv" ? "active-tab" : ""}`}
            onClick={() => handleClick("cctv")}
          >
            CCTV Cameras
          </Link>
        </nav>

        {/* Define Routes */}
        <Routes>
          <Route path="/" element={<WifiHeatmapVisualizer />} />
          <Route path="/cctv" element={<CameraCoverageView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
