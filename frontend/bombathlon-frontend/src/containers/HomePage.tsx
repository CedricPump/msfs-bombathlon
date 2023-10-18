import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, MapContainerProps } from 'react-leaflet';
import planeIcon from '../assets/leaflet/planeIcon.png';
import apiService from '../services/ApiService'; // Import your API service
import 'leaflet/dist/leaflet.css';
import {DivIcon, Icon, LatLng} from "leaflet";

function HomePage() {

    const airports = [
        { ICAO: 'ABC', position: new LatLng(52.52, 13.405, 0) }, // Replace with your actual airport data
        // Add more airports as needed
    ];

    const airplane = {
        position: new LatLng(52.52, 13.405, 0), // Replace with your actual airplane position
    };

    const airplaneIcon = new Icon({
        iconUrl: planeIcon,
        iconSize: [32, 32],
    });

    return  (
        <div>
            <h1>Home Page</h1>
            <div>
                <h2>Welcome</h2>
                <MapContainer center={[50.5, 30.5]} zoom={6} style={{ height: '400px', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {airports.map((airport, index) => (
                        <Marker key={`airport-${index}`} position={airport.position}>
                            <Popup>{airport.ICAO}</Popup>
                        </Marker>
                    ))}
                    <Marker position={airplane.position} icon={airplaneIcon}>
                        <Popup>Airplane</Popup>
                    </Marker>
                </MapContainer>
            </div>
        </div>
    );
}

export default HomePage;