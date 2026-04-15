import axios from "axios";
import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Link, useNavigate, Navigate } from "react-router-dom";
import "./Auth.css";

const Login = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");

  const navigateTo = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Form submitted");
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/login`,
        { emailOrPhone, password, role: "Patient" },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("Response received", response);
      toast.success(response.data.message);
      setIsAuthenticated(true);
      navigateTo("/");
      setEmailOrPhone("");
      setPassword("");
    } catch (error) {
      console.log("Error occurred", error);
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };

  if (isAuthenticated) {
    return <Navigate to={"/"} />;
  }

  return (
    <>
      <div className="container form-component login-form">
        <div className="login-card">
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
          <h2>Sign In</h2>
          <p>Please Login To Continue</p>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email or Phone Number <span>*</span></label>
              <input
                type="text"
                placeholder="Enter email or phone number"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Password <span>*</span></label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div
              className="register-link"
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "center",
                marginTop: "10px"
              }}
            >
              <p style={{ marginBottom: 0 }}>Not Registered?</p>
              <Link
                to={"/register"}
                style={{ textDecoration: "none", color: "#271776ca", fontWeight: "600" }}
              >
                Register Now
              </Link>
            </div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <button 
                type="submit" 
                className={`btn ${(!emailOrPhone || !password) ? "disabled-btn" : ""}`}
                disabled={!emailOrPhone || !password}
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
