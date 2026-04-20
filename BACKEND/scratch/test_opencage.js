const axios = require('axios');
const apiKey = '057180b965384ad5ada65cff25a21201';
const query = '123 Medical Plaza, New York, USA';
const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${apiKey}`;

console.log('Testing OpenCage API with key:', apiKey);
console.log('Query:', query);

axios.get(url)
  .then(response => {
    console.log('\n--- SUCCESS ---');
    console.log('Status Code:', response.status);
    console.log('Results Found:', response.data.results.length);
    if (response.data.results.length > 0) {
      console.log('Coordinates:', response.data.results[0].geometry);
      console.log('Formatted Address:', response.data.results[0].formatted);
    }
  })
  .catch(error => {
    console.log('\n--- FAILURE ---');
    console.error('Error Message:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    }
  });
