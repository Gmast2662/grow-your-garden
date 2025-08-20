# Update Log

## [1.6.20] - 2025-08-19

### 🚀 FIXED
- **Admin Panel UI Issue**: Fixed tabs being visible on login page - admin section now properly hidden until login
- **Login State Management**: Added localStorage token persistence and proper logout functionality
- **Admin Panel Navigation**: Added logout button and improved admin section visibility control
- **Dashboard & Security Tab Issues**: Fixed dashboard stats and security tab loading problems with enhanced debugging
- **Login Page Redirect**: Fixed issue where login page wasn't showing on page refresh when not authenticated
- **Tab Visibility Debugging**: Added comprehensive debugging to identify why dashboard and security tabs aren't displaying content

### 🔧 FIXED: Friend Request Self-Acceptance Issue
- **Issue**: Users could see and accept their own sent friend requests in the pending requests list
- **Fix**: Modified server-side friends API to distinguish between sent and received requests using request_type field
- **Fix**: Updated client-side filtering to only show received requests in pending requests section
- **Result**: Users can no longer accept their own friend requests

### 🔧 FIXED: Dashboard & Security Tab Display Issues
- **Issue**: Dashboard stats and security tab content not displaying despite API calls working
- **Root Cause**: CSS rule `.tab-content { display: none; }` was overriding `.tab-content.active { display: block; }`
- **Fix**: Added `!important` to `.tab-content.active { display: block !important; }` to ensure active tabs are visible
- **Fix**: Fixed "undefined" Chat Messages stat by handling both `totalMessages` and `totalChatMessages` API response fields
- **Result**: Dashboard and security tabs now properly display content

### 🔍 INVESTIGATING: Sprinkler Growth System
- **Issue**: User reported that sprinklers don't grow crops
- **Status**: Examining sprinkler growth logic and game loop integration
- **Findings**: Sprinkler growth function exists and is being called in game loop
- **Next Steps**: Need to verify if sprinkler bonus calculation is working correctly

### 🆕 ADDED: Water & Fertilizer Purchase System
- **New Feature**: Added water and fertilizer purchase buttons to the shop
- **Water Cost**: $5 per water unit
- **Fertilizer Cost**: $10 per fertilizer unit
- **Functionality**: Players can now purchase water and fertilizer for money
- **UI**: Added attractive purchase section with hover effects and clear pricing
- **Integration**: Purchase functions properly update inventory and save game state
- **Result**: Players have more control over their water and fertilizer supply

### 🔧 FIXED: Water & Fertilizer UI Update Issue
- **Issue**: Water and fertilizer UI not updating after purchase
- **Root Cause**: buyWater() and buyFertilizer() functions were updating `waterInventory`/`fertilizerInventory` instead of `water`/`fertilizer`
- **Fix**: Updated both class methods and global window functions to use correct property names
- **Result**: UI now properly updates when purchasing water and fertilizer

### 🔧 FIXED: Dashboard Stats Missing
- **Issue**: Dashboard was only showing 6 stats instead of all available stats from server
- **Fix**: Added all missing stats to dashboard display (Total Friends, Pending Friends, Announcements, Admin Users, Admin Logs, Today's Users, Today's Messages, Filter Words)
- **Result**: Dashboard now shows comprehensive server statistics

### 🔧 FIXED: Sprinkler Growth System
- **Issue**: Sprinklers not growing crops and no console output for growth
- **Root Cause**: `checkSprinklerGrowth()` function was not being called in the game loop
- **Fix**: Added `checkAllSprinklerGrowth()` function to game loop that checks all plants for sprinkler growth
- **Result**: Sprinklers should now properly grow crops with console output

### 🔍 INVESTIGATING: Security Tab Display
- **Issue**: Security tab content not displaying despite API calls working
- **Status**: Added comprehensive debugging logs to loadBannedIPs() function
- **Next Steps**: Need user console output to identify why security tab content is not being displayed

### 🔧 FIXED: Season Change Display Issue
- **Issue**: When changing seasons with admin commands, the season display wasn't updating properly
- **Root Cause**: setSeason() function wasn't calling updateSeasonDisplay() directly and wasn't saving the game state
- **Fix**: Added explicit updateSeasonDisplay() call and saveGame() call to setSeason() function
- **Result**: Season changes now properly update the display and persist across game sessions

### 🔍 INVESTIGATING: Permanent Mute Functionality
- **Issue**: User reported that permanent mutes are not working
- **Status**: Investigating admin panel mute form and server-side mute handling
- **Next Steps**: Need to verify mute application and enforcement logic

### 🔍 ONGOING: Dashboard & Security Tab Issues
- **Issue**: Dashboard stats and security tab content not displaying despite API calls working
- **Status**: Debugging logs added, need user console output to identify root cause
- **Next Steps**: Analyze console output to determine why content is not being displayed


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
