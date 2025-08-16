# 🌱 Grow Your Garden

A feature-rich, browser-based gardening simulation game built with vanilla JavaScript, HTML5 Canvas, and CSS3. Plant seeds, manage resources, upgrade tools, and grow your perfect garden!

This game is still in progress and you may experience some bugs, try to only do 1 slot as more than that could cause issues.

![Grow Your Garden](https://img.shields.io/badge/Status-Complete-brightgreen)
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
- **Sprinkler System**: 4 types with different ranges and bonuses
- **Plant Harvesting**: Harvest at any stage for different rewards
- **Weather Effects**: Dynamic weather affecting growth rates

### 🎯 **Progression Systems**
- **Achievement System**: 15+ achievements to unlock
- **Garden Challenges**: Daily and weekly challenges with rewards
- **Statistics Tracking**: Comprehensive game statistics
- **Winning System**: Reach 10,000 score to win

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
1. **Choose a Save Slot**: Select from 3 available slots
2. **Plant Seeds**: Buy seeds from the shop and plant them in your garden
3. **Water & Fertilize**: Use tools to help your plants grow
4. **Harvest**: Collect mature plants for money and score
5. **Expand**: Use money to expand your garden and buy better tools

### **Game Mechanics**
- **Seasons**: Each season affects plant growth and seed availability
- **Growth Stages**: Plants progress through 5 visual stages
- **Early Harvesting**: Harvest anytime for reduced rewards
- **Sprinklers**: Automatically water plants within range
- **Tool Upgrades**: Improve efficiency and harvest bonuses

### **Winning**
- Reach **10,000 score** to win the game
- Score is earned by harvesting plants and completing challenges
- Using the admin panel disables winning (creative mode)

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
└── LICENSE            # MIT License
```

## 🎯 Game Features Deep Dive

### **Seasonal System**
- **Spring**: Balanced growth, spring-specific seeds
- **Summer**: Fast growth, summer vegetables
- **Fall**: Moderate growth, fall harvest crops
- **Winter**: Slow growth, greenhouse plants

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

### **Latest Version (v1.3.0)**
- ✅ Fixed seed selection and button responsiveness issues
- ✅ Improved shop display and UI consistency
- ✅ Enhanced mobile experience
- ✅ Fixed plant growth stage display
- ✅ Updated copyright year to 2025

*See [UPDATE_LOG.md](UPDATE_LOG.md) for complete changelog*

## 📝 Development History

See [UPDATE_LOG.md](UPDATE_LOG.md) for a detailed history of all updates, bug fixes, and new features.

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
