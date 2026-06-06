const axios = require('axios');

async function test() {
  const apiKey = '057180b965384ad5ada65cff25a21201';
  const url = `https://api.opencagedata.com/geocode/v1/json?q=28.6139+77.2090&key=${apiKey}`;
  try {
    const res = await axios.get(url);
    console.log('COMPONENTS:', res.data.results[0].components);
  } catch (err) {
    console.error(err);
  }
}

test();
