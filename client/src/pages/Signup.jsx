import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import signupImage from '../Images/signup.jpg';
import axios from 'axios';
import '../assets/Signup.css';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import 'bootstrap-icons/font/bootstrap-icons.css';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [alert, setAlert] = useState({ visible: false, type: '', message: '' }); // Alert state

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        // Validate all fields and password confirmation
        if (!name || !email || !password || !confirmPassword) {
            setAlert({
                visible: true,
                type: 'danger',
                message: 'All fields are required!',
            });
            return;
        }

        if (password !== confirmPassword) {
            setAlert({
                visible: true,
                type: 'danger',
                message: 'Passwords do not match!',
            });
            return;
        }

        const userData = {
            name,
            email,
            password,
        };

        try {
            await axios.post('http://localhost:7000/signup', userData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            setAlert({
                visible: true,
                type: 'success',
                message: 'Well done! You have successfully created your account!',
            });

            // Clear form fields
            setName('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');

            // Navigate to login page after a brief timeout
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            if (error.response) {
                setAlert({
                    visible: true,
                    type: 'danger',
                    message: 'Registration failed: ' + error.response.data.message,
                });
            } else {
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
                <img src={signupImage} alt="Signup" />
            </div>
            <div className="form-container">
                <h2>Create Your Account</h2>

                {/* Bootstrap Alert */}
                {alert.visible && (
                    <div className={`alert alert-${alert.type}`} role="alert">
                         <i className={`bi ${ alert.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'  } me-2`}></i>
                        {alert.message}
                    </div>
                )}

                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <label>Your Full Name:</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="form-control"
                        />
                    </div>
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
                    <div className="form-group">
                        <label>Confirm Password:</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="form-control"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block">
                        Create Your Account
                    </button>
                </form>
                <p>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
