// Simple syntax test for server.js
try {
    require('./server.js');
    console.log('✅ server.js syntax is valid');
} catch (error) {
    console.error('❌ Syntax error in server.js:');
    console.error(error.message);
    console.error('Line:', error.lineNumber);
    console.error('Column:', error.columnNumber);
}
