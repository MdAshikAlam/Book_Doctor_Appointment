import * as dotenv from 'dotenv';
dotenv.config();

// pawan@gmail.com is admin
async function run() {
  const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'pawan@gmail.com', password: 'password123', isDashboard: true })
  });
  
  const loginData = await loginRes.json();
  const cookies = loginRes.headers.get('set-cookie');
  console.log('Login response:', loginData);
  console.log('Set-Cookie:', cookies);
  
  const clinicId = '69f7a90962bf2ca129d692f9'; // known clinic ID
  
  const res = await fetch('http://localhost:5000/api/v1/doctors?isDashboard=true&status=all', {
    headers: {
      'Cookie': cookies || '',
      'X-Clinic-ID': clinicId
    }
  });
  
  const data = await res.json();
  console.log('Doctors API Response:', JSON.stringify(data, null, 2));
}

run();
