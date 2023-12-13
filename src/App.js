import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  serverTimestamp,
  doc,
  setDoc,
} from "firebase/firestore";
import opencage from "opencage-api-client";
// Replace with your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDTTQkVOY3NezrG_BRef61nQIA3yxofdHc",
  authDomain: "location-18b18.firebaseapp.com",
  projectId: "location-18b18",
  storageBucket: "location-18b18.appspot.com",
  messagingSenderId: "438374169446",
  appId: "1:438374169446:web:d97cc67e304f5ddffb66a7",
  measurementId: "G-BQD8EE7PCF",
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const apiKey = 'bd69b4c44a284231b226afe887a53579';

const LocationComponent = () => {
  const [userAddress, setUserAddress] = useState('');
  const [userIp, setUserIp] = useState('');
  const [userAgent, setUserAgent] = useState('');
  const [geolocationAccuracy, setGeolocationAccuracy] = useState(null);
  const [locationTimestamp, setLocationTimestamp] = useState(null);
  const [googleMapsLink, setGoogleMapsLink] = useState('');

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        let locationRef;

        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;

          // Use OpenCage to get address from coordinates
          const apiKey = 'bd69b4c44a284231b226afe887a53579';
          const response = await opencage.geocode({ q: `${latitude},${longitude}`, key: apiKey });

          const formattedAddress = response?.results[0]?.formatted || 'Address not available';

          // Get user's IP address
          const responseIp = await fetch('https://api64.ipify.org?format=json');
          const ipData = await responseIp.json();
          const userIpAddress = ipData.ip || 'IP not available';

          // Get user agent
          const userAgent = window.navigator.userAgent || 'User agent not available';

          // Get geolocation accuracy
          const accuracy = position.coords.accuracy;
          setGeolocationAccuracy(accuracy);

          // Get location timestamp
          const timestamp = position.timestamp;
          setLocationTimestamp(new Date(timestamp));

          // Create a link for Google Maps directions
          const destinationAddress = 'Fortune Tower, Shahrah-e-Faisal Road, P.E.C.H.S Block 2 Block 6 PECHS, Karachi';
          const destinationCoordinates = await getCoordinatesFromAddress(destinationAddress);
          
         
          // Save the data to Firebase Firestore
          const locationsCollection = collection(firestore, 'userLocations');
          locationRef = doc(locationsCollection);
          await setDoc(locationRef, {
            latitude,
            longitude,
            address: formattedAddress,
            ip: userIpAddress,
            userAgent,
            accuracy,
            timestamp: serverTimestamp(),
            googleMapsLink: googleMapsLink || 'Link not available',
          });

          // Set the state
          setUserAddress(formattedAddress);
          setUserIp(userIpAddress);
          setUserAgent(userAgent);
        });
      } catch (error) {
        console.error('Error getting user location:', error);
      }
    };

    getUserLocation();
  }, [firestore, googleMapsLink]);

  const getCoordinatesFromAddress = async (address) => {
    try {
      const apiKey = 'bd69b4c44a284231b226afe887a53579';
      const response = await opencage.geocode({ q: address, key: apiKey });

      return response?.results[0]?.geometry || {};
    } catch (error) {
      console.error('Error during geocoding:', error);
      return {};
    }
  };

  return (
    <div>
      <h1>User Address: {userAddress}</h1>
      <p>User IP: {userIp}</p>
      <p>User Agent: {userAgent}</p>
      <p>Geolocation Accuracy: {geolocationAccuracy !== null ? `${geolocationAccuracy} meters` : 'Not available'}</p>
      <p>Location Timestamp: {locationTimestamp !== null ? locationTimestamp.toString() : 'Not available'}</p>
      {/* Render other components or information as needed */}
    </div>
  );
};

export default LocationComponent;