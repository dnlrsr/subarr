const fetch = require('node-fetch');

async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fetch(url, options);
    }
    catch (err) {
      if (attempt === retries - 1)
        throw err;
      
      await new Promise(r => setTimeout(r, 1000)); // wait before retry
    }
  }
}

module.exports = { fetchWithRetry }