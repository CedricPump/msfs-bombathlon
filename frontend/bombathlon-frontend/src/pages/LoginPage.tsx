import React from 'react';
import logo from '../logo.png';
import discordIcon from '../discord-icon.png'; // Import your Discord icon image
import { Link } from 'react-router-dom';

function LoginPage() {
    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" style={{ width: '150px', height: '150px' }} />
                <h2>Login</h2>
                <form>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input type="text" id="username" className="form-control" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" className="form-control" />
                    </div>
                    <button type="submit" className="btn btn-primary">Login</button>
                </form>
                <div className="mt-3">
                    <a href="https://discord.com/invite/YOUR_INVITE_CODE">
                        <img src={discordIcon} alt="Discord Icon" style={{ width: '24px', height: '24px', marginRight: '5px' }} />
                        Join our Discord server
                    </a>
                </div>
                <div className="mt-2">
                    Don't have an account? <a href="/register">Register here</a>
                </div>
            </header>
        </div>
    );
}

export default LoginPage;