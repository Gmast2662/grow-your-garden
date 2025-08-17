// Replit startup file - this will be automatically run by Replit
console.log('🌱 Starting Garden Game on Replit...');

// Check if we're on Replit
if (process.env.REPL_ID) {
    console.log('✅ Detected Replit environment');
    console.log(`📦 REPL_ID: ${process.env.REPL_ID}`);
    console.log(`👤 REPL_OWNER: ${process.env.REPL_OWNER}`);
    console.log(`🔗 REPL_SLUG: ${process.env.REPL_SLUG}`);
}

// Set environment variables if not already set
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'garden-game-2025-secret-key-jwt-123';
    console.log('🔑 Set JWT_SECRET');
}

if (!process.env.PORT) {
    process.env.PORT = '3000';
    console.log('🌐 Set PORT to 3000');
}

// Start the restart server
try {
    require('./restart-server.js');
    console.log('✅ Restart server started successfully!');
} catch (error) {
    console.error('❌ Failed to start restart server:', error);
    
    // Fallback to direct server start
    console.log('🔄 Trying direct server start...');
    try {
        require('./server.js');
        console.log('✅ Direct server start successful!');
    } catch (directError) {
        console.error('❌ Direct server start also failed:', directError);
        process.exit(1);
    }
}
