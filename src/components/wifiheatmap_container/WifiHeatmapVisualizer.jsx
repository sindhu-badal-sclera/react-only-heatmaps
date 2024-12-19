import {
    MapContainer,
    ImageOverlay,
    Marker,
    Popup,
    SVGOverlay,
  } from "react-leaflet";
  import floorplan from "../../assets/office.png";
  import "leaflet/dist/leaflet.css";
  import L from "leaflet";
  import { useState } from "react";
  import "./WiFiSignalVisualizer.module.css";

  import wifiIconUrl from "../../assets/router.png";

  const wifiIcon = new L.Icon({
    iconUrl: wifiIconUrl,
    iconSize: [30, 30],
  });
  
  const signalStrengthData = [
    {
      model: "RUCKUS R670",
      manufacturer: "RUCKUS Networks",
      signal_strength_0_to_5_metres: "-45 dBm",
      signal_strength_5_to_15_metres: "-60 dBm",
      signal_strength_15_to_30_metres: "-80 dBm",
      signal_strength_30_to_50_metres: "-90 dBm"
    }
  ];
  
  function dBmToOffset(dBm, strongestDbm = -45, weakestDbm = -90) {
    console.log(dBm)
    // Normalize the dBm value to a percentage between 0% and 100%
    const offset = ((dBm - strongestDbm) / (weakestDbm - strongestDbm)) * 100;
  
    // Tie the offset to stay in range (0% to 100% for intermediate stops)
    return Math.min(Math.max(offset, 1), 99);
  }
  
   
  // Using the data from signalStrengthData
  const modelData = signalStrengthData[0];
  console.log(modelData)
  const signalStrengthOffsets = {
    signal_strength_0_to_5_metres_offset: dBmToOffset(parseInt(modelData.signal_strength_0_to_5_metres)),
    signal_strength_5_to_15_metres_offset: dBmToOffset(parseInt(modelData.signal_strength_5_to_15_metres)),
    signal_strength_15_to_30_metres_offset: dBmToOffset(parseInt(modelData.signal_strength_15_to_30_metres)),
    signal_strength_30_to_50_metres_offset: dBmToOffset(parseInt(modelData.signal_strength_30_to_50_metres))
  };
  
  // Checking offsets
  console.log(signalStrengthOffsets);
  
  function WifiHeatmapVisualizer() {
    const imageWidth = 1920;
    const imageHeight = 1080;
  

    const initialAddressPoints = [
      [430, 380],
      [610, 1530],
      [910, 1700],
    ];
  
    const [addressPoints, setAddressPoints] = useState(initialAddressPoints);
  
    const bounds = [
      [0, 0],
      [imageHeight, imageWidth],
    ];
  
    const handleMarkerDragEnd = (event, index) => {
      let { lat, lng } = event.target.getLatLng();
  
      // Constrain coordinates to the bounds of the image
      lat = Math.min(Math.max(lat, 0), imageHeight);
      lng = Math.min(Math.max(lng, 0), imageWidth);
  
      setAddressPoints((prevPoints) => {
        const newPoints = [...prevPoints];
        newPoints[index] = [lat, lng];
        return newPoints;
      });
    };
  
    const createAP = () => {
      // Add a new marker at the center of the image
      setAddressPoints((prevPoints) => [
        ...prevPoints,
        [imageHeight / 2, imageWidth / 2],
      ]);
    };
  
    const deleteMarker = (index) => {
      setAddressPoints((prevPoints) => {
        const newPoints = [...prevPoints];
        newPoints.splice(index, 1); // Remove the marker at the given index
        return newPoints;
      });
    };
  
    console.log("signalStrengthOffsets: " + JSON.stringify(signalStrengthOffsets));

    //Legends UI - To display differnet signal strength
    const legendStyles = {
        container: {
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          color: "black",
          padding: "16px",
          backgroundColor: "inherit",
          zIndex: "400",
        },
        innerContainer: {
          maxWidth: "1000px",
          margin: "0 auto",
        },
        title: {
          fontSize: "18px",
          fontWeight: 600,
          marginBottom: "8px",
        },
        legendItems: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        },
        item: {
          display: "flex",
          alignItems: "center",
        },
        colorIndicator: {
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          marginRight: "8px",
        },
      };
     
      function Legend() {
        return (
          <div style={legendStyles.container}>
            <div style={legendStyles.innerContainer}>
              <div style={legendStyles.legendItems}>
                <div style={legendStyles.item}>
                  <div
                    style={{
                      ...legendStyles.colorIndicator,
                      backgroundColor: "green",
                      opacity: 0.8,
                    }}
                  ></div>
                  <span>Excellent (-45 dBm) | 0-5m</span>
                </div>
                <div style={legendStyles.item}>
                  <div
                    style={{
                      ...legendStyles.colorIndicator,
                      backgroundColor: "yellow",
                      opacity: 0.8,
                    }}
                  ></div>
                  <span>Good (-60 dBm) | 5-15m</span>
                </div>
                <div style={legendStyles.item}>
                  <div
                    style={{
                      ...legendStyles.colorIndicator,
                      backgroundColor: "orange",
                      opacity: 1,
                    }}
                  ></div>
                  <span>Fair (-80 dBm) | 15-30m</span>
                </div>
                <div style={legendStyles.item}>
                  <div
                    style={{
                      ...legendStyles.colorIndicator,
                      backgroundColor: "red",
                      opacity: 0.5,
                    }}
                  ></div>
                  <span>Poor (-90 dBm) | 30-50m</span>
                </div>
              </div>
            </div>
          </div>
        );
      }
  
    return (
      <>
      <div style={{ height: "100vh", width: "100vw" }}>

<button onClick={createAP} style={{ position: "absolute", zIndex: 1000,top:"50px", left :"70px" }}>
  Add a Router Point
</button>

<MapContainer
  zoom={-1}
  center={[imageHeight / 2, imageWidth / 2]}
  minZoom={-2}
  bounds={bounds}
  style={{ height: "100%", width: "100%" }}
  crs={L.CRS.Simple}
  className="animated-map-container"
>
  <ImageOverlay zIndex={1} url={floorplan} bounds={bounds} />

  {addressPoints.map(([y, x], index) => (

    <Marker
    icon={wifiIcon}
      key={index}
      position={[y, x]}
      draggable={true}
      eventHandlers={{
        dragend: (event) => handleMarkerDragEnd(event, index),
      }}
    >
      <Popup>
        <div>
          <p>Router at [{y.toFixed(0)}, {x.toFixed(0)}]</p>
          <button
            onClick={() => deleteMarker(index)}
            style={{ backgroundColor: "red", color: "white", padding: "5px" }}
          >
            Delete Router Point
          </button>
        </div>
      </Popup>
    </Marker>
  ))}


   {/* SVG component using dynamic offsets */}
  <SVGOverlay bounds={bounds} style={{ pointerEvents: "none" }}>
    <defs>
      <radialGradient id="wifiGradient" cx="50%" cy="50%" r="50%">
        <stop offset={`${signalStrengthOffsets.signal_strength_0_to_5_metres_offset}%`} stopColor="green" stopOpacity={0.8} />
        <stop offset={`${signalStrengthOffsets.signal_strength_5_to_15_metres_offset}%`} stopColor="yellow" stopOpacity={0.8} />
        <stop offset={`${signalStrengthOffsets.signal_strength_15_to_30_metres_offset}%`} stopColor="orange" stopOpacity={0.75} />
        <stop offset={`${signalStrengthOffsets.signal_strength_30_to_50_metres_offset}%`} stopColor="red" stopOpacity={0.2} />
      </radialGradient>
    </defs>

    {addressPoints.map(([y, x], index) => {
      const cxPercent = ((x / imageWidth) * 100).toFixed(2);
      const cyPercent = ((1 - y / imageHeight) * 100).toFixed(2);

      return (
        <circle
          key={index}
          cx={`${cxPercent}%`}
          cy={`${cyPercent}%`}
          r="20%"
          fill="url(#wifiGradient)"
          opacity="0.8"
          className="pulsing-circle"
        />
      );
    })}
  </SVGOverlay>
<Legend/>

</MapContainer>
</div></>
    );
  }
  
  export default WifiHeatmapVisualizer;
