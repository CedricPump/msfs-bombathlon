import React, { useState } from 'react';
import logo from '../logo.png';
import discordIcon from '../discord-icon.png';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/ApiService';

function RegisterPage() {
    const navigate = useNavigate(); // Initialize the useNavigate hook
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // New state for confirm password
    const [error, setError] = useState('');

    const handleUsernameChange = (e: any) => {
        setUsername(e.target.value);
    };

    const handleEmailChange = (e: any) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e: any) => {
        setPassword(e.target.value);
    };

    const handleConfirmPasswordChange = (e: any) => {
        setConfirmPassword(e.target.value); // Update confirm password state
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        console.log('handleSubmit');
        try {
            if (password !== confirmPassword) { // Check if passwords match
                setError('Passwords do not match.');
                return;
            }

            const success = await apiService.register(username, email, password);

            if (success) {
                // Redirect to the login page if registration is successful
                console.log('success');
                navigate('/login');
            } else {
                // Display an error message if registration fails
                setError('Registration failed. Please check your information.');
            }
        } catch (error) {
            console.error('Error during registration:', error);
            setError('An error occurred during registration.');
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" style={{ width: '150px', height: '150px' }} />
                <h2>Register</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            className="form-control"
                            value={username}
                            onChange={handleUsernameChange}
                            pattern=".{4,}"
                            title="Username must be at least 4 characters long."
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="text"
                            id="email"
                            className="form-control"
                            value={email}
                            onChange={handleEmailChange}
                            pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="form-control"
                            value={password}
                            onChange={handlePasswordChange}
                            pattern="^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$"
                            title="Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character."
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className="form-control"
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Register</button>
                    {error && <div className="text-danger">{error}</div>}
                </form>
                <div className="mt-2">
                    Already have an account? <a href="/login">Login here</a>
                </div>
            </header>
        </div>
    );
}

export default RegisterPage;
