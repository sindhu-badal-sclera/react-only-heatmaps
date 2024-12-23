import React, { useState, useEffect } from "react";
import {
  MapContainer,
  ImageOverlay,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import floorplan from "../../assets/office.png";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-semicircle";
import Select from "react-select";
import HeaderButton from "../../header_button/HeaderButton";

// Import the CCTV and WiFi icons
import bulletCamIconUrl from "../../assets/cctvs/bulletcam.jpg";
import unvCamIconUrl from "../../assets/cctvs/Unvcam.jpg";

// Import styles
import styles from "./CameraCoverageView.module.css";

const bulletCameraIcon = new L.Icon({
  iconUrl: bulletCamIconUrl,
  iconSize: [35, 35],
});

const unvCameraIcon = new L.Icon({
  iconUrl: unvCamIconUrl,
  iconSize: [25, 25],
});

function SemiCircleComponent({
  position,
  radius,
  startAngle,
  stopAngle,
  rotationAngle = 0,
  fillOpacity = 0.3,
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const semiCircle = L.semiCircle(position, {
      radius,
      startAngle: startAngle + rotationAngle,
      stopAngle: stopAngle + rotationAngle,
      color: "blue",
      fillColor: "rgba(0, 0, 255, 0.3)",
      fillOpacity: fillOpacity,
      weight: 0,
    });
    semiCircle.addTo(map);
    return () => {
      map.removeLayer(semiCircle);
    };
  }, [map, position, radius, startAngle, stopAngle, rotationAngle, fillOpacity]);

  return null;
}

function CameraCoverageView() {
  const imageWidth = 1920;
  const imageHeight = 1080;

  const cameraModels = [
    {
      name: "Bullet Camera",
      label: "Bullet",
      startFov: 0,
      value: 70,
      maxFoV: 70,
      maxDistance: 380,
      icon: bulletCameraIcon,
      color: "rgba(0, 0, 255, 0.3)",
    },
    {
      name: "UNV Camera",
      label: "Unv",
      startFov: 0,
      value: 90,
      maxFoV: 90,
      maxDistance: 320,
      icon: unvCameraIcon,
      color: "rgba(255, 0, 0, 0.3)",
    },
  ];

  const [cctvPoints, setCCTVPoints] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);

  const bounds = [
    [0, 0],
    [imageHeight, imageWidth],
  ];

  const addCCTVPoint = () => {
    if (selectedModel) {
      setCCTVPoints((prevPoints) => [
        ...prevPoints,
        {
          position: [imageHeight / 2, imageWidth / 2],
          model: selectedModel,
          rotationAngle: 0,
          fillOpacity: 0.3,
        },
      ]);
    } else {
      alert("Please select a camera model first!");
    }
  };

  const handleMarkerDragEnd = (event, index) => {
    let { lat, lng } = event.target.getLatLng();
    lat = Math.min(Math.max(lat, 0), imageHeight);
    lng = Math.min(Math.max(lng, 0), imageWidth);

    setCCTVPoints((prevPoints) => {
      const newPoints = [...prevPoints];
      newPoints[index].position = [lat, lng];
      return newPoints;
    });
  };

  const updateCameraSettings = (index, updates) => {
    setCCTVPoints((prevPoints) => {
      const newPoints = [...prevPoints];
      newPoints[index] = { ...newPoints[index], ...updates };
      return newPoints;
    });
  };

  const deleteMarker = (index) => {
    setCCTVPoints((prevPoints) => prevPoints.filter((_, i) => i !== index));
  };

  return (
    <div style={{ height: "100vh", width: "100vw", display: "flex" }}>
      <div className={styles.sidebar}>
        <h3>Camera Configuration</h3>
        <div style={{ marginBottom: "15px" }}>
          <label>Select Camera Model:</label>
          <Select
            options={cameraModels.map((model) => ({
              value: model,
              label: `${model.name} (FoV: ${model.maxFoV}°, Range: ${model.maxDistance}m)`,
            }))}
            onChange={(selectedOption) =>
              setSelectedModel(selectedOption.value)
            }
          />
        </div>
        <HeaderButton
          onClick={addCCTVPoint}
          title="Add Camera"
          name="Add Camera"
          className={styles["sidebar-button"]}
          icon={null}
          disabled={!selectedModel}
          type="button"
        />
      </div>

      <MapContainer
        zoom={-1}
        center={[imageHeight / 2, imageWidth / 2]}
        minZoom={-2}
        bounds={bounds}
        style={{ height: "100%", width: "100%" }}
        crs={L.CRS.Simple}
      >
        <ImageOverlay zIndex={1} url={floorplan} bounds={bounds} />
        {cctvPoints.map(
          ({ position, model, rotationAngle = 0, fillOpacity = 0.3 }, index) => (
            <Marker
              key={index}
              position={position}
              icon={model.icon}
              draggable={true}
              eventHandlers={{
                dragend: (event) => handleMarkerDragEnd(event, index),
              }}
            >
              <Popup>
                <div style={{ minWidth: "250px" }}>
                  <h4>{model.name} Details</h4>
                  <div style={{ marginBottom: "10px" }}>
                    <label>Swipe to Rotate</label>
                    <input
                      className={styles["range-input"]}
                      type="range"
                      min="0"
                      max="360"
                      value={rotationAngle}
                      onChange={(e) =>
                        updateCameraSettings(index, {
                          rotationAngle: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <button
                    className={styles["delete-button"]}
                    onClick={() => deleteMarker(index)}
                  >
                    Delete Camera
                  </button>
                </div>
              </Popup>

              <SemiCircleComponent
                position={position}
                radius={model.maxDistance}
                startAngle={0}
                stopAngle={model.maxFoV}
                rotationAngle={rotationAngle}
                fillOpacity={fillOpacity}
              />
            </Marker>
          )
        )}
      </MapContainer>
    </div>
  );
}

export default CameraCoverageView;
