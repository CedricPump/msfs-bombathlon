import React, { useState, useEffect } from 'react';
import apiService from '../services/ApiService'; // Import your API service

function HomePage() {
    const [userData , setUserData] = useState(null); // State to store user data

    useEffect(() => {
        // Fetch user data when the component mounts
        apiService.getCurrentUser()
            .then((data) => {
                // Store the fetched user data in the state
                //setUserData(data);
            })
            .catch((error) => {
                console.error('Error fetching user data:', error);
            });
    }, []); // Empty dependency array means this effect runs once when the component mounts

    return (
        <div>
            <h1>Home Page</h1>
            {userData ? (
                <div>
                    <h2>Welcome, {userData}!</h2>
                    {/* Render other user data here */}
                </div>
            ) : (
                <p>Loading user data...</p>
            )}
        </div>
    );
}

export default HomePage;
