const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:5000/api/v1/utility/reverse-geocode', {
      latitude: 28.6139,
      longitude: 77.2090
    });
    console.log('SUCCESS:', res.data);
  } catch (err) {
    console.error('ERROR:', err.response ? err.response.data : err.message);
  }
}

test();
