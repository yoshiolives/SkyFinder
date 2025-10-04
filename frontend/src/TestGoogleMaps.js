import React, { useState, useEffect } from 'react';
import { LoadScript, GoogleMap, Marker } from '@react-google-maps/api';

const TestGoogleMaps = () => {
  const [apiKey, setApiKey] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [testResult, setTestResult] = useState('');

  useEffect(() => {
    // Get the API key from environment or use the provided key
    const key = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "AIzaSyDLE75-5w3zdWvc0Z2RJjifAJZLYzZi67w";
    setApiKey(key);
  }, []);

  const testApiKey = () => {
    setTestResult('Testing API key...');
    setError(null);
    
    // Test if the API key is valid by making a simple request
    const testUrl = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    
    fetch(testUrl)
      .then(response => {
        if (response.ok) {
          setTestResult('✅ API key appears to be valid!');
        } else {
          setTestResult('❌ API key test failed');
          setError(`HTTP ${response.status}: ${response.statusText}`);
        }
      })
      .catch(err => {
        setTestResult('❌ Network error testing API key');
        setError(err.message);
      });
  };

  const handleLoad = () => {
    setIsLoaded(true);
    setTestResult('✅ Google Maps loaded successfully!');
  };

  const handleError = (error) => {
    setError(error.message || 'Unknown error');
    setTestResult('❌ Google Maps failed to load');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>🗺️ Google Maps API Key Test</h2>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Current API Key:</h3>
        <code style={{ 
          display: 'block', 
          padding: '10px', 
          backgroundColor: '#e0e0e0', 
          borderRadius: '4px',
          wordBreak: 'break-all'
        }}>
          {apiKey}
        </code>
        
        <button 
          onClick={testApiKey}
          style={{
            marginTop: '10px',
            padding: '10px 20px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test API Key
        </button>
      </div>

      {testResult && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: testResult.includes('✅') ? '#e8f5e8' : '#ffe8e8',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <strong>Test Result:</strong> {testResult}
        </div>
      )}

      {error && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#ffe8e8',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <h3>Google Maps Test:</h3>
        <div style={{ height: '400px', border: '2px solid #ccc', borderRadius: '8px' }}>
          <LoadScript
            googleMapsApiKey={apiKey}
            onLoad={handleLoad}
            onError={handleError}
          >
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={{ lat: 40.7128, lng: -74.0060 }}
              zoom={10}
            >
              <Marker position={{ lat: 40.7128, lng: -74.0060 }} />
            </GoogleMap>
          </LoadScript>
        </div>
      </div>

      <div style={{ padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
        <h4>How to fix API key issues:</h4>
        <ol>
          <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
          <li>Create a project or select existing one</li>
          <li>Enable "Maps JavaScript API"</li>
          <li>Create credentials → API Key</li>
          <li>Copy the API key</li>
          <li>Add to your <code>.env</code> file: <code>REACT_APP_GOOGLE_MAPS_API_KEY=your_key_here</code></li>
          <li>Restart the React server</li>
        </ol>
      </div>
    </div>
  );
};

export default TestGoogleMaps;
