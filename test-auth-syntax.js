// Test auth.js syntax
try {
    require('./auth.js');
    console.log('✅ auth.js syntax is valid');
} catch (error) {
    console.error('❌ Syntax error in auth.js:');
    console.error(error.message);
    console.error('Line:', error.lineNumber);
    console.error('Column:', error.columnNumber);
}
