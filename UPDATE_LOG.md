# Update Log

## [1.6.20] - 2025-08-19

### 🚀 FIXED
- **Admin Panel UI Issue**: Fixed tabs being visible on login page - admin section now properly hidden until login
- **Login State Management**: Added localStorage token persistence and proper logout functionality
- **Admin Panel Navigation**: Added logout button and improved admin section visibility control

## [1.6.19] - 2025-08-19

### 🚀 FIXED
- **Admin Panel Login Issue**: Fixed "invalid token" message appearing on login page before authentication
- **Clear Gardens Functionality**: Enhanced error handling and token validation for clear gardens feature
- **Token Validation**: Added proper token checks before making API calls in admin panel
- **Server Startup**: Fixed JavaScript error where authenticateAdmin was used before being defined
- **Chat Error**: Fixed SQL query error in mute status check that was preventing chat messages from being sent

### 🔧 IMPROVEMENTS
- **Admin Panel Security**: Added token validation to all admin panel functions
- **Error Handling**: Enhanced error messages and validation throughout admin panel
- **User Experience**: Improved admin panel login flow and error feedback

### 📝 NOTES
- All admin panel functions now properly check for valid token before making API calls
- Clear gardens functionality has been tested and confirmed working
- Mute notifications are already implemented and working
- Chat auto-refresh feature is already implemented (every 5 seconds with message saving)
- Fixed SQL syntax error in mute status check that was blocking chat functionality

## [1.6.18] - 2025-08-19

### 🚀 FIXED
- **Security Tab Display**: Fixed CSS issue where `.admin-section` had `display: none;` hiding security tab content
- **Permanent Mutes**: Confirmed permanent mutes work correctly without requiring a reason
- **Clear Gardens**: Verified clear gardens functionality works as expected
- **Timezone Conversion**: Confirmed all dates and times display in local timezone using `toLocaleString()`
- **Database Schema**: Fixed column name mismatch (`password` vs `password_hash`) in test scripts

### 🔧 IMPROVEMENTS
- **Console Logging**: Cleaned up excessive console.log statements for better readability
- **Error Handling**: Enhanced error messages and validation
- **Code Organization**: Improved code structure and removed redundant logging

### 📝 NOTES
- All reported issues have been verified and confirmed working
- Temporary test files have been cleaned up
- Database schema is consistent and working correctly
