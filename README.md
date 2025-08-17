# 🌱 Grow Your Garden

A feature-rich, browser-based gardening simulation game built with vanilla JavaScript, HTML5 Canvas, and CSS3. Plant seeds, manage resources, upgrade tools, and grow your perfect garden!

- **This game is fully working and released as v1.6.0. I am actively working on more updates to make this game even better. Contact me or tell me in the Github.**
- **I have fixed every bug, but there still may be some bugs I don't know about. So if you find any go to the issues page in the Github.**

![Grow Your Garden](https://img.shields.io/badge/Status-v1.6.0%20Released-brightgreen)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![HTML5](https://img.shields.io/badge/HTML5-Canvas-orange)
![CSS3](https://img.shields.io/badge/CSS3-Responsive-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 🎮 Play Now

**[Play the Game](https://Gmast2662.github.io/grow-your-garden/)**

## ✨ Features

### 🌿 **Core Gameplay**
- **30+ Plant Types**: From basic vegetables to legendary fruits
- **Seasonal System**: 4 seasons with different growth multipliers
- **Growth Stages**: Visual progression from seed to mature plant
- **Resource Management**: Money, water, and fertilizer systems
- **Tool Upgrades**: Improve watering, harvesting, and gardening tools

### 🏡 **Garden Management**
- **Expandable Garden**: Start 8x8, expand up to 12x12
- **Sprinkler System**: 4 types with different ranges, bonuses, and active growth capabilities
- **Plant Harvesting**: Harvest at any stage for different rewards
- **Weather Effects**: Dynamic weather affecting growth rates

### 🎯 **Progression Systems**
- **Achievement System**: 8 achievements to unlock
- **Garden Challenges**: Daily and weekly challenges with rewards
- **Statistics Tracking**: Comprehensive game statistics with admin panel usage tracking
- **Endless Seasonal Gardening**: No win condition - garden forever through seasonal cycles

### 📱 **User Experience**
- **Multi-Slot Saves**: 3 save slots for different gardens
- **Mobile Optimized**: Touch-friendly controls and responsive design
- **Admin Panel**: Debug tools and creative mode
- **Sound Effects**: Immersive audio feedback

## 💻 System Requirements

- **Browser**: Modern web browser (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)
- **Storage**: LocalStorage support (enabled by default in modern browsers)
- **Audio**: Web Audio API support (for sound effects)
- **Memory**: Minimal requirements - works on most devices
- **Internet**: Required only for initial load, then works offline

## 🚀 Quick Start

### **Play Online**
1. Visit the [live demo](https://Gmast2662.github.io/grow-your-garden/)
2. Start playing immediately - no downloads required!

### **Run Locally**
1. **Clone the repository**
   ```bash
   git clone https://github.com/Gmast2662/grow-your-garden.git
   cd grow-your-garden
   ```

2. **Start a local server**
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Python 2
   python -m SimpleHTTPServer 8000
   
   # Using Node.js
   npx http-server
   ```

3. **Open your browser**
   - Navigate to `http://localhost:8000` (this opens the game on your local computer)
   - Start gardening!

## 🎮 How to Play

### **Getting Started**
1. **Choose a Save Slot**: Select from 3 available slots (fully isolated states)
2. **Plant Seeds**: Buy seeds from the shop and plant them in your garden
3. **Water & Fertilize**: Use tools to help your plants grow
4. **Harvest**: Collect mature plants for money and score (harvest anytime for reduced rewards)
5. **Expand**: Use money to expand your garden and buy better tools
6. **Seasonal Play**: Experience all seasons every 20 days with fast 5-day seasons

### **Game Mechanics**
- **Seasons**: Each season affects plant growth and seed availability (5 real-life days per season)
- **Growth Stages**: Plants progress through 5 visual stages
- **Early Harvesting**: Harvest anytime for reduced rewards
- **Sprinklers**: Automatically water plants and actively grow them within range
- **Tool Upgrades**: Improve efficiency and harvest bonuses
- **Admin Panel**: Pure creative mode for experimentation with transparent usage tracking

### **🌱 Plant Growth System**
- **5 Growth Stages**: Seed → Sprout → Small → Medium → Mature
- **🌱 Continuous Growth**: Plants grow continuously while watered, fertilized, or within sprinkler range
- **💧 Water Growth**: 1 stage every 2 seconds for 8 seconds when watered
- **🌿 Fertilizer Growth**: 1 stage every 1.5 seconds for 12 seconds when fertilized
- **💦 Sprinkler Growth**: 1 stage every 30 seconds while within sprinkler range
- **💰 Stage-Based Harvesting**: Harvest value depends on growth stage
- **⚖️ Risk vs Reward**: Harvest early for less money or wait for full maturity
- **🎯 Strategic Care**: Players must actively manage water and fertilizer resources

### **Endless Gardening**
- **No Win Condition**: Game is designed for endless seasonal gardening
- **Seasonal Cycles**: Garden forever through spring, summer, fall, winter cycles
- **Pure Creative Mode**: Admin panel for experimentation without restrictions
- **Transparent Tracking**: Admin panel usage is tracked for honesty but doesn't restrict gameplay

## 🎮 Controls

### **Mouse/Touch Controls**
- **Click/Tap**: Select seeds, tools, and garden cells
- **Drag**: Move around the garden (mobile)
- **Scroll**: Navigate shop items

### **Keyboard Shortcuts**
- **R**: Refresh game
- **F5**: Reload page
- **Ctrl+S**: Save game (automatic)

## 🌱 Plant Types

### **Spring Seeds**
- Carrot, Lettuce, Radish, Spinach, Peas, Asparagus

### **Summer Seeds**
- Tomato, Corn, Cucumber, Zucchini, Bell Pepper, Watermelon

### **Fall Seeds**
- Pumpkin, Squash, Broccoli, Cauliflower, Cabbage

### **Winter Seeds**
- Winter Greens, Herbs

### **Year-Round Seeds**
- Onion, Garlic, Potato, Celery

### **Rare Seeds**
- Watermelon, Asparagus, Artichoke, Kiwi

### **Legendary Seeds**
- Grapes, Apple, Pineapple, Mango, Dragonfruit

## 🛠️ Technical Details

### **Built With**
- **Frontend**: Vanilla JavaScript (ES6+)
- **Graphics**: HTML5 Canvas for garden rendering
- **Styling**: CSS3 with responsive design
- **Storage**: LocalStorage for game saves
- **Audio**: Web Audio API for sound effects

### **Browser Support**
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### **Performance**
- **Lightweight**: No external dependencies
- **Fast Loading**: Optimized assets and code
- **Smooth Animation**: 60fps garden rendering
- **Memory Efficient**: Minimal memory footprint

## 📁 Project Structure

```
grow-your-garden/
├── index.html          # Main game page
├── game.js            # Core game logic
├── styles.css         # Game styling
├── README.md          # This file
├── UPDATE_LOG.md      # Development history
├── CHANGELOG.md       # Complete technical changelog
└── LICENSE            # MIT License
```

## 🎯 Game Features Deep Dive

### **Seasonal System**
- **Spring**: 20% faster growth (1.2x), spring-specific seeds
- **Summer**: Normal growth speed (1.0x), summer vegetables
- **Fall**: 20% slower growth (0.8x), fall harvest crops
- **Winter**: 40% slower growth (0.6x), limited crop availability
- **Fast Progression**: Seasons change every 5 real-life days for dynamic gameplay

### **Tool System**
- **Watering Can**: Water plants for growth bonus
- **Fertilizer**: Boost plant growth speed
- **Shovel**: Remove unwanted plants
- **Harvest Tool**: Collect plants with bonus money

### **Sprinkler Types**
- **Basic**: 1 tile range, +20% growth
- **Advanced**: 2 tile range, +40% growth, +10% water efficiency
- **Premium**: 2 tile range, +60% growth, +20% water, +10% fertilizer
- **Legendary**: 3 tile range, +80% growth, +30% water, +20% fertilizer

### **Achievement System**
- **Harvest Master**: Harvest 100 plants
- **Speed Grower**: Grow 10 plants in under 5 minutes
- **Rich Gardener**: Earn $1000 in a single session
- **Tool Master**: Upgrade all tools to maximum level
- **And 10+ more achievements!**

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### **Bug Reports**
- Use the [Issues](https://github.com/Gmast2662/grow-your-garden/issues) page
- Include browser version and steps to reproduce

### **Feature Requests**
- Suggest new features via Issues
- Describe the feature and its benefits

### **Code Contributions**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🆕 Recent Updates

### **Latest Version (v1.6.0)**
- 🌸 **NEW**: Garden decorations system with 12 decorative items (paths, statues, fences, seasonal)
- ⛈️ **NEW**: Storm damage system - stormy weather can damage unprotected plants
- 🛡️ **NEW**: Plant protection system - fences provide protection against storm damage
- 🏡 **ENHANCED**: Garden expansion increased to 16x16 maximum size
- 🌱 **NEW**: Continuous growth system - plants grow continuously while watered/fertilized
- ✨ **NEW**: Visual rarity display system - seeds move to correct sections when rarity is set
- 🎨 **ENHANCED**: Shop restock system with proper visual updates and inventory structure
- 🔧 **FIXED**: All console logging cleaned up for cleaner user experience
- 🎯 **IMPROVED**: Rarity command now properly updates seed appearance and section placement
- 🛠️ **CLEANUP**: Removed all debugging messages and console spam
- ✅ **MAJOR FIX**: Shop display now properly updates after restocks
- ✅ **MAJOR FIX**: Inventory structure corruption issues resolved
- ✅ **ENHANCED**: Better visual feedback for rarity changes in the shop
- ✅ **IMPROVED**: Cleaner codebase with all debugging removed
- ✅ **MAINTENANCE**: Comprehensive console logging cleanup throughout the game

*See [UPDATE_LOG.md](UPDATE_LOG.md) for complete changelog*

## 📝 Development History

See [UPDATE_LOG.md](UPDATE_LOG.md) for a detailed history of all updates, bug fixes, and new features.

**📋 For complete technical details and implementation specifics, see [CHANGELOG.md](CHANGELOG.md)**

## 🎨 For Developers

This game is built with vanilla JavaScript and is fully customizable. Check out the code to see how it works or modify it for your own projects!

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Emoji Icons**: Built-in browser emoji support
- **Game Design**: Inspired by classic farming simulation games and Grow a Garden (Roblox)
- **AI Assistance**: Developed with help from Claude AI
- **Community**: Thanks to all players and contributors

## 🔧 Troubleshooting

### **Common Issues**
- **Game won't load**: Try refreshing the page or clearing browser cache
- **Saves not working**: Ensure LocalStorage is enabled in your browser
- **Buttons not responding**: Try refreshing the page
- **Mobile issues**: Use landscape mode for better experience
- **Save slot issues**: All save slots now have fully isolated states - no more cross-contamination

### **Browser Compatibility**
- **Chrome/Edge**: Full support, recommended
- **Firefox**: Full support
- **Safari**: Full support (including mobile)
- **Internet Explorer**: Not supported

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Gmast2662/grow-your-garden/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Gmast2662/grow-your-garden/discussions)
- **Email**: avigmast@icloud.com

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Gmast2662/grow-your-garden&type=Date)](https://star-history.com/#Gmast2662/grow-your-garden&Date)

---

**Made with ❤️ by Avi (Gmast)**

*If you enjoy this game, consider giving it a ⭐ on GitHub!*
