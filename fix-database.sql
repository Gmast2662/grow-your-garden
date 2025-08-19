-- Fix database tables for admin panel
-- Run this in your SQLite database

-- Create banned_ips table
CREATE TABLE IF NOT EXISTS banned_ips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip_address TEXT UNIQUE NOT NULL,
    reason TEXT,
    banned_by_admin_id INTEGER,
    banned_by_admin_username TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create banned_devices table
CREATE TABLE IF NOT EXISTS banned_devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT UNIQUE NOT NULL,
    reason TEXT,
    banned_by_admin_id INTEGER,
    banned_by_admin_username TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create security_logs table
CREATE TABLE IF NOT EXISTS security_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id TEXT,
    admin_id INTEGER,
    admin_username TEXT,
    details TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create user_mutes table
CREATE TABLE IF NOT EXISTS user_mutes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    is_muted BOOLEAN DEFAULT 1,
    mute_reason TEXT,
    muted_until DATETIME,
    muted_by_admin_id INTEGER,
    muted_by_admin_username TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add missing columns to users table if they don't exist
-- Note: SQLite doesn't support IF NOT EXISTS for ALTER TABLE, so we'll add them manually

-- Add test data to make security tab show content
INSERT OR IGNORE INTO banned_ips (ip_address, reason, banned_by_admin_id, banned_by_admin_username)
VALUES ('192.168.1.100', 'Test ban for security tab', 1, 'admin');

INSERT OR IGNORE INTO banned_devices (device_id, reason, banned_by_admin_id, banned_by_admin_username)
VALUES ('test-device-123', 'Test device ban for security tab', 1, 'admin');

INSERT OR IGNORE INTO security_logs (action, target_type, target_id, admin_id, admin_username, details, ip_address)
VALUES ('TEST_LOGIN', 'user', 'test_user', 1, 'admin', 'Test security log entry', '192.168.1.100');

-- Show results
SELECT 'Banned IPs' as table_name, COUNT(*) as count FROM banned_ips
UNION ALL
SELECT 'Banned Devices', COUNT(*) FROM banned_devices
UNION ALL
SELECT 'Security Logs', COUNT(*) FROM security_logs
UNION ALL
SELECT 'User Mutes', COUNT(*) FROM user_mutes;
