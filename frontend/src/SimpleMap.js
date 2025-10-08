import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import React from 'react';

const SimpleMap = () => {
  const mapContainerStyle = {
    width: '100%',
    height: '400px',
  };

  const center = {
    lat: 40.758,
    lng: -73.9855,
  };

  const locations = [
    { lat: 40.7829, lng: -73.9654, title: 'Central Park' },
    { lat: 40.7794, lng: -73.9632, title: 'Metropolitan Museum' },
    { lat: 40.758, lng: -73.9855, title: 'Times Square' },
    { lat: 40.6892, lng: -74.0445, title: 'Statue of Liberty' },
    { lat: 40.7061, lng: -73.9969, title: 'Brooklyn Bridge' },
  ];

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={10}>
        {locations.map((location, index) => (
          <Marker
            key={index}
            position={location}
            title={location.title}
            label={{
              text: (index + 1).toString(),
              color: 'white',
              fontWeight: 'bold',
            }}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default SimpleMap;
