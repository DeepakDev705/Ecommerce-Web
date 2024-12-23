import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import signupImage from '../Images/signup image.jpg';
import axios from 'axios';
import '../assets/Login.css';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import 'bootstrap-icons/font/bootstrap-icons.css'; // Import Bootstrap Icons

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [alert, setAlert] = useState({ visible: false, type: '', message: '' }); // Alert state
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        const loginData = { email, password };

        try {
            const response = await axios.post('http://localhost:7000/login', loginData, {
                headers: { 'Content-Type': 'application/json' },
            });

            console.log('Login successful:', response.data);

            // Store userId in session storage
            sessionStorage.setItem('userId', response.data.userId);

            // Set success alert
            setAlert({
                visible: true,
                type: 'success',
                message: 'Login successful! Redirecting to the homepage...',
            });

            // Redirect to the homepage after a brief timeout
            setTimeout(() => navigate('/'), 2000);
        } catch (error) {
            if (error.response) {
                console.error('Login error:', error.response.data);
                setAlert({
                    visible: true,
                    type: 'danger',
                    message: 'Login failed: ' + error.response.data.message,
                });
            } else {
                console.error('Network error:', error);
                setAlert({
                    visible: true,
                    type: 'danger',
                    message: 'Network error, please try again later.',
                });
            }
        }
    };

    return (
        <div className="form-wrapper">
            <h1>Ecommerce | Web</h1>
            <div className="image-container">
                <img 
                    src={signupImage} 
                    alt="Signup"
                    className="img-fluid"
                />
            </div>
            <div className="form-container">
                <h2>Login</h2>

                {/* Bootstrap Alert with Icons */}
                {alert.visible && (
                    <div className={`alert alert-${alert.type} d-flex align-items-center`} role="alert">
                        <i
                            className={`bi ${
                                alert.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'
                            } me-2`}
                        ></i>
                        <span>{alert.message}</span>
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Email:</label>
                        <input 
                            type="email" 
                            required
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="form-control"
                        />
                    </div>
                    <div className="form-group">
                        <label>Password:</label>
                        <input 
                            type="password" 
                            required
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className="form-control"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block">
                        Login
                    </button>
                </form>
                <p>Don't have an account? <Link to="/signup">Signup</Link></p>
            </div>
        </div>
    );
};

export default Login;
