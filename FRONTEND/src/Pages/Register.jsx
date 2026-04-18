import axios from "axios";
import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Link, Navigate, useNavigate } from "react-router-dom";
import "./Auth.css";

const Register = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigateTo = useNavigate();

  const handleRegistration = async (e) => {
    e.preventDefault();
    console.log("Form submitted");
  
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      toast.error("Please fill in all fields!");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Password and Confirm Password do not match!");
      return;
    }
  
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/patient/register`,
        { fullName, email, phone, password, confirmPassword, role: "Patient" },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("Response received", response);
      toast.success(response.data.message);
      setIsAuthenticated(true);
      navigateTo("/");
      setFullName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.log("Error response:", error.response);
  
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "An unknown error occurred";
  
      toast.error(errorMessage);
    }
  };

  if (isAuthenticated) {
    return <Navigate to={"/"} />;
  }

  return (
    <>
      <div className="container form-component register-form">
        <div className="register-card">
          <button 
            onClick={() => navigateTo(-1)} 
            style={{
              position: "absolute",
              top: "15px",
              right: "20px",
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#666",
              padding: "0",
              margin: "0",
              width: "auto",
              boxShadow: "none"
            }}
          >
            &times;
          </button>
          <h2>Sign Up</h2>
          <p>Please Sign Up To Continue</p>

          <form onSubmit={handleRegistration}>
            <div style={{ display: "flex", gap: "15px" }}>
              <div className="form-group">
                <label>Full Name <span>*</span></label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label>Email <span>*</span></label>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "15px" }}>
              <div className="form-group">
                <label>Phone Number <span>*</span></label>
                <input
                  type="text"
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Password <span>*</span></label>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Confirm Password <span>*</span></label>
              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "center",
                marginTop: "5px"
              }}
            >
              <p style={{ marginBottom: 0 }}>Already Registered?</p>
              <Link
                to={"/signin"}
                style={{ textDecoration: "none", color: "#271776ca", fontWeight: "600" }}
              >
                Login Now
              </Link>
            </div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <button 
                type="submit" 
                disabled={!fullName || !email || !phone || !password || !confirmPassword}
                className={`btn ${(!fullName || !email || !phone || !password || !confirmPassword) ? "disabled-btn" : ""}`}
              >
                Register
              </button>
            </div>
          </form>
        </div>
      </div>
    </> 
  );
};

export default Register;
