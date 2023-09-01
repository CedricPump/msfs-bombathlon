import React, { useState } from 'react';
import logo from '../logo.png';
import discordIcon from '../discord-icon.png';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/AuthService'; // Import your authentication service

function LoginPage() {
    const navigate = useNavigate(); // Initialize the useNavigate hook
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleEmailChange = (e: any) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e: any) => {
        setPassword(e.target.value);
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        console.log("handleSubmit")
        try {
            const success = await authService.login(email, password);

            if (success) {
                // Redirect to the home page if login is successful
                console.log("success");
                navigate('/home');
            } else {
                // Display an error message if login fails
                setError('Login failed. Please check your username and password.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            setError('An error occurred during login.');
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" style={{ width: '150px', height: '150px' }} />
                <h2>Login</h2>
                <form onSubmit={handleSubmit}>
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
                    <button type="submit" className="btn btn-primary">Login</button>
                    {error && <div className="text-danger">{error}</div>}
                </form>
                <div className="mt-3">
                    <a href="https://discord.gg/Q8cQ5nhC">
                        <img src={discordIcon} alt="Discord Icon" style={{ width: '24px', height: '24px', marginRight: '5px' }} />
                        Join our Discord server
                    </a>
                </div>
                <div className="mt-2">
                    Don't have an account? <Link to="/register">Register here</Link>
                </div>
            </header>
        </div>
    );
}

export default LoginPage;
