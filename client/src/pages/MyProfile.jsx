import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../assets/MyProfile.css';

const MyProfile = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: '',
    mobile: '',
    address: '',
  });
  const [alert, setAlert] = useState({
    type: 'success', // You can customize this for 'danger', 'info', etc.
    message: 'Profile updated successfully!',
    visible: false,
  });

  useEffect(() => {
    const userId = sessionStorage.getItem('userId');

    if (!userId) {
      navigate('/login');
    } else {
      const fetchUserData = async () => {
        try {
          const response = await axios.get(`http://localhost:7000/users/${userId}`);
          const user = response.data;

          if (user) {
            setUserProfile(user);
            setFormData({
              name: user.name || '',
              email: user.email || '',
              gender: user.gender || '',
              mobile: user.mobile || '',
              address: user.address || '',
            });
          } else {
            setError('User not found');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setError('Error fetching user data');
        }
      };

      fetchUserData();
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProfile = async () => {
    try {
      const updatedData = {
        ...formData,
      };

      await axios.put(`http://localhost:7000/users/${userProfile._id}`, updatedData);
      setUserProfile({
        ...userProfile,
        ...updatedData,
      });
      setIsEditing(false);
      
      // Show success alert
      setAlert({
        type: 'success',
        message: 'Profile updated successfully!',
        visible: true,
      });

      // Hide alert after 3 seconds
      setTimeout(() => {
        setAlert((prevAlert) => ({
          ...prevAlert,
          visible: false,
        }));
      }, 3000);
    } catch (error) {
      console.error('Error updating user data:', error);
      setError('Error updating user data');
    }
  };

  if (error) {
    return <p className="text-center text-danger">{error}</p>;
  }

  if (!userProfile) {
    return <p className="text-center">Loading profile...</p>;
  }

  return (
    <div className="container myprofile-page">
      <h2 className="text-center mb-4">My Profile</h2>

      {/* Success alert */}
      {alert.visible && (
        <div
          className={`alert alert-${alert.type} alert-dismissible`}
          role="alert"
          style={{
            width: '30%',
            height: '50px',
            textAlign: 'center',
            position: 'fixed',
            top: '12%',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '8px',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
            zIndex: 9999,
            opacity: alert.visible ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out',
          }}
          aria-live="polite">
              <i className={`bi ${ alert.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'  } me-2`}></i>     
          {alert.message}
        </div>
      )}

      <div className="card">
        <div className="card-body">
          {!isEditing ? (
            <>
              <p><strong>Name:</strong> {userProfile.name}</p>
              <p><strong>Email:</strong> {userProfile.email}</p>
              <p><strong>Gender:</strong> {userProfile.gender || 'Not set'}</p>
              <p><strong>Mobile No:</strong> {userProfile.mobile || 'Not set'}</p>
              <p><strong>Address:</strong> {userProfile.address || 'Not set'}</p>
              <button 
                className="btn btn-primary mt-4"
                onClick={() => setIsEditing(true)}
              >
                Update Profile
              </button>
            </>
          ) : (
            <>
              {['name', 'email', 'gender', 'mobile', 'address'].map((field) => (
                <div className="form-group mt-3" key={field}>
                  <label htmlFor={field}><strong>{field.charAt(0).toUpperCase() + field.slice(1)}:</strong></label>
                  <input
                    type="text"
                    id={field}
                    name={field}
                    className="form-control"
                    value={formData[field]}
                    onChange={handleInputChange}
                    placeholder={`Enter ${field}`}
                  />
                </div>
              ))}
              <button 
                className="btn btn-success mt-4"
                onClick={handleUpdateProfile}
              >
                Save
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
