import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// source 1: https://react-leaflet.js.org/docs/start-introduction/
//source 2: https://openrouteservice.org/
//soruce 3: https://github.com/K4ryuu/ors-client
//soruce 4: https://openrouteservice.org/dev/#/api-docs/v2/directions/{profile}/post check options tab for round routing 

function App() {
  return (
    <MapContainer
      center={[43.0766, -89.4125]}
      zoom={12}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position = {[43.0747, -89.3841]}>
          <Popup> This is the capitol! </Popup>
      </Marker>
    </MapContainer>
  );
}

export default App;