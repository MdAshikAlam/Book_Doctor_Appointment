import React, { useContext, useState, useEffect } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import "./Auth.css"; 

const Profile = () => {
  const { isAuthenticated, user } = useContext(Context);
  const [isEditing, setIsEditing] = useState(false);

  // Use local state for form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Update local state when user data is available
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  // Show loading if user data isn't available yet
  if (!user || Object.keys(user).length === 0) {
    return (
      <div className="container" style={{ marginTop: "120px", textAlign: "center" }}>
        <h3>Loading Profile Information...</h3>
      </div>
    );
  }

  const handleUpdate = (e) => {
    e.preventDefault();
    // Implementation for profile update will go here
    setIsEditing(false);
  };

  return (
    <div className="container form-component" style={{ marginTop: "120px" }}>
      <div className="register-card" style={{ maxWidth: "600px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", marginBottom: "5px" }}>User Profile</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "30px" }}>
          Manage your account settings and information
        </p>
        
        <form onSubmit={handleUpdate}>
          <div style={{ display: "flex", gap: "15px" }}>
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>
          
          <div className="form-group" style={{ marginTop: "15px" }}>
            <label>Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={true} 
            />
          </div>
          
          <div className="form-group" style={{ marginTop: "15px" }}>
            <label>Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group" style={{ marginTop: "15px" }}>
            <label>Account Role</label>
            <input
              type="text"
              value={user?.role || "Patient"}
              disabled={true}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "30px", justifyContent: "center" }}>
            {!isEditing ? (
              <button 
                type="button" 
                className="btn" 
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button type="submit" className="btn">Save Changes</button>
                <button 
                  type="button" 
                  className="btn" 
                  style={{ background: "#666" }}
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
