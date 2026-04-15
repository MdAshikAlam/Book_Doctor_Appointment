import React from "react";
import "./Biography.css";

const Biography = ({imageUrl}) => {
  return (
    <>
      <div className="container biography">
        <div className="banner">
          <img src={imageUrl} alt="whoweare" />
        </div>
        <div className="banner">
          <p>Biography</p>
          <h3>Who We Are</h3>
          <p>We are all in 2024!</p>
          <p>We are working on a MERN STACK PROJECT.</p>
          <p>Coding is fun!</p>
        </div>
      </div>
    </>
  );
};

export default Biography;
