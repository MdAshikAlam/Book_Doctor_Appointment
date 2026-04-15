import React, { useContext, useState } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaSearch, FaUserCircle } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";
import "./Navbar.css";

const Navbar = () => {
  const [show, setShow] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { isAuthenticated, setIsAuthenticated, user } = useContext(Context);

  const handleLogout = async () => {
    await axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/user/patient/logout`, {
        withCredentials: true,
      })
      .then((res) => {
        toast.success(res.data.message);
        setIsAuthenticated(false);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  const navigateTo = useNavigate();

  const goToLogin = () => {
    navigateTo("/login");
  };

  return (
    <>
      <nav className={"container"}>
        <div className="logo">
          <img src="/logo.png" alt="logo" className="logo-img" />
        </div>
        <div className={show ? "navLinks showmenu" : "navLinks"}>
          <div className="links">
            <NavLink to={"/"} onClick={() => setShow(!show)}>
              Home
            </NavLink>
            <NavLink to={"/specialties"} onClick={() => setShow(!show)}>
              Specialties
            </NavLink>
            <NavLink to={"/appointment"} onClick={() => setShow(!show)}>
              Appointments
            </NavLink>
            <NavLink to={"/my-bookings"} onClick={() => setShow(!show)}>
              My Bookings
            </NavLink>
            <NavLink to={"/about"} onClick={() => setShow(!show)}>
              About Us
            </NavLink>
            <NavLink to={"/contact"} onClick={() => setShow(!show)}>
              Contact
            </NavLink>
            <div className="search-bar">
              <input type="text" placeholder="Search doctors,clinics,etc" />
              <FaSearch className="search-icon" />
            </div>
          </div>
        </div>

        <div className="auth-section">
          {isAuthenticated ? (
            <div className="auth-links">
              <div
                className="profile-icon-container"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <FaUserCircle className="profile-icon" />
                {showDropdown && (
                  <div className="profile-dropdown">
                    <NavLink to={"/profile"} onClick={() => setShowDropdown(false)}>
                      User Profile
                    </NavLink>
                    <button className="dropdown-item" onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button className="loginBtn btn" onClick={goToLogin}>
              LOGIN
            </button>
          )}
        </div>

        <div className="hamburger" onClick={() => setShow(!show)}>
          <GiHamburgerMenu />
        </div>
      </nav>
    </>
  );
};

export default Navbar;
