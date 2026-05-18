const axios = require('axios');

async function test() {
  try {
    let token = "";
    let username = "testuser_123";
    
    try {
      await axios.post('http://localhost:5001/api/signup', { username, password: "password123" });
    } catch(e) {}
    
    const loginRes = await axios.post('http://localhost:5001/api/login', { username, password: "password123" });
    token = loginRes.data.token;
    console.log("Got token:", token);

    const serverRes = await axios.post('http://localhost:5001/api/servers', {
      name: "My Test Server"
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("Server created:", serverRes.data);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}

test();
