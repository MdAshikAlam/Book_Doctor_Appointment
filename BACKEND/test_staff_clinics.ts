import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'yash@gmail.com', password: 'password123', isDashboard: true })
  });
  
  const loginData = await loginRes.json();
  const cookies = loginRes.headers.get('set-cookie');
  console.log('Login as staff:', loginData.status);
  
  const res = await fetch('http://localhost:5000/api/v1/clinics?isDashboard=true', {
    headers: {
      'Cookie': cookies || ''
    }
  });
  
  const data = await res.json();
  console.log('Clinics API Response:', data.data?.clinics?.length);
}

run();
