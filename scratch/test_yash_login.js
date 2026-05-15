const axios = require('axios');

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'yash@gmail.com',
      password: '12345678',
      isDashboard: true
    });
    console.log('LOGIN SUCCESS:', response.data.status);
  } catch (error) {
    console.log('LOGIN FAILED:', error.response?.data?.message || error.message);
    console.log('STATUS CODE:', error.response?.status);
  }
}

testLogin();
