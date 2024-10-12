// components/Map.js
"use client";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useCallback, useRef } from "react";
import styles from "./Map.module.css"; // Optional: Create CSS module for custom styling

const Map = ({ jobs }) => {
  const mapRef = useRef(null);

  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);
  const apiKey = "AIzaSyBJ_KG6ykrtije7hb4BGwBIus3SoltgEcU";
  return (
    // <LoadScript googleMapsApiKey={apiKey}>
    <GoogleMap
      mapContainerClassName={styles.mapContainer} // Custom styling
      center={{ lat: 40.7128, lng: -74.006 }} // Default center (NYC)
      zoom={12}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        styles: [
          /* Optional: Add custom Google Maps styling for a unique look */
        ],
        disableDefaultUI: true, // Hide default UI controls for a clean design
        zoomControl: true,
      }}
    >
      {jobs.map((job, index) => (
        <Marker
          key={index}
          position={{ lat: job.lat, lng: job.lng }}
          title={job.title}
        />
      ))}
    </GoogleMap>
    // </LoadScript>
  );
};

export default Map;
