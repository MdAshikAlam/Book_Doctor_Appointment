import React from "react";
import "./Specialties.css";

const Specialties = () => {
  const specialtiesArray = [
    { name: "Pediatrics", imageUrl: "/departments/pedia.jpg" },
    { name: "Orthopedics", imageUrl: "/departments/ortho.jpg" },
    { name: "Cardiology", imageUrl: "/departments/cardio.jpg" },
    { name: "Neurology", imageUrl: "/departments/neuro.jpg" },
    { name: "Oncology", imageUrl: "/departments/onco.jpg" },
    { name: "Radiology", imageUrl: "/departments/radio.jpg" },
    { name: "Physical Therapy", imageUrl: "/departments/therapy.jpg" },
    { name: "Dermatology", imageUrl: "/departments/derma.jpg" },
    { name: "ENT", imageUrl: "/departments/ent.jpg" },
  ];

  return (
    <div className="specialties-page container">
      <div className="header">
        <h1>Our Medical Specialties</h1>
        <p>Explore our wide range of specialized healthcare services tailored to your needs.</p>
      </div>
      <div className="specialties-grid">
        {specialtiesArray.map((spec, index) => (
          <div key={index} className="specialty-card">
            <div className="image-container">
              <img src={spec.imageUrl} alt={spec.name} />
            </div>
            <div className="content">
              <h3>{spec.name}</h3>
              <p>State-of-the-art care provided by our top medical professionals in {spec.name.toLowerCase()}.</p>
              <button className="explore-btn">Learn More</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Specialties;
