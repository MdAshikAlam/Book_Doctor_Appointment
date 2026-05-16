
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'pawan@gmail.com', password: 'password123', isDashboard: true })
  });
  
  const loginData = await loginRes.json();
  const cookies = loginRes.headers.get('set-cookie');
  console.log('Login response:', loginData.status);
  
  const clinicId = '69f7a90962bf2ca129d692f9'; // known clinic ID
  
  const res = await fetch('http://localhost:5000/api/v1/clinics?isDashboard=true', {
    headers: {
      'Cookie': cookies || '',
      'X-Clinic-ID': clinicId
    }
  });
  
  if (!res.ok) {
    const err = await res.text();
    console.log('Clinics API Failed:', res.status, err);
  } else {
    const data = await res.json();
    console.log('Clinics API Response length:', data.data?.clinics?.length);
  }
}

run();
