// Simple test script to verify server functionality
const http = require('http');

console.log('🧪 Testing Garden Game Server...\n');

// Test server connection
const testServer = () => {
    return new Promise((resolve, reject) => {
        const req = http.get('http://localhost:3000/api/users/online', (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve('✅ Server is running and responding');
                } else {
                    resolve(`⚠️ Server responded with status: ${res.statusCode}`);
                }
            });
        });
        
        req.on('error', (err) => {
            reject(`❌ Server connection failed: ${err.message}`);
        });
        
        req.setTimeout(5000, () => {
            req.destroy();
            reject('❌ Server connection timeout');
        });
    });
};

// Test database connection
const testDatabase = () => {
    return new Promise((resolve) => {
        const sqlite3 = require('sqlite3').verbose();
        const db = new sqlite3.Database('./garden_game.db');
        
        db.get('SELECT name FROM sqlite_master WHERE type="table" AND name="users"', (err, row) => {
            db.close();
            if (err) {
                resolve('❌ Database error: ' + err.message);
            } else if (row) {
                resolve('✅ Database tables created successfully');
            } else {
                resolve('⚠️ Database tables not found (will be created on first run)');
            }
        });
    });
};

// Run tests
async function runTests() {
    try {
        console.log('1. Testing server connection...');
        const serverResult = await testServer();
        console.log(serverResult);
        
        console.log('\n2. Testing database...');
        const dbResult = await testDatabase();
        console.log(dbResult);
        
        console.log('\n🎉 Test completed!');
        console.log('\n📋 Next steps:');
        console.log('1. Open http://localhost:3000 in your browser');
        console.log('2. Create an account or log in');
        console.log('3. Start playing with multiplayer features!');
        
    } catch (error) {
        console.log('\n❌ Test failed:', error);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Make sure the server is running (npm start)');
        console.log('2. Check if port 3000 is available');
        console.log('3. Verify all dependencies are installed (npm install)');
    }
}

// Run tests if this script is executed directly
if (require.main === module) {
    runTests();
}

module.exports = { testServer, testDatabase };
