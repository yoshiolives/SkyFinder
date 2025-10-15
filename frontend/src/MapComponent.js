/* global google */

import { GoogleMap, InfoWindow, LoadScript, Marker } from '@react-google-maps/api';
import React, { useMemo } from 'react';

// Constants to prevent re-renders - moved outside component
const LIBRARIES = ['places'];

const MapComponent = ({ selectedItem, onMarkerClick, itinerary }) => {
  // Convert itinerary to marker data - memoized to prevent unnecessary re-renders
  const markerData = useMemo(
    () =>
      itinerary.map((item) => ({
        id: item.id,
        lat: Number(item.coordinates[0]),
        lng: Number(item.coordinates[1]),
        title: item.location,
      })),
    [itinerary]
  );

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
        libraries={LIBRARIES}
      >
        <GoogleMap
          mapContainerStyle={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1,
          }}
          center={{ lat: 40.758, lng: -73.9855 }}
          zoom={10}
          onLoad={(map) => {
            console.log('Map loaded, fitting bounds...');
            setTimeout(() => {
              const bounds = new google.maps.LatLngBounds();
              markerData.forEach((marker) => {
                bounds.extend({ lat: marker.lat, lng: marker.lng });
              });
              map.fitBounds(bounds);
              console.log('Bounds fitted');
            }, 1000);
          }}
          options={{
            mapTypeId: 'roadmap',
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            fullscreenControl: true,
          }}
        >
          {/* Render markers */}
          {markerData.map((marker) => (
            <Marker
              key={marker.id}
              position={{ lat: marker.lat, lng: marker.lng }}
              onClick={() => onMarkerClick(marker.id)}
              title={marker.title}
              label={{
                text: marker.id.toString(),
                color: 'white',
                fontWeight: 'bold',
                fontSize: '16px',
              }}
              // Note: google.maps.Marker is deprecated as of Feb 2024
              // Consider migrating to AdvancedMarkerElement in the future
              // For now, keeping the current implementation for compatibility
            />
          ))}

          {/* Info Window */}
          {selectedItem && (
            <InfoWindow
              position={{
                lat: Number(selectedItem.coordinates[0]),
                lng: Number(selectedItem.coordinates[1]),
              }}
              onCloseClick={() => onMarkerClick(null)}
            >
              <div style={{ padding: '10px', minWidth: '200px' }}>
                <h3>{selectedItem.location}</h3>
                <p>
                  <strong>Day {selectedItem.day}</strong> • {selectedItem.time}
                </p>
                <p>{selectedItem.activity}</p>
                <p>{selectedItem.address}</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default MapComponent;
