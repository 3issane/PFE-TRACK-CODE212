// Utility function to test backend connectivity
export const testBackendConnection = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/auth/test', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('✅ Backend is running and accessible');
      return true;
    } else {
      console.log('❌ Backend responded with error:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Backend connection failed:', error.message);
    return false;
  }
};

// Test login with DataInitializer users
export const testDataInitializerUsers = async () => {
  const testUsers = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'student', password: 'student123', role: 'student' },
    { username: 'supervisor', password: 'supervisor123', role: 'supervisor' }
  ];

  console.log('🧪 Testing DataInitializer users...');
  
  for (const user of testUsers) {
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: user.username,
          password: user.password
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${user.role} login successful:`, data);
      } else {
        console.log(`❌ ${user.role} login failed:`, response.status);
      }
    } catch (error) {
      console.log(`❌ ${user.role} login error:`, error.message);
    }
  }
};

// Add backend test button to login page
export const addBackendTestButton = () => {
  if (window.location.pathname === '/login') {
    const button = document.createElement('button');
    button.textContent = 'Test Backend Connection';
    button.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 5px;
      cursor: pointer;
      z-index: 9999;
    `;
    
    button.onclick = async () => {
      console.clear();
      console.log('🔍 Testing backend connection...');
      await testBackendConnection();
      await testDataInitializerUsers();
    };
    
    document.body.appendChild(button);
  }
};