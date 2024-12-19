import React, { useState, useEffect } from "react";
import {
  MapContainer,
  ImageOverlay,
  Marker,
  Popup,
  useMap,
  FeatureGroup,
} from "react-leaflet";
import floorplan from "../../assets/office.png";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
// import { EditControl } from "react-leaflet-draw";
import "leaflet-semicircle";
import Select from "react-select";
import HeaderButton from "../../header_button/HeaderButton";

// Import the CCTV and WiFi icons
import bulletCamIconUrl from "../../assets/cctvs/bulletcam.jpg";
import unvCamIconUrl from "../../assets/cctvs/Unvcam.jpg";

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
    // Create the semicircle with dynamic rotation
    const semiCircle = L.semiCircle(position, {
      radius,
      // Dynamically adjust start and stop angles
      startAngle: startAngle + rotationAngle,
      stopAngle: stopAngle + rotationAngle,
      color: "blue",
      fillColor: "rgba(0, 0, 255, 0.3)",
      fillOpacity: fillOpacity,
      weight: 0,
    });
    semiCircle.addTo(map);
    // Cleanup on unmount
    return () => {
      map.removeLayer(semiCircle);
    };
  }, [
    map,
    position,
    radius,
    startAngle,
    stopAngle,
    rotationAngle,
    fillOpacity,
  ]);
  return null;
}

function CameraCoverageView() {
  const imageWidth = 1920;
  const imageHeight = 1080;

  // Predefined camera models with enhanced details
  const cameraModels = [
    {
      name: "Bullet Camera",
      label: "Bullet",
      startFov: 0,
      value: 70,
      maxFoV: 70,
      maxDistance: 380,
      icon: bulletCameraIcon,
      color: "rgba(0, 0, 255, 0.3)", // Blue with transparency
    },
    {
      name: "UNV Camera",
      label: "Unv",
      startFov: 0,
      value: 90,
      maxFoV: 90,
      maxDistance: 320,
      icon: unvCameraIcon,
      color: "rgba(255, 0, 0, 0.3)", // Red with transparency
    },
  ];

  // Initial state
  const [cctvPoints, setCCTVPoints] = useState([]);
  // const [polylines, setPolylines] = useState([]); // For storing drawn polyline coordinates
  const [selectedModel, setSelectedModel] = useState(null);
  console.log(cctvPoints);
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
          rotationAngle: 0, //fov rotation angle
          fillOpacity: 0.3, //opacity
        },
      ]);
    } else {
      alert("Please select a camera model first!");
    }
  };

  const handleMarkerDragEnd = (event, index) => {
    let { lat, lng } = event.target.getLatLng();

    // fix the coordinates to bounds of the image
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

  console.log(cctvPoints);

  // Handle Polyline Creation
  // const handlePolylineCreated = (e) => {
  //   if (e.layerType === "polyline") {
  //     const coordinates = e.layer.getLatLngs();
  //     setPolylines((prevPolylines) => [...prevPolylines, coordinates]);
  //     console.log("Polyline created:", coordinates);
  //   }
  // };

  // // Handle Polyline Deletion
  // const handlePolylineDeleted = (e) => {
  //   let deletedCount = 0;
  //   e.layers.eachLayer((layer) => {
  //     const coords = layer.getLatLngs();
  //     setPolylines((prevPolylines) =>
  //       prevPolylines.filter(
  //         (polyline) => JSON.stringify(polyline) !== JSON.stringify(coords)
  //       )
  //     );
  //     deletedCount++;
  //   });
  //   console.log(`Deleted ${deletedCount} polyline(s)`);
  // };

  return (
    <>
      <div style={{ height: "100vh", width: "100vw", display: "flex" }}>
        {/* sidebar and dropdown for different camera models and their specifications */}
        <div
          style={{
            width: "300px",
            padding: "10px",
            backgroundColor: "#303030",
            color: "white",
            overflowY: "auto",
          }}
        >
          <h3>Camera Configuration</h3>

          {/* selecting the camera model */}
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

          {/* Add Camera Point Button */}
          <HeaderButton
                    onClick={addCCTVPoint} // Function to handle the button click
          title="Add Router Point" // Text displayed when hovering over the button
          name="Add Router Point" // Name identifier for the button
          className="sidebar-button" // CSS class for styling
          icon={null} // Optional; can pass an icon or leave as null
          disabled={!selectedModel} // Optional; controls whether the button is disabled
          type="button" // Optional; default type for a button
         />
        </div>

        {/* Map Container- contains floormap using react leaflet */}
        <MapContainer
          zoom={-1}
          center={[imageHeight / 2, imageWidth / 2]}
          minZoom={-2}
          bounds={bounds}
          style={{ height: "100%", width: "100%" }}
          crs={L.CRS.Simple}
        >
          <ImageOverlay zIndex={1} url={floorplan} bounds={bounds} />

          {/* <FeatureGroup>
            {/* Drawing Controls */}
          {/* <EditControl
              position="topright"
              onCreated={handlePolylineCreated}
              onDeleted={handlePolylineDeleted}
              draw={{
                polyline: {
                  shapeOptions: {
                    color: "green",
                    weight: 4,
                  },
                },
                rectangle: false,
                circle: false,
                circlemarker: false,
                marker: false,
                polygon: false,
              }}
            /> */}
          {/* </FeatureGroup> */}

          {cctvPoints.map(
            (
              { position, model, rotationAngle = 0, fillOpacity = 0.3 },
              index
            ) => (
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

                    {/* Rotation Control to camera angles */}
                    <div style={{ marginBottom: "10px" }}>
                      <label>Swipe to Rotate</label>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={rotationAngle}
                        onChange={(e) =>
                          updateCameraSettings(index, {
                            rotationAngle: Number(e.target.value),
                          })
                        }
                        style={{ width: "100%" }}
                      />
                    </div>

                    {/* Delete camera button */}
                    <button
                      onClick={() => deleteMarker(index)}
                      style={{
                        backgroundColor: "red",
                        color: "white",
                        padding: "5px 10px",
                        border: "none",
                        borderRadius: "5px",
                      }}
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
    </>
  );
}

export default CameraCoverageView;
