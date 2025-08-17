console.log('🧪 Testing Replit Environment...');

// Test 1: Check Node.js version
console.log('Node.js version:', process.version);

// Test 2: Check environment variables
console.log('PORT:', process.env.PORT);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('REPL_ID:', process.env.REPL_ID);
console.log('REPL_OWNER:', process.env.REPL_OWNER);

// Test 3: Check if we can require dependencies
try {
    console.log('Testing dependencies...');
    require('express');
    require('socket.io');
    require('sqlite3');
    require('bcryptjs');
    require('jsonwebtoken');
    require('cors');
    require('uuid');
    require('dotenv');
    console.log('✅ All dependencies loaded successfully');
} catch (error) {
    console.error('❌ Dependency error:', error.message);
}

// Test 4: Check if we can start the server
console.log('\n🚀 Attempting to start server...');
try {
    require('./server.js');
    console.log('✅ Server started successfully!');
} catch (error) {
    console.error('❌ Server failed to start:', error.message);
    console.error('Full error:', error);
}
