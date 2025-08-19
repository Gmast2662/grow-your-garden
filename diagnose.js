const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnosing server issues...\n');

// Check if required files exist
const requiredFiles = [
    'server.js',
    'auth.js', 
    'admin.js',
    'package.json',
    'node_modules'
];

console.log('📁 Checking required files:');
requiredFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// Check if node_modules exists and has required packages
console.log('\n📦 Checking dependencies:');
if (fs.existsSync('node_modules')) {
    const requiredPackages = [
        'express',
        'socket.io', 
        'sqlite3',
        'bcryptjs',
        'jsonwebtoken',
        'cors',
        'uuid',
        'dotenv'
    ];
    
    requiredPackages.forEach(pkg => {
        const pkgPath = path.join('node_modules', pkg);
        const exists = fs.existsSync(pkgPath);
        console.log(`${exists ? '✅' : '❌'} ${pkg}`);
    });
} else {
    console.log('❌ node_modules not found - run npm install');
}

// Check server.js syntax
console.log('\n🔧 Checking server.js syntax:');
try {
    const serverCode = fs.readFileSync('server.js', 'utf8');
    
    // Check for common syntax issues
    const issues = [];
    
    if (!serverCode.includes('db.serialize(() => {')) {
        issues.push('Missing db.serialize block');
    }
    
    if (!serverCode.includes('}); // Close db.serialize block')) {
        issues.push('Missing db.serialize closing brace');
    }
    
    if (!serverCode.includes('server.listen(')) {
        issues.push('Missing server.listen');
    }
    
    if (issues.length === 0) {
        console.log('✅ server.js structure looks good');
    } else {
        console.log('❌ Issues found:');
        issues.forEach(issue => console.log(`   - ${issue}`));
    }
    
} catch (error) {
    console.log(`❌ Error reading server.js: ${error.message}`);
}

console.log('\n🎯 Next steps:');
console.log('1. If any files are missing, check your project directory');
console.log('2. If dependencies are missing, run: npm install');
console.log('3. If syntax issues found, check the server.js file');
console.log('4. Try running: node server.js');
