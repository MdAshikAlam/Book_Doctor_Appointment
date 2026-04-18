import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "./AppointmentForm.css";

const AppointmentForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [adhar, setAdhar] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [department, setDepartment] = useState("Pediatrics");
  const [doctorFirstName, setDoctorFirstName] = useState("");
  const [doctorLastName, setDoctorLastName] = useState("");
  const [address, setAddress] = useState("");
  const [hasVisited, setHasVisited] = useState(false);
  const [timing, setTiming] = useState("");
  const [city, setCity] = useState("");

  const departmentsArray = [
    "Pediatrics",
    "Orthopedics",
    "Cardiology",
    "Neurology",
    "Oncology",
    "Radiology",
    "Physical Therapy",
    "Dermatology",
    "ENT",
  ];

  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/user/doctors`,
          { withCredentials: true }
        );
        setDoctors(data.doctors);
        console.log("Doctors fetched:", data.doctors);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };
    fetchDoctors();
  }, []);

  const handleAppointment = async (e) => {
    e.preventDefault();
    console.log("Form submitted");

    try {
      const hasVisitedBool = Boolean(hasVisited);
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/appointment/post`,

        {
          firstName,
          lastName,
          email,
          phone,
          adhar,
          dob,
          gender,
          appointment_date: appointmentDate,
          department,
          doctor_firstName: doctorFirstName,
          doctor_lastName: doctorLastName,
          hasVisited: hasVisitedBool,
          address,
          timing,
          city,
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("Appointment response:", data);
      toast.success(data.message);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setAdhar("");
      setDob("");
      setGender("");
      setAppointmentDate("");
      setDepartment("Pediatrics");
      setDoctorFirstName("");
      setDoctorLastName("");
      setHasVisited(false);
      setAddress("");
      setTiming("");
      setCity("");
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div className="container appointment-page-wrapper">
      <h2>Appointment</h2>
      <form onSubmit={handleAppointment} className="appointment-main-form">
        <div className="apt-main-container">
          <div className="apt-section-header">
            <h4>Doctor & Clinic Details</h4>
            <div className="apt-header-line"></div>
          </div>
          <div className="apt-form-grid">
            <div className="apt-form-group">
              <label>Department <span>*</span></label>
              <select
                title="Department"
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  setCity("");
                  setDoctorFirstName("");
                  setDoctorLastName("");
                }}
              >
                {departmentsArray.map((depart, index) => (
                  <option value={depart} key={index}>
                    {depart}
                  </option>
                ))}
              </select>
            </div>
            <div className="apt-form-group">
              <label>Clinic City <span>*</span></label>
              <select
                title="Clinic City"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setDoctorFirstName("");
                  setDoctorLastName("");
                }}
                disabled={!department}
              >
                <option value="">Select City</option>
                {[...new Set(doctors
                  .filter(d => d.doctorDepartment === department)
                  .map(d => d.city))]
                  .map((c, index) => (
                    <option value={c} key={index}>{c}</option>
                  ))}
              </select>
            </div>
            <div className="apt-form-group">
              <label>Doctor <span>*</span></label>
              <select
                title="Doctor"
                value={`${doctorFirstName} ${doctorLastName}`}
                onChange={(e) => {
                  const [firstName, lastName] = e.target.value.split(" ");
                  setDoctorFirstName(firstName);
                  setDoctorLastName(lastName);
                }}
              >
                <option value="">Select Doctor</option>
                {doctors
                  .filter((doctor) => doctor.doctorDepartment === department && doctor.city === city)
                  .map((doctor, index) => (
                    <option
                      value={`${doctor.firstName} ${doctor.lastName}`}
                      key={index}
                    >
                      {doctor.firstName} {doctor.lastName}
                    </option>
                  ))}
                {city && doctors.filter(d => d.doctorDepartment === department && d.city === city).length === 0 && (
                  <option disabled>No doctors available in this city</option>
                )}
              </select>
            </div>
            <div className="apt-form-group">
              <label>Appointment Date <span>*</span></label>
              <input
                title="Appointment Date"
                type="date"
                placeholder="Date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
              />
            </div>
            <div className="apt-form-group">
              <label>Appointment Time <span>*</span></label>
              <input
                title="Appointment Time"
                type="time"
                placeholder="Time"
                value={timing}
                onChange={(e) => setTiming(e.target.value)}
              />
            </div>
          </div>

          <div className="apt-section-header" style={{ marginTop: "30px" }}>
            <h4>Personal Details</h4>
            <div className="apt-header-line"></div>
          </div>
          <div className="apt-form-grid">
            <div className="apt-form-group">
              <label>First Name <span>*</span></label>
              <input
                title="First Name"
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="apt-form-group">
              <label>Last Name <span>*</span></label>
              <input
                title="Last Name"
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="apt-form-group">
              <label>Email <span>*</span></label>
              <input
                title="Email"
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="apt-form-group">
              <label>Mobile Number <span>*</span></label>
              <input
                title="Mobile Number"
                type="number"
                placeholder="Mobile Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="apt-form-group">
              <label>Aadhaar <span>*</span></label>
              <input
                title="Aadhaar"
                type="number"
                placeholder="Aadhaar"
                value={adhar}
                onChange={(e) => setAdhar(e.target.value)}
              />
            </div>
            <div className="apt-form-group">
              <label>Date of Birth <span>*</span></label>
              <input
                title="Date of Birth"
                type="date"
                placeholder="Date of Birth"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
            <div className="apt-form-group">
              <label>Gender <span>*</span></label>
              <select
                title="Gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="apt-form-group apt-grid-span-2">
              <label>Patient Address <span>*</span></label>
              <textarea
                title="Patient Address"
                rows="3"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Your Address"
              />
            </div>
          </div>
        </div>
        <div className="visited-container">
          <p>Have you visited before?</p>
          <input
            type="checkbox"
            checked={hasVisited}
            onChange={(e) => setHasVisited(e.target.checked)}
          />
        </div>
        <div className="button-container">
          <button type="submit" className="btn">
            GET APPOINTMENT
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;