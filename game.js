// Advanced Garden Game
class GardenGame {
    constructor(saveSlot) {
        this.saveSlot = saveSlot;
        this.eventListeners = [];
        
        // Make this game instance globally available
        window.game = this;
        
        // Core game properties
        this.money = 100;
        this.water = 50;
        this.fertilizer = 20;
        this.score = 0;
        this.weather = 'sunny';
        this.weatherChangeInterval = 5 * 60 * 1000; // 5 minutes
        this.lastWeatherChange = Date.now();
        
        // Seasonal system
        this.currentSeason = 'spring';
        this.seasonDay = 1;
        this.seasonLength = 5; // real-life days per season (5 days = 1 season)
        this.seasonMultiplier = 1.0;
        this.seasonStartTime = null; // Will be set on first updateSeason() call
        
        // Plant growth stages
        this.growthStages = ['seed', 'sprout', 'small', 'medium', 'mature'];
        this.stageMultipliers = [0.1, 0.3, 0.6, 0.8, 1.0]; // harvest value multipliers
        
                    // Garden expansion
        this.gardenSize = 8;
        this.maxGardenSize = 16; // Increased from 12 to 16
        this.expansionCost = 5000;
        
        // Garden statistics
        this.stats = {
            totalPlantsHarvested: 0,
            totalMoneyEarned: 0,
            totalWaterUsed: 0,
            totalFertilizerUsed: 0,
            plantsByType: {},
            bestHarvest: 0,
            longestPlaySession: 0,
            sessionStartTime: Date.now(),
            adminPanelUsed: false,
            adminPanelUsageCount: 0
        };
        
        // Garden challenges
        this.challenges = {
            daily: null,
            weekly: null,
            completed: []
        };
        this.lastChallengeUpdate = Date.now();
        
        // Visual feedback
        this.particles = [];
        this.animations = [];
        
        // Sound effects (will be implemented)
        this.soundEnabled = true;
        
        // Plant types with seasonal availability
        this.plantTypes = {
            // Spring seeds
            'carrot': { name: 'Carrot', cost: 5, growthTime: 10000, harvestValue: 8, season: 'spring', stages: ['🌱', '🌿', '🥕', '🥕', '🥕'] },
            'lettuce': { name: 'Lettuce', cost: 3, growthTime: 8000, harvestValue: 5, season: 'spring', stages: ['🌱', '🌿', '🥬', '🥬', '🥬'] },
            'radish': { name: 'Radish', cost: 4, growthTime: 12000, harvestValue: 7, season: 'spring', stages: ['🌱', '🌿', '🥬', '🥬', '🥬'] },
            'spinach': { name: 'Spinach', cost: 6, growthTime: 15000, harvestValue: 10, season: 'spring', stages: ['🌱', '🌿', '🥬', '🥬', '🥬'] },
            'peas': { name: 'Peas', cost: 7, growthTime: 18000, harvestValue: 12, season: 'spring', stages: ['🫛', '🫛', '🫛', '🫛', '🫛'] },
            
            // Summer seeds
            'tomato': { name: 'Tomato', cost: 8, growthTime: 20000, harvestValue: 15, season: 'summer', stages: ['🌱', '🌿', '🍅', '🍅', '🍅'] },
            'corn': { name: 'Corn', cost: 12, growthTime: 25000, harvestValue: 20, season: 'summer', stages: ['🌱', '🌿', '🌽', '🌽', '🌽'] },
            'cucumber': { name: 'Cucumber', cost: 6, growthTime: 16000, harvestValue: 11, season: 'summer', stages: ['🌱', '🌿', '🥒', '🥒', '🥒'] },
            'zucchini': { name: 'Zucchini', cost: 9, growthTime: 22000, harvestValue: 16, season: 'summer', stages: ['🌱', '🌿', '🥬', '🥬', '🥬'] },
            'bell_pepper': { name: 'Bell Pepper', cost: 10, growthTime: 22000, harvestValue: 18, season: 'summer', stages: ['🫑', '🫑', '🫑', '🫑', '🫑'] },
            
            // Fall seeds
            'pumpkin': { name: 'Pumpkin', cost: 25, growthTime: 35000, harvestValue: 45, season: 'fall', stages: ['🎃', '🎃', '🎃', '🎃', '🎃'] },
            'squash': { name: 'Squash', cost: 15, growthTime: 28000, harvestValue: 25, season: 'fall', stages: ['🌱', '🌿', '🥬', '🥬', '🥬'] },
            'broccoli': { name: 'Broccoli', cost: 11, growthTime: 24000, harvestValue: 19, season: 'fall', stages: ['🌱', '🌿', '🥦', '🥦', '🥦'] },
            'cauliflower': { name: 'Cauliflower', cost: 14, growthTime: 26000, harvestValue: 22, season: 'fall', stages: ['🌱', '🌿', '🥬', '🥬', '🥬'] },
            'cabbage': { name: 'Cabbage', cost: 8, growthTime: 20000, harvestValue: 14, season: 'fall', stages: ['🌱', '🌿', '🥬', '🥬', '🥬'] },
            
            // Winter seeds (greenhouse)
            'winter_greens': { name: 'Winter Greens', cost: 20, growthTime: 30000, harvestValue: 35, season: 'winter', stages: ['🌱', '🌿', '🥬', '🥬', '🥬'] },
            'herbs': { name: 'Herbs', cost: 15, growthTime: 25000, harvestValue: 28, season: 'winter', stages: ['🌿', '🌿', '🌿', '🌿', '🌿'] },
            
            // Year-round seeds
            'onion': { name: 'Onion', cost: 4, growthTime: 14000, harvestValue: 6, season: 'all', stages: ['🧅', '🧅', '🧅', '🧅', '🧅'] },
            'garlic': { name: 'Garlic', cost: 5, growthTime: 16000, harvestValue: 8, season: 'all', stages: ['🧄', '🧄', '🧄', '🧄', '🧄'] },
            'potato': { name: 'Potato', cost: 7, growthTime: 18000, harvestValue: 12, season: 'all', stages: ['🥔', '🥔', '🥔', '🥔', '🥔'] },
            'celery': { name: 'Celery', cost: 6, growthTime: 15000, harvestValue: 9, season: 'all', stages: ['🌱', '🌿', '🥬', '🥬', '🥬'] },
            
            // Rare seeds (available in multiple seasons)
            'watermelon': { name: 'Watermelon', cost: 20, growthTime: 30000, harvestValue: 35, season: 'summer', stages: ['🌱', '🌿', '🍉', '🍉', '🍉'], isRare: true },
            'asparagus': { name: 'Asparagus', cost: 13, growthTime: 26000, harvestValue: 21, season: 'spring', stages: ['🌱', '🌿', '🥬', '🥬', '🥬'], isRare: true },
            'artichoke': { name: 'Artichoke', cost: 16, growthTime: 32000, harvestValue: 28, season: 'fall', stages: ['🌱', '🌿', '🥬', '🥬', '🥬'], isRare: true },
            'kiwi': { name: 'Kiwi', cost: 22, growthTime: 34000, harvestValue: 38, season: 'fall', stages: ['🌱', '🌿', '🥝', '🥝', '🥝'], isRare: true },
            
            // Legendary seeds (available year-round but expensive)
            'grapes': { name: 'Grapes', cost: 18, growthTime: 35000, harvestValue: 30, season: 'all', stages: ['🌱', '🌿', '🍇', '🍇', '🍇'], isLegendary: true },
            'apple': { name: 'Apple', cost: 15, growthTime: 32000, harvestValue: 25, season: 'all', stages: ['🌱', '🌿', '🍎', '🍎', '🍎'], isLegendary: true },
            'pineapple': { name: 'Pineapple', cost: 30, growthTime: 50000, harvestValue: 50, season: 'all', stages: ['🌱', '🌿', '🍍', '🍍', '🍍'], isLegendary: true },
            'mango': { name: 'Mango', cost: 28, growthTime: 48000, harvestValue: 45, season: 'all', stages: ['🌱', '🌿', '🥭', '🥭', '🥭'], isLegendary: true },
            'dragonfruit': { name: 'Dragonfruit', cost: 35, growthTime: 60000, harvestValue: 60, season: 'all', stages: ['🌱', '🌿', '🌳', '🌳', '🐉'], isLegendary: true }
        };
        
        // Game state
        this.selectedSeed = null;
        this.selectedSprinkler = null;
        this.selectedDecoration = null;
        this.currentTool = 'water';
        this.isRunning = true;
        
        // Garden grid setup
        this.gridSize = this.gardenSize;
        this.cellSize = Math.floor(600 / this.gridSize);
        
        // Adjust cell size for mobile devices
        if (window.innerWidth <= 768) {
            this.cellSize = Math.max(75, Math.floor(window.innerWidth * 0.8 / this.gridSize));
        }
        
        this.garden = this.initializeGarden();
        
        // Initialize canvas and context
        const canvasElement = document.getElementById('gardenCanvas');
        if (canvasElement) {
            this.canvas = canvasElement;
            this.ctx = this.canvas.getContext('2d');
        } else {
            this.canvas = null;
            this.ctx = null;
        }
        
        // Tool levels and upgrade costs
        this.toolLevels = {
            water: 1,
            fertilizer: 1,
            shovel: 1,
            harvest: 1
        };
        
        this.toolUpgradeCosts = {
            water: 50,
            fertilizer: 75,
            shovel: 25,
            harvest: 100
        };
        
        // Tool cooldowns
        this.toolCooldowns = {
            water: 0,
            fertilizer: 0
        };
        
        // Plant effects
        this.plantEffects = {
            watered: {},
            fertilized: {}
        };
        
        // Weather system
        this.weatherEffects = {
            sunny: { growthMultiplier: 1.0, name: 'Sunny' },
            rainy: { growthMultiplier: 1.5, name: 'Rainy' },
            cloudy: { growthMultiplier: 0.8, name: 'Cloudy' },
            stormy: { growthMultiplier: 2.0, name: 'Stormy' }
        };
        
        // Sprinkler system
        this.sprinklerTypes = {
            basic: { price: 50, range: 1, growthBonus: 0.2, waterBonus: 0, fertilizerBonus: 0, color: '#87CEEB', icon: '💧', description: '+20% growth, 1 tile range', duration: 120000 },
            advanced: { price: 150, range: 2, growthBonus: 0.4, waterBonus: 0.1, fertilizerBonus: 0, color: '#4A90E2', icon: '🌊', description: '+40% growth, +10% water efficiency, 2 tile range', duration: 180000 },
            premium: { price: 300, range: 2, growthBonus: 0.6, waterBonus: 0.2, fertilizerBonus: 0.1, color: '#9B59B6', icon: '🌈', description: '+60% growth, +20% water, +10% fertilizer, 2 tile range', duration: 240000 },
            legendary: { price: 500, range: 3, growthBonus: 0.8, waterBonus: 0.3, fertilizerBonus: 0.2, color: '#E74C3C', icon: '⭐', description: '+80% growth, +30% water, +20% fertilizer, 3 tile range', duration: 300000 }
        };
        
        // Decoration system
        this.decorations = {
            // Paths & Ground Decorations
            'stone_path': { name: 'Stone Path', cost: 25, type: 'path', icon: '🪨', bonus: 'none', description: 'Beautiful stone pathway' },
            'wooden_path': { name: 'Wooden Path', cost: 15, type: 'path', icon: '🪵', bonus: 'none', description: 'Rustic wooden walkway' },
            'flower_bed': { name: 'Flower Bed', cost: 50, type: 'decoration', icon: '🌸', bonus: '+5% growth', description: 'Attracts beneficial insects' },
            
            // Statues & Ornaments
            'garden_gnome': { name: 'Garden Gnome', cost: 100, type: 'statue', icon: '🧙', bonus: '+10% harvest value', description: 'Magical garden guardian' },
            'bird_bath': { name: 'Bird Bath', cost: 75, type: 'statue', icon: '🛁', bonus: '+15% water efficiency', description: 'Attracts helpful birds' },
            'sundial': { name: 'Sundial', cost: 200, type: 'statue', icon: '⏰', bonus: '+20% growth speed', description: 'Ancient time-keeping wisdom' },
            
            // Fences & Borders
            'picket_fence': { name: 'Picket Fence', cost: 30, type: 'fence', icon: '🏡', bonus: '+5% plant protection', description: 'Classic garden border' },
            'stone_wall': { name: 'Stone Wall', cost: 80, type: 'fence', icon: '🧱', bonus: '+10% plant protection', description: 'Sturdy garden defense' },
            
            // Seasonal Decorations
            'christmas_lights': { name: 'Christmas Lights', cost: 150, type: 'seasonal', icon: '🎄', bonus: '+25% winter growth', season: 'winter', description: 'Festive winter cheer' },
            'halloween_pumpkins': { name: 'Halloween Pumpkins', cost: 100, type: 'seasonal', icon: '🎃', bonus: '+20% fall harvest', season: 'fall', description: 'Spooky fall decoration' },
            'spring_tulips': { name: 'Spring Tulips', cost: 60, type: 'seasonal', icon: '🌷', bonus: '+15% spring growth', season: 'spring', description: 'Beautiful spring flowers' },
            'summer_sunflowers': { name: 'Summer Sunflowers', cost: 70, type: 'seasonal', icon: '🌻', bonus: '+15% summer growth', season: 'summer', description: 'Bright summer beauty' }
        };
        
        // Auto-save system
        this.lastAutoSave = Date.now();
        this.autoSaveInterval = 60000; // 1 minute
        
        // Sound system
        this.audioContext = null;
        this.initializeSound();
        
        // Shop inventory (will be initialized in initializeFreshGame)
        this.shopInventory = {};
        
        // Restock system
        this.lastRestockTime = Date.now();
        this.restockInterval = 300000; // 5 minutes
        this.rareRestockChance = 0.25; // 25% chance for rare seeds
        this.legendaryRestockChance = 0.12; // 12% chance for legendary seeds
        

        
        // Only load game and initialize UI if we have a canvas (not for background processing)
        if (this.canvas) {
            this.loadGame();
            this.initializeEventListeners();
            this.initializeAdminPanel();
            this.updateUI();
            this.updateToolDisplay();
            this.updateSprinklerDisplay();
            this.updateAchievementsDisplay();
            this.gameLoop();
        }
        
        // Initialize challenges
        this.generateChallenges();
    }
    
    // ===== SEASONAL SYSTEM =====
    updateSeason() {
        // For new games, always start from Spring Day 1
        if (!this.seasonStartTime) {
            this.seasonStartTime = Date.now();
            this.currentSeason = 'spring';
            this.seasonDay = 1;
            this.updateSeasonMultiplier();
            return;
        }
        
        const now = Date.now();
        const dayInMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        const daysSinceStart = Math.floor((now - this.seasonStartTime) / dayInMs);
        const seasonDay = (daysSinceStart % this.seasonLength) + 1;
        
        const seasons = ['spring', 'summer', 'fall', 'winter'];
        const seasonIndex = Math.floor(daysSinceStart / this.seasonLength) % 4;
        const newSeason = seasons[seasonIndex];
        
        if (newSeason !== this.currentSeason) {
            this.currentSeason = newSeason;
            this.seasonDay = 1;
            this.updateSeasonMultiplier();
            this.showMessage(`Season changed to ${this.currentSeason}!`, 'info');
            this.updateSeasonDisplay();
        } else {
            this.seasonDay = seasonDay;
        }
    }
    
    updateSeasonMultiplier() {
        const seasonMultipliers = {
            spring: 1.2, // 20% faster growth
            summer: 1.0, // Normal growth
            fall: 0.8,   // 20% slower growth
            winter: 0.6  // 40% slower growth
        };
        this.seasonMultiplier = seasonMultipliers[this.currentSeason] || 1.0;
    }
    
    isSeedAvailable(seedType) {
        const plant = this.plantTypes[seedType];
        if (!plant) return false;
        
        if (plant.season === 'all') return true;
        return plant.season === this.currentSeason;
    }
    
    // ===== PLANT GROWTH STAGES =====
    getPlantGrowthStage(plant) {
        if (!plant) return 0;
        
        // Plants now only grow through watering and fertilizing
        // Return the stored growth stage instead of calculating from time
        return plant.growthStage || 0;
    }
    
    getHarvestValue(plant) {
        const plantData = this.plantTypes[plant.type];
        if (!plantData) return 0;
        
        const baseValue = plantData.harvestValue;
        const stage = this.getPlantGrowthStage(plant);
        const stageMultiplier = this.stageMultipliers[stage] || 1.0;
        return Math.floor(baseValue * stageMultiplier);
    }
    
    // ===== GARDEN EXPANSION =====
    expandGarden() {
        if (this.gardenSize >= this.maxGardenSize) {
            this.showMessage('Garden is already at maximum size!', 'error');
            return false;
        }
        
        if (this.money < this.expansionCost) {
            this.showMessage(`Not enough money! Need $${this.expansionCost}`, 'error');
            return false;
        }
        
        this.money -= this.expansionCost;
        this.gardenSize++;
        this.gridSize = this.gardenSize;
        this.cellSize = Math.floor(600 / this.gridSize);
        
        // Expand the garden array while preserving existing plants
        const oldGarden = this.garden;
        this.garden = this.initializeGarden();
        
        // Copy existing plants and decorations to the new garden
        for (let row = 0; row < oldGarden.length; row++) {
            for (let col = 0; col < oldGarden[row].length; col++) {
                if (oldGarden[row][col].plant || oldGarden[row][col].decoration) {
                    this.garden[row][col] = {
                        plant: oldGarden[row][col].plant,
                        decoration: oldGarden[row][col].decoration,
                        watered: oldGarden[row][col].watered,
                        wateredAt: oldGarden[row][col].wateredAt,
                        waterCooldown: oldGarden[row][col].waterCooldown,
                        fertilized: oldGarden[row][col].fertilized,
                        fertilizedAt: oldGarden[row][col].fertilizedAt,
                        fertilizerCooldown: oldGarden[row][col].fertilizerCooldown,
                        plantedAt: oldGarden[row][col].plantedAt
                    };
                }
            }
        }
        
        // Update expansion cost for next expansion
        this.expansionCost = Math.floor(this.expansionCost * 1.3);
        
        this.showMessage(`Garden expanded to ${this.gardenSize}x${this.gardenSize}!`, 'success');
        this.updateUI();
        this.saveGame();
        return true;
    }
    
    // ===== GARDEN CHALLENGES =====
    generateChallenges() {
        const now = Date.now();
        const dayInMs = 24 * 60 * 60 * 1000;
        const currentDay = Math.floor(now / dayInMs);
        
        // Generate daily challenge if needed
        if (!this.challenges.daily || this.challenges.daily.day !== currentDay) {
            this.challenges.daily = this.createDailyChallenge();
        }
        
        // Generate weekly challenge if needed
        const weekInMs = 7 * dayInMs;
        const currentWeek = Math.floor(now / weekInMs);
        if (!this.challenges.weekly || this.challenges.weekly.week !== currentWeek) {
            this.challenges.weekly = this.createWeeklyChallenge();
        }
    }
    
    createDailyChallenge() {
        const challenges = [
            { challengeType: 'harvest', target: 10, description: 'Harvest 10 plants', reward: 50 },
            { challengeType: 'plant', target: 15, description: 'Plant 15 seeds', reward: 30 },
            { challengeType: 'water', target: 20, description: 'Water 20 plants', reward: 25 },
            { challengeType: 'money', target: 200, description: 'Earn $200', reward: 40 },
            { challengeType: 'rare', target: 3, description: 'Harvest 3 rare plants', reward: 75 }
        ];
        
        const challenge = challenges[Math.floor(Math.random() * challenges.length)];
        return {
            type: 'daily',
            challengeType: challenge.challengeType,
            target: challenge.target,
            description: challenge.description,
            reward: challenge.reward,
            day: Math.floor(Date.now() / (24 * 60 * 60 * 1000)),
            progress: 0,
            completed: false
        };
    }
    
    createWeeklyChallenge() {
        const challenges = [
            { challengeType: 'harvest', target: 50, description: 'Harvest 50 plants', reward: 200 },
            { challengeType: 'plant', target: 75, description: 'Plant 75 seeds', reward: 150 },
            { challengeType: 'money', target: 1000, description: 'Earn $1000', reward: 300 },
            { challengeType: 'legendary', target: 5, description: 'Harvest 5 legendary plants', reward: 500 },
            { challengeType: 'expansion', target: 1, description: 'Expand garden once', reward: 400 }
        ];
        
        const challenge = challenges[Math.floor(Math.random() * challenges.length)];
        return {
            type: 'weekly',
            challengeType: challenge.challengeType,
            target: challenge.target,
            description: challenge.description,
            reward: challenge.reward,
            week: Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)),
            progress: 0,
            completed: false
        };
    }
    
    updateChallengeProgress(type, amount = 1) {
        // Update daily challenge
        if (this.challenges.daily && !this.challenges.daily.completed && this.challenges.daily.challengeType === type) {
            this.challenges.daily.progress += amount;
            if (this.challenges.daily.progress >= this.challenges.daily.target) {
                this.completeChallenge(this.challenges.daily);
            }
        }
        
        // Update weekly challenge
        if (this.challenges.weekly && !this.challenges.weekly.completed && this.challenges.weekly.challengeType === type) {
            this.challenges.weekly.progress += amount;
            if (this.challenges.weekly.progress >= this.challenges.weekly.target) {
                this.completeChallenge(this.challenges.weekly);
            }
        }
    }
    
    completeChallenge(challenge) {
        challenge.completed = true;
        this.money += challenge.reward;
        this.challenges.completed.push(challenge);
        this.showMessage(`Challenge completed! +$${challenge.reward}`, 'success');
        this.updateUI();
        this.saveGame();
    }
    
    // ===== VISUAL FEEDBACK =====
    addParticle(x, y, type, value) {
        this.particles.push({
            x: x,
            y: y,
            type: type,
            value: value,
            life: 90, // 90 frames for longer visibility
            maxLife: 90,
            vx: (Math.random() - 0.5) * 3,
            vy: -3 - Math.random() * 2,
            scale: 1 + Math.random() * 0.5 // Random size variation
        });
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            return particle.life > 0;
        });
    }
    
    drawParticles() {
        if (!this.ctx) return;
        
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            
            // Different colors and styles for different particle types
            switch (particle.type) {
                case 'money':
                    this.ctx.fillStyle = '#FFD700';
                    this.ctx.strokeStyle = '#FFA500';
                    this.ctx.lineWidth = 2;
                    this.ctx.font = `${Math.floor(16 * (particle.scale || 1))}px Arial`;
                    this.ctx.fillText(`+$${particle.value}`, particle.x, particle.y);
                    this.ctx.strokeText(`+$${particle.value}`, particle.x, particle.y);
                    break;
                case 'water':
                    this.ctx.fillStyle = '#87CEEB';
                    this.ctx.font = `${Math.floor(20 * (particle.scale || 1))}px Arial`;
                    this.ctx.fillText('💧', particle.x, particle.y);
                    break;
                case 'fertilizer':
                    this.ctx.fillStyle = '#FFD700';
                    this.ctx.font = `${Math.floor(20 * (particle.scale || 1))}px Arial`;
                    this.ctx.fillText('🌱', particle.x, particle.y);
                    break;
                case 'plant':
                    this.ctx.fillStyle = '#32CD32';
                    this.ctx.font = `${Math.floor(20 * (particle.scale || 1))}px Arial`;
                    this.ctx.fillText('🌱', particle.x, particle.y);
                    break;
                case 'upgrade':
                    this.ctx.fillStyle = '#FF6B6B';
                    this.ctx.font = `${Math.floor(24 * (particle.scale || 1))}px Arial`;
                    this.ctx.fillText('⬆️', particle.x, particle.y);
                    break;
                case 'sprinkler':
                    this.ctx.fillStyle = '#4A90E2';
                    this.ctx.font = `${Math.floor(20 * (particle.scale || 1))}px Arial`;
                    this.ctx.fillText('💧', particle.x, particle.y);
                    break;
                case 'decoration':
                    this.ctx.fillStyle = '#FF69B4';
                    this.ctx.font = `${Math.floor(24 * (particle.scale || 1))}px Arial`;
                    this.ctx.fillText(particle.value, particle.x, particle.y);
                    break;
                case 'damage':
                    this.ctx.fillStyle = '#FF4444';
                    this.ctx.font = `${Math.floor(20 * (particle.scale || 1))}px Arial`;
                    this.ctx.fillText('💥', particle.x, particle.y);
                    break;
                default:
                    this.ctx.fillStyle = '#00FF00';
                    this.ctx.font = `${Math.floor(16 * (particle.scale || 1))}px Arial`;
                    this.ctx.fillText(`+${particle.value}`, particle.x, particle.y);
            }
            
            this.ctx.restore();
        });
    }
    
    // ===== GARDEN STATISTICS =====
    updateStats(type, amount = 1) {
        switch (type) {
            case 'harvest':
                this.stats.totalPlantsHarvested += amount;
                break;
            case 'money':
                this.stats.totalMoneyEarned += amount;
                if (amount > this.stats.bestHarvest) {
                    this.stats.bestHarvest = amount;
                }
                break;
            case 'water':
                this.stats.totalWaterUsed += amount;
                break;
            case 'fertilizer':
                this.stats.totalFertilizerUsed += amount;
                break;
            case 'plant':
                const plantType = amount;
                this.stats.plantsByType[plantType] = (this.stats.plantsByType[plantType] || 0) + 1;
                break;
        }
    }
    
    updateSessionTime() {
        const now = Date.now();
        const sessionTime = now - this.stats.sessionStartTime;
        if (sessionTime > this.stats.longestPlaySession) {
            this.stats.longestPlaySession = sessionTime;
        }
    }
    
    // ===== SOUND EFFECTS =====
    initializeSound() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            this.soundEnabled = false;
        }
    }
    
    playSound(type) {
        if (!this.soundEnabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        const sounds = {
            harvest: { frequency: 800, duration: 0.2 },
            plant: { frequency: 600, duration: 0.15 },
            water: { frequency: 400, duration: 0.1 },
            money: { frequency: 1000, duration: 0.3 },
            upgrade: { frequency: 1200, duration: 0.4 }
        };
        
        const sound = sounds[type];
        if (sound) {
            oscillator.frequency.setValueAtTime(sound.frequency, this.audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + sound.duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + sound.duration);
        }
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.showMessage(`Sound ${this.soundEnabled ? 'enabled' : 'disabled'}!`, 'success');
        this.saveGame();
        
        // Update button text
        const soundBtn = document.getElementById('soundBtn');
        if (soundBtn) {
            soundBtn.textContent = this.soundEnabled ? '🔊 Sound' : '🔇 Sound';
        }
    }
    
    initializeGarden() {
        const garden = [];
        for (let row = 0; row < this.gridSize; row++) {
            garden[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                garden[row][col] = {
                    plant: null,
                    sprinkler: null,
                    decoration: null,
                    watered: false,
                    wateredAt: null,
                    waterCooldown: 0,
                    fertilized: false,
                    fertilizedAt: null,
                    fertilizerCooldown: 0,
                    plantedAt: null
                };
            }
        }
        return garden;
    }
    
    initializeEventListeners() {
        if (!this.canvas) {
            return;
        }
        
        // Remove any existing event listeners first
        this.removeEventListeners();
        
        // Adjust canvas size for mobile devices
        this.adjustCanvasForMobile();
        
        // Helper function to add event listeners and track them
        const addBtnListener = (element, event, handler) => {
            if (element) {
                // Remove any existing listeners first to prevent duplicates
                element.removeEventListener(event, handler);
                element.addEventListener(event, handler);
                this.eventListeners.push({ element, event, handler });
            }
        };
        
        // Canvas event listeners
        addBtnListener(this.canvas, 'click', (e) => this.handleCanvasClick(e));
        addBtnListener(this.canvas, 'mousemove', (e) => this.handleMouseMove(e));
        
        // Touch event listeners for mobile
        let touchStartTime = 0;
        let touchStartPos = { x: 0, y: 0 };
        
        addBtnListener(this.canvas, 'touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            touchStartPos.x = touch.clientX - rect.left;
            touchStartPos.y = touch.clientY - rect.top;
            touchStartTime = Date.now();
            
            console.log('Touch start detected:', touchStartPos.x, touchStartPos.y);
        });
        
        addBtnListener(this.canvas, 'touchmove', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleMouseMove(e);
        });
        
        addBtnListener(this.canvas, 'touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Only trigger click if it's a short tap (not a scroll)
            const touchEndTime = Date.now();
            const touchDuration = touchEndTime - touchStartTime;
            
            if (touchDuration < 300) { // Less than 300ms = tap
                const touch = e.changedTouches[0];
                const rect = this.canvas.getBoundingClientRect();
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                
                // Check if touch ended near where it started (to avoid scroll-triggered clicks)
                const distance = Math.sqrt(
                    Math.pow(x - touchStartPos.x, 2) + Math.pow(y - touchStartPos.y, 2)
                );
                
                if (distance < 20) { // Less than 20px movement = tap
                    this.handleCanvasClick({ 
                        clientX: touch.clientX, 
                        clientY: touch.clientY,
                        touches: [touch]
                    });
                }
            }
        });
        
        // Fallback touch event for better mobile compatibility
        addBtnListener(this.canvas, 'click', (e) => {
            // This will handle both mouse clicks and touch events that bubble up
        });
        
        // Seed selection
        document.querySelectorAll('.seed-item').forEach(item => {
            addBtnListener(item, 'click', () => {
                this.selectSeed(item.dataset.seed);
            });
        });
        
        // Tool selection
        addBtnListener(document.getElementById('water-btn'), 'click', () => {
            this.selectTool('water');
        });
        addBtnListener(document.getElementById('fertilizer-btn'), 'click', () => {
            this.selectTool('fertilizer');
        });
        addBtnListener(document.getElementById('harvest-btn'), 'click', () => {
            this.selectTool('harvest');
        });
        addBtnListener(document.getElementById('shovel-btn'), 'click', () => {
            this.selectTool('shovel');
        });
        
        // Tool upgrade buttons
        addBtnListener(document.getElementById('upgrade-water-btn'), 'click', () => this.upgradeTool('water'));
        addBtnListener(document.getElementById('upgrade-fertilizer-btn'), 'click', () => this.upgradeTool('fertilizer'));
        addBtnListener(document.getElementById('upgrade-shovel-btn'), 'click', () => this.upgradeTool('shovel'));
        
        // Garden expansion button
        addBtnListener(document.getElementById('expandBtn'), 'click', () => this.expandGarden());
        addBtnListener(document.getElementById('upgrade-harvest-btn'), 'click', () => this.upgradeTool('harvest'));
        
        // Sound toggle button
        addBtnListener(document.getElementById('soundBtn'), 'click', () => this.toggleSound());
        
        // Sprinkler shop
        document.querySelectorAll('.sprinkler-item').forEach(item => {
            addBtnListener(item, 'click', () => {
                this.buySprinkler(item.dataset.sprinkler);
            });
        });
        
        // Sprinkler tool buttons
        addBtnListener(document.getElementById('sprinkler-basic-btn'), 'click', () => this.selectSprinkler('basic'));
        addBtnListener(document.getElementById('sprinkler-advanced-btn'), 'click', () => this.selectSprinkler('advanced'));
        addBtnListener(document.getElementById('sprinkler-premium-btn'), 'click', () => this.selectSprinkler('premium'));
        addBtnListener(document.getElementById('sprinkler-legendary-btn'), 'click', () => this.selectSprinkler('legendary'));
        
        // Admin panel modal
        this.initializeAdminModal();
        this.initializeDecorationShop();
        
        // Initialize multiplayer system
        this.initializeMultiplayer();
        
        // Add window resize listener for responsive canvas
        addBtnListener(window, 'resize', () => {
            this.adjustCanvasForMobile();
            this.draw(); // Redraw with new canvas size
        });
        
        // Test if event listeners are working
        console.log('Event listeners added. Testing...');
        setTimeout(() => {
            console.log('Testing button elements...');
            const waterBtn = document.getElementById('water-btn');
            const harvestBtn = document.getElementById('harvest-btn');
            console.log('Water button found:', !!waterBtn);
            console.log('Harvest button found:', !!harvestBtn);
        }, 1000);
    }
    
    adjustCanvasForMobile() {
        if (!this.canvas) return;
        
        // Calculate responsive canvas size
        const maxCanvasSize = 600;
        let canvasSize = maxCanvasSize;
        
        if (window.innerWidth <= 768) {
            // On mobile, make canvas responsive but maintain minimum size
            canvasSize = Math.max(400, Math.min(maxCanvasSize, window.innerWidth * 0.8));
        }
        
        // Set canvas size
        this.canvas.width = canvasSize;
        this.canvas.height = canvasSize;
        
        // Recalculate cell size based on new canvas size
        this.cellSize = Math.floor(canvasSize / this.gridSize);
    }
    
    initializeAdminModal() {
        const adminBtn = document.getElementById('adminBtn');
        const adminModal = document.getElementById('adminModal');
        const closeAdminBtn = document.getElementById('closeAdminBtn');
        const adminTabs = document.querySelectorAll('.admin-tab');
        const adminTabContents = document.querySelectorAll('.admin-tab-content');
        
        // Helper function to add event listeners and track them
        const addBtnListener = (element, event, handler) => {
            if (element) {
                // Remove any existing listeners first to prevent duplicates
                element.removeEventListener(event, handler);
                element.addEventListener(event, handler);
                this.eventListeners.push({ element, event, handler });
            }
        };
        
        // Open admin modal
                      addBtnListener(adminBtn, 'click', () => {
                          // Show warning about admin panel usage being tracked
                          const confirmed = confirm('⚠️ ADMIN PANEL ACCESS\n\nUsing admin commands will be recorded in your game statistics.\n\nThis shows that you\'ve used creative mode features for experimentation and fun!\n\nContinue to admin panel?');
                          if (confirmed) {
                              adminModal.style.display = 'block';
                              document.body.style.overflow = 'hidden'; // Prevent background scrolling
                          }
        });
        
        // Close admin modal
        addBtnListener(closeAdminBtn, 'click', () => {
            adminModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
        
        // Close modal when clicking outside
        addBtnListener(adminModal, 'click', (e) => {
            if (e.target === adminModal) {
                adminModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
        
        // Tab switching
        adminTabs.forEach(tab => {
            addBtnListener(tab, 'click', () => {
                const targetTab = tab.dataset.tab;
                
                // Remove active class from all tabs and contents
                adminTabs.forEach(t => t.classList.remove('active'));
                adminTabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                tab.classList.add('active');
                document.getElementById(`${targetTab}-tab`).classList.add('active');
            });
        });
        
        // Make admin functions globally accessible
        this.makeAdminFunctionsGlobal();
        
        // Initialize decoration shop
        this.initializeDecorationShop();
    }
    
    initializeDecorationShop() {
        const decorationItems = document.querySelectorAll('.decoration-item');
        const categoryBtns = document.querySelectorAll('.category-btn');
        
        // Helper function to add event listeners and track them
        const addBtnListener = (element, event, handler) => {
            if (element) {
                element.removeEventListener(event, handler);
                element.addEventListener(event, handler);
                this.eventListeners.push({ element, event, handler });
            }
        };
        
        // Decoration item selection
        decorationItems.forEach(item => {
            addBtnListener(item, 'click', () => {
                const decorationType = item.dataset.decoration;
                const decorationData = this.decorations[decorationType];
                
                if (decorationData) {
                    // Remove selection from all items
                    decorationItems.forEach(i => i.classList.remove('selected'));
                    
                    // Add selection to clicked item
                    item.classList.add('selected');
                    
                    // Set selected decoration
                    this.selectedDecoration = decorationType;
                    
                    // Update info panel
                    document.getElementById('selectedDecorationName').textContent = decorationData.name;
                    document.getElementById('selectedDecorationDescription').textContent = decorationData.description;
                    document.getElementById('selectedDecorationCost').textContent = `Cost: $${decorationData.cost}`;
                    document.getElementById('selectedDecorationBonus').textContent = `Bonus: ${decorationData.bonus}`;
                    
                    // Update current tool to decoration mode
                    this.currentTool = 'decoration';
                    this.updateToolDisplay();
                    
                    // Clear other selections
                    this.selectedSeed = null;
                    this.selectedSprinkler = null;
                    document.querySelectorAll('.seed-item').forEach(seed => seed.classList.remove('selected'));
                    document.querySelectorAll('.sprinkler-tool').forEach(sprinkler => sprinkler.classList.remove('active'));
                    document.querySelectorAll('.tool-btn').forEach(tool => tool.classList.remove('active'));
                    
                    // Show selection feedback
                    this.showMessage(`Selected ${decorationData.name} for placement`, 'info');
                }
            });
        });
        
        // Category filtering
        categoryBtns.forEach(btn => {
            addBtnListener(btn, 'click', () => {
                const category = btn.dataset.category;
                
                // Update active category button
                categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Filter decoration items
                decorationItems.forEach(item => {
                    const itemCategory = item.dataset.category;
                    if (category === 'all' || itemCategory === category) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }
    
    initializeMultiplayer() {
        // Check if MultiplayerManager is available
        if (typeof MultiplayerManager === 'undefined') {
            console.log('MultiplayerManager not loaded, skipping multiplayer initialization');
            return;
        }
        
        // Initialize multiplayer manager
        this.multiplayer = new MultiplayerManager();
        
        // Get JWT token from localStorage (set during login)
        const token = localStorage.getItem('garden_game_token');
        
        if (token) {
            // Initialize multiplayer connection
            this.multiplayer.initialize(token).then(success => {
                if (success) {
                    console.log('✅ Multiplayer initialized successfully');
                    
                    // Set current user from token
                    try {
                        const tokenData = JSON.parse(atob(token.split('.')[1]));
                        this.multiplayer.setCurrentUser({
                            id: tokenData.id,
                            username: tokenData.username
                        });
                    } catch (error) {
                        console.error('Error parsing token:', error);
                    }
                    
                    // Send current garden data to server after successful connection
                    setTimeout(() => {
                        if (this.garden && Object.keys(this.garden).length > 0) {
                            const gardenData = {
                                garden: this.garden,
                                money: this.money,
                                score: this.score,
                                achievements: this.achievements,
                                stats: this.stats,
                                currentSeason: this.currentSeason,
                                seasonDay: this.seasonDay,
                                gardenSize: this.gardenSize
                            };
                            this.multiplayer.sendGardenUpdate(gardenData);
                            console.log('🌐 Initial garden data sent to multiplayer server');
                        }
                    }, 1000); // Small delay to ensure connection is fully established
                    
                    this.updateMultiplayerUI();
                } else {
                    console.log('❌ Failed to initialize multiplayer');
                }
            });
        } else {
            console.log('No JWT token found, multiplayer disabled');
        }
        
        // Add multiplayer button event listeners
        this.addMultiplayerEventListeners();
        
        // Add logout button
        this.addLogoutButton();
        
        // Periodically update multiplayer UI to ensure status is current
        setInterval(() => {
            this.updateMultiplayerUI();
        }, 5000); // Update every 5 seconds
    }
    
    addMultiplayerEventListeners() {
        const addBtnListener = (element, event, handler) => {
            if (element) {
                element.removeEventListener(event, handler);
                element.addEventListener(event, handler);
                this.eventListeners.push({ element, event, handler });
            }
        };
        
        // Friends button
        addBtnListener(document.getElementById('friendsBtn'), 'click', () => {
            this.toggleFriendsList();
        });
        
        // Chat button
        addBtnListener(document.getElementById('chatBtn'), 'click', () => {
            this.toggleChatPanel();
        });
        
        // Visit garden button
        addBtnListener(document.getElementById('visitBtn'), 'click', () => {
            this.requestGardenVisit();
        });
        
        // Send chat message
        addBtnListener(document.getElementById('sendChatBtn'), 'click', () => {
            this.sendChatMessage();
        });
        
        // Chat input enter key
        addBtnListener(document.getElementById('chatInput'), 'keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });
    }
    
    // Add logout button
    addLogoutButton() {
        // Create logout button
        const logoutBtn = document.createElement('button');
        logoutBtn.textContent = 'Logout';
        logoutBtn.className = 'logout-btn';
        logoutBtn.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            padding: 8px 16px;
            background: #ff4444;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            z-index: 1000;
        `;
        
        logoutBtn.addEventListener('click', () => {
            // Clear token
            localStorage.removeItem('garden_game_token');
            // Redirect to login
            window.location.href = '/login';
        });
        
        document.body.appendChild(logoutBtn);
    }
    
    updateMultiplayerUI() {
        if (!this.multiplayer) return;
        
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            if (this.multiplayer.isConnected) {
                statusElement.textContent = '🟢 Connected';
                statusElement.style.color = '#4CAF50';
            } else {
                statusElement.textContent = '🔴 Disconnected';
                statusElement.style.color = '#f44336';
            }
        }
        
        // Refresh friends list if it's currently visible
        const friendsList = document.getElementById('friendsList');
        if (friendsList && friendsList.style.display !== 'none') {
            this.loadFriendsList();
        }
    }
    
    toggleFriendsList() {
        const friendsList = document.getElementById('friendsList');
        const chatPanel = document.getElementById('chatPanel');
        
        if (friendsList.style.display === 'none') {
            friendsList.style.display = 'block';
            chatPanel.style.display = 'none';
            this.loadFriendsList();
        } else {
            friendsList.style.display = 'none';
        }
    }
    
    toggleChatPanel() {
        const friendsList = document.getElementById('friendsList');
        const chatPanel = document.getElementById('chatPanel');
        
        if (chatPanel.style.display === 'none') {
            chatPanel.style.display = 'block';
            friendsList.style.display = 'none';
            this.loadChatMessages();
        } else {
            chatPanel.style.display = 'none';
        }
    }
    
    loadFriendsList() {
        if (!this.multiplayer) return;
        
        const friendsContainer = document.getElementById('friendsContainer');
        if (friendsContainer) {
            // Preserve the current input field value before refreshing
            const currentInput = document.getElementById('friendUsername');
            const preservedValue = currentInput ? currentInput.value : '';
            
            friendsContainer.innerHTML = '<p>Loading friends...</p>';
            
            // Get friends from multiplayer manager
            this.multiplayer.getFriends().then(friends => {
                console.log('🔍 Friends data received:', friends);
                
                // Remove duplicates based on user ID
                const uniqueFriends = friends.filter((friend, index, self) => 
                    index === self.findIndex(f => f.id === friend.id || f.user_id === friend.user_id)
                );
                console.log('🔍 Unique friends after deduplication:', uniqueFriends);
                console.log('🔍 Current user ID:', this.multiplayer?.currentUser?.id);
                
                // Debug each friend's online status
                uniqueFriends.forEach(friend => {
                    console.log(`🔍 Friend ${friend.username}:`, {
                        id: friend.id,
                        online: friend.online,
                        isOnline: friend.isOnline,
                        isCurrentUser: friend.id === this.multiplayer?.currentUser?.id
                    });
                });
                
                let friendsHtml = '';
                
                // Show accepted friends
                const acceptedFriends = uniqueFriends.filter(friend => friend.status === 'accepted');
                if (acceptedFriends.length > 0) {
                    // Separate online and offline friends
                    const onlineFriends = acceptedFriends.filter(friend => {
                        // Don't show current user in friends list
                        if (friend.id === this.multiplayer?.currentUser?.id) {
                            return false;
                        }
                        // Check real-time online status
                        return friend.online === true || friend.isOnline === true;
                    });
                    
                    const offlineFriends = acceptedFriends.filter(friend => {
                        // Don't show current user in friends list
                        if (friend.id === this.multiplayer?.currentUser?.id) {
                            return false;
                        }
                        // Check real-time online status
                        return !(friend.online === true || friend.isOnline === true);
                    });
                    
                    // Show online friends first
                    if (onlineFriends.length > 0) {
                        console.log('🟢 Online friends:', onlineFriends);
                        friendsHtml += '<h4>🟢 Online Friends</h4>';
                        friendsHtml += onlineFriends.map(friend => {
                            return `<div class="friend-item">
                                <div class="friend-info">
                                    <span class="friend-name">${friend.username}</span>
                                    <span class="friend-status online">🟢</span>
                                </div>
                                <div class="friend-actions">
                                    <button class="unfriend-btn-small" data-friend-id="${friend.id || friend.user_id}" data-action="unfriend">Unfriend</button>
                                </div>
                            </div>`;
                        }).join('');
                    }
                    
                    // Show offline friends
                    if (offlineFriends.length > 0) {
                        console.log('🔴 Offline friends:', offlineFriends);
                        friendsHtml += '<h4>🔴 Offline Friends</h4>';
                        friendsHtml += offlineFriends.map(friend => {
                            return `<div class="friend-item">
                                <div class="friend-info">
                                    <span class="friend-name">${friend.username}</span>
                                    <span class="friend-status offline">🔴</span>
                                </div>
                                <div class="friend-actions">
                                    <button class="unfriend-btn-small" data-friend-id="${friend.id || friend.user_id}" data-action="unfriend">Unfriend</button>
                                </div>
                            </div>`;
                        }).join('');
                    }
                }
                
                // Show pending friend requests
                const pendingRequests = uniqueFriends.filter(friend => friend.status === 'pending');
                if (pendingRequests.length > 0) {
                    friendsHtml += '<h4>⏳ Pending Requests</h4>';
                    pendingRequests.forEach(friend => {
                        console.log('🔍 Creating button for friend:', friend);
                        const friendId = friend.id || friend.user_id || friend.from_id;
                        console.log('🔍 Using friend ID:', friendId);
                        friendsHtml += `
                            <div class="friend-item pending">
                                <div class="friend-info">
                                    <span class="friend-name">${friend.username}</span>
                                    <span class="friend-status">⏳ Pending</span>
                                </div>
                                <div class="friend-actions">
                                    <button class="accept-btn-small" data-friend-id="${friendId}" data-action="accept">Accept</button>
                                    <button class="reject-btn-small" data-friend-id="${friendId}" data-action="reject">Reject</button>
                                </div>
                            </div>
                        `;
                    });
                }
                
                // Always show the add friend section
                const isConnected = this.multiplayer && this.multiplayer.isConnected;
                const addFriendSection = `
                    <div class="add-friend-section">
                        <input type="text" id="friendUsername" placeholder="Enter username to add" ${!isConnected ? 'disabled' : ''}>
                        <button id="addFriendBtn" ${!isConnected ? 'disabled' : ''}>
                            ${isConnected ? 'Add Friend' : 'Connecting...'}
                        </button>
                    </div>
                `;
                
                if (friendsHtml) {
                    friendsContainer.innerHTML = friendsHtml + addFriendSection;
                } else {
                    friendsContainer.innerHTML = `
                        <p>No friends found. Add some friends to get started!</p>
                        ${addFriendSection}
                    `;
                }
                
                // Restore the input field value if it was preserved
                const newInput = document.getElementById('friendUsername');
                if (newInput && preservedValue) {
                    newInput.value = preservedValue;
                }
                
                // Add event listener after creating the button
                const addFriendBtn = document.getElementById('addFriendBtn');
                if (addFriendBtn) {
                    addFriendBtn.addEventListener('click', () => {
                        this.sendFriendRequest();
                    });
                }
                
                // Add event listeners for accept/reject buttons
                const acceptButtons = document.querySelectorAll('.accept-btn-small');
                const rejectButtons = document.querySelectorAll('.reject-btn-small');
                
                acceptButtons.forEach(button => {
                    button.addEventListener('click', (e) => {
                        const friendId = e.target.getAttribute('data-friend-id');
                        console.log('🔍 Accept button clicked for friend ID:', friendId);
                        console.log('🔍 window.game exists:', !!window.game);
                        
                        // Try to find the game object if window.game doesn't exist
                        let gameObj = window.game;
                        if (!gameObj) {
                            // Look for the game object in different places
                            gameObj = window.currentGame || window.gardenGame;
                            console.log('🔍 Trying alternative game object:', !!gameObj);
                        }
                        
                        if (gameObj && friendId) {
                            console.log('🔍 Calling respondToFriendRequest...');
                            gameObj.respondToFriendRequest(friendId, true);
                        } else {
                            console.error('❌ Cannot call respondToFriendRequest - game object or friendId missing');
                            // Show user-friendly error
                            alert('Game not ready. Please wait a moment and try again.');
                        }
                    });
                });
                
                rejectButtons.forEach(button => {
                    button.addEventListener('click', (e) => {
                        const friendId = e.target.getAttribute('data-friend-id');
                        console.log('🔍 Reject button clicked for friend ID:', friendId);
                        console.log('🔍 window.game exists:', !!window.game);
                        
                        // Try to find the game object if window.game doesn't exist
                        let gameObj = window.game;
                        if (!gameObj) {
                            // Look for the game object in different places
                            gameObj = window.currentGame || window.gardenGame;
                            console.log('🔍 Trying alternative game object:', !!gameObj);
                        }
                        
                        if (gameObj && friendId) {
                            console.log('🔍 Calling respondToFriendRequest...');
                            gameObj.respondToFriendRequest(friendId, false);
                        } else {
                            console.error('❌ Cannot call respondToFriendRequest - game object or friendId missing');
                            // Show user-friendly error
                            alert('Game not ready. Please wait a moment and try again.');
                        }
                    });
                });
                
                // Add event listeners for unfriend buttons
                const unfriendButtons = document.querySelectorAll('.unfriend-btn-small');
                unfriendButtons.forEach(button => {
                    button.addEventListener('click', (e) => {
                        const friendId = e.target.getAttribute('data-friend-id');
                        console.log('🔍 Unfriend button clicked for friend ID:', friendId);
                        console.log('🔍 window.game exists:', !!window.game);
                        
                        // Try to find the game object if window.game doesn't exist
                        let gameObj = window.game;
                        if (!gameObj) {
                            // Look for the game object in different places
                            gameObj = window.currentGame || window.gardenGame;
                            console.log('🔍 Trying alternative game object:', !!gameObj);
                        }
                        
                        if (gameObj && friendId) {
                            console.log('🔍 Calling unfriendUser...');
                            gameObj.unfriendUser(friendId);
                        } else {
                            console.error('❌ Cannot call unfriendUser - game object or friendId missing');
                            // Show user-friendly error
                            alert('Game not ready. Please wait a moment and try again.');
                        }
                    });
                });
            });
        }
    }
    
    loadChatMessages() {
        if (!this.multiplayer) return;
        
        const chatMessagesDiv = document.getElementById('chatMessages');
        if (chatMessagesDiv) {
            // Display recent chat messages
            const messages = this.multiplayer.chatMessages || [];
            if (messages.length > 0) {
                const messagesHtml = messages.map(msg => 
                    `<div class="chat-message">
                        <span class="chat-username">${msg.senderName || msg.username}:</span>
                        <span class="chat-text">${msg.message}</span>
                    </div>`
                ).join('');
                chatMessagesDiv.innerHTML = messagesHtml;
                chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
            } else {
                chatMessagesDiv.innerHTML = '<p>No messages yet. Start chatting!</p>';
            }
        }
    }
    
    sendChatMessage() {
        if (!this.multiplayer) return;
        
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();
        
        if (message) {
            // Send as global message (no specific receiver)
            this.multiplayer.sendMessage(message);
            chatInput.value = '';
            
            // Update chat display after a short delay to allow server response
            setTimeout(() => {
                this.loadChatMessages();
            }, 100);
        }
    }
    
    requestGardenVisit() {
        if (!this.multiplayer) return;
        
        // For now, just show a message
        this.showMessage('Garden visit feature coming soon!', 'info');
    }
    
    sendFriendRequest() {
        console.log('🔍 sendFriendRequest called');
        console.log('Multiplayer object:', this.multiplayer);
        console.log('Multiplayer connected:', this.multiplayer?.isConnected);
        
        // Check if multiplayer exists and is connected
        if (!this.multiplayer) {
            console.error('❌ Multiplayer not initialized');
            this.showMessage('Multiplayer not initialized. Please refresh the page.', 'error');
            return;
        }
        
        if (!this.multiplayer.isConnected) {
            console.error('❌ Multiplayer not connected');
            this.showMessage('Multiplayer not connected. Please wait...', 'error');
            return;
        }
        
        // Check if sendFriendRequest method exists
        if (typeof this.multiplayer.sendFriendRequest !== 'function') {
            console.error('❌ sendFriendRequest method not found');
            this.showMessage('Friend system not ready. Please wait...', 'error');
            return;
        }
        
        const usernameInput = document.getElementById('friendUsername');
        if (!usernameInput) {
            console.error('❌ Friend input not found');
            this.showMessage('Friend input not found. Please refresh the page.', 'error');
            return;
        }
        
        const username = usernameInput.value.trim();
        console.log('Username to add:', username);
        
        if (username) {
            try {
                console.log('📤 Sending friend request to server...');
                this.multiplayer.sendFriendRequest(username);
                usernameInput.value = '';
                this.showMessage(`Friend request sent to ${username}!`, 'success');
            } catch (error) {
                console.error('❌ Error sending friend request:', error);
                this.showMessage('Failed to send friend request. Please try again.', 'error');
            }
        } else {
            this.showMessage('Please enter a username', 'error');
        }
    }
    
    showFriendRequestNotification(data) {
        const notification = document.createElement('div');
        notification.className = 'friend-request-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h4>👥 Friend Request</h4>
                <p>${data.fromName} wants to be your friend!</p>
                <div class="notification-buttons">
                                                    <button onclick="if(window.game) window.game.respondToFriendRequest('${data.fromId}', true)" class="accept-btn">Accept</button>
                                <button onclick="if(window.game) window.game.respondToFriendRequest('${data.fromId}', false)" class="reject-btn">Reject</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 30 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 30000);
    }
    
    respondToFriendRequest(fromId, accepted) {
        console.log('🔍 respondToFriendRequest called with:', { fromId, accepted });
        console.log('🔍 this.multiplayer exists:', !!this.multiplayer);
        console.log('🔍 this.multiplayer.isConnected:', this.multiplayer?.isConnected);
        
        if (!this.multiplayer) {
            console.error('❌ Multiplayer not initialized');
            return;
        }
        
        if (!this.multiplayer.isConnected) {
            console.error('❌ Multiplayer not connected');
            this.showMessage('Multiplayer not connected. Please wait...', 'error');
            return;
        }
        
        console.log(`📤 Sending friend request response: fromId=${fromId}, accepted=${accepted}`);
        this.multiplayer.respondToFriendRequest(fromId, accepted);
        
        // Remove the notification
        const notification = document.querySelector('.friend-request-notification');
        if (notification) {
            notification.parentNode.removeChild(notification);
        }
        
        const status = accepted ? 'accepted' : 'rejected';
        this.showMessage(`Friend request ${status}!`, 'success');
        
        // Refresh the friends list to show updated status
        setTimeout(() => {
            this.loadFriendsList();
        }, 500);
        
        // Also refresh after a longer delay to ensure server updates are processed
        setTimeout(() => {
            this.loadFriendsList();
        }, 2000);
    }
    
    unfriendUser(friendId) {
        console.log('🔍 unfriendUser called with:', { friendId });
        console.log('🔍 this.multiplayer exists:', !!this.multiplayer);
        console.log('🔍 this.multiplayer.isConnected:', this.multiplayer?.isConnected);
        
        if (!this.multiplayer) {
            console.error('❌ Multiplayer not initialized');
            return;
        }
        
        if (!this.multiplayer.isConnected) {
            console.error('❌ Multiplayer not connected');
            this.showMessage('Multiplayer not connected. Please wait...', 'error');
            return;
        }
        
        // Confirm the action
        if (!confirm('Are you sure you want to unfriend this user?')) {
            return;
        }
        
        console.log(`📤 Sending unfriend request: friendId=${friendId}`);
        this.multiplayer.unfriendUser(friendId);
        
        this.showMessage('User unfriended!', 'success');
        
        // Refresh the friends list to show updated status
        setTimeout(() => {
            this.loadFriendsList();
        }, 500);
        
        // Also refresh after a longer delay to ensure server updates are processed
        setTimeout(() => {
            this.loadFriendsList();
        }, 2000);
    }
    
    makeAdminFunctionsGlobal() {
        // Helper function to track admin command usage
        const trackAdminCommand = () => {
            if (!this.stats.adminPanelUsed) {
                this.stats.adminPanelUsed = true;
            }
            this.stats.adminPanelUsageCount++;
            this.saveGame();
        };
        // Resources functions
        window.addMoney = () => {
            const amount = parseInt(document.getElementById('addMoneyInput').value) || 0;
            if (amount > 0) {
                // Track admin command usage
                trackAdminCommand();
                
                // Completely stop background processing to prevent interference
                if (window.menuSystem) {
                    window.menuSystem.stopBackgroundProcessing();
                }
                
                this.money += amount;
                this.updateUI();
                this.updateShopDisplay();
                this.showMessage(`Added $${amount}!`, 'success');
                document.getElementById('addMoneyInput').value = '';
                
                // Force immediate save to prevent data loss
                this.saveGame();
                
                // Add a timestamp to prevent background processing from overwriting this change
                localStorage.setItem(`adminChange_${this.saveSlot}`, Date.now().toString());
                

            }
        };
        
        window.setMoney = () => {
            const amount = parseInt(document.getElementById('setMoneyInput').value) || 0;
            
            // Track admin command usage
            trackAdminCommand();
            
            // Completely stop background processing to prevent interference
            if (window.menuSystem) {
                window.menuSystem.stopBackgroundProcessing();
            }
            
            this.money = amount;
            

            
            this.updateUI();
            this.updateShopDisplay();
            this.showMessage(`Money set to $${amount}!`, 'success');
            document.getElementById('setMoneyInput').value = '';
            
            // Force immediate save to prevent data loss
            this.saveGame();
            
            // Add a timestamp to prevent background processing from overwriting this change
            localStorage.setItem(`adminChange_${this.saveSlot}`, Date.now().toString());
        };
        
        window.addWater = () => {
            const amount = parseInt(document.getElementById('addWaterInput').value) || 0;
            if (amount > 0) {
                // Track admin command usage
                trackAdminCommand();
                
                // Completely stop background processing to prevent interference
                if (window.menuSystem) {
                    window.menuSystem.stopBackgroundProcessing();
                }
                
                this.water += amount;
                
                this.updateUI();
                this.updateShopDisplay();
                this.showMessage(`Added ${amount} water!`, 'success');
                document.getElementById('addWaterInput').value = '';
                
                // Force immediate save to prevent data loss
                this.saveGame();
                
                // Add a timestamp to prevent background processing from overwriting this change
                localStorage.setItem(`adminChange_${this.saveSlot}`, Date.now().toString());
            }
        };
        
        window.setWater = () => {
            const amount = parseInt(document.getElementById('setWaterInput').value) || 0;
            
            // Track admin command usage
            trackAdminCommand();
            
            // Completely stop background processing to prevent interference
            if (window.menuSystem) {
                window.menuSystem.stopBackgroundProcessing();
            }
            
            this.water = amount;
            
            this.updateUI();
            this.updateShopDisplay();
            this.showMessage(`Water set to ${amount}!`, 'success');
            document.getElementById('setWaterInput').value = '';
            
            // Force immediate save to prevent data loss
            this.saveGame();
            
            // Add a timestamp to prevent background processing from overwriting this change
            localStorage.setItem(`adminChange_${this.saveSlot}`, Date.now().toString());
        };
        
        window.addFertilizer = () => {
            const amount = parseInt(document.getElementById('addFertilizerInput').value) || 0;
            if (amount > 0) {
                // Track admin command usage
                trackAdminCommand();
                
                // Completely stop background processing to prevent interference
                if (window.menuSystem) {
                    window.menuSystem.stopBackgroundProcessing();
                }
                
                this.fertilizer += amount;
                
                this.updateUI();
                this.updateShopDisplay();
                this.showMessage(`Added ${amount} fertilizer!`, 'success');
                document.getElementById('addFertilizerInput').value = '';
                
                // Force immediate save to prevent data loss
                this.saveGame();
                
                // Add a timestamp to prevent background processing from overwriting this change
                localStorage.setItem(`adminChange_${this.saveSlot}`, Date.now().toString());
            }
        };
        
        window.setFertilizer = () => {
            const amount = parseInt(document.getElementById('setFertilizerInput').value) || 0;
            
            // Track admin command usage
            trackAdminCommand();
            
            // Completely stop background processing to prevent interference
            if (window.menuSystem) {
                window.menuSystem.stopBackgroundProcessing();
            }
            
            this.fertilizer = amount;
            
            this.updateUI();
            this.updateShopDisplay();
            this.showMessage(`Fertilizer set to ${amount}!`, 'success');
            document.getElementById('setFertilizerInput').value = '';
            
            // Force immediate save to prevent data loss
            this.saveGame();
            
            // Add a timestamp to prevent background processing from overwriting this change
            localStorage.setItem(`adminChange_${this.saveSlot}`, Date.now().toString());
        };
        
        window.addScore = () => {
            const amount = parseInt(document.getElementById('addScoreInput').value) || 0;
            if (amount > 0) {
                // Track admin command usage
                trackAdminCommand();
                
                // Completely stop background processing to prevent interference
                if (window.menuSystem) {
                    window.menuSystem.stopBackgroundProcessing();
                }
                
                this.score += amount;
                
                this.updateUI();
                this.updateShopDisplay();
                this.showMessage(`Added ${amount} score!`, 'success');
                document.getElementById('addScoreInput').value = '';
                
                // Force immediate save to prevent data loss
                this.saveGame();
                
                // Add a timestamp to prevent background processing from overwriting this change
                localStorage.setItem(`adminChange_${this.saveSlot}`, Date.now().toString());
            }
        };
        
        window.setScore = () => {
            const amount = parseInt(document.getElementById('setScoreInput').value) || 0;
            
            // Track admin command usage
            trackAdminCommand();
            
            // Completely stop background processing to prevent interference
            if (window.menuSystem) {
                window.menuSystem.stopBackgroundProcessing();
            }
            
            this.score = amount;
            
            this.updateUI();
            this.updateShopDisplay();
            this.showMessage(`Score set to ${amount}!`, 'success');
            document.getElementById('setScoreInput').value = '';
            
            // Force immediate save to prevent data loss
            this.saveGame();
            
            // Add a timestamp to prevent background processing from overwriting this change
            localStorage.setItem(`adminChange_${this.saveSlot}`, Date.now().toString());
        };
        
        // Shop functions
        window.setStock = () => {
            const seedType = document.getElementById('seedTypeSelect').value;
            const amount = parseInt(document.getElementById('setStockInput').value) || 0;
            
            if (seedType && this.shopInventory[seedType]) {
                this.shopInventory[seedType].stock = amount;
                
                this.updateShopDisplay();
                this.showMessage(`${seedType} stock set to ${amount}!`, 'success');
                document.getElementById('setStockInput').value = '';
                this.saveGame();
            } else {
                this.showMessage('Invalid seed type!', 'error');
            }
        };
        
        window.setRarity = () => {
    const seedTypeElement = document.getElementById('seedTypeSelect');
    const rarityElement = document.getElementById('raritySelect');
    
    if (!seedTypeElement || !rarityElement) {
        this.showMessage('Error: Admin panel elements not found!', 'error');
        return;
    }
    
    const seedType = seedTypeElement.value;
    const rarity = rarityElement.value;
    
    if (seedType && this.plantTypes[seedType]) {
        // Remove existing rarity flags
        delete this.plantTypes[seedType].isRare;
        delete this.plantTypes[seedType].isLegendary;
        
        // Set new rarity
        if (rarity === 'rare') {
            this.plantTypes[seedType].isRare = true;
        } else if (rarity === 'legendary') {
            this.plantTypes[seedType].isLegendary = true;
        } else if (rarity === 'common') {
            // Already removed flags above
        } else {
            this.showMessage(`Invalid rarity: ${rarity}!`, 'error');
            return;
        }
        
        // Update the visual appearance in the shop
        this.updateSeedRarityDisplay(seedType, rarity);
        
        this.updateShopDisplay();
        this.showMessage(`${seedType} rarity set to ${rarity}!`, 'success');
        this.saveGame();
    } else {
        this.showMessage(`Invalid seed type: ${seedType}!`, 'error');
    }
};
        
        window.restockAll = () => {
            Object.keys(this.shopInventory).forEach(seedType => {
                this.shopInventory[seedType].stock = this.shopInventory[seedType].maxStock;
            });
            
            this.updateShopDisplay();
            this.showMessage('All seeds restocked!', 'success');
            this.saveGame();
        };
        
        window.restockNow = () => {
            this.lastRestockTime = Date.now() - this.restockInterval; // restockInterval is already in milliseconds
            
            this.checkRestock();
            this.showMessage('Shop restocked!', 'success');
            this.saveGame();
        };
        
        // Tool functions
        window.upgradeTool = () => {
            const toolType = document.getElementById('toolTypeSelect').value;
            if (toolType && this.toolLevels[toolType]) {
                // Track admin command usage
                trackAdminCommand();
                
                // Admin command: upgrade tool without money cost
                if (this.toolLevels[toolType] < 5) {
                    this.toolLevels[toolType]++;
                    this.toolUpgradeCosts[toolType] = Math.floor(this.toolUpgradeCosts[toolType] * 1.5);
                    
                    // Add resource bonuses for water and fertilizer tools
                    if (toolType === 'water') {
                        this.water += 10;
                    } else if (toolType === 'fertilizer') {
                        this.fertilizer += 5;
                    } else if (toolType === 'harvest') {
                        this.harvestBonus += 0.1;
                    }
                    
                    this.updateToolDisplay();
                    this.showMessage(`${toolType} tool upgraded to level ${this.toolLevels[toolType]}!`, 'success');
                    
                    this.saveGame();
                } else {
                    this.showMessage(`${toolType} tool is already at maximum level!`, 'error');
                }
            } else {
                this.showMessage('Invalid tool type!', 'error');
            }
        };
        
        // Sprinkler functions
        window.addSprinkler = () => {
            const sprinklerType = document.getElementById('sprinklerTypeSelect').value;
            const amount = parseInt(document.getElementById('addSprinklerInput').value) || 1;
            
            if (sprinklerType && this.sprinklerInventory[sprinklerType] !== undefined) {
                // Track admin command usage
                trackAdminCommand();
                
                this.sprinklerInventory[sprinklerType] += amount;
                
                this.updateSprinklerDisplay();
                this.showMessage(`Added ${amount} ${sprinklerType} sprinkler(s)!`, 'success');
                document.getElementById('addSprinklerInput').value = '';
                this.saveGame();
            } else {
                this.showMessage('Invalid sprinkler type!', 'error');
            }
        };
        
        window.clearSprinklers = () => {
            // Track admin command usage
            trackAdminCommand();
            
            this.sprinklers = [];
            
            this.updateSprinklerDisplay();
            this.showMessage('All sprinklers cleared!', 'success');
            this.saveGame();
        };
        
        // Weather functions
        window.setWeather = () => {
            const weather = document.getElementById('weatherSelect').value;
            if (weather && ['sunny', 'rainy', 'cloudy', 'stormy'].includes(weather)) {
                this.weather = weather;
                
                this.updateUI();
                this.showMessage(`Weather set to ${weather}!`, 'success');
                this.saveGame();
            } else {
                this.showMessage('Invalid weather type!', 'error');
            }
        };
        
        window.setWeatherTime = () => {
            const minutes = parseInt(document.getElementById('weatherTimeInput').value) || 5;
            this.weatherChangeInterval = minutes * 60 * 1000;
            
            this.showMessage(`Weather change interval set to ${minutes} minutes!`, 'success');
            document.getElementById('weatherTimeInput').value = '';
            this.saveGame();
        };
        
        window.setRestockTime = () => {
            const inputElement = document.getElementById('restockTimeInput');
            if (!inputElement) {
                this.showMessage('Error: Restock time input not found!', 'error');
                return;
            }
            
            const minutes = parseInt(inputElement.value) || 5;
            this.restockInterval = minutes * 60 * 1000; // Convert minutes to milliseconds
            
            this.showMessage(`Restock interval set to ${minutes} minutes!`, 'success');
            inputElement.value = '';
            this.saveGame();
        };
        
        // Achievement functions
        window.unlockAchievement = () => {
            const achievement = document.getElementById('achievementSelect').value;
            if (achievement && this.achievements[achievement]) {
                this.unlockAchievement(achievement);
                this.showMessage(`Achievement "${achievement}" unlocked!`, 'success');
                this.saveGame();
            } else {
                this.showMessage('Invalid achievement!', 'error');
            }
        };
        
        window.showAchievements = () => {
            this.updateAchievementsDisplay();
            this.showMessage('Achievements updated!', 'success');
        };
        
        // Garden functions
        window.clearGarden = () => {
            this.garden = this.initializeGarden();
            this.sprinklers = []; // Clear all sprinklers
            this.showMessage('Garden and sprinklers cleared!', 'success');
            this.saveGame();
            // Update the UI to reflect the cleared garden
            this.updateUI();
            this.draw(); // Redraw the canvas to show the cleared garden
        };
        
        // Sound functions
        window.toggleSound = () => {
            this.soundEnabled = !this.soundEnabled;
            this.showMessage(`Sound ${this.soundEnabled ? 'enabled' : 'disabled'}!`, 'success');
            this.saveGame();
        };
        
        // Save function - FIXED to properly reference current game instance
        window.saveGame = () => {
            if (window.menuSystem && window.menuSystem.currentGame) {
                window.menuSystem.currentGame.saveGame();
                window.menuSystem.currentGame.showMessage('Game saved manually!', 'success');
            } else {
                console.error('No current game instance found for saveGame');
            }
        };
        
        window.restartBackgroundProcessing = () => {
            if (window.menuSystem) {
                // Clear admin change timestamps for all slots when manually restarting
                for (let slot = 1; slot <= 3; slot++) {
                    localStorage.removeItem(`adminChange_${slot}`);
                }
                window.menuSystem.startBackgroundProcessing();
                this.showMessage('Background processing restarted!', 'success');
            }
        };
        
        // Add manual background processing control
        window.enableBackgroundProcessing = () => {
            if (window.menuSystem) {
                window.menuSystem.startBackgroundProcessing();
                this.showMessage('Background processing enabled!', 'success');
            }
        };
        
        window.disableBackgroundProcessing = () => {
            if (window.menuSystem) {
                window.menuSystem.stopBackgroundProcessing();
                this.showMessage('Background processing disabled!', 'success');
            }
        };
        

        
        // Add function to clear corrupted save data
        window.clearCorruptedSaves = () => {
            console.log('Clearing all corrupted save data...');
            let clearedCount = 0;
            for (let slot = 1; slot <= 3; slot++) {
                const saveData = localStorage.getItem(`gardenGameSave_${slot}`);
                if (saveData) {
                    try {
                        const data = JSON.parse(saveData);
                        if (data.saveSlot !== slot) {
                            console.log(`Clearing corrupted save data for slot ${slot} (contains data for slot ${data.saveSlot})`);
                            localStorage.removeItem(`gardenGameSave_${slot}`);
                            clearedCount++;
                        }
                    } catch (error) {
                        console.log(`Clearing corrupted save data for slot ${slot} (JSON parse error)`);
                        localStorage.removeItem(`gardenGameSave_${slot}`);
                        clearedCount++;
                    }
                }
            }
            this.showMessage(`Cleared ${clearedCount} corrupted save files!`, 'success');
            
            // Update the menu display
            if (window.menuSystem) {
                window.menuSystem.updateSaveSlots();
            }
        };
        
        // Add function to reset current slot
        window.resetCurrentSlot = () => {
            if (confirm('Are you sure you want to reset the current slot? This will clear all progress.')) {
                localStorage.removeItem(`gardenGameSave_${this.saveSlot}`);
                this.showMessage(`Slot ${this.saveSlot} reset!`, 'success');
                this.loadGame(); // Reload the current game
            }
        };
        
        // Add function to fix current slot if corrupted
        window.fixCurrentSlot = () => {
            const saveData = localStorage.getItem(`gardenGameSave_${this.saveSlot}`);
            if (saveData) {
                try {
                    const data = JSON.parse(saveData);
                    if (data.saveSlot !== this.saveSlot) {
                        // Clear the corrupted data and start fresh
                        localStorage.removeItem(`gardenGameSave_${this.saveSlot}`);
                        this.showMessage(`Slot ${this.saveSlot} fixed! Starting fresh.`, 'success');
                        this.loadGame(); // Reload with fresh data
                    } else {
                        this.showMessage(`Slot ${this.saveSlot} is not corrupted.`, 'info');
                    }
                } catch (error) {
                    localStorage.removeItem(`gardenGameSave_${this.saveSlot}`);
                    this.showMessage(`Slot ${this.saveSlot} fixed! Starting fresh.`, 'success');
                    this.loadGame(); // Reload with fresh data
                }
            } else {
                this.showMessage(`Slot ${this.saveSlot} is empty, no fix needed.`, 'info');
            }
        };
        
        // Add function to show background processing status
        window.showBackgroundStatus = () => {
            const isRunning = window.menuSystem && window.menuSystem.backgroundInterval !== null;
            const status = isRunning ? 'ENABLED' : 'DISABLED';
            const color = isRunning ? '#d63031' : '#00b894';
            this.showMessage(`Background processing: ${status}`, isRunning ? 'error' : 'success');
        };
        
        // Emergency recovery command
        window.emergencyReset = () => {
            if (window.menuSystem && window.menuSystem.currentGame) {
                const game = window.menuSystem.currentGame;
                
                // Stop the current game
                game.stopGame();
                
                // Clear any stuck states
                game.selectedSeed = null;
                game.selectedSprinkler = null;
                game.selectedDecoration = null;
                game.currentTool = 'water';
                
                // Clear performance monitoring
                game.lastPerformanceCheck = null;
                game.performanceCheckCount = 0;
                
                // Clear particles and animations
                if (game.particles) game.particles = [];
                if (game.animations) game.animations = [];
                
                // Restart the game
                game.isRunning = true;
                game.gameLoop();
                
                // Force UI update
                game.updateUI();
                game.updateShopDisplay();
                
                window.menuSystem.currentGame.showMessage('Emergency reset completed! Game should be working again.', 'success');
            } else {
                alert('Error: No game instance found. Please start a game first.');
            }
        };
        
        // Debug function to check current state
        window.debugState = () => {
            if (window.menuSystem && window.menuSystem.currentGame) {
                const game = window.menuSystem.currentGame;
                // Debug state information available in console
                game.showMessage('Debug info logged to console', 'info');
            } else {
                alert('Error: No game instance found. Please start a game first.');
            }
        };
        
        // ===== ADVANCED ADMIN FUNCTIONS =====
        
        // Challenge Management
        window.generateNewChallenges = () => {
            if (window.menuSystem && window.menuSystem.currentGame) {
                window.menuSystem.currentGame.generateChallenges();
                window.menuSystem.currentGame.updateChallengesDisplay();
                window.menuSystem.currentGame.showMessage('New challenges generated!', 'success');
            } else {
                console.error('No current game instance found');
                alert('Error: No game instance found. Please start a game first.');
            }
        };
        
        window.completeAllChallenges = () => {
            if (window.menuSystem && window.menuSystem.currentGame) {
                if (window.menuSystem.currentGame.challenges.daily && !window.menuSystem.currentGame.challenges.daily.completed) {
                    window.menuSystem.currentGame.challenges.daily.progress = window.menuSystem.currentGame.challenges.daily.target;
                    window.menuSystem.currentGame.completeChallenge(window.menuSystem.currentGame.challenges.daily);
                }
                if (window.menuSystem.currentGame.challenges.weekly && !window.menuSystem.currentGame.challenges.weekly.completed) {
                    window.menuSystem.currentGame.challenges.weekly.progress = window.menuSystem.currentGame.challenges.weekly.target;
                    window.menuSystem.currentGame.completeChallenge(window.menuSystem.currentGame.challenges.weekly);
                }
                window.menuSystem.currentGame.updateChallengesDisplay();
                window.menuSystem.currentGame.showMessage('All challenges completed!', 'success');
            } else {
                console.error('No current game instance found');
                alert('Error: No game instance found. Please start a game first.');
            }
        };
        
        window.resetChallenges = () => {
            if (window.menuSystem && window.menuSystem.currentGame) {
                window.menuSystem.currentGame.challenges = {
                    daily: null,
                    weekly: null,
                    completed: []
                };
                window.menuSystem.currentGame.generateChallenges();
                window.menuSystem.currentGame.updateChallengesDisplay();
                window.menuSystem.currentGame.showMessage('Challenges reset!', 'success');
            } else {
                console.error('No current game instance found');
                alert('Error: No game instance found. Please start a game first.');
            }
        };
        
        // Garden Management
        window.growAllPlants = () => {
            if (window.menuSystem && window.menuSystem.currentGame) {
                // Track admin command usage
                trackAdminCommand();
                
                let grownCount = 0;
                for (let x = 0; x < window.menuSystem.currentGame.gardenSize; x++) {
                    for (let y = 0; y < window.menuSystem.currentGame.gardenSize; y++) {
                        const cell = window.menuSystem.currentGame.garden[x][y];
                        if (cell && cell.plant && cell.plant.type) {
                            // Set plant to fully mature (last growth stage)
                            const maxStage = window.menuSystem.currentGame.growthStages.length - 1;
                            if (cell.plant.growthStage < maxStage) {
                                cell.plant.growthStage = maxStage;
                                cell.plant.isFullyGrown = true;
                                grownCount++;
                            }
                        }
                    }
                }
                window.menuSystem.currentGame.updateUI();
                window.menuSystem.currentGame.draw();
                window.menuSystem.currentGame.showMessage(`Grew ${grownCount} plants to full maturity!`, 'success');
            } else {
                console.error('No current game instance found');
                alert('Error: No game instance found. Please start a game first.');
            }
        };
        
        window.harvestAllPlants = () => {
            if (window.menuSystem && window.menuSystem.currentGame) {
                // Track admin command usage
                trackAdminCommand();
                
                try {
                    let harvestedCount = 0;
                    let totalValue = 0;
                    for (let x = 0; x < window.menuSystem.currentGame.gardenSize; x++) {
                        for (let y = 0; y < window.menuSystem.currentGame.gardenSize; y++) {
                            const cell = window.menuSystem.currentGame.garden[x][y];
                            if (cell && cell.plant && cell.plant.type && window.menuSystem.currentGame.getPlantGrowthStage(cell.plant) >= window.menuSystem.currentGame.growthStages.length - 1) {
                                const value = window.menuSystem.currentGame.getHarvestValue(cell.plant);
                                totalValue += value;
                                
                                // Clear the cell completely (same as individual harvestPlant)
                                window.menuSystem.currentGame.garden[x][y] = {
                                    plant: null,
                                    watered: false,
                                    wateredAt: null,
                                    waterCooldown: 0,
                                    fertilized: false,
                                    fertilizedAt: null,
                                    fertilizerCooldown: 0,
                                    plantedAt: null
                                };
                                harvestedCount++;
                            }
                        }
                    }
                    window.menuSystem.currentGame.money += totalValue;
                    window.menuSystem.currentGame.score += totalValue;
                    
                    // Force save and update
                    window.menuSystem.currentGame.saveGame();
                    window.menuSystem.currentGame.updateUI();
                    window.menuSystem.currentGame.updateShopDisplay();
                    window.menuSystem.currentGame.draw();
                    
                    window.menuSystem.currentGame.showMessage(`Harvested ${harvestedCount} plants for $${totalValue}!`, 'success');
                } catch (error) {
                    console.error('Error in harvestAllPlants:', error);
                    window.menuSystem.currentGame.showMessage('Error during harvest. Try the emergency reset.', 'error');
                }
            } else {
                console.error('No current game instance found');
                alert('Error: No game instance found. Please start a game first.');
            }
        };
        
        window.waterAllPlants = () => {
            if (window.menuSystem && window.menuSystem.currentGame) {
                // Track admin command usage
                trackAdminCommand();
                
                try {
                    let wateredCount = 0;
                    let totalPlants = 0;
                    const now = Date.now();
                    
                    for (let x = 0; x < window.menuSystem.currentGame.gardenSize; x++) {
                        for (let y = 0; y < window.menuSystem.currentGame.gardenSize; y++) {
                            const cell = window.menuSystem.currentGame.garden[x][y];
                            if (cell && cell.plant && cell.plant.type) {
                                totalPlants++;
                                // Check if plant is not fully grown by comparing growth stage
                                const growthStage = window.menuSystem.currentGame.getPlantGrowthStage(cell.plant);
                                const maxStage = window.menuSystem.currentGame.growthStages.length - 1;
                                
                                if (growthStage < maxStage) {
                                    // Use the same system as regular watering
                                    cell.watered = true;
                                    cell.wateredAt = now;
                                    cell.waterCooldown = now + 8000;
                                    wateredCount++;
                                }
                            }
                        }
                    }
                    

                    
                    window.menuSystem.currentGame.updateUI();
                    window.menuSystem.currentGame.draw();
                    window.menuSystem.currentGame.showMessage(`Watered ${wateredCount} plants!`, 'success');
                } catch (error) {
                    console.error('Error in waterAllPlants:', error);
                    window.menuSystem.currentGame.showMessage('Error during watering. Try the emergency reset.', 'error');
                }
            } else {
                console.error('No current game instance found');
                alert('Error: No game instance found. Please start a game first.');
            }
        };
        
        window.fertilizeAllPlants = () => {
            if (window.menuSystem && window.menuSystem.currentGame) {
                // Track admin command usage
                trackAdminCommand();
                
                try {
                    let fertilizedCount = 0;
                    let totalPlants = 0;
                    const now = Date.now();
                    
                    for (let x = 0; x < window.menuSystem.currentGame.gardenSize; x++) {
                        for (let y = 0; y < window.menuSystem.currentGame.gardenSize; y++) {
                            const cell = window.menuSystem.currentGame.garden[x][y];
                            if (cell && cell.plant && cell.plant.type) {
                                totalPlants++;
                                // Check if plant is not fully grown by comparing growth stage
                                const growthStage = window.menuSystem.currentGame.getPlantGrowthStage(cell.plant);
                                const maxStage = window.menuSystem.currentGame.growthStages.length - 1;
                                
                                if (growthStage < maxStage) {
                                    // Use the same system as regular fertilizing
                                    cell.fertilized = true;
                                    cell.fertilizedAt = now;
                                    cell.fertilizerCooldown = now + 12000;
                                    fertilizedCount++;
                                }
                            }
                        }
                    }
                    

                    
                    window.menuSystem.currentGame.updateUI();
                    window.menuSystem.currentGame.draw();
                    window.menuSystem.currentGame.showMessage(`Fertilized ${fertilizedCount} plants!`, 'success');

                } catch (error) {
                    console.error('Error in fertilizeAllPlants:', error);
                    window.menuSystem.currentGame.showMessage('Error during fertilizing. Try the emergency reset.', 'error');
                }
            } else {
                console.error('No current game instance found');
                alert('Error: No game instance found. Please start a game first.');
            }
        };
        
        // Statistics & Data
        window.showDetailedStats = () => {
            const stats = {
                'Total Plants Harvested': this.stats.totalPlantsHarvested || 0,
                'Total Money Earned': `$${this.stats.totalMoneyEarned || 0}`,
                'Total Water Used': this.stats.totalWaterUsed || 0,
                'Total Fertilizer Used': this.stats.totalFertilizerUsed || 0,
                'Best Harvest Value': `$${this.stats.bestHarvest || 0}`,
                'Longest Play Session': `${Math.floor((this.stats.longestPlaySession || 0) / 60000)} minutes`,
                'Different Plants Planted': this.stats.plantsByType ? Object.keys(this.stats.plantsByType).length : 0,
                'Current Season': this.currentSeason || 'spring',
                'Season Day': this.seasonDay || 1,
                'Garden Size': `${this.gardenSize}x${this.gardenSize}`,
                'Active Sprinklers': this.sprinklers ? this.sprinklers.length : 0,
                'Completed Challenges': this.challenges.completed ? this.challenges.completed.length : 0,
                'Tool Levels': this.toolLevels,
                'Achievements Unlocked': Object.values(this.achievements).filter(a => a.unlocked).length,
                'Admin Panel Used': this.stats.adminPanelUsed ? 'Yes' : 'No',
                'Admin Panel Usage Count': this.stats.adminPanelUsageCount || 0
            };
            
            alert('Detailed statistics logged to console. Press F12 to view.');
            this.showMessage('Statistics logged to console!', 'info');
        };
        
        window.resetStats = () => {
            if (confirm('Are you sure you want to reset all statistics and garden data?')) {
                // Reset statistics
                this.stats = {
                    totalPlantsHarvested: 0,
                    totalMoneyEarned: 0,
                    totalWaterUsed: 0,
                    totalFertilizerUsed: 0,
                    plantsByType: {},
                    bestHarvest: 0,
                    longestPlaySession: 0,
                    sessionStartTime: Date.now(),
                    adminPanelUsed: false,
                    adminPanelUsageCount: 0
                };
                
                // Reset garden to initial state
                this.gardenSize = 8;
                this.gridSize = 8;
                this.cellSize = Math.floor(600 / this.gridSize);
                this.expansionCost = 5000;
                this.garden = this.initializeGarden();
                this.sprinklers = [];
                
                // Reset game state
                this.money = 100;
                this.water = 50;
                this.fertilizer = 25;
                this.score = 0;
                this.selectedSeed = null;
                this.selectedTool = null;
                this.selectedSprinkler = null;
                
                // Reset tools to level 1
                this.tools = {
                    water: 1,
                    fertilizer: 1,
                    harvest: 1
                };
                
                // Reset shop inventory with proper structure
                this.shopInventory = {
                    carrot: { stock: 7, maxStock: 10, restockAmount: 5 },
                    tomato: { stock: 6, maxStock: 8, restockAmount: 4 },
                    corn: { stock: 4, maxStock: 6, restockAmount: 3 },
                    squash: { stock: 5, maxStock: 7, restockAmount: 3 },
                    potato: { stock: 6, maxStock: 8, restockAmount: 4 },
                    lettuce: { stock: 8, maxStock: 10, restockAmount: 5 },
                    onion: { stock: 6, maxStock: 8, restockAmount: 4 },
                    garlic: { stock: 4, maxStock: 6, restockAmount: 3 },
                    broccoli: { stock: 3, maxStock: 5, restockAmount: 2 },
                    cauliflower: { stock: 2, maxStock: 4, restockAmount: 2 },
                    cucumber: { stock: 6, maxStock: 8, restockAmount: 4 },
                    radish: { stock: 8, maxStock: 10, restockAmount: 5 },
                    spinach: { stock: 7, maxStock: 9, restockAmount: 4 },
                    winter_greens: { stock: 4, maxStock: 6, restockAmount: 3 },
                    zucchini: { stock: 5, maxStock: 7, restockAmount: 3 },
                    peas: { stock: 8, maxStock: 10, restockAmount: 5 },
                    herbs: { stock: 6, maxStock: 8, restockAmount: 4 },
                    cabbage: { stock: 5, maxStock: 7, restockAmount: 3 },
                    celery: { stock: 6, maxStock: 8, restockAmount: 4 },
                    bell_pepper: { stock: 4, maxStock: 5, restockAmount: 2 },
                    watermelon: { stock: 2, maxStock: 3, restockAmount: 1 },
                    asparagus: { stock: 3, maxStock: 4, restockAmount: 2 },
                    artichoke: { stock: 2, maxStock: 3, restockAmount: 1 },
                    kiwi: { stock: 2, maxStock: 3, restockAmount: 1 },
                    pumpkin: { stock: 1, maxStock: 2, restockAmount: 1 },
                    grapes: { stock: 3, maxStock: 4, restockAmount: 2 },
                    apple: { stock: 4, maxStock: 5, restockAmount: 2 },
                    pineapple: { stock: 1, maxStock: 2, restockAmount: 1 },
                    mango: { stock: 2, maxStock: 3, restockAmount: 1 },
                    dragonfruit: { stock: 1, maxStock: 1, restockAmount: 1 }
                };
                
                this.updateStatsDisplay();
                this.updateUI();
                this.saveGame();
                this.showMessage('Statistics and garden reset!', 'success');
            }
        };
        
        window.showGrowthRates = () => {
            this.showGrowthRates();
        };
        
        window.exportSaveData = () => {
            const saveData = {
                slot: this.saveSlot,
                data: localStorage.getItem(`gardenGameSave_${this.saveSlot}`),
                exportTime: new Date().toISOString()
            };
            const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `garden-game-slot-${this.saveSlot}-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            this.showMessage('Save data exported!', 'success');
        };
        
        window.importSaveData = () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const importData = JSON.parse(e.target.result);
                            if (importData.slot && importData.data) {
                                localStorage.setItem(`gardenGameSave_${importData.slot}`, importData.data);
                                this.showMessage(`Save data imported for slot ${importData.slot}!`, 'success');
                                if (importData.slot == this.saveSlot) {
                                    this.loadGame();
                                }
                            } else {
                                this.showMessage('Invalid save data format!', 'error');
                            }
                        } catch (error) {
                            this.showMessage('Error importing save data!', 'error');
                        }
                    };
                    reader.readAsText(file);
                }
            };
            input.click();
        };
        


        
        window.setSeason = () => {
            const season = prompt('Enter season (spring/summer/fall/winter):');
            if (season && ['spring', 'summer', 'fall', 'winter'].includes(season)) {
                this.currentSeason = season;
                this.seasonDay = 1;
                this.updateSeasonMultiplier();
                this.updateUI();
                this.showMessage(`Season set to ${season}!`, 'success');
            } else {
                this.showMessage('Invalid season!', 'error');
            }
        };
        
        // System
        window.clearAllSlots = () => {
            if (confirm('Are you sure you want to clear ALL save slots? This cannot be undone!')) {
                for (let slot = 1; slot <= 3; slot++) {
                    localStorage.removeItem(`gardenGameSave_${slot}`);
                }
                this.showMessage('All slots cleared!', 'success');
                if (window.menuSystem) {
                    window.menuSystem.updateSaveSlots();
                }
            }
        };
        
        window.backupGame = () => {
            const backup = {};
            for (let slot = 1; slot <= 3; slot++) {
                const saveData = localStorage.getItem(`gardenGameSave_${slot}`);
                if (saveData) {
                    backup[`slot_${slot}`] = saveData;
                }
            }
            backup.backupTime = new Date().toISOString();
            backup.backupVersion = '1.0';
            
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `garden-game-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            this.showMessage('Game backup created!', 'success');
        };
        
        window.restoreGame = () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const backup = JSON.parse(e.target.result);
                            let restoredCount = 0;
                            for (let slot = 1; slot <= 3; slot++) {
                                if (backup[`slot_${slot}`]) {
                                    localStorage.setItem(`gardenGameSave_${slot}`, backup[`slot_${slot}`]);
                                    restoredCount++;
                                }
                            }
                            this.showMessage(`${restoredCount} slots restored from backup!`, 'success');
                            if (window.menuSystem) {
                                window.menuSystem.updateSaveSlots();
                            }
                        } catch (error) {
                            this.showMessage('Error restoring backup!', 'error');
                        }
                    };
                    reader.readAsText(file);
                }
            };
            input.click();
        };
    }
    
    selectSeed(seedType) {
        const plantData = this.plantTypes[seedType];
        const inventory = this.shopInventory[seedType];
        
        if (!plantData) {
            console.error(`No plant data found for ${seedType}`);
            this.showMessage(`Error: Invalid seed type ${seedType}!`, 'error');
            return;
        }
        
        if (!inventory) {
            console.error(`No inventory found for ${seedType}`);
            this.showMessage(`Error: No inventory data for ${seedType}!`, 'error');
            return;
        }
        
        // Check if seed is available in current season
        if (!this.isSeedAvailable(seedType)) {
            this.showMessage(`${plantData.name} is not available in ${this.currentSeason}!`, 'error');
            return;
        }
        
        if (inventory.stock <= 0) {
            this.showMessage(`${plantData.name} is out of stock!`, 'error');
            // Clear selection when out of stock
            this.selectedSeed = null;
            document.querySelectorAll('.seed-item').forEach(item => {
                item.classList.remove('selected');
            });
            return;
        }
        
        if (this.money >= plantData.cost) {
            this.selectedSeed = seedType;
            
            // Clear all previous selections
            document.querySelectorAll('.seed-item').forEach(item => {
                item.classList.remove('selected');
            });
            document.querySelectorAll('.tool-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelectorAll('.sprinkler-tool').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add selection to the clicked seed
            const seedElement = document.querySelector(`[data-seed="${seedType}"]`);
            if (seedElement) {
                seedElement.classList.add('selected');
            }
            
            // Update shop display to reflect current state
            this.updateShopDisplay();
        } else {
            this.showMessage('Not enough money!');
        }
    }
    
    selectTool(tool) {
        this.currentTool = tool;
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const toolBtn = document.getElementById(`${tool}-btn`);
        if (toolBtn) {
            toolBtn.classList.add('active');
        } else {
            console.error('Tool button not found:', `${tool}-btn`);
        }
        this.selectedSeed = null;
        this.selectedSprinkler = null;
        this.selectedDecoration = null; // Clear decoration selection when selecting tools
        document.querySelectorAll('.seed-item').forEach(item => {
            item.classList.remove('selected');
        });
        document.querySelectorAll('.sprinkler-tool').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.decoration-item').forEach(item => {
            item.classList.remove('selected');
        });
        // Update shop display when clearing seed selection
        this.updateShopDisplay();
    }
    
    selectSprinkler(sprinklerType) {
        this.selectedSprinkler = sprinklerType;
        this.currentTool = 'sprinkler';
        this.selectedSeed = null;
        this.selectedDecoration = null; // Clear decoration selection when selecting sprinklers
        
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.sprinkler-tool').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const sprinklerBtn = document.getElementById(`sprinkler-${sprinklerType}-btn`);
        if (sprinklerBtn) {
            sprinklerBtn.classList.add('active');
        }
        
        document.querySelectorAll('.seed-item').forEach(item => {
            item.classList.remove('selected');
        });
        document.querySelectorAll('.decoration-item').forEach(item => {
            item.classList.remove('selected');
        });
        // Update shop display when clearing seed selection
        this.updateShopDisplay();
    }
    
    handleCanvasClick(e) {
        if (!this.canvas) {
            return;
        }
        
        const rect = this.canvas.getBoundingClientRect();
        
        // Handle both mouse and touch events
        let x, y;
        if (e.touches && e.touches[0]) {
            // Touch event
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            // Mouse event
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }
        
        // Calculate the grid offset
        const gridWidth = this.gridSize * this.cellSize;
        const gridHeight = this.gridSize * this.cellSize;
        const offsetX = (this.canvas.width - gridWidth) / 2;
        const offsetY = (this.canvas.height - gridHeight) / 2;
        
        // Adjust click coordinates for the offset
        const adjustedX = x - offsetX;
        const adjustedY = y - offsetY;
        
        const col = Math.floor(adjustedX / this.cellSize);
        const row = Math.floor(adjustedY / this.cellSize);
        
        if (row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize) {
            this.handleCellClick(row, col);
        }
    }
    
    handleMouseMove(e) {
        if (!this.canvas) {
            return;
        }
        
        const rect = this.canvas.getBoundingClientRect();
        
        // Handle both mouse and touch events
        let x, y;
        if (e.touches && e.touches[0]) {
            // Touch event
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            // Mouse event
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }
        
        // Calculate the grid offset
        const gridWidth = this.gridSize * this.cellSize;
        const gridHeight = this.gridSize * this.cellSize;
        const offsetX = (this.canvas.width - gridWidth) / 2;
        const offsetY = (this.canvas.height - gridHeight) / 2;
        
        // Adjust mouse coordinates for the offset
        const adjustedX = x - offsetX;
        const adjustedY = y - offsetY;
        
        const col = Math.floor(adjustedX / this.cellSize);
        const row = Math.floor(adjustedY / this.cellSize);
        
        this.canvas.style.cursor = 'pointer';
        
        if (row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize) {
            const cell = this.garden[row][col];
            const hasSprinklerHere = this.hasSprinkler(row, col);
            
            if (this.currentTool === 'harvest' && cell.plant && cell.plant.isFullyGrown) {
                this.canvas.style.cursor = 'crosshair';
            } else if (this.selectedSeed && !cell.plant && !hasSprinklerHere) {
                this.canvas.style.cursor = 'grab';
            } else if (this.currentTool === 'water' && cell.plant && !cell.watered && cell.waterCooldown <= Date.now()) {
                this.canvas.style.cursor = 'grab';
            } else if (this.currentTool === 'fertilizer' && cell.plant && !cell.fertilized && cell.fertilizerCooldown <= Date.now()) {
                this.canvas.style.cursor = 'grab';
            } else if (this.currentTool === 'shovel' && (cell.plant || hasSprinklerHere)) {
                this.canvas.style.cursor = 'crosshair';
            } else if (this.currentTool === 'sprinkler' && this.selectedSprinkler && !cell.plant && !hasSprinklerHere) {
                this.canvas.style.cursor = 'grab';
            }
        }
    }
    
    handleCellClick(row, col) {
        const cell = this.garden[row][col];
        const hasSprinklerHere = this.hasSprinkler(row, col);
        
        if (this.selectedSeed && !cell.plant && !hasSprinklerHere) {
            this.plantSeed(row, col);
        } else if (this.currentTool === 'harvest' && cell.plant) {
            this.harvestPlant(row, col);
        } else if (this.currentTool === 'water' && cell.plant && !cell.watered && cell.waterCooldown <= Date.now()) {
            this.waterPlant(row, col);
        } else if (this.currentTool === 'fertilizer' && cell.plant && !cell.fertilized && cell.fertilizerCooldown <= Date.now()) {
            this.fertilizePlant(row, col);
        } else if (this.currentTool === 'shovel' && (cell.plant || hasSprinklerHere)) {
            if (cell.plant) {
                this.removePlant(row, col);
            } else {
                this.removeSprinkler(row, col);
            }
        } else if (this.currentTool === 'sprinkler' && this.selectedSprinkler && !cell.plant && !hasSprinklerHere) {
            this.placeSprinkler(row, col);
        } else if (this.selectedDecoration && !cell.plant && !hasSprinklerHere && !cell.decoration) {
            this.placeDecoration(row, col);
        } else if (this.currentTool === 'shovel' && cell.decoration) {
            this.removeDecoration(row, col);
        } else if (cell.plant) {
            // Show bonus info when clicking on plants without a specific action
            this.showBonusInfo(row, col);
            
            // Also show damage info if plant was recently damaged
            if (cell.plant.recentlyDamaged) {
                this.showMessage(`🌱 This plant was recently damaged by a storm!`, 'warning');
                // Clear the recently damaged flag after showing the message
                setTimeout(() => {
                    if (cell.plant) {
                        cell.plant.recentlyDamaged = false;
                    }
                }, 3000);
            }
        }
    }
    
    hasSprinkler(row, col) {
        return this.sprinklers.some(s => s.row === row && s.col === col);
    }
    
    getSprinklerBonus(row, col) {
        let totalBonus = 0;
        this.sprinklers.forEach(sprinkler => {
            const distance = Math.max(Math.abs(sprinkler.row - row), Math.abs(sprinkler.col - col));
            if (distance <= this.sprinklerTypes[sprinkler.type].range) {
                totalBonus += this.sprinklerTypes[sprinkler.type].growthBonus;
            }
        });
        return totalBonus;
    }
    
    // Function to handle continuous growth from watering and fertilizing
    checkContinuousGrowth(row, col) {
        const cell = this.garden[row][col];
        if (!cell || !cell.plant || cell.plant.isFullyGrown) return;
        
        const now = Date.now();
        const plantData = this.plantTypes[cell.plant.type];
        if (!plantData) return;
        
        // Check water-based continuous growth
        if (cell.watered && cell.waterGrowthStart && cell.waterGrowthDuration) {
            const waterGrowthElapsed = now - cell.waterGrowthStart;
            if (waterGrowthElapsed < cell.waterGrowthDuration) {
                // Calculate growth progress (1 stage per 2 seconds when watered)
                let growthTimePerStage = 2000; // 2 seconds per stage (base)
                
                // Apply custom growth rate multiplier
                const seedType = cell.plant.type;
                const growthMultiplier = this.getSeedGrowthMultiplier(seedType);
                growthTimePerStage *= growthMultiplier;
                
                const lastWaterGrowthCheck = cell.lastWaterGrowthCheck || cell.waterGrowthStart;
                const timeSinceLastCheck = now - lastWaterGrowthCheck;
                const growthProgress = timeSinceLastCheck / growthTimePerStage;
                

                
                if (growthProgress >= 1) {
                    // Advance growth stage
                    if (cell.plant.growthStage < this.growthStages.length - 1) {
                        cell.plant.growthStage++;
                        cell.lastWaterGrowthCheck = now;
                        
                        // Check if fully mature
                        if (cell.plant.growthStage >= this.growthStages.length - 1) {
                            cell.plant.isFullyGrown = true;
                        }
                        
                        this.saveGame();
                        this.updateUI();
                        this.draw(); // Force immediate redraw to show growth
                    }
                }
            } else {
                // Water growth period ended
                cell.watered = false;
                cell.waterGrowthStart = null;
                cell.waterGrowthDuration = null;
                cell.lastWaterGrowthCheck = null;
            }
        }
        
        // Check fertilizer-based continuous growth
        if (cell.fertilized && cell.fertilizerGrowthStart && cell.fertilizerGrowthDuration) {
            const fertilizerGrowthElapsed = now - cell.fertilizerGrowthStart;
            if (fertilizerGrowthElapsed < cell.fertilizerGrowthDuration) {
                // Calculate growth progress (1 stage per 1.5 seconds when fertilized)
                let growthTimePerStage = 1500; // 1.5 seconds per stage (base)
                
                // Apply custom growth rate multiplier
                const seedType = cell.plant.type;
                const growthMultiplier = this.getSeedGrowthMultiplier(seedType);
                growthTimePerStage *= growthMultiplier;
                
                const lastFertilizerGrowthCheck = cell.lastFertilizerGrowthCheck || cell.fertilizerGrowthStart;
                const timeSinceLastCheck = now - lastFertilizerGrowthCheck;
                const growthProgress = timeSinceLastCheck / growthTimePerStage;
                

                
                if (growthProgress >= 1) {
                    // Advance growth stage
                    if (cell.plant.growthStage < this.growthStages.length - 1) {
                        cell.plant.growthStage++;
                        cell.lastFertilizerGrowthCheck = now;
                        
                        // Check if fully mature
                        if (cell.plant.growthStage >= this.growthStages.length - 1) {
                            cell.plant.isFullyGrown = true;
                        }
                        
                        this.saveGame();
                        this.updateUI();
                        this.draw(); // Force immediate redraw to show growth
                    }
                }
            } else {
                // Fertilizer growth period ended
                cell.fertilized = false;
                cell.fertilizerGrowthStart = null;
                cell.fertilizerGrowthDuration = null;
                cell.lastFertilizerGrowthCheck = null;
            }
        }
    }
    
    // Helper functions to identify seed rarity
    isRareSeed(seedType) {
        const rareSeeds = ['watermelon', 'asparagus', 'artichoke', 'kiwi', 'strawberry'];
        return rareSeeds.includes(seedType);
    }
    
    isLegendarySeed(seedType) {
        const legendarySeeds = ['dragonfruit', 'pineapple', 'mango', 'apple', 'grape'];
        return legendarySeeds.includes(seedType);
    }
    
    // Admin function to check current growth rates for all seeds
    showGrowthRates() {
        const allSeeds = Object.keys(this.plantTypes);
        allSeeds.forEach(seedType => {
            const multiplier = this.getSeedGrowthMultiplier(seedType);
            const waterTime = (2000 * multiplier / 1000).toFixed(1);
            const fertilizerTime = (1500 * multiplier / 1000).toFixed(1);
            const sprinklerTime = (30000 * multiplier / 1000).toFixed(0);
            
            console.log(`${seedType}: ${multiplier}x (Water: ${waterTime}s, Fertilizer: ${fertilizerTime}s, Sprinkler: ${sprinklerTime}s)`);
        });
        
        this.showMessage('Growth rates logged to console!', 'info');
    }
    
    // New flexible growth rate system - customize individual seed growth speeds
    getSeedGrowthMultiplier(seedType) {
        // Custom growth multipliers for individual seeds
        const customGrowthRates = {
            // Fast growing seeds (0.5x time = 2x faster)
            'carrot': 0.5,
            'lettuce': 0.5,
            'radish': 0.5,
            'spinach': 0.6,
            'tomato': 0.7,
            
            // Normal growing seeds (1.0x time = standard speed)
            'corn': 1.0,
            'potato': 1.0,
            'bell_pepper': 1.0,
            'cucumber': 1.0,
            'onion': 1.0,
            'garlic': 1.0,
            'broccoli': 1.0,
            'cauliflower': 1.0,
            'cabbage': 1.0,
            'squash': 1.0,
            'winter_greens': 1.0,
            'herbs': 1.0,
            'peas': 1.0,
            'beans': 1.0,
            
            // Slow growing seeds (1.5x time = 1.5x slower)
            'pumpkin': 1.5,
            'sweet_potato': 1.5,
            'eggplant': 1.5,
            
            // Rare seeds - individual growth rates
            'watermelon': 2.5,    // Slower than other rare seeds
            'asparagus': 2.0,     // Standard rare speed
            'artichoke': 2.8,     // Very slow growing
            'kiwi': 1.8,          // Faster than other rare seeds
            'strawberry': 2.2,    // Slightly slower than standard rare
            
            // Legendary seeds - individual growth rates
            'dragonfruit': 4.0,   // Slowest legendary (very rare)
            'pineapple': 3.5,     // Very slow growing
            'mango': 2.8,         // Faster than other legendary seeds
            'apple': 3.2,         // Standard legendary speed
            'grape': 3.8          // Very slow growing
        };
        
        // Return custom rate if defined, otherwise use rarity-based fallback
        if (customGrowthRates.hasOwnProperty(seedType)) {
            return customGrowthRates[seedType];
        }
        
        // Fallback to old rarity system for any undefined seeds
        if (this.isLegendarySeed(seedType)) {
            return 3.0;
        } else if (this.isRareSeed(seedType)) {
            return 2.0;
        }
        
        return 1.0; // Default normal speed
    }
    
    // New function to check if sprinklers should advance plant growth
    checkSprinklerGrowth(row, col) {
        const cell = this.garden[row][col];
        if (!cell || !cell.plant || cell.plant.isFullyGrown) return;
        
        const plantData = this.plantTypes[cell.plant.type];
        if (!plantData) return;
        
        // Check if plant is within sprinkler range
        const sprinklerBonus = this.getSprinklerBonus(row, col);
        if (sprinklerBonus > 0) {
            // Calculate continuous growth based on time
            const now = Date.now();
            const lastGrowthCheck = cell.lastSprinklerGrowth || now;
            const timeSinceLastCheck = now - lastGrowthCheck;
            
            // Growth rate: 1 stage per 30 seconds with sprinkler
            let growthTimePerStage = 30000; // 30 seconds per stage (base)
            
            // Apply custom growth rate multiplier
            const seedType = cell.plant.type;
            const growthMultiplier = this.getSeedGrowthMultiplier(seedType);
            growthTimePerStage *= growthMultiplier;
            
            const growthProgress = timeSinceLastCheck / growthTimePerStage;
            
            if (growthProgress >= 1) {
                // Advance growth stage
                if (cell.plant.growthStage < this.growthStages.length - 1) {
                    cell.plant.growthStage++;
                    cell.lastSprinklerGrowth = now;
                    
                    // Show growth message
                    this.showMessage(`${plantData.name} grew from sprinkler!`, 'success');
                    console.log(`${plantData.name} grew to stage ${cell.plant.growthStage + 1}/${this.growthStages.length} from sprinkler`);
                    
                    // Check if fully mature
                    if (cell.plant.growthStage >= this.growthStages.length - 1) {
                        cell.plant.isFullyGrown = true;
                    }
                    
                    // Save game and update UI
                    this.saveGame();
                    this.updateUI();
                    this.draw(); // Force immediate redraw to show growth
                }
            }
        }
    }
    
    plantSeed(row, col) {
        const seedType = this.selectedSeed;
        
        // Validate seed selection
        if (!seedType) {
            this.showMessage('No seed selected!', 'error');
            this.playSound('error');
            return;
        }
        
        const seedData = this.plantTypes[seedType];
        const inventory = this.shopInventory[seedType];
        
        // Validate seed data
        if (!seedData) {
            console.error(`No plant data found for ${seedType}`);
            this.showMessage(`Error: Invalid seed type ${seedType}!`, 'error');
            this.playSound('error');
            return;
        }
        
        if (!inventory) {
            console.error(`No inventory found for ${seedType}`);
            this.showMessage(`Error: No inventory data for ${seedType}!`, 'error');
            this.playSound('error');
            return;
        }
        
        // Check seasonal availability
        if (!this.isSeedAvailable(seedType)) {
            this.showMessage(`${seedData.name} is not available in ${this.currentSeason}!`, 'error');
            this.playSound('error');
            return;
        }
        
        // Validate stock
        if (inventory.stock <= 0) {
            this.showMessage(`${seedData.name} is out of stock!`, 'error');
            this.playSound('error');
            return;
        }
        
        // Validate money
        if (this.money < seedData.cost) {
            this.showMessage('Not enough money!', 'error');
            this.playSound('error');
            return;
        }
        
        // Check if there's already a plant here
        const cell = this.garden[row][col];
        if (cell.plant) {
            this.showMessage('There\'s already a plant here!', 'error');
            this.playSound('error');
            return;
        }
        
        // Check if there's a sprinkler here
        if (this.hasSprinkler(row, col)) {
            this.showMessage('Cannot plant on a sprinkler!', 'error');
            this.playSound('error');
            return;
        }
        
        // All validations passed, proceed with planting
        
        // Deduct money and reduce stock
            this.money -= seedData.cost;
            inventory.stock--;
            
        // Create the plant with growth stages
        const plantObject = {
                    type: seedType,
                    stage: 0,
                    plantedAt: Date.now(),
            isFullyGrown: false,
            growthStage: 0
        };
        
        // Create the garden cell with the plant
        this.garden[row][col] = {
            plant: plantObject,
                watered: false,
                wateredAt: null,
                waterCooldown: 0,
                fertilized: false,
                fertilizedAt: null,
                fertilizerCooldown: 0,
                plantedAt: Date.now()
            };
        
        // Verify the plant was actually created
        if (!this.garden[row][col].plant) {
            this.showMessage(`Error: Failed to plant ${seedData.name}!`, 'error');
            return;
        }
            
            this.showMessage(`Planted ${seedData.name}!`, 'success');
            this.playSound('plant');
            this.achievementStats.plantsPlanted++;
            this.achievementStats.differentPlantsPlanted.add(seedType);
            
            // Add plant particle effect
            const x = (col * this.cellSize) + (this.cellSize / 2);
            const y = (row * this.cellSize) + (this.cellSize / 2);
            this.addParticle(x, y, 'plant', '');
        
        // Save immediately to ensure plant is persisted
        this.saveGame();
        
        // Update UI immediately and force redraw
            this.updateUI();
        this.draw(); // Force immediate redraw to show the new plant
        
        // Keep seed selected for continued planting
        // (Removed seed selection clearing to allow multiple plantings of same seed)
        
        // Update shop display to reflect stock changes
            this.updateShopDisplay();
            
        // Force another save and update after a brief delay to ensure everything is saved
        setTimeout(() => {
            this.saveGame();
            this.updateShopDisplay();
            this.draw(); // Force another redraw
        }, 100);
    }
    
    waterPlant(row, col) {
        const cell = this.garden[row][col];
        const now = Date.now();
        
        if (cell.waterCooldown > now) {
            const remainingTime = Math.ceil((cell.waterCooldown - now) / 1000);
            this.showMessage(`Water cooldown: ${remainingTime}s remaining`, 'error');
            return;
        }
        
        if (this.water > 0) {
            this.water--;
            cell.watered = true;
            cell.wateredAt = now;
            cell.waterCooldown = now + 8000;
            
            // Start continuous growth when watered
            if (cell.plant && cell.plant.growthStage < this.growthStages.length - 1) {
                const plantData = this.plantTypes[cell.plant.type];
                this.showMessage(`${plantData.name} watered! Will grow continuously for 8 seconds!`, 'success');
                
                // Set up continuous growth tracking
                cell.waterGrowthStart = now;
                cell.waterGrowthDuration = 8000; // 8 seconds of continuous growth
            } else {
                const plantData = this.plantTypes[cell.plant.type];
                this.showMessage(`${plantData.name} watered! (Already fully grown)`, 'success');
            }
            
            this.playSound('water');
            this.achievementStats.plantsWatered++;
            
            // Add water particle effect
            const x = (col * this.cellSize) + (this.cellSize / 2);
            const y = (row * this.cellSize) + (this.cellSize / 2);
            this.addParticle(x, y, 'water', '');
            
            this.updateUI();
            this.saveGame();
        } else {
            this.showMessage('No water left!', 'error');
            this.playSound('error');
        }
    }
    
    fertilizePlant(row, col) {
        const cell = this.garden[row][col];
        const now = Date.now();
        
        if (cell.fertilizerCooldown > now) {
            const remainingTime = Math.ceil((cell.fertilizerCooldown - now) / 1000);
            this.showMessage(`Fertilizer cooldown: ${remainingTime}s remaining`, 'error');
            return;
        }
        
        if (this.fertilizer > 0) {
            this.fertilizer--;
            cell.fertilized = true;
            cell.fertilizedAt = now;
            cell.fertilizerCooldown = now + 12000;
            
            // Start continuous growth when fertilized
            if (cell.plant && cell.plant.growthStage < this.growthStages.length - 1) {
                const plantData = this.plantTypes[cell.plant.type];
                this.showMessage(`${plantData.name} fertilized! Will grow continuously for 12 seconds!`, 'success');
                
                // Set up continuous growth tracking
                cell.fertilizerGrowthStart = now;
                cell.fertilizerGrowthDuration = 12000; // 12 seconds of continuous growth
            } else {
                const plantData = this.plantTypes[cell.plant.type];
                this.showMessage(`${plantData.name} fertilized! (Already fully grown)`, 'success');
            }
            
            this.playSound('fertilizer');
            this.achievementStats.plantsFertilized++;
            
            // Add fertilizer particle effect
            const x = (col * this.cellSize) + (this.cellSize / 2);
            const y = (row * this.cellSize) + (this.cellSize / 2);
            this.addParticle(x, y, 'fertilizer', '');
            
            this.updateUI();
            this.saveGame();
        } else {
            this.showMessage('No fertilizer left!', 'error');
            this.playSound('error');
        }
    }
    
    harvestPlant(row, col) {
        const cell = this.garden[row][col];
        if (cell.plant) {
            const plantData = this.plantTypes[cell.plant.type];
            
            // Calculate harvest value with growth stages and bonus from upgraded harvest tool
            const baseValue = plantData.harvestValue;
            const growthStage = this.getPlantGrowthStage(cell.plant);
            const stageMultiplier = this.stageMultipliers[growthStage] || 1.0;
            const bonusMultiplier = 1 + this.harvestBonus;
            const finalValue = Math.floor(baseValue * stageMultiplier * bonusMultiplier);
            
            this.money += finalValue;
            this.score += finalValue;
            this.achievementStats.totalHarvests++;
            this.achievementStats.totalMoney += finalValue;
            
            // Update statistics
            this.updateStats('harvest', 1);
            this.updateStats('money', finalValue);
            this.updateStats('plant', cell.plant.type);
            
            // Update challenge progress
            this.updateChallengeProgress('harvest', 1);
            this.updateChallengeProgress('money', finalValue);
            
            // Add particle effect
            const x = (col * this.cellSize) + (this.cellSize / 2);
            const y = (row * this.cellSize) + (this.cellSize / 2);
            this.addParticle(x, y, 'money', finalValue);
            

            
            // Check for rare/legendary achievements
            if (plantData.isRare) {
                this.achievementStats.rareHarvests++;
            }
            if (plantData.isLegendary) {
                this.achievementStats.legendaryHarvests++;
            }
            
            // Show bonus message if harvest tool is upgraded
            if (this.harvestBonus > 0) {
                const bonusAmount = finalValue - baseValue;
                this.showMessage(`Harvested ${plantData.name} for $${finalValue}! (+$${bonusAmount} bonus)`, 'success');
            } else {
                this.showMessage(`Harvested ${plantData.name} for $${finalValue}!`, 'success');
            }
            this.playSound('harvest');
            this.playSound('money');
            
            // Clear the cell completely
            this.garden[row][col] = {
                plant: null,
                watered: false,
                wateredAt: null,
                waterCooldown: 0,
                fertilized: false,
                fertilizedAt: null,
                fertilizerCooldown: 0,
                plantedAt: null
            };
            
            this.updateUI();
            this.saveGame();
        }
    }
    
    removePlant(row, col) {
        const cell = this.garden[row][col];
        if (cell.plant) {
            const plantData = this.plantTypes[cell.plant.type];
            this.showMessage(`Removed ${plantData.name}!`, 'info');
            
            this.garden[row][col] = {
                plant: null,
                watered: false,
                wateredAt: null,
                waterCooldown: 0,
                fertilized: false,
                fertilizedAt: null,
                fertilizerCooldown: 0,
                plantedAt: null
            };
            
            this.updateUI();
        }
    }
    
    updatePlants() {
        this.updatePlantsSilent();
    }
    
    updatePlantsSilent() {
        const now = Date.now();
        
        // Check for expired sprinklers
        this.sprinklers = this.sprinklers.filter(sprinkler => {
            if (now >= sprinkler.expiresAt) {
                const sprinklerData = this.sprinklerTypes[sprinkler.type];
                const durationMinutes = Math.floor(sprinklerData.duration / 60000);
                this.showMessage(`${sprinkler.type} sprinkler expired after ${durationMinutes} minutes!`, 'info');
                return false; // Remove expired sprinkler
            }
            return true; // Keep active sprinkler
        });
        
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const cell = this.garden[row][col];
                if (cell.plant && !cell.plant.isFullyGrown) {
                    const plantData = this.plantTypes[cell.plant.type];
                    const timeSincePlanted = now - cell.plantedAt;
                    const growthProgress = timeSincePlanted / plantData.growthTime;
                    
                    if (cell.watered && cell.wateredAt && (now - cell.wateredAt) > 15000) {
                        cell.watered = false;
                        cell.wateredAt = null;
                    }
                    
                    if (cell.fertilized && cell.fertilizedAt && (now - cell.fertilizedAt) > 20000) {
                        cell.fertilized = false;
                        cell.fertilizedAt = null;
                    }
                    
                    let growthMultiplier = 0.3;
                    if (cell.watered) growthMultiplier = 1.8;
                    if (cell.fertilized) growthMultiplier = 2.5;
                    if (cell.watered && cell.fertilized) growthMultiplier = 3.2;
                    
                    // Apply sprinkler effects
                    const sprinklerBonus = this.getSprinklerBonus(row, col);
                    growthMultiplier += sprinklerBonus;
                    
                    // Apply weather effects
                    growthMultiplier *= this.weatherEffects[this.weather].growthMultiplier;
                    
                    // Apply seasonal effects
                    growthMultiplier *= this.seasonMultiplier;
                    
                    // Plants now only grow when watered or fertilized
                    // No automatic growth updates in the game loop
                    
                    // Check if plant is fully mature for achievement tracking
                    const currentStage = this.getPlantGrowthStage(cell.plant);
                    if (currentStage >= this.growthStages.length - 1 && !cell.plant.isFullyGrown) {
                        cell.plant.isFullyGrown = true;
                    }
                    
                    // Check for continuous growth from watering and fertilizing
                    this.checkContinuousGrowth(row, col);
                    
                    // Check for sprinkler growth
                    this.checkSprinklerGrowth(row, col);
                }
            }
        }
    }
    
    checkRestock() {
        this.checkRestockSilent();
    }
    
    checkRestockSilent() {
        const now = Date.now();
        const timeSinceLastRestock = now - this.lastRestockTime;
        
        if (timeSinceLastRestock >= this.restockInterval) {
            this.restockShopSilent();
            this.lastRestockTime = now;
            this.updateShopDisplay(); // Force update the shop display
        }
    }
    
    restockShop() {
        this.restockShopSilent();
        this.updateShopDisplay();
        this.showMessage('Shop restocked!', 'info');
    }
    
    restockShopSilent() {
        let restockedSeeds = [];
        
        for (const [seedType, inventory] of Object.entries(this.shopInventory)) {
            const plantData = this.plantTypes[seedType];
            
            if (inventory.stock < inventory.maxStock) {
                let shouldRestock = true;
                let restockAmount = inventory.restockAmount;
                
                // Check rare and legendary restock chances
                if (plantData.isRare && Math.random() > this.rareRestockChance) {
                    shouldRestock = false;
                }
                if (plantData.isLegendary && Math.random() > this.legendaryRestockChance) {
                    shouldRestock = false;
                }
                
                if (shouldRestock) {
                    // For rare and legendary seeds, give higher quantities when they do restock
                    if (plantData.isRare) {
                        restockAmount = inventory.restockAmount * 3; // Triple the amount
                    } else if (plantData.isLegendary) {
                        restockAmount = inventory.restockAmount * 5; // 5x the amount
                    }
                    
                    // Ensure we don't exceed max stock
                    restockAmount = Math.min(
                        restockAmount,
                        inventory.maxStock - inventory.stock
                    );
                    
                    if (restockAmount > 0) {
                        const oldStock = inventory.stock;
                        inventory.stock += restockAmount;
                        restockedSeeds.push(`${plantData.name} (${oldStock}→${inventory.stock})`);
                    }
                }
            }
        }
        
        if (restockedSeeds.length > 0) {
            this.showMessage(`Shop restocked: ${restockedSeeds.join(', ')}`, 'info');
            
            // Force immediate shop display update
            setTimeout(() => {
                this.updateShopDisplay();
            }, 100);
        }
    }
    
    draw() {
        if (!this.canvas || !this.ctx) {
            return;
        }
        
        // Ensure globalAlpha is reset to 1 at the start of each draw cycle
        this.ctx.globalAlpha = 1;
        
        // Calculate the actual grid dimensions
        const gridWidth = this.gridSize * this.cellSize;
        const gridHeight = this.gridSize * this.cellSize;
        
        // Calculate center position to center the grid in the canvas
        const offsetX = (this.canvas.width - gridWidth) / 2;
        const offsetY = (this.canvas.height - gridHeight) / 2;
        
        // Fill the entire canvas with background color
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Fill the grid area with a slightly different color
        this.ctx.fillStyle = '#e9ecef';
        this.ctx.fillRect(offsetX, offsetY, gridWidth, gridHeight);
        
        this.ctx.strokeStyle = '#dee2e6';
        this.ctx.lineWidth = 1;
        
        // Draw grid lines only within the grid area, offset by the center position
        for (let i = 0; i <= this.gridSize; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(offsetX + i * this.cellSize, offsetY);
            this.ctx.lineTo(offsetX + i * this.cellSize, offsetY + gridHeight);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(offsetX, offsetY + i * this.cellSize);
            this.ctx.lineTo(offsetX + gridWidth, offsetY + i * this.cellSize);
            this.ctx.stroke();
        }
        
        // Draw plants first
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const cell = this.garden[row][col];
                const x = offsetX + col * this.cellSize;
                const y = offsetY + row * this.cellSize;
                
                if (cell.plant) {
                    this.drawPlant(row, col, cell, offsetX, offsetY);
                } else {
                    this.ctx.fillStyle = '#e9ecef';
                    this.ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
                }
            }
        }
        
        // Draw sprinklers last (as overlays) - but only for empty cells
        this.sprinklers.forEach(sprinkler => {
            const cell = this.garden[sprinkler.row][sprinkler.col];
            if (!cell.plant) {
                this.drawSprinkler(sprinkler.row, sprinkler.col, sprinkler.type, offsetX, offsetY);
            }
        });
        
        // Draw decorations
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const cell = this.garden[row][col];
                if (cell.decoration) {
                    this.drawDecoration(row, col, cell.decoration, offsetX, offsetY);
                }
            }
        }
        
        // Draw particles
        this.drawParticles();
        
        // Update season display in HTML (seasonal info is now in HTML, not canvas)
        this.updateSeasonDisplay();
        
        // Ensure globalAlpha is reset to 1 at the end of each draw cycle
        this.ctx.globalAlpha = 1;
    }
    
    drawPlant(row, col, cell, offsetX, offsetY) {
        if (!this.ctx) {
            return;
        }
        
        if (!cell.plant || !cell.plant.type) {
            return;
        }
        
        const x = offsetX + col * this.cellSize + this.cellSize / 2;
        const y = offsetY + row * this.cellSize + this.cellSize / 2;
        const plantData = this.plantTypes[cell.plant.type];
        
        if (!plantData) {
            return;
        }
        
        // Draw soil
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(offsetX + col * this.cellSize + 2, offsetY + row * this.cellSize + this.cellSize * 0.7, 
                         this.cellSize - 4, this.cellSize * 0.3);
        
        this.ctx.font = `${this.cellSize * 0.6}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Determine plant color based on state
        if (cell.plant.isFullyGrown) {
            this.ctx.fillStyle = plantData.color;
        } else if (cell.fertilized) {
            this.ctx.fillStyle = '#FFD700';
        } else if (cell.watered) {
            this.ctx.fillStyle = '#228B22';
        } else {
            this.ctx.fillStyle = '#8FBC8F';
        }
        
        // Draw the plant stage - use growthStage for visual display
        const stage = this.getPlantGrowthStage(cell.plant);
        if (plantData.stages && plantData.stages[stage]) {
            this.ctx.fillText(plantData.stages[stage], x, y);
        } else {
            // Fallback to a simple plant emoji if stages are not available
            this.ctx.fillText('🌱', x, y);
        }
        
        if (cell.watered) {
            this.ctx.fillStyle = '#87CEEB';
            this.ctx.globalAlpha = 0.7;
            this.ctx.fillRect(offsetX + col * this.cellSize + 2, offsetY + row * this.cellSize + 2, 
                             this.cellSize - 4, 4);
            this.ctx.globalAlpha = 1;
        }
        
        if (cell.fertilized) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.globalAlpha = 0.7;
            this.ctx.fillRect(offsetX + col * this.cellSize + 2, offsetY + row * this.cellSize + this.cellSize - 6, 
                             this.cellSize - 4, 4);
            this.ctx.globalAlpha = 1;
        }
        
        if (cell.waterCooldown > Date.now()) {
            this.ctx.strokeStyle = '#FF6B6B';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(offsetX + col * this.cellSize + 1, offsetY + row * this.cellSize + 1, 
                               this.cellSize - 2, this.cellSize - 2);
        }
        
        if (cell.plant.isFullyGrown) {
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(offsetX + col * this.cellSize + 4, offsetY + row * this.cellSize + 4, 
                               this.cellSize - 8, this.cellSize - 8);
        }
        
        // Check if this plant is affected by a sprinkler and show indicator
        const affectedBySprinkler = this.sprinklers.some(sprinkler => {
            const distance = Math.max(Math.abs(sprinkler.row - row), Math.abs(sprinkler.col - col));
            return distance <= this.sprinklerTypes[sprinkler.type].range;
        });
        
        if (affectedBySprinkler) {
            // Show a tiny sprinkler indicator in the corner
            const sprinkler = this.sprinklers.find(s => {
                const distance = Math.max(Math.abs(s.row - row), Math.abs(s.col - col));
                return distance <= this.sprinklerTypes[s.type].range;
            });
            if (sprinkler) {
                const sprinklerData = this.sprinklerTypes[sprinkler.type];
                this.ctx.fillStyle = sprinklerData.color;
                this.ctx.globalAlpha = 0.8;
                this.ctx.beginPath();
                this.ctx.arc(offsetX + col * this.cellSize + this.cellSize - 3, 
                             offsetY + row * this.cellSize + 3, 2, 0, 2 * Math.PI);
                this.ctx.fill();
                this.ctx.globalAlpha = 1;
            }
        }
    }
    
    drawSprinkler(row, col, type, offsetX, offsetY) {
        if (!this.ctx) {
            return;
        }
        
        const x = offsetX + col * this.cellSize + this.cellSize / 2;
        const y = offsetY + row * this.cellSize + this.cellSize / 2;
        const sprinklerData = this.sprinklerTypes[type];
        
        // Find the sprinkler data to get expiration info
        const sprinkler = this.sprinklers.find(s => s.row === row && s.col === col);
        const now = Date.now();
        const timeLeft = sprinkler ? sprinkler.expiresAt - now : 0;
        const timeLeftMinutes = Math.floor(timeLeft / 60000);
        const timeLeftSeconds = Math.floor((timeLeft % 60000) / 1000);
        
        // Check if there's a plant in this cell
        const cell = this.garden[row][col];
        const hasPlant = cell && cell.plant;
        
        // Only draw sprinkler background if there's no plant
        if (!hasPlant) {
        this.ctx.fillStyle = sprinklerData.color;
            this.ctx.globalAlpha = 0.6;
            this.ctx.fillRect(offsetX + col * this.cellSize + 2, offsetY + row * this.cellSize + 2, 
                             this.cellSize - 4, this.cellSize - 4);
        this.ctx.globalAlpha = 1;
        }
        
        // Draw sprinkler icon - only show if no plant, or as tiny indicator if plant present
        if (!hasPlant) {
        this.ctx.font = `${this.cellSize * 0.4}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(sprinklerData.icon, x, y);
        } else {
            // Just show a tiny dot in the corner when plant is present
            this.ctx.fillStyle = sprinklerData.color;
            this.ctx.globalAlpha = 0.9;
            this.ctx.beginPath();
            this.ctx.arc(offsetX + col * this.cellSize + this.cellSize - 4, 
                         offsetY + row * this.cellSize + 4, 2, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        }
        
        // Draw timer if less than 1 minute remaining
        if (timeLeft > 0 && timeLeft < 60000) {
            this.ctx.font = `${this.cellSize * 0.15}px Arial`;
            this.ctx.fillStyle = '#FF6B6B';
            this.ctx.fillText(`${timeLeftSeconds}s`, x, y + this.cellSize * 0.4);
        } else if (timeLeft > 0 && timeLeft < 300000) { // Less than 5 minutes
            this.ctx.font = `${this.cellSize * 0.15}px Arial`;
            this.ctx.fillStyle = '#FFA500';
            this.ctx.fillText(`${timeLeftMinutes}m`, x, y + this.cellSize * 0.4);
        }
        
        // Draw range indicator
        this.ctx.strokeStyle = sprinklerData.color;
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.2;
        
        // Draw range circle
        this.ctx.beginPath();
        this.ctx.arc(x, y, sprinklerData.range * this.cellSize, 0, 2 * Math.PI);
        this.ctx.stroke();
        
        // Reset globalAlpha
        this.ctx.globalAlpha = 1;
    }
    
    drawDecoration(row, col, decoration, offsetX, offsetY) {
        if (!this.ctx) {
            return;
        }
        
        const decorationData = this.decorations[decoration.type];
        if (!decorationData) {
            return;
        }
        
        const x = offsetX + col * this.cellSize + this.cellSize / 2;
        const y = offsetY + row * this.cellSize + this.cellSize / 2;
        
        // Draw decoration background
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.globalAlpha = 0.8;
        this.ctx.fillRect(offsetX + col * this.cellSize + 2, offsetY + row * this.cellSize + 2, 
                         this.cellSize - 4, this.cellSize - 4);
        this.ctx.globalAlpha = 1;
        
        // Draw decoration icon
        this.ctx.font = `${this.cellSize * 0.6}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = '#6c757d';
        this.ctx.fillText(decorationData.icon, x, y);
        
        // Add glow effect for active decorations
        if (decoration.active) {
            this.ctx.shadowColor = '#FFD700';
            this.ctx.shadowBlur = 5;
            this.ctx.fillText(decorationData.icon, x, y);
            this.ctx.shadowBlur = 0;
        }
        
        // Add border for seasonal decorations
        if (decorationData.type === 'seasonal') {
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(offsetX + col * this.cellSize + 1, offsetY + row * this.cellSize + 1, 
                               this.cellSize - 2, this.cellSize - 2);
        }
        
        // Draw decoration range indicator (3x3 area)
        if (decorationData.bonus && decorationData.bonus !== 'none') {
            this.ctx.strokeStyle = '#28a745';
            this.ctx.lineWidth = 1;
            this.ctx.globalAlpha = 0.2;
            
            // Draw 3x3 range square
            this.ctx.strokeRect(offsetX + (col - 1) * this.cellSize, offsetY + (row - 1) * this.cellSize, 
                               this.cellSize * 3, this.cellSize * 3);
            
            this.ctx.globalAlpha = 1;
        }
    }
    
    drawRangeIndicator(row, col, type, offsetX, offsetY) {
        if (!this.ctx) return;
        
        const x = offsetX + col * this.cellSize + this.cellSize / 2;
        const y = offsetY + row * this.cellSize + this.cellSize / 2;
        const sprinklerData = this.sprinklerTypes[type];
        
        // Draw range indicator
        this.ctx.strokeStyle = sprinklerData.color;
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.3;
        
        // Draw range circle
        this.ctx.beginPath();
        this.ctx.arc(x, y, sprinklerData.range * this.cellSize, 0, 2 * Math.PI);
        this.ctx.stroke();
        
        // Reset globalAlpha
        this.ctx.globalAlpha = 1;
    }
    
    // Function to show which plants are affected by bonuses
    showBonusInfo(row, col) {
        const cell = this.garden[row][col];
        if (!cell.plant) return;
        
        const plant = cell.plant;
        let bonusInfo = [];
        
        // Check for decoration bonuses
        for (let y = Math.max(0, row - 1); y <= Math.min(this.gridSize - 1, row + 1); y++) {
            for (let x = Math.max(0, col - 1); x <= Math.min(this.gridSize - 1, col + 1); x++) {
                const nearbyCell = this.garden[y][x];
                if (nearbyCell.decoration) {
                    const decorationData = this.decorations[nearbyCell.decoration.type];
                    if (decorationData && decorationData.bonus && decorationData.bonus !== 'none') {
                        bonusInfo.push(`${decorationData.name}: ${decorationData.bonus}`);
                    }
                }
            }
        }
        
        // Check for sprinkler bonuses
        this.sprinklers.forEach(sprinkler => {
            const distance = Math.max(Math.abs(sprinkler.row - row), Math.abs(sprinkler.col - col));
            if (distance <= this.sprinklerTypes[sprinkler.type].range) {
                const sprinklerData = this.sprinklerTypes[sprinkler.type];
                bonusInfo.push(`${sprinkler.type} sprinkler: +${Math.round(sprinklerData.growthBonus * 100)}% growth`);
            }
        });
        
        if (bonusInfo.length > 0) {
            this.showMessage(`Plant bonuses: ${bonusInfo.join(', ')}`, 'info');
        }
    }
    
    drawSeasonalInfo() {
        if (!this.ctx) return;
        
        // Draw season indicator in top-right corner to avoid interference with plants
        this.ctx.save();
        this.ctx.fillStyle = '#333';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'top';
        
        var seasonColors = {
            spring: '#90EE90',
            summer: '#FFD700',
            fall: '#FF8C00',
            winter: '#87CEEB'
        };
        
        var seasonEmojis = {
            spring: '🌸',
            summer: '☀️',
            fall: '🍂',
            winter: '❄️'
        };
        
        // Season display is now handled by HTML elements, not canvas drawing
        
        this.ctx.restore();
    }
    
    updateSeasonDisplay() {
        const seasonTextElement = document.getElementById('seasonText');
        const growthMultiplierElement = document.getElementById('growthMultiplier');
        
        if (seasonTextElement && growthMultiplierElement) {
            const seasonEmojis = {
                spring: '🌸',
                summer: '☀️',
                fall: '🍂',
                winter: '❄️'
            };
            
            const seasonText = seasonEmojis[this.currentSeason] + ' ' + this.currentSeason.charAt(0).toUpperCase() + this.currentSeason.slice(1) + ' (Day ' + this.seasonDay + ')';
            seasonTextElement.textContent = seasonText;
            
            // Update growth multiplier display
            if (this.seasonMultiplier !== 1.0) {
                const multiplierText = 'Growth: ' + (this.seasonMultiplier > 1 ? '+' : '') + Math.round((this.seasonMultiplier - 1) * 100) + '%';
                growthMultiplierElement.textContent = multiplierText;
                growthMultiplierElement.className = this.seasonMultiplier > 1 ? 'growth-multiplier' : 'growth-multiplier negative';
                growthMultiplierElement.style.display = 'block';
            } else {
                growthMultiplierElement.style.display = 'none';
            }
        }
    }
    
    updateUI() {
        // Force immediate update of all UI elements
        const moneyElement = document.getElementById('money');
        const waterElement = document.getElementById('water');
        const fertilizerElement = document.getElementById('fertilizer');
        const scoreElement = document.getElementById('score');
        
        if (moneyElement) {
            moneyElement.textContent = this.money;
        }
        if (waterElement) {
            waterElement.textContent = this.water;
        }
        if (fertilizerElement) {
            fertilizerElement.textContent = this.fertilizer;
        }
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
        
        // Update weather display
        const weatherElement = document.getElementById('weather');
        if (weatherElement) {
            weatherElement.textContent = this.weatherEffects[this.weather].name;
        }
        
        // Update achievement count
        const unlockedCount = Object.values(this.achievements).filter(a => a.unlocked).length;
        const totalCount = Object.keys(this.achievements).length;
        const achievementElement = document.getElementById('achievements');
        if (achievementElement) {
            achievementElement.textContent = `${unlockedCount}/${totalCount}`;
        }
        
        // Force a reflow to ensure the DOM updates
        if (moneyElement) moneyElement.offsetHeight;
        
        this.updateShopDisplay();
        this.updateChallengesDisplay();
        this.updateStatsDisplay();
        this.updateSeasonDisplay();
        
        // Update sound button text
        const soundBtn = document.getElementById('soundBtn');
        if (soundBtn) {
            soundBtn.textContent = this.soundEnabled ? '🔊 Sound' : '🔇 Sound';
        }
    }
    
                updateSeedRarityDisplay(seedType, rarity) {
        // Find the seed element
        const seedElement = document.querySelector(`[data-seed="${seedType}"]`);
        if (!seedElement) {
            this.showMessage(`Warning: Seed element not found for ${seedType}`, 'warning');
            return;
        }
        
        // Remove existing rarity classes
        seedElement.classList.remove('rare-seed', 'legendary-seed');
        
        // Get the seed name element
        const nameElement = seedElement.querySelector('.seed-name');
        if (!nameElement) {
            this.showMessage(`Warning: Name element not found for ${seedType}`, 'warning');
            return;
        }
        
        // Get the base name (remove any existing rarity suffix)
        let baseName = nameElement.textContent.replace(/\s*\(RARE\)$/, '').replace(/\s*\(LEGENDARY\)$/, '');
        
        // Find the shop container
        const shopContainer = seedElement.closest('.seed-shop');
        if (!shopContainer) {
            this.showMessage(`Warning: Shop container not found for ${seedType}`, 'warning');
            return;
        }
        
        // Remove the seed from its current position
        seedElement.remove();
        
        // Update the seed name and add appropriate class
        if (rarity === 'rare') {
            nameElement.textContent = `${baseName} (RARE)`;
            seedElement.classList.add('rare-seed');
            
            // Find the rare seeds section and add the seed there
            const rareSection = Array.from(shopContainer.querySelectorAll('h4')).find(h4 => h4.textContent.includes('⭐ Rare Seeds'));
            if (rareSection) {
                const rareContainer = rareSection.nextElementSibling;
                if (rareContainer && rareContainer.classList.contains('seed-item')) {
                    // Insert after the last rare seed
                    let lastRareSeed = rareSection;
                    while (lastRareSeed.nextElementSibling && 
                           lastRareSeed.nextElementSibling.classList.contains('seed-item') &&
                           lastRareSeed.nextElementSibling.classList.contains('rare-seed')) {
                        lastRareSeed = lastRareSeed.nextElementSibling;
                    }
                    lastRareSeed.parentNode.insertBefore(seedElement, lastRareSeed.nextSibling);
                } else {
                    // Insert after the rare section header
                    rareSection.parentNode.insertBefore(seedElement, rareSection.nextSibling);
                }
            } else {
                // Fallback: add to the end of the shop
                shopContainer.appendChild(seedElement);
            }
        } else if (rarity === 'legendary') {
            nameElement.textContent = `${baseName} (LEGENDARY)`;
            seedElement.classList.add('legendary-seed');
            
            // Find the legendary seeds section and add the seed there
            const legendarySection = Array.from(shopContainer.querySelectorAll('h4')).find(h4 => h4.textContent.includes('🌟 Legendary Seeds'));
            if (legendarySection) {
                const legendaryContainer = legendarySection.nextElementSibling;
                if (legendaryContainer && legendaryContainer.classList.contains('seed-item')) {
                    // Insert after the last legendary seed
                    let lastLegendarySeed = legendarySection;
                    while (lastLegendarySeed.nextElementSibling && 
                           lastLegendarySeed.nextElementSibling.classList.contains('seed-item') &&
                           lastLegendarySeed.nextElementSibling.classList.contains('legendary-seed')) {
                        lastLegendarySeed = lastLegendarySeed.nextElementSibling;
                    }
                    lastLegendarySeed.parentNode.insertBefore(seedElement, lastLegendarySeed.nextSibling);
                } else {
                    // Insert after the legendary section header
                    legendarySection.parentNode.insertBefore(seedElement, legendarySection.nextSibling);
                }
            } else {
                // Fallback: add to the end of the shop
                shopContainer.appendChild(seedElement);
            }
        } else {
            // Common rarity - remove any rarity styling and move to basic section
            nameElement.textContent = baseName;
            
            // Find the basic seeds section and add the seed there
            const basicSection = Array.from(shopContainer.querySelectorAll('h4')).find(h4 => h4.textContent.includes('🌱 Basic Seeds'));
            if (basicSection) {
                const basicContainer = basicSection.nextElementSibling;
                if (basicContainer && basicContainer.classList.contains('seed-item')) {
                    // Insert after the last basic seed
                    let lastBasicSeed = basicSection;
                    while (lastBasicSeed.nextElementSibling && 
                           lastBasicSeed.nextElementSibling.classList.contains('seed-item') &&
                           !lastBasicSeed.nextElementSibling.classList.contains('rare-seed') &&
                           !lastBasicSeed.nextElementSibling.classList.contains('legendary-seed')) {
                        lastBasicSeed = lastBasicSeed.nextElementSibling;
                    }
                    lastBasicSeed.parentNode.insertBefore(seedElement, lastBasicSeed.nextSibling);
                } else {
                    // Insert after the basic section header
                    basicSection.parentNode.insertBefore(seedElement, basicSection.nextSibling);
                }
            } else {
                // Fallback: add to the beginning of the shop
                shopContainer.insertBefore(seedElement, shopContainer.firstChild);
            }
        }
    }

    updateShopDisplay() {
            
                    // First, ensure all seed elements are visible and reset their state
        document.querySelectorAll('.seed-item').forEach(element => {
                element.style.display = 'block';
                element.classList.remove('out-of-stock');
            });
            
            // Update existing seed items in the HTML
            Object.keys(this.shopInventory).forEach(seedType => {
                const seedData = this.plantTypes[seedType];
                const inventory = this.shopInventory[seedType];
                
                // Check if inventory structure is valid
                if (!inventory || typeof inventory !== 'object') {
                    return;
                }
                
                if (seedData && inventory) {
                    const seedElement = document.querySelector(`[data-seed="${seedType}"]`);
                if (seedElement) {
                    // Check if seed is available in current season
                    const isAvailable = this.isSeedAvailable(seedType);
                    
                    // Show/hide seed based on seasonal availability
                    if (isAvailable) {
                        seedElement.style.display = 'block';
                        
                        // Update the stock display
                        const stockElement = seedElement.querySelector('.seed-stock');
                if (stockElement) {
                    const oldText = stockElement.textContent;
                    stockElement.textContent = `Stock: ${inventory.stock}`;
                    // Stock display updated
                }
                        
                        // Update the price display
                        const priceElement = seedElement.querySelector('.seed-price');
                        if (priceElement) {
                            priceElement.textContent = `$${seedData.cost || seedData.price}`;
                        }
                        
                        // Update the name display
                        const nameElement = seedElement.querySelector('.seed-name');
                        if (nameElement) {
                            nameElement.textContent = seedData.name;
                        }
                        
                        // Handle out of stock styling
                    if (inventory.stock <= 0) {
                            seedElement.classList.add('out-of-stock');
                            seedElement.style.pointerEvents = 'none';
                            seedElement.style.cursor = 'not-allowed';
                    } else {
                            seedElement.classList.remove('out-of-stock');
                            seedElement.style.pointerEvents = 'auto';
                            seedElement.style.cursor = 'pointer';
                        }
                        
                        // Remove any existing buy buttons
                        const existingBuyButton = seedElement.querySelector('.buy-button');
                        if (existingBuyButton) {
                            existingBuyButton.remove();
                        }
                    } else {
                        seedElement.style.display = 'none';
                    }
                }
            }
        });
        
        // Force a reflow to ensure the DOM updates
        document.body.offsetHeight;
        

        
        // Ensure seed elements are clickable
        document.querySelectorAll('.seed-item').forEach(item => {
            if (item.hasAttribute('data-seed') && !item.classList.contains('out-of-stock')) {
                item.style.pointerEvents = 'auto';
                item.style.cursor = 'pointer';
            }
        });
        

    }
    

    
    updateChallengesDisplay() {
        const challengesList = document.getElementById('challenges-list');
        if (!challengesList) {
            console.log('Challenges list element not found!');
            return;
        }
        
        console.log('Updating challenges display:', this.challenges);
        
        // Clear existing content
        challengesList.innerHTML = '';
        
        // Display daily challenge
        if (this.challenges.daily) {
            const dailyChallenge = this.challenges.daily;
            const dailyElement = document.createElement('div');
            dailyElement.className = 'challenge-item daily-challenge';
            dailyElement.innerHTML = `
                <div class="challenge-header">
                    <span class="challenge-icon">📅</span>
                    <span class="challenge-title">Daily Challenge</span>
                    ${dailyChallenge.completed ? '<span class="challenge-completed">✅</span>' : ''}
                </div>
                <div class="challenge-description">${dailyChallenge.description}</div>
                <div class="challenge-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min((dailyChallenge.progress / dailyChallenge.target) * 100, 100)}%"></div>
                    </div>
                    <span class="progress-text">${dailyChallenge.progress}/${dailyChallenge.target}</span>
                </div>
                <div class="challenge-reward">Reward: $${dailyChallenge.reward}</div>
            `;
            challengesList.appendChild(dailyElement);
        }
        
        // Display weekly challenge
        if (this.challenges.weekly) {
            const weeklyChallenge = this.challenges.weekly;
            const weeklyElement = document.createElement('div');
            weeklyElement.className = 'challenge-item weekly-challenge';
            weeklyElement.innerHTML = `
                <div class="challenge-header">
                    <span class="challenge-icon">📆</span>
                    <span class="challenge-title">Weekly Challenge</span>
                    ${weeklyChallenge.completed ? '<span class="challenge-completed">✅</span>' : ''}
                </div>
                <div class="challenge-description">${weeklyChallenge.description}</div>
                <div class="challenge-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min((weeklyChallenge.progress / weeklyChallenge.target) * 100, 100)}%"></div>
                    </div>
                    <span class="progress-text">${weeklyChallenge.progress}/${weeklyChallenge.target}</span>
                </div>
                <div class="challenge-reward">Reward: $${weeklyChallenge.reward}</div>
            `;
            challengesList.appendChild(weeklyElement);
        }
        
        // Display completed challenges
        if (this.challenges.completed.length > 0) {
            const completedHeader = document.createElement('h4');
            completedHeader.textContent = '✅ Completed Challenges';
            completedHeader.className = 'completed-challenges-header';
            challengesList.appendChild(completedHeader);
            
            this.challenges.completed.slice(-3).forEach(challenge => {
                const completedElement = document.createElement('div');
                completedElement.className = 'challenge-item completed-challenge';
                completedElement.innerHTML = `
                    <div class="challenge-header">
                        <span class="challenge-icon">${challenge.type === 'daily' ? '📅' : '📆'}</span>
                        <span class="challenge-title">${challenge.type === 'daily' ? 'Daily' : 'Weekly'} Challenge</span>
                        <span class="challenge-completed">✅</span>
                    </div>
                    <div class="challenge-description">${challenge.description}</div>
                    <div class="challenge-reward">Reward: $${challenge.reward}</div>
                `;
                challengesList.appendChild(completedElement);
            });
        }
    }
    
    updateStatsDisplay() {
        const statsList = document.getElementById('stats-list');
        if (!statsList) return;
        
        // Clear existing content
        statsList.innerHTML = '';
        
        // Create stat items
        const statItems = [
            { label: '🌱 Total Plants Harvested', value: this.stats.totalPlantsHarvested || 0 },
            { label: '💰 Total Money Earned', value: `$${this.stats.totalMoneyEarned || 0}` },
            { label: '💧 Total Water Used', value: this.stats.totalWaterUsed || 0 },
            { label: '🌿 Total Fertilizer Used', value: this.stats.totalFertilizerUsed || 0 },
            { label: '🏆 Best Harvest Value', value: `$${this.stats.bestHarvest || 0}` },
            { label: '⏱️ Longest Play Session', value: `${Math.floor((this.stats.longestPlaySession || 0) / 60000)}m` },
            { label: '🌱 Different Plants Planted', value: this.stats.plantsByType ? Object.keys(this.stats.plantsByType).length : 0 },
            { label: '🌤️ Current Season', value: this.currentSeason || 'spring' },
            { label: '📅 Season Day', value: this.seasonDay || 1 },
            { label: '🏡 Garden Size', value: `${this.gardenSize}x${this.gardenSize}` },
            { label: '💧 Active Sprinklers', value: this.sprinklers ? this.sprinklers.length : 0 },
            { label: '🎯 Completed Challenges', value: this.challenges.completed ? this.challenges.completed.length : 0 },
            { label: '⚡ Admin Panel Used', value: this.stats.adminPanelUsed ? 'Yes' : 'No' },
            { label: '🔢 Admin Panel Usage Count', value: this.stats.adminPanelUsageCount || 0 }
        ];
        
        statItems.forEach(stat => {
            const statElement = document.createElement('div');
            statElement.className = 'stat-item';
            statElement.innerHTML = `
                <span class="stat-label">${stat.label}</span>
                <span class="stat-value">${stat.value}</span>
            `;
            statsList.appendChild(statElement);
        });
    }
    
    showMessage(message, type = 'info', silent = false) {
        // If silent mode is enabled, don't show notifications
        if (silent) return;
        
        const messageEl = document.createElement('div');
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#17a2b8'};
        `;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            if (messageEl.parentNode) {
                document.body.removeChild(messageEl);
            }
        }, 3000);
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        // Performance monitoring - check for potential issues
        this.checkPerformance();
        
        // CRITICAL: Only process if this is the active game instance
        if (window.menuSystem && window.menuSystem.currentGame && window.menuSystem.currentGame !== this) {
            console.log(`Game loop skipped for slot ${this.saveSlot} - not the active game`);
            return;
        }
        
        try {
            // Update season
            this.updateSeason();
        
        this.updatePlants();
        this.checkRestock();
        this.updateWeather();
        this.checkStormDamage();
        this.checkAutoSave();
        this.checkAchievements();
            this.generateChallenges();
            
            // Note: updateShopDisplay is now only called when needed, not in the game loop
            
            // Update particles
            this.updateParticles();
            
            // Update session time
            this.updateSessionTime();
        
        // Only draw if we have a canvas (for background processing, canvas might be null)
        if (this.canvas && this.ctx) {
            this.draw();
            }
        } catch (error) {
            console.error(`Error in game loop for slot ${this.saveSlot}:`, error);
            // Try to recover from the error
            this.handleGameLoopError(error);
        }
        
        this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
    }
    
    checkPerformance() {
        // Check if the game has been running too long without a break
        const now = Date.now();
        if (!this.lastPerformanceCheck) {
            this.lastPerformanceCheck = now;
            this.performanceCheckCount = 0;
        }
        
        this.performanceCheckCount++;
        
        // Every 1000 frames (about 16 seconds at 60fps), do a performance check
        if (this.performanceCheckCount >= 1000) {
            const timeSinceLastCheck = now - this.lastPerformanceCheck;
            const expectedTime = 1000 * (1000 / 60); // Expected time for 1000 frames at 60fps
            
            // If we're running significantly slower than expected, there might be a performance issue
            if (timeSinceLastCheck > expectedTime * 1.5) {
                console.warn(`Performance issue detected in slot ${this.saveSlot}. Expected ${expectedTime}ms, got ${timeSinceLastCheck}ms`);
                this.optimizePerformance();
            }
            
            this.lastPerformanceCheck = now;
            this.performanceCheckCount = 0;
        }
        
        // Check for memory leaks - if we have too many event listeners
        if (this.eventListeners && this.eventListeners.length > 200) {
            console.warn(`Too many event listeners (${this.eventListeners.length}) in slot ${this.saveSlot}. Cleaning up...`);
            this.cleanupEventListeners();
        }
    }
    
    handleGameLoopError(error) {
        console.error(`Handling game loop error for slot ${this.saveSlot}:`, error);
        
        // Try to save the current state before attempting recovery
        try {
            this.saveGame();
        } catch (saveError) {
            console.error(`Failed to save game after error:`, saveError);
        }
        
        // Attempt to recover by reinitializing critical components
        try {
            // Reinitialize canvas if needed
            if (!this.canvas || !this.ctx) {
                this.initializeCanvas();
            }
            
            // Clear any stuck states
            this.selectedSeed = null;
            this.selectedSprinkler = null;
            this.currentTool = 'water';
            
            // Force a UI update
            this.updateUI();
            
            console.log(`Recovery attempt completed for slot ${this.saveSlot}`);
        } catch (recoveryError) {
            console.error(`Failed to recover from game loop error:`, recoveryError);
            // If recovery fails, stop the game to prevent further issues
            this.stopGame();
        }
    }
    
    optimizePerformance() {
        console.log(`Optimizing performance for slot ${this.saveSlot}`);
        
        // Clear any accumulated particles that might be causing slowdown
        if (this.particles && this.particles.length > 50) {
            this.particles = this.particles.slice(-20); // Keep only the last 20 particles
        }
        
        // Clear any old animations
        if (this.animations && this.animations.length > 10) {
            this.animations = this.animations.slice(-5); // Keep only the last 5 animations
        }
        
        // Force garbage collection hint (if available)
        if (window.gc) {
            window.gc();
        }
    }
    
    cleanupEventListeners() {
        console.log(`Cleaning up event listeners for slot ${this.saveSlot}`);
        
        // Remove old event listeners, keeping only the most recent ones
        if (this.eventListeners && this.eventListeners.length > 50) {
            const recentListeners = this.eventListeners.slice(-30); // Keep only the last 30
            
            // Remove the old ones
            this.eventListeners.slice(0, -30).forEach(({ element, event, handler }) => {
                if (element && element.removeEventListener) {
                    element.removeEventListener(event, handler);
                }
            });
            
            this.eventListeners = recentListeners;
        }
        
        // Re-initialize critical event listeners that might have been removed
        this.initializeEventListeners();
    }
    
    removeEventListeners() {
        console.log(`Removing event listeners for slot ${this.saveSlot}`);
        
        // Remove all tracked event listeners
        this.eventListeners.forEach(({ element, event, handler }) => {
            if (element && element.removeEventListener) {
                element.removeEventListener(event, handler);
            }
        });
        
        // Clear the event listeners array
        this.eventListeners = [];
        console.log(`Event listeners removed for slot ${this.saveSlot}`);
    }
    
    stopGame() {
        console.log(`Stopping game instance ${this.instanceId} for slot ${this.saveSlot}`);
        this.isRunning = false;
        
        // Clear any timers or intervals
        if (this.gameLoopInterval) {
            clearInterval(this.gameLoopInterval);
            this.gameLoopInterval = null;
        }
        
        // Remove all event listeners
        this.removeEventListeners();
        
        // Clear UI state
        this.selectedSeed = null;
        this.selectedSprinkler = null;
        this.currentTool = 'water';
        
        console.log(`Game instance ${this.instanceId} for slot ${this.saveSlot} stopped`);
    }
    
    saveGame() {
        console.log(`saveGame called for slot ${this.saveSlot} at ${new Date().toLocaleTimeString()}`);
        
        // Validate the current state before saving
        if (!this.saveSlot || this.saveSlot < 1 || this.saveSlot > 3) {
            console.error(`Invalid saveSlot in saveGame: ${this.saveSlot}`);
            return;
        }
        
        // Validate money is not negative
        if (this.money < 0) {
            console.error(`Invalid money value: ${this.money}, setting to 0`);
            this.money = 0;
        }
        
        // Validate sprinkler inventory is not negative
        Object.keys(this.sprinklerInventory).forEach(type => {
            if (this.sprinklerInventory[type] < 0) {
                console.error(`Invalid sprinkler inventory for ${type}: ${this.sprinklerInventory[type]}, setting to 0`);
                this.sprinklerInventory[type] = 0;
            }
        });
        
        const saveData = {
            saveSlot: this.saveSlot, // Include saveSlot in the save data for verification
            money: this.money,
            water: this.water,
            fertilizer: this.fertilizer,
            score: this.score,
            garden: this.garden,
            shopInventory: this.shopInventory,
            lastRestockTime: this.lastRestockTime,
            restockInterval: this.restockInterval,
            toolLevels: this.toolLevels,
            toolUpgradeCosts: this.toolUpgradeCosts,
            harvestBonus: this.harvestBonus,
            weather: this.weather,
            achievements: this.achievements,
            achievementStats: {
                ...this.achievementStats,
                differentPlantsPlanted: Array.from(this.achievementStats.differentPlantsPlanted)
            },
            sprinklerInventory: this.sprinklerInventory,
            sprinklers: this.sprinklers,
            soundEnabled: this.soundEnabled,

            // New features
            currentSeason: this.currentSeason,
            seasonDay: this.seasonDay,
            seasonMultiplier: this.seasonMultiplier,
            seasonStartTime: this.seasonStartTime,
            gardenSize: this.gardenSize,
            expansionCost: this.expansionCost,
            stats: this.stats,
            challenges: this.challenges,
            lastChallengeUpdate: this.lastChallengeUpdate,

            saveTime: Date.now()
        };
        
        const saveKey = `gardenGameSave_${this.saveSlot}`;
        console.log(`Saving to localStorage key: ${saveKey}`);
        console.log(`Save data slot verification: ${saveData.saveSlot}`);
        
        localStorage.setItem(saveKey, JSON.stringify(saveData));
        
        // Also save a timestamp for when this save was created
        localStorage.setItem(`lastSaveTime_${this.saveSlot}`, Date.now().toString());
        
        console.log(`Game saved to slot ${this.saveSlot} at ${new Date().toLocaleTimeString()}`);
        console.log(`Save data: money=${this.money}, sprinklerInventory=`, this.sprinklerInventory);
        
        // Send garden data to multiplayer server if connected
        if (window.multiplayer && window.multiplayer.isConnected) {
            try {
                const gardenData = {
                    garden: this.garden,
                    money: this.money,
                    score: this.score,
                    achievements: this.achievements,
                    stats: this.stats,
                    currentSeason: this.currentSeason,
                    seasonDay: this.seasonDay,
                    gardenSize: this.gardenSize
                };
                window.multiplayer.sendGardenUpdate(gardenData);
                console.log('🌐 Garden data sent to multiplayer server');
            } catch (error) {
                console.error('Error sending garden data to server:', error);
            }
        }
        
        // Verify the save was successful by reading it back
        const savedData = localStorage.getItem(saveKey);
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                if (parsedData.saveSlot !== this.saveSlot) {
                    console.error(`Save verification failed! Saved slot ${parsedData.saveSlot} doesn't match current slot ${this.saveSlot}`);
                } else {
                    console.log(`Save verification successful for slot ${this.saveSlot}`);
                }
            } catch (error) {
                console.error(`Error verifying save data:`, error);
            }
        } else {
            console.error(`Save verification failed! No data found in localStorage for key ${saveKey}`);
        }
    }
    
    saveGameWithProtection() {
        console.log(`[${new Date().toLocaleTimeString()}] saveGameWithProtection called for slot ${this.saveSlot}`);
        
        // Set a protection timestamp to prevent background processing from overwriting
        localStorage.setItem(`adminChange_${this.saveSlot}`, Date.now().toString());
        
        // Call the regular saveGame method
        this.saveGame();
        
        // Set another protection timestamp after saving
        localStorage.setItem(`lastSaveTime_${this.saveSlot}`, Date.now().toString());
        
        console.log(`[${new Date().toLocaleTimeString()}] Save protection applied for slot ${this.saveSlot}`);
    }
    
    clearUIState() {
        // Reset all UI elements to default/zero values
        if (document.getElementById('money')) {
            document.getElementById('money').textContent = '0';
        }
        if (document.getElementById('water')) {
            document.getElementById('water').textContent = '0';
        }
        if (document.getElementById('fertilizer')) {
            document.getElementById('fertilizer').textContent = '0';
        }
        if (document.getElementById('score')) {
            document.getElementById('score').textContent = '0';
        }
        if (document.getElementById('weather')) {
            document.getElementById('weather').textContent = 'Sunny';
        }
        
        // Clear achievements display
        const achievementsList = document.getElementById('achievements-list');
        if (achievementsList) {
            achievementsList.innerHTML = '';
        }
        
        // Clear shop items
        const shopContainer = document.getElementById('shop-container');
        if (shopContainer) {
            shopContainer.innerHTML = '';
        }
        
        // Clear tool upgrades
        const toolUpgradesContainer = document.getElementById('tool-upgrades-container');
        if (toolUpgradesContainer) {
            toolUpgradesContainer.innerHTML = '';
        }
        
        // Clear any existing notifications
        const existingMessages = document.querySelectorAll('[style*="position: fixed"][style*="top: 20px"][style*="right: 20px"]');
        existingMessages.forEach(msg => {
            if (msg.parentNode) {
                msg.parentNode.removeChild(msg);
            }
        });
        
        // Clear all UI selections
        document.querySelectorAll('.seed-item').forEach(item => {
            item.classList.remove('selected');
        });
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.sprinkler-tool').forEach(btn => {
            btn.classList.remove('active');
        });
        
        console.log('UI state cleared completely');
    }
    

    
    initializeFreshGame() {
        console.log(`Initializing fresh game for slot ${this.saveSlot}`);
        
        // CRITICAL: Clear any existing save data for this slot from localStorage
        const saveKey = `gardenGameSave_${this.saveSlot}`;
        localStorage.removeItem(saveKey);
        console.log(`Cleared existing save data for slot ${this.saveSlot} from localStorage`);
        
        // Initialize fresh garden
        this.garden = this.initializeGarden();
        
        // Initialize fresh shop inventory with correct structure
        this.shopInventory = {
            carrot: { stock: 7, maxStock: 10, restockAmount: 5 },
            tomato: { stock: 6, maxStock: 8, restockAmount: 4 },
            corn: { stock: 4, maxStock: 6, restockAmount: 3 },
            squash: { stock: 5, maxStock: 7, restockAmount: 3 },
            potato: { stock: 6, maxStock: 8, restockAmount: 4 },
            lettuce: { stock: 8, maxStock: 10, restockAmount: 5 },
            onion: { stock: 6, maxStock: 8, restockAmount: 4 },
            garlic: { stock: 4, maxStock: 6, restockAmount: 3 },
            broccoli: { stock: 3, maxStock: 5, restockAmount: 2 },
            cauliflower: { stock: 2, maxStock: 4, restockAmount: 2 },
            // New seeds inventory
            cucumber: { stock: 6, maxStock: 8, restockAmount: 4 },
            radish: { stock: 8, maxStock: 10, restockAmount: 5 },
            spinach: { stock: 7, maxStock: 9, restockAmount: 4 },
            winter_greens: { stock: 4, maxStock: 6, restockAmount: 3 },
            zucchini: { stock: 5, maxStock: 7, restockAmount: 3 },
            peas: { stock: 8, maxStock: 10, restockAmount: 5 },
            herbs: { stock: 6, maxStock: 8, restockAmount: 4 },
            cabbage: { stock: 5, maxStock: 7, restockAmount: 3 },
            celery: { stock: 6, maxStock: 8, restockAmount: 4 },
            // Rare seeds
            bell_pepper: { stock: 4, maxStock: 5, restockAmount: 2 },
            watermelon: { stock: 2, maxStock: 3, restockAmount: 1 },
            asparagus: { stock: 3, maxStock: 4, restockAmount: 2 },
            artichoke: { stock: 2, maxStock: 3, restockAmount: 1 },
            kiwi: { stock: 2, maxStock: 3, restockAmount: 1 },
            // Legendary seeds
            pumpkin: { stock: 1, maxStock: 2, restockAmount: 1 },
            grapes: { stock: 3, maxStock: 4, restockAmount: 2 },
            apple: { stock: 4, maxStock: 5, restockAmount: 2 },
            pineapple: { stock: 1, maxStock: 2, restockAmount: 1 },
            mango: { stock: 2, maxStock: 3, restockAmount: 1 },
            dragonfruit: { stock: 1, maxStock: 1, restockAmount: 1 }
        };
        
        // Initialize fresh sprinkler inventory with correct structure
        this.sprinklerInventory = {
            basic: 0,
            advanced: 0,
            premium: 0,
            legendary: 0
        };
        
        // Reset other game state
        this.money = 100;
        this.water = 50;
        this.fertilizer = 20;
        this.score = 0;
        this.sprinklers = [];
        this.lastRestockTime = Date.now();
        this.weather = 'sunny';
        
        // Reset tool levels and upgrade costs
        this.toolLevels = {
            water: 1,
            fertilizer: 1,
            shovel: 1,
            harvest: 1
        };
        
        this.toolUpgradeCosts = {
            water: 50,
            fertilizer: 75,
            shovel: 100,
            harvest: 60
        };
        
        // Harvest bonus from upgraded harvest tool
        this.harvestBonus = 0;
        

        
        // Initialize new features
        this.currentSeason = 'spring';
        this.seasonDay = 1;
        this.seasonMultiplier = 1.0;
        this.seasonStartTime = null; // Will be set on first updateSeason() call
        this.gardenSize = 8;
        this.expansionCost = 5000;
        
        // Initialize statistics
        this.stats = {
            totalPlantsHarvested: 0,
            totalMoneyEarned: 0,
            totalWaterUsed: 0,
            totalFertilizerUsed: 0,
            plantsByType: {},
            bestHarvest: 0,
            longestPlaySession: 0,
            sessionStartTime: Date.now(),
            adminPanelUsed: false,
            adminPanelUsageCount: 0
        };
        
        // Initialize challenges
        this.challenges = {
            daily: null,
            weekly: null,
            completed: []
        };
        this.lastChallengeUpdate = Date.now();
        
        // Initialize visual feedback
        this.particles = [];
        this.animations = [];
        
        // Reset achievements with correct structure
        this.achievements = {
            firstHarvest: { unlocked: false, name: 'First Harvest', description: 'Harvest your first crop' },
            moneyMaker: { unlocked: false, name: 'Money Maker', description: 'Earn $100 total' },
            plantMaster: { unlocked: false, name: 'Plant Master', description: 'Plant 10 different crops' },
            waterWizard: { unlocked: false, name: 'Water Wizard', description: 'Water 20 plants' },
            fertilizerFanatic: { unlocked: false, name: 'Fertilizer Fanatic', description: 'Use fertilizer 15 times' },
            speedGrower: { unlocked: false, name: 'Speed Grower', description: 'Grow a crop in under 30 seconds' },
            rareCollector: { unlocked: false, name: 'Rare Collector', description: 'Harvest 5 rare crops' },
            legendaryFarmer: { unlocked: false, name: 'Legendary Farmer', description: 'Harvest 3 legendary crops' }
        };
        
        this.achievementStats = {
            totalHarvests: 0,
            totalMoney: 0,
            plantsPlanted: 0,
            plantsWatered: 0,
            plantsFertilized: 0,
            rareHarvests: 0,
            legendaryHarvests: 0,
            differentPlantsPlanted: new Set(),
            speedGrowerUnlocked: false
        };
        
        // Save the fresh game immediately
        this.saveGame();
        console.log(`Fresh game initialized and saved for slot ${this.saveSlot}`);
        
        // Generate challenges for the new game
        this.generateChallenges();
        
        // Update UI
        if (this.canvas) {
            this.updateUI();
            this.updateShopDisplay();
            this.updateToolDisplay();
            this.updateSprinklerDisplay();
            this.updateAchievementsDisplay();
            this.updateChallengesDisplay();
            this.updateSeasonDisplay();
        }
    }
    
    loadGame(slot) {
        console.log(`Loading game for slot ${slot}`);
        
        // Validate slot number
        if (slot < 1 || slot > 3) {
            console.error(`Invalid slot number: ${slot}`);
            return;
        }
        
        // CRITICAL: Stop background processing immediately to prevent interference
        this.stopBackgroundProcessing();
        
        // CRITICAL: Clear all background games to prevent any interference
        this.backgroundGames.clear();
        
        if (this.currentGame) {
            console.log(`Stopping current game instance for slot ${this.currentGame.saveSlot}`);
            // Properly stop the old game instance
            this.currentGame.isRunning = false;
            this.currentGame.stopGame();
            
            // Clear any admin change timestamps from the old slot to prevent interference
            if (this.currentGame.saveSlot) {
                localStorage.removeItem(`adminChange_${this.currentGame.saveSlot}`);
            }
            
            // CRITICAL: Force garbage collection by clearing all references
            this.currentGame.garden = null;
            this.currentGame.shopInventory = null;
            this.currentGame.sprinklerInventory = null;
            this.currentGame.sprinklers = null;
            this.currentGame.achievementStats = null;
            
            // Clear the old game instance completely
            this.currentGame = null;
        }
        
        // CRITICAL: Clear any existing event listeners to prevent duplicates
        const menuBtn = document.getElementById('menuBtn');
        const saveBtn = document.getElementById('saveBtn');
        
        // Remove existing event listeners by cloning and replacing elements
        if (menuBtn) {
            const newMenuBtn = menuBtn.cloneNode(true);
            menuBtn.parentNode.replaceChild(newMenuBtn, menuBtn);
        }
        if (saveBtn) {
            const newSaveBtn = saveBtn.cloneNode(true);
            saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
        }
        
        // Hide menu and show game
        document.getElementById('mainMenu').style.display = 'none';
        document.getElementById('gameContainer').style.display = 'block';
        
        // CRITICAL: Clear any existing notifications from previous slots
        const existingMessages = document.querySelectorAll('[style*="position: fixed"][style*="top: 20px"][style*="right: 20px"]');
        existingMessages.forEach(msg => {
            if (msg.parentNode) {
                msg.parentNode.removeChild(msg);
            }
        });
        
        // CRITICAL: Clear any existing UI state to prevent bleeding
        this.clearUIState();
        
        // CRITICAL: Force a longer delay to ensure all cleanup is complete
        setTimeout(() => {
            // Create new game instance with the correct slot
            console.log(`About to create GardenGame with slot: ${slot}`);
            this.currentGame = new GardenGame(slot);
            console.log(`Created new GardenGame instance for slot ${slot}`);
            
            // Verify the game was created with the correct slot
            if (this.currentGame.saveSlot !== slot) {
                console.error(`Game created with wrong slot! Expected: ${slot}, Got: ${this.currentGame.saveSlot}`);
                console.error(`This could cause the slot loading issue you're experiencing`);
                // Force the correct slot and reload
                this.currentGame.saveSlot = slot;
                this.currentGame.loadGame(); // Reload with correct slot
                console.log(`Forced saveSlot to ${slot} and reloaded`);
            }
            
            console.log(`Current game slot is now: ${this.currentGame.saveSlot}`);
            console.log(`Current game instance ID: ${this.currentGame.instanceId}`);
            
            // Add event listeners to the new elements
            const newMenuBtn = document.getElementById('menuBtn');
            const newSaveBtn = document.getElementById('saveBtn');
            
            if (newMenuBtn) {
                newMenuBtn.addEventListener('click', () => {
                    this.returnToMenu();
                });
            }
            
            if (newSaveBtn) {
                newSaveBtn.addEventListener('click', () => {
                    this.currentGame.saveGame();
                    this.currentGame.showMessage('Game saved manually!', 'success');
                    this.updateSaveSlots();
                });
            }
            
            // Force update the save slots display to reflect the current state
            this.updateSaveSlots();
            
            // CRITICAL: Keep background processing disabled to prevent state bleeding
            console.log(`Background processing remains disabled to prevent cross-slot interference`);
        }, 200); // Increased delay to ensure cleanup is complete
    }
    
    // Sound System
    initializeSound() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.log('Audio not supported');
        }
    }
    
    playSound(type) {
        if (!this.soundEnabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        const sounds = {
            plant: { frequency: 440, duration: 0.1 },
            harvest: { frequency: 880, duration: 0.2 },
            water: { frequency: 330, duration: 0.15 },
            fertilizer: { frequency: 550, duration: 0.15 },
            money: { frequency: 660, duration: 0.1 },
            error: { frequency: 220, duration: 0.3 },
            achievement: { frequency: 1100, duration: 0.5 }
        };
        
        const sound = sounds[type];
        if (sound) {
            oscillator.frequency.setValueAtTime(sound.frequency, this.audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + sound.duration);
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + sound.duration);
        }
    }
    
    // Tool Upgrade System
    upgradeTool(toolType) {
        const currentLevel = this.toolLevels[toolType];
        
        if (currentLevel >= 5) {
            this.showMessage(`${toolType} tool is already at maximum level!`, 'error');
            return;
        }
        
        const upgradeCost = this.toolUpgradeCosts[toolType];
        
        // Check if player has enough money
        if (this.money < upgradeCost) {
            this.showMessage(`Not enough money! Need $${upgradeCost}`, 'error');
            return;
        }
        
        // Deduct money and upgrade tool
        this.money -= upgradeCost;
        this.toolLevels[toolType]++;
        
        // Increase cost for next upgrade
        this.toolUpgradeCosts[toolType] = Math.floor(this.toolUpgradeCosts[toolType] * 1.5);
        
        // Add resource bonuses for water and fertilizer tools
        if (toolType === 'water') {
            this.water += 10;
        } else if (toolType === 'fertilizer') {
            this.fertilizer += 5;
        } else if (toolType === 'harvest') {
            // Increase harvest bonus by 10% per level
            this.harvestBonus += 0.1;
        }
        
        this.showMessage(`${toolType} tool upgraded to level ${this.toolLevels[toolType]}!`, 'success');
        this.playSound('achievement');
        
        // Add upgrade particle effect (show in center of screen)
        const x = this.canvas.width / 2;
        const y = this.canvas.height / 2;
        this.addParticle(x, y, 'upgrade', toolType);
        
        this.updateToolDisplay();
        this.updateUI();
        this.saveGame();
    }
    
    updateToolDisplay() {
        // Update tool level displays
        Object.keys(this.toolLevels).forEach(tool => {
            const levelElement = document.querySelector(`#${tool}-btn .tool-level`);
            if (levelElement) {
                levelElement.textContent = `Lv.${this.toolLevels[tool]}`;
            }
        });
        
        // Update upgrade button costs and states
        Object.keys(this.toolUpgradeCosts).forEach(tool => {
            const upgradeBtn = document.getElementById(`upgrade-${tool}-btn`);
            if (upgradeBtn) {
                const costElement = upgradeBtn.querySelector('.upgrade-cost');
                if (costElement) {
                    if (this.toolLevels[tool] >= 5) {
                        costElement.textContent = 'MAX';
                        upgradeBtn.disabled = true;
                    } else {
                        costElement.textContent = `$${this.toolUpgradeCosts[tool]}`;
                        upgradeBtn.disabled = false;
                    }
                }
            }
        });
    }
    
    // Sprinkler System
    buySprinkler(sprinklerType) {
        const sprinklerData = this.sprinklerTypes[sprinklerType];
        
        console.log(`[${new Date().toLocaleTimeString()}] Attempting to buy ${sprinklerType} sprinkler. Current money: $${this.money}, Cost: $${sprinklerData.price}`);
        console.log(`[${new Date().toLocaleTimeString()}] Current sprinkler inventory:`, this.sprinklerInventory);
        
        // Validate sprinkler type exists
        if (!sprinklerData) {
            console.error(`Invalid sprinkler type: ${sprinklerType}`);
            this.showMessage('Invalid sprinkler type!', 'error');
            return;
        }
        
        // Validate money is sufficient
        if (this.money < sprinklerData.price) {
            console.log(`[${new Date().toLocaleTimeString()}] Not enough money to buy ${sprinklerType} sprinkler. Have: $${this.money}, Need: $${sprinklerData.price}`);
            this.showMessage('Not enough money!', 'error');
            return;
        }
        
        // Validate money is not negative
        if (this.money < 0) {
            console.error(`[${new Date().toLocaleTimeString()}] Money is negative: $${this.money}, setting to 0`);
            this.money = 0;
            this.showMessage('Money error detected and fixed!', 'error');
            return;
        }
        
        // Store the old values for comparison
        const oldMoney = this.money;
        const oldInventory = { ...this.sprinklerInventory };
        
        // Perform the purchase
        this.money -= sprinklerData.price;
        this.sprinklerInventory[sprinklerType]++;
        
        console.log(`[${new Date().toLocaleTimeString()}] Successfully bought ${sprinklerType} sprinkler. Money: $${oldMoney} -> $${this.money}, Inventory: ${oldInventory[sprinklerType]} -> ${this.sprinklerInventory[sprinklerType]}`);
        
        // Update UI immediately
        this.showMessage(`Bought ${sprinklerType} sprinkler!`, 'success');
        this.playSound('money');
        this.updateSprinklerDisplay();
        this.updateUI();
        
        // Force immediate save with protection
        this.saveGameWithProtection();
        
        // Verify the save was successful
        setTimeout(() => {
            const savedData = localStorage.getItem(`gardenGameSave_${this.saveSlot}`);
            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    if (parsed.money !== this.money || parsed.sprinklerInventory[sprinklerType] !== this.sprinklerInventory[sprinklerType]) {
                        console.error(`[${new Date().toLocaleTimeString()}] Save verification failed! Expected money: $${this.money}, saved: $${parsed.money}`);
                        console.error(`[${new Date().toLocaleTimeString()}] Expected ${sprinklerType} inventory: ${this.sprinklerInventory[sprinklerType]}, saved: ${parsed.sprinklerInventory[sprinklerType]}`);
                        // Force a re-save
                        this.saveGameWithProtection();
                    } else {
                        console.log(`[${new Date().toLocaleTimeString()}] Save verification successful for ${sprinklerType} purchase`);
                    }
                } catch (error) {
                    console.error(`[${new Date().toLocaleTimeString()}] Error verifying save:`, error);
                }
            }
        }, 100);
    }
    
    placeSprinkler(row, col) {
        console.log(`[${new Date().toLocaleTimeString()}] Attempting to place sprinkler at (${row}, ${col})`);
        console.log(`[${new Date().toLocaleTimeString()}] Selected sprinkler: ${this.selectedSprinkler}`);
        console.log(`[${new Date().toLocaleTimeString()}] Current sprinkler inventory:`, this.sprinklerInventory);
        
        // Validate selected sprinkler
        if (!this.selectedSprinkler) {
            console.error(`[${new Date().toLocaleTimeString()}] No sprinkler selected`);
            this.showMessage('No sprinkler selected!', 'error');
            return;
        }
        
        // Validate sprinkler type exists
        if (!this.sprinklerTypes[this.selectedSprinkler]) {
            console.error(`[${new Date().toLocaleTimeString()}] Invalid sprinkler type: ${this.selectedSprinkler}`);
            this.showMessage('Invalid sprinkler type!', 'error');
            return;
        }
        
        // Validate inventory
        if (!this.sprinklerInventory[this.selectedSprinkler] || this.sprinklerInventory[this.selectedSprinkler] <= 0) {
            console.error(`[${new Date().toLocaleTimeString()}] No ${this.selectedSprinkler} sprinklers available. Inventory: ${this.sprinklerInventory[this.selectedSprinkler]}`);
            this.showMessage('No sprinklers available!', 'error');
            return;
        }
        
        // Validate coordinates
        if (row < 0 || row >= this.gridSize || col < 0 || col >= this.gridSize) {
            console.error(`[${new Date().toLocaleTimeString()}] Invalid coordinates: (${row}, ${col})`);
            this.showMessage('Invalid placement location!', 'error');
            return;
        }
        
        // Check if there's already a plant at this location
        const cell = this.garden[row][col];
        if (cell.plant) {
            console.log(`[${new Date().toLocaleTimeString()}] Cannot place sprinkler on plant at (${row}, ${col})`);
            this.showMessage('Cannot place sprinkler on a plant!', 'error');
            return;
        }
        
        // Check if there's already a sprinkler at this location
        const existingSprinkler = this.sprinklers.find(s => s.row === row && s.col === col);
        if (existingSprinkler) {
            console.log(`[${new Date().toLocaleTimeString()}] Cannot place sprinkler on existing sprinkler at (${row}, ${col})`);
            this.showMessage('Cannot place sprinkler on another sprinkler!', 'error');
            return;
        }
        
        // Store old values for comparison
        const oldInventory = this.sprinklerInventory[this.selectedSprinkler];
        const oldSprinklerCount = this.sprinklers.length;
        
        console.log(`[${new Date().toLocaleTimeString()}] Placing ${this.selectedSprinkler} sprinkler at (${row}, ${col}). Inventory before: ${oldInventory}`);
        
        // Place the sprinkler
        const sprinklerData = this.sprinklerTypes[this.selectedSprinkler];
        const now = Date.now();
        const newSprinkler = {
            type: this.selectedSprinkler,
            row: row,
            col: col,
            placedAt: now,
            expiresAt: now + sprinklerData.duration
        };
        
        this.sprinklers.push(newSprinkler);
        this.sprinklerInventory[this.selectedSprinkler]--;
        
        console.log(`[${new Date().toLocaleTimeString()}] Successfully placed sprinkler. Inventory after: ${this.sprinklerInventory[this.selectedSprinkler]}, Total sprinklers: ${this.sprinklers.length}`);
        
        // Update UI
        this.showMessage(`${this.selectedSprinkler} sprinkler placed!`, 'success');
        this.playSound('plant');
        
        // Add sprinkler particle effect
        const x = (col * this.cellSize) + (this.cellSize / 2);
        const y = (row * this.cellSize) + (this.cellSize / 2);
        this.addParticle(x, y, 'sprinkler', '');
        
        this.updateSprinklerDisplay();
        
        // Force immediate save with protection
        this.saveGameWithProtection();
        
        // Verify the save was successful
        setTimeout(() => {
            const savedData = localStorage.getItem(`gardenGameSave_${this.saveSlot}`);
            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    if (parsed.sprinklerInventory[this.selectedSprinkler] !== this.sprinklerInventory[this.selectedSprinkler] || 
                        parsed.sprinklers.length !== this.sprinklers.length) {
                        console.error(`[${new Date().toLocaleTimeString()}] Save verification failed for sprinkler placement!`);
                        console.error(`Expected ${this.selectedSprinkler} inventory: ${this.sprinklerInventory[this.selectedSprinkler]}, saved: ${parsed.sprinklerInventory[this.selectedSprinkler]}`);
                        console.error(`Expected sprinkler count: ${this.sprinklers.length}, saved: ${parsed.sprinklers.length}`);
                        // Force a re-save
                        this.saveGameWithProtection();
                    } else {
                        console.log(`[${new Date().toLocaleTimeString()}] Save verification successful for sprinkler placement`);
                    }
                } catch (error) {
                    console.error(`[${new Date().toLocaleTimeString()}] Error verifying save:`, error);
                }
            }
        }, 100);
    }
    
    removeSprinkler(row, col) {
        const sprinklerIndex = this.sprinklers.findIndex(s => s.row === row && s.col === col);
        if (sprinklerIndex !== -1) {
            const sprinkler = this.sprinklers[sprinklerIndex];
            this.sprinklerInventory[sprinkler.type]++;
            this.sprinklers.splice(sprinklerIndex, 1);
            this.showMessage(`${sprinkler.type} sprinkler removed!`, 'info');
            this.updateSprinklerDisplay();
            this.saveGame();
        }
    }
    
    placeDecoration(row, col) {
        console.log(`Attempting to place decoration at (${row}, ${col})`);
        console.log(`Selected decoration: ${this.selectedDecoration}`);
        
        // Validate selected decoration
        if (!this.selectedDecoration) {
            console.error('No decoration selected');
            this.showMessage('No decoration selected!', 'error');
            return;
        }
        
        // Validate decoration type exists
        if (!this.decorations[this.selectedDecoration]) {
            console.error(`Invalid decoration type: ${this.selectedDecoration}`);
            this.showMessage('Invalid decoration type!', 'error');
            return;
        }
        
        // Validate coordinates
        if (row < 0 || row >= this.gridSize || col < 0 || col >= this.gridSize) {
            console.error(`Invalid coordinates: (${row}, ${col})`);
            this.showMessage('Invalid placement location!', 'error');
            return;
        }
        
        // Check if there's already something at this location
        const cell = this.garden[row][col];
        if (cell.plant || cell.sprinkler || cell.decoration) {
            console.log(`Cannot place decoration at (${row}, ${col}) - space occupied`);
            this.showMessage('Cannot place decoration here - space occupied!', 'error');
            return;
        }
        
        // Check if player has enough money
        const decorationData = this.decorations[this.selectedDecoration];
        if (this.money < decorationData.cost) {
            console.log(`Not enough money for ${this.selectedDecoration}. Need: ${decorationData.cost}, Have: ${this.money}`);
            this.showMessage(`Not enough money! Need $${decorationData.cost}`, 'error');
            return;
        }
        
        // Check seasonal restrictions
        if (decorationData.season && decorationData.season !== this.currentSeason && decorationData.season !== 'all') {
            console.log(`Cannot place ${this.selectedDecoration} in ${this.currentSeason} season`);
            this.showMessage(`This decoration is only available in ${decorationData.season}!`, 'error');
            return;
        }
        
        console.log(`Placing ${this.selectedDecoration} at (${row}, ${col})`);
        
        // Place the decoration
        this.garden[row][col].decoration = {
            type: this.selectedDecoration,
            placedAt: Date.now(),
            active: true
        };
        
        // Deduct money
        this.money -= decorationData.cost;
        
        // Apply decoration bonuses to nearby plants
        this.applyDecorationBonuses(row, col);
        
        // Update UI
        this.showMessage(`${decorationData.name} placed!`, 'success');
        this.playSound('plant');
        
        // Add decoration particle effect
        const x = (col * this.cellSize) + (this.cellSize / 2);
        const y = (row * this.cellSize) + (this.cellSize / 2);
        this.addParticle(x, y, 'decoration', decorationData.icon);
        
        this.updateUI();
        this.saveGame();
    }
    
    removeDecoration(row, col) {
        const cell = this.garden[row][col];
        if (cell.decoration) {
            const decorationData = this.decorations[cell.decoration.type];
            this.garden[row][col].decoration = null;
            
            // Remove decoration bonuses
            this.removeDecorationBonuses(row, col);
            
            this.showMessage(`${decorationData.name} removed!`, 'info');
            this.updateUI();
            this.saveGame();
        }
    }
    
    applyDecorationBonuses(row, col) {
        const decoration = this.garden[row][col].decoration;
        if (!decoration) return;
        
        const decorationData = this.decorations[decoration.type];
        if (!decorationData || decorationData.bonus === 'none') return;
        
        // Check 3x3 area around decoration
        for (let y = Math.max(0, row - 1); y <= Math.min(this.gridSize - 1, row + 1); y++) {
            for (let x = Math.max(0, col - 1); x <= Math.min(this.gridSize - 1, col + 1); x++) {
                if (this.garden[y][x].plant) {
                    // Apply bonus to plant (implementation depends on bonus type)
                    this.applyPlantBonus(y, x, decorationData.bonus);
                }
            }
        }
    }
    
    removeDecorationBonuses(row, col) {
        const decoration = this.garden[row][col].decoration;
        if (!decoration) return;
        
        const decorationData = this.decorations[decoration.type];
        if (!decorationData || decorationData.bonus === 'none') return;
        
        // Remove bonuses from 3x3 area around decoration
        for (let y = Math.max(0, row - 1); y <= Math.min(this.gridSize - 1, row + 1); y++) {
            for (let x = Math.max(0, col - 1); x <= Math.min(this.gridSize - 1, col + 1); x++) {
                if (this.garden[y][x].plant) {
                    // Remove bonus from plant
                    this.removePlantBonus(y, x, decorationData.bonus);
                }
            }
        }
    }
    
    applyPlantBonus(row, col, bonus) {
        const plant = this.garden[row][col].plant;
        if (!plant) return;
        
        // Initialize plant bonuses if they don't exist
        if (!plant.bonuses) {
            plant.bonuses = {};
        }
        
        // Apply the specific bonus
        if (bonus.includes('plant protection')) {
            const protectionAmount = parseInt(bonus.match(/(\d+)%/)[1]);
            plant.bonuses.protection = (plant.bonuses.protection || 0) + protectionAmount;
            console.log(`Applied ${protectionAmount}% plant protection to plant at (${row}, ${col})`);
        } else if (bonus.includes('growth')) {
            const growthAmount = parseInt(bonus.match(/(\d+)%/)[1]);
            plant.bonuses.growth = (plant.bonuses.growth || 0) + growthAmount;
            console.log(`Applied ${growthAmount}% growth bonus to plant at (${row}, ${col})`);
        } else if (bonus.includes('harvest value')) {
            const harvestAmount = parseInt(bonus.match(/(\d+)%/)[1]);
            plant.bonuses.harvestValue = (plant.bonuses.harvestValue || 0) + harvestAmount;
            console.log(`Applied ${harvestAmount}% harvest value bonus to plant at (${row}, ${col})`);
        } else if (bonus.includes('water efficiency')) {
            const waterAmount = parseInt(bonus.match(/(\d+)%/)[1]);
            plant.bonuses.waterEfficiency = (plant.bonuses.waterEfficiency || 0) + waterAmount;
            console.log(`Applied ${waterAmount}% water efficiency bonus to plant at (${row}, ${col})`);
        }
    }
    
    removePlantBonus(row, col, bonus) {
        const plant = this.garden[row][col].plant;
        if (!plant || !plant.bonuses) return;
        
        // Remove the specific bonus
        if (bonus.includes('plant protection')) {
            const protectionAmount = parseInt(bonus.match(/(\d+)%/)[1]);
            plant.bonuses.protection = Math.max(0, (plant.bonuses.protection || 0) - protectionAmount);
            console.log(`Removed ${protectionAmount}% plant protection from plant at (${row}, ${col})`);
        } else if (bonus.includes('growth')) {
            const growthAmount = parseInt(bonus.match(/(\d+)%/)[1]);
            plant.bonuses.growth = Math.max(0, (plant.bonuses.growth || 0) - growthAmount);
            console.log(`Removed ${growthAmount}% growth bonus from plant at (${row}, ${col})`);
        } else if (bonus.includes('harvest value')) {
            const harvestAmount = parseInt(bonus.match(/(\d+)%/)[1]);
            plant.bonuses.harvestValue = Math.max(0, (plant.bonuses.harvestValue || 0) - harvestAmount);
            console.log(`Removed ${harvestAmount}% harvest value bonus from plant at (${row}, ${col})`);
        } else if (bonus.includes('water efficiency')) {
            const waterAmount = parseInt(bonus.match(/(\d+)%/)[1]);
            plant.bonuses.waterEfficiency = Math.max(0, (plant.bonuses.waterEfficiency || 0) - waterAmount);
            console.log(`Removed ${waterAmount}% water efficiency bonus from plant at (${row}, ${col})`);
        }
    }
    
    // Storm damage system
    checkStormDamage() {
        if (this.weather !== 'stormy') return;
        
        // Only check for storm damage every 30 seconds during stormy weather
        const now = Date.now();
        if (!this.lastStormDamageCheck) {
            this.lastStormDamageCheck = now;
        }
        
        if (now - this.lastStormDamageCheck < 30000) return; // 30 seconds
        this.lastStormDamageCheck = now;
        
        console.log(`Storm damage check triggered at ${new Date().toLocaleTimeString()}`);
        
        let damagedPlants = 0;
        let protectedPlants = 0;
        
        // Check all plants in the garden
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const cell = this.garden[row][col];
                if (cell.plant) {
                    const protection = cell.plant.bonuses?.protection || 0;
                    
                    // 15% chance of storm damage per plant (reduced by protection)
                    const damageChance = Math.max(0, 15 - protection);
                    const random = Math.random() * 100;
                    
                    if (random < damageChance) {
                        // Plant gets damaged
                        console.log(`Storm damage check: Plant at (${row}, ${col}) hit! Random: ${random.toFixed(1)}, Damage chance: ${damageChance}%`);
                        this.damagePlant(row, col);
                        damagedPlants++;
                    } else if (protection > 0 && random >= 15) {
                        // Only count as protected if they would have been damaged without protection
                        // (random >= 15 means they would have been damaged without protection)
                        protectedPlants++;
                    }
                }
            }
        }
        
        // Show feedback to player
        if (damagedPlants > 0 || protectedPlants > 0) {
            let message = '';
            if (damagedPlants > 0) {
                message += `⛈️ Storm damaged ${damagedPlants} unprotected plants!`;
                this.addParticle('damage', this.canvas.width / 2, this.canvas.height / 2);
            }
            if (protectedPlants > 0) {
                if (message) message += ' ';
                message += `🛡️ ${protectedPlants} plants were protected by fences!`;
            }
            this.showMessage(message, damagedPlants > 0 ? 'warning' : 'info');
        }
    }
    
    damagePlant(row, col) {
        const plant = this.garden[row][col].plant;
        if (!plant) return;
        
        // Reduce plant growth stage by 1 (but not below seed stage)
        const currentStage = plant.growthStage || 0;
        if (currentStage > 0) {
            plant.growthStage = currentStage - 1;
            plant.recentlyDamaged = true; // Mark as recently damaged
            
            // Update isFullyGrown status
            const maxStage = this.growthStages.length - 1;
            plant.isFullyGrown = (plant.growthStage >= maxStage);
            
            console.log(`Plant at (${row}, ${col}) was damaged by storm, regressed to stage ${plant.growthStage}, isFullyGrown: ${plant.isFullyGrown}`);
            
            // Add visual feedback
            this.addParticle('damage', 
                col * this.cellSize + this.cellSize / 2, 
                row * this.cellSize + this.cellSize / 2
            );
            
            // Force a redraw to show the stage change immediately
            this.draw();
        }
    }
    
    updateSprinklerDisplay() {
        // Update sprinkler shop counts
        Object.keys(this.sprinklerInventory).forEach(type => {
            const countElement = document.getElementById(`sprinkler-${type}-count`);
            if (countElement) {
                countElement.textContent = this.sprinklerInventory[type];
            }
            
            const toolCountElement = document.getElementById(`sprinkler-${type}-tool-count`);
            if (toolCountElement) {
                toolCountElement.textContent = this.sprinklerInventory[type];
            }
        });
    }
    
    updateAchievementsDisplay() {
        const achievementsList = document.getElementById('achievements-list');
        if (!achievementsList) return;
        
        achievementsList.innerHTML = '';
        
        const achievementIcons = {
            firstHarvest: '🌾',
            moneyMaker: '💰',
            plantMaster: '🌱',
            waterWizard: '💧',
            fertilizerFanatic: '🌿',
            speedGrower: '⚡',
            rareCollector: '⭐',
            legendaryFarmer: '🌟'
        };
        
        const achievementRequirements = {
            firstHarvest: 'Harvest your first crop',
            moneyMaker: 'Earn $100 total',
            plantMaster: 'Plant 10 different crops',
            waterWizard: 'Water 20 plants',
            fertilizerFanatic: 'Use fertilizer 15 times',
            speedGrower: 'Grow a crop in under 30 seconds',
            rareCollector: 'Harvest 5 rare crops',
            legendaryFarmer: 'Harvest 3 legendary crops'
        };
        
        Object.keys(this.achievements).forEach(achievementId => {
            const achievement = this.achievements[achievementId];
            const icon = achievementIcons[achievementId] || '🏆';
            const requirement = achievementRequirements[achievementId] || achievement.description;
            
            const achievementElement = document.createElement('div');
            achievementElement.className = `achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`;
            
            achievementElement.innerHTML = `
                <div class="achievement-icon">${icon}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-description">${requirement}</div>
                </div>
                <div class="achievement-status">${achievement.unlocked ? 'UNLOCKED' : 'LOCKED'}</div>
            `;
            
            achievementsList.appendChild(achievementElement);
        });
    }
    
    // Weather System
    updateWeather() {
        const oldWeather = this.weather;
        this.updateWeatherSilent();
        
        // Show weather change message if weather actually changed
        if (oldWeather !== this.weather) {
            const weatherName = this.weatherEffects[this.weather].name;
            this.showMessage(`🌤️ Weather changed to ${weatherName}!`, 'info');
            
            // Special warning for stormy weather
            if (this.weather === 'stormy') {
                this.showMessage(`⛈️ Stormy weather can damage unprotected plants!`, 'warning');
            }
        }
    }
    
    updateWeatherSilent() {
        const now = Date.now();
        if (now - this.lastWeatherChange >= this.weatherChangeInterval) {
            const weatherTypes = Object.keys(this.weatherEffects);
            const currentIndex = weatherTypes.indexOf(this.weather);
            const nextIndex = (currentIndex + 1) % weatherTypes.length;
            this.weather = weatherTypes[nextIndex];
            this.lastWeatherChange = now;
            
            // Don't show weather change message in silent mode
            // this.showMessage(`Weather changed to ${this.weatherEffects[this.weather].name}!`, 'info');
            // this.updateUI();
        }
    }
    
    // Auto-save System
    checkAutoSave() {
        this.checkAutoSaveSilent();
    }
    
    checkAutoSaveSilent() {
        const now = Date.now();
        if (now - this.lastAutoSave >= this.autoSaveInterval) {
            this.saveGame();
            this.lastAutoSave = now;
        }
    }
    
    // Achievement System
    checkAchievements() {
        this.checkAchievementsSilent();
    }
    
    checkAchievementsSilent() {
        // First Harvest
        if (this.achievementStats.totalHarvests >= 1 && !this.achievements.firstHarvest.unlocked) {
            this.unlockAchievementSilent('firstHarvest');
        }
        
        // Money Maker
        if (this.achievementStats.totalMoney >= 100 && !this.achievements.moneyMaker.unlocked) {
            this.unlockAchievementSilent('moneyMaker');
        }
        
        // Water Wizard
        if (this.achievementStats.plantsWatered >= 20 && !this.achievements.waterWizard.unlocked) {
            this.unlockAchievementSilent('waterWizard');
        }
        
        // Plant Master
        if (this.achievementStats.differentPlantsPlanted.size >= 10 && !this.achievements.plantMaster.unlocked) {
            this.unlockAchievementSilent('plantMaster');
        }
        
        // Fertilizer Fanatic
        if (this.achievementStats.plantsFertilized >= 15 && !this.achievements.fertilizerFanatic.unlocked) {
            this.unlockAchievementSilent('fertilizerFanatic');
        }
        
        // Rare Collector
        if (this.achievementStats.rareHarvests >= 5 && !this.achievements.rareCollector.unlocked) {
            this.unlockAchievementSilent('rareCollector');
        }
        
        // Legendary Farmer
        if (this.achievementStats.legendaryHarvests >= 3 && !this.achievements.legendaryFarmer.unlocked) {
            this.unlockAchievementSilent('legendaryFarmer');
        }
        
        // Speed Grower achievement is checked in updatePlants() when a plant becomes fully grown
    }
    
    unlockAchievement(achievementId) {
        this.unlockAchievementSilent(achievementId);
        this.showMessage(`Achievement Unlocked: ${this.achievements[achievementId].name}!`, 'success');
        this.playSound('achievement');
        this.updateAchievementsDisplay();
        this.updateUI();
    }
    
    unlockAchievementSilent(achievementId) {
        this.achievements[achievementId].unlocked = true;
    }
    
    // Admin Panel
    initializeAdminPanel() {
        window.admin = {
            setRestockTime: (minutes) => {
                this.restockInterval = minutes * 60000;
                this.lastRestockTime = Date.now();
                console.log(`Restock time set to ${minutes} minutes`);
            },
            restockNow: () => {
                this.restockShop();
                this.lastRestockTime = Date.now();
                console.log('Shop restocked manually');
            },
            setStock: (seedType, amount) => {
                if (this.shopInventory[seedType]) {
                    this.shopInventory[seedType].stock = amount;
                    this.updateShopDisplay();
                    console.log(`${seedType} stock set to ${amount}`);
                } else {
                    console.log('Available seeds:', Object.keys(this.shopInventory));
                }
            },
            addMoney: (amount) => {
                this.money += amount;
                this.updateUI();
                console.log(`Added $${amount}`);
            },
            addWater: (amount) => {
                this.water += amount;
                this.updateUI();
                console.log(`Added ${amount} water`);
            },
            setMoney: (amount) => {
                this.money = amount;
                this.updateUI();
                console.log(`Money set to $${amount}`);
            },
            setWater: (amount) => {
                this.water = amount;
                this.updateUI();
                console.log(`Water set to ${amount}`);
            },
            setRareChance: (chance) => {
                this.rareRestockChance = chance;
                console.log(`✅ Rare restock chance set to ${chance}`);
            },
            setLegendaryChance: (chance) => {
                this.legendaryRestockChance = chance;
                console.log(`✅ Legendary restock chance set to ${chance}`);
            },
            setSeedRarity: (seedType, rarity) => {
                if (this.plantTypes[seedType]) {
                    // Remove existing rarity flags
                    delete this.plantTypes[seedType].isRare;
                    delete this.plantTypes[seedType].isLegendary;
                    
                    // Set new rarity
                    if (rarity === 'rare' || rarity === "rare") {
                        this.plantTypes[seedType].isRare = true;
                        console.log(`✅ ${seedType} set to RARE`);
                    } else if (rarity === 'legendary' || rarity === "legendary") {
                        this.plantTypes[seedType].isLegendary = true;
                        console.log(`✅ ${seedType} set to LEGENDARY`);
                    } else if (rarity === 'common' || rarity === "common") {
                        console.log(`✅ ${seedType} set to COMMON`);
                    } else {
                        console.log(`❌ Invalid rarity: "${rarity}". Use 'common', 'rare', or 'legendary'`);
                        console.log(`❌ Example: admin.setSeedRarity("tomato", "rare")`);
                        return;
                    }
                    
                    // Update UI to reflect the new rarity
                    this.updateShopDisplay();
                    console.log(`🔄 UI updated to show new rarity for ${seedType}`);
                } else {
                    console.log(`❌ Seed type '${seedType}' not found. Use admin.listSeeds() to see available seeds.`);
                }
            },
            getSeedRarity: (seedType) => {
                if (this.plantTypes[seedType]) {
                    const plant = this.plantTypes[seedType];
                    if (plant.isLegendary) {
                        console.log(`🌟 ${seedType} is LEGENDARY`);
                    } else if (plant.isRare) {
                        console.log(`⭐ ${seedType} is RARE`);
                    } else {
                        console.log(`🌱 ${seedType} is COMMON`);
                    }
                } else {
                    console.log(`❌ Seed type '${seedType}' not found.`);
                }
            },
            getStatus: () => {
                console.log('Game Status:', {
                    money: this.money,
                    water: this.water,
                    fertilizer: this.fertilizer,
                    score: this.score,
                    weather: this.weather,
                    toolLevels: this.toolLevels
                });
            },
            help: () => {
                console.log('🌱 GARDEN GAME ADMIN COMMANDS 🌱');
                console.log('=====================================');
                console.log('');
                console.log('💰 MONEY & RESOURCES:');
                console.log('  admin.addMoney(amount) - Add money');
                console.log('  admin.setMoney(amount) - Set money');
                console.log('  admin.addWater(amount) - Add water');
                console.log('  admin.setWater(amount) - Set water');
                console.log('  admin.addFertilizer(amount) - Add fertilizer');
                console.log('  admin.setFertilizer(amount) - Set fertilizer');

                console.log('');
                console.log('🌿 SHOP & SEEDS:');
                console.log('  admin.setStock(seedType, amount) - Set seed stock');
                console.log('  admin.restockNow() - Restock shop immediately');
                console.log('  admin.setRestockTime(minutes) - Set restock interval');
                console.log('  admin.restockAll() - Restock all seeds to max');
                console.log('  admin.listSeeds() - List all available seeds');
                console.log('');
                console.log('🎯 RARITY SETTINGS:');
                console.log('  admin.setRareChance(chance) - Set rare restock chance (0-1)');
                console.log('  admin.setLegendaryChance(chance) - Set legendary restock chance (0-1)');
                console.log('  admin.setSeedRarity(seedType, rarity) - Set seed rarity (common/rare/legendary)');
                console.log('  admin.getSeedRarity(seedType) - Check seed rarity');
                console.log('');
                console.log('🔧 TOOLS & UPGRADES:');
                console.log('  admin.upgradeTool(toolType) - Upgrade a tool (water/fertilizer/shovel/harvest)');
                console.log('');
                console.log('🌤️ WEATHER & ENVIRONMENT:');
                console.log('  admin.setWeather(weatherType) - Set weather (sunny/rainy/cloudy/stormy)');
                console.log('  admin.setWeatherTime(minutes) - Set weather change interval');
                console.log('');
                console.log('💧 SPRINKLER SYSTEM:');
                console.log('  admin.addSprinkler(type, amount) - Add sprinklers (basic/advanced/premium/legendary)');
                console.log('  admin.setSprinkler(type, amount) - Set sprinkler count');
                console.log('  admin.clearSprinklers() - Remove all sprinklers');
                console.log('  admin.listSprinklers() - List sprinkler types');
                console.log('');
                console.log('🏡 GARDEN MANAGEMENT:');
                console.log('  admin.clearGarden() - Clear all plants');
                console.log('');
                console.log('🎵 SOUND & SAVE:');
                console.log('  admin.toggleSound() - Toggle sound on/off');
                console.log('  admin.save() - Save game manually');
                console.log('');
                console.log('🏆 ACHIEVEMENTS:');
                console.log('  admin.showAchievements() - Show achievements');
                console.log('  admin.unlockAchievement(achievementId) - Unlock specific achievement');
                console.log('');
                console.log('📊 INFORMATION:');
                console.log('  admin.getStatus() - Show game status');
                console.log('  admin.help() - Show this help menu');
                console.log('');
                console.log('💡 EXAMPLES:');
                console.log('  admin.addMoney(1000) - Add $1000');

                console.log('  admin.setStock("carrot", 10) - Set carrot stock to 10');
                console.log('  admin.addSprinkler("basic", 5) - Add 5 basic sprinklers');
                console.log('  admin.setWeather("stormy") - Set weather to stormy');
                console.log('  admin.setWeatherTime(10) - Set weather to change every 10 minutes');
                console.log('  admin.upgradeTool("water") - Upgrade water tool');
                console.log('  admin.setSeedRarity("tomato", "rare") - Make tomato rare');
                console.log('  admin.setRareChance(0.25) - Set rare restock to 25%');
                console.log('  admin.getSeedRarity("pumpkin") - Check pumpkin rarity');
                console.log('  admin.unlockAchievement("speedGrower") - Unlock Speed Grower achievement');
                console.log('');
                console.log('=====================================');
            },
            restockAll: () => {
                Object.keys(this.shopInventory).forEach(seedType => {
                    this.shopInventory[seedType].stock = this.shopInventory[seedType].maxStock;
                });
                this.updateShopDisplay();
                console.log('✅ All seeds restocked to maximum');
            },
            clearGarden: () => {
                for (let row = 0; row < this.gridSize; row++) {
                    for (let col = 0; col < this.gridSize; col++) {
                        this.garden[row][col] = {
                            plant: null,
                            watered: false,
                            wateredAt: null,
                            waterCooldown: 0,
                            fertilized: false,
                            fertilizedAt: null,
                            fertilizerCooldown: 0,
                            plantedAt: null
                        };
                    }
                }
                // Clear all sprinklers
                this.sprinklers = [];
                console.log('✅ Garden cleared (plants and sprinklers removed)');
            },
            listSeeds: () => {
                console.log('🌱 Available seeds:');
                Object.keys(this.shopInventory).forEach(seedType => {
                    const inventory = this.shopInventory[seedType];
                    const plantData = this.plantTypes[seedType];
                    let rarity = '';
                    if (plantData.isLegendary) rarity = ' [LEGENDARY]';
                    else if (plantData.isRare) rarity = ' [RARE]';
                    console.log(`  ${seedType}${rarity}: ${inventory.stock}/${inventory.maxStock} stock - $${plantData.price}`);
                });
            },
            addFertilizer: (amount) => {
                this.fertilizer += amount;
                this.updateUI();
                console.log(`✅ Added ${amount} fertilizer`);
            },
            setFertilizer: (amount) => {
                this.fertilizer = amount;
                this.updateUI();
                console.log(`✅ Fertilizer set to ${amount}`);
            },

            setRareChance: (chance) => {
                this.rareRestockChance = chance;
                console.log(`✅ Rare restock chance set to ${chance}`);
            },
            setLegendaryChance: (chance) => {
                this.legendaryRestockChance = chance;
                console.log(`✅ Legendary restock chance set to ${chance}`);
            },
            upgradeTool: (toolType) => {
                if (this.toolLevels[toolType] < 5) {
                    this.toolLevels[toolType]++;
                    this.toolUpgradeCosts[toolType] = Math.floor(this.toolUpgradeCosts[toolType] * 1.5);
                    console.log(`✅ ${toolType} tool upgraded to level ${this.toolLevels[toolType]}`);
                    this.updateToolDisplay();
                } else {
                    console.log(`❌ ${toolType} tool is already at maximum level`);
                }
            },
            toggleSound: () => {
                this.soundEnabled = !this.soundEnabled;
                console.log(`🔊 Sound ${this.soundEnabled ? 'enabled' : 'disabled'}`);
            },
            save: () => {
                this.saveGame();
                console.log('💾 Game saved manually');
            },
            showAchievements: () => {
                console.log('🏆 Achievements:');
                Object.keys(this.achievements).forEach(id => {
                    const achievement = this.achievements[id];
                    const status = achievement.unlocked ? '✅ UNLOCKED' : '🔒 LOCKED';
                    console.log(`  ${achievement.name}: ${status} - ${achievement.description}`);
                });
            },
            unlockAchievement: (achievementId) => {
                if (this.achievements[achievementId]) {
                    if (!this.achievements[achievementId].unlocked) {
                        this.unlockAchievement(achievementId);
                        console.log(`✅ Achievement "${this.achievements[achievementId].name}" unlocked!`);
                    } else {
                        console.log(`ℹ️ Achievement "${this.achievements[achievementId].name}" is already unlocked`);
                    }
                } else {
                    console.log('❌ Available achievements:');
                    Object.keys(this.achievements).forEach(id => {
                        console.log(`  ${id}: ${this.achievements[id].name}`);
                    });
                }
            },
            setWeather: (weatherType) => {
                if (this.weatherEffects[weatherType]) {
                    this.weather = weatherType;
                    console.log(`🌤️ Weather set to ${weatherType}`);
                    this.updateUI();
                    console.log(`🔄 UI updated to show ${weatherType} weather`);
                } else {
                    console.log('❌ Available weather types:', Object.keys(this.weatherEffects));
                }
            },
            setWeatherTime: (minutes) => {
                this.weatherChangeInterval = minutes * 60000;
                this.lastWeatherChange = Date.now();
                console.log(`🌤️ Weather change interval set to ${minutes} minutes`);
            },
            addSprinkler: (type, amount) => {
                if (this.sprinklerTypes[type]) {
                    this.sprinklerInventory[type] += amount;
                    this.updateSprinklerDisplay();
                    console.log(`✅ Added ${amount} ${type} sprinklers`);
                } else {
                    console.log('❌ Available sprinkler types:', Object.keys(this.sprinklerTypes));
                }
            },
            setSprinkler: (type, amount) => {
                if (this.sprinklerTypes[type]) {
                    this.sprinklerInventory[type] = amount;
                    this.updateSprinklerDisplay();
                    console.log(`✅ ${type} sprinklers set to ${amount}`);
                } else {
                    console.log('❌ Available sprinkler types:', Object.keys(this.sprinklerTypes));
                }
            },
            clearSprinklers: () => {
                this.sprinklers = [];
                console.log('✅ All sprinklers removed');
            },
            listSprinklers: () => {
                console.log('💧 Sprinkler types:');
                Object.keys(this.sprinklerTypes).forEach(type => {
                    const data = this.sprinklerTypes[type];
                    const durationMinutes = Math.floor(data.duration / 60000);
                    console.log(`  ${type}: $${data.price} - ${data.description} (${durationMinutes} min duration)`);
                });
            }
        };
    }
    
    loadGame() {
        console.log(`GardenGame.loadGame() called for slot ${this.saveSlot}`);
        
        const saveKey = `gardenGameSave_${this.saveSlot}`;
        const saveData = localStorage.getItem(saveKey);
        
        if (saveData) {
            try {
                const data = JSON.parse(saveData);
                
                // Validate that the save data belongs to this slot
                if (data.saveSlot !== this.saveSlot) {
                    console.error(`Save data mismatch! Expected slot ${this.saveSlot}, but data contains slot ${data.saveSlot}`);
                    console.log(`Clearing corrupted save data and starting fresh`);
                    localStorage.removeItem(saveKey);
                    this.initializeFreshGame();
                    return;
                }
                
                // Load game state with deep copying to prevent shared references
                this.money = Math.max(0, data.money || 100);
                this.water = Math.max(0, data.water || 50);
                this.fertilizer = Math.max(0, data.fertilizer || 20);
                this.score = Math.max(0, data.score || 0);
                
                // Deep copy garden data to prevent cross-slot interference
                if (data.garden) {
                    this.garden = JSON.parse(JSON.stringify(data.garden));
                }
                
                // Deep copy shop inventory to prevent cross-slot interference
                if (data.shopInventory) {
                    this.shopInventory = JSON.parse(JSON.stringify(data.shopInventory));
                    // Validate shop inventory data
                    Object.keys(this.shopInventory).forEach(seedType => {
                        if (this.shopInventory[seedType].stock < 0) {
                            this.shopInventory[seedType].stock = 0;
                        }
                    });
                }
                
                this.lastRestockTime = data.lastRestockTime || Date.now();
                if (data.restockInterval) this.restockInterval = data.restockInterval;
                
                // Load tool data
                if (data.toolLevels) this.toolLevels = data.toolLevels;
                if (data.toolUpgradeCosts) this.toolUpgradeCosts = data.toolUpgradeCosts;
                if (data.harvestBonus !== undefined) this.harvestBonus = data.harvestBonus;
                
                // Load weather data
                if (data.weather) this.weather = data.weather;
                
                // Load achievements
                if (data.achievements) this.achievements = data.achievements;
                if (data.achievementStats) {
                    this.achievementStats = data.achievementStats;
                    if (Array.isArray(this.achievementStats.differentPlantsPlanted)) {
                        this.achievementStats.differentPlantsPlanted = new Set(this.achievementStats.differentPlantsPlanted);
                    } else if (!this.achievementStats.differentPlantsPlanted) {
                        this.achievementStats.differentPlantsPlanted = new Set();
                    }
                }
                
                // Deep copy sprinkler inventory to prevent cross-slot interference
                if (data.sprinklerInventory) {
                    this.sprinklerInventory = JSON.parse(JSON.stringify(data.sprinklerInventory));
                    // Validate sprinkler inventory data
                    Object.keys(this.sprinklerInventory).forEach(type => {
                        if (this.sprinklerInventory[type] < 0) {
                            this.sprinklerInventory[type] = 0;
                        }
                    });
                }
                
                // Deep copy sprinklers to prevent cross-slot interference
                if (data.sprinklers) {
                    this.sprinklers = JSON.parse(JSON.stringify(data.sprinklers));
                    // Handle both old and new sprinkler formats
                    this.sprinklers = this.sprinklers.map(sprinkler => {
                        if (sprinkler.expiresAt) {
                            return sprinkler; // Already has timer data
                        } else {
                            // Convert old format to new format with timer
                            const sprinklerData = this.sprinklerTypes[sprinkler.type];
                            const now = Date.now();
                            return {
                                ...sprinkler,
                                placedAt: now,
                                expiresAt: now + sprinklerData.duration
                            };
                        }
                    });
                }
                
                if (data.soundEnabled !== undefined) this.soundEnabled = data.soundEnabled;
                

                
                // Load new features
                if (data.currentSeason) this.currentSeason = data.currentSeason;
                if (data.seasonDay) this.seasonDay = data.seasonDay;
                if (data.seasonMultiplier) this.seasonMultiplier = data.seasonMultiplier;
                if (data.seasonStartTime) this.seasonStartTime = data.seasonStartTime;
                if (data.gardenSize) {
                    this.gardenSize = data.gardenSize;
                    this.gridSize = this.gardenSize;
                    this.cellSize = Math.floor(600 / this.gridSize);
                }
                if (data.expansionCost) this.expansionCost = data.expansionCost;
                if (data.stats) this.stats = data.stats;
                if (data.challenges) this.challenges = data.challenges;
                if (data.lastChallengeUpdate) this.lastChallengeUpdate = data.lastChallengeUpdate;

                
                console.log(`Successfully loaded game for slot ${this.saveSlot}`);
                
                // Generate challenges if they don't exist
                this.generateChallenges();
                
                // Update UI if canvas is available
                if (this.canvas) {
                    this.updateUI();
                    this.updateToolDisplay();
                    this.updateSprinklerDisplay();
                    this.updateAchievementsDisplay();
                    this.updateChallengesDisplay();
                    this.updateSeasonDisplay();
                }
                
            } catch (error) {
                console.error(`Error loading game for slot ${this.saveSlot}:`, error);
                console.log(`Clearing corrupted save data and starting fresh`);
                localStorage.removeItem(saveKey);
                this.initializeFreshGame();
            }
        } else {
            console.log(`No save data found for slot ${this.saveSlot}, starting fresh game`);
            this.initializeFreshGame();
        }
    }
    

}

// Menu System
class MenuSystem {
    constructor() {
        this.currentGame = null;
        this.backgroundGames = new Map(); // Store background game instances
        this.backgroundInterval = null;
        this.initializeMenu();
        // Background processing completely disabled to prevent state bleeding
        console.log('Background processing disabled by default to prevent cross-slot interference');
    }
    
    initializeMenu() {
        this.updateSaveSlots();
        this.addMenuEventListeners();
    }
    
    updateSaveSlots() {
        for (let slot = 1; slot <= 3; slot++) {
            const saveData = localStorage.getItem(`gardenGameSave_${slot}`);
            const slotElement = document.querySelector(`[data-slot="${slot}"]`);
            const statusElement = slotElement.querySelector('.slot-status');
            const dateElement = slotElement.querySelector('.slot-date');
            const loadBtn = slotElement.querySelector('.load-btn');
            
            if (saveData) {
                try {
                    const data = JSON.parse(saveData);
                    const saveDate = new Date(data.saveTime);
                    const formattedDate = saveDate.toLocaleDateString() + ' ' + saveDate.toLocaleTimeString();
                    
                    statusElement.textContent = `Money: $${data.money} | Score: ${data.score}`;
                    dateElement.textContent = `Last saved: ${formattedDate}`;
                    loadBtn.disabled = false;
                    slotElement.classList.add('has-save');
                } catch (error) {
                    statusElement.textContent = 'Corrupted Save';
                    loadBtn.disabled = true;
                    slotElement.classList.remove('has-save');
                }
            } else {
                statusElement.textContent = 'Empty';
                loadBtn.disabled = true;
                slotElement.classList.remove('has-save');
            }
        }
    }
    
    addMenuEventListeners() {
        console.log('Adding menu event listeners...');
        
        const newButtons = document.querySelectorAll('.new-btn');
        console.log(`Found ${newButtons.length} new buttons`);
        
        newButtons.forEach((btn, index) => {
            console.log(`Adding click listener to new button ${index + 1}`);
            btn.addEventListener('click', (e) => {
                console.log('New button clicked!');
                const saveSlot = e.target.closest('.save-slot');
                if (!saveSlot) {
                    console.error('Could not find save-slot parent element');
                    return;
                }
                const slot = parseInt(saveSlot.dataset.slot);
                if (isNaN(slot) || slot < 1 || slot > 3) {
                    console.error(`Invalid slot number: ${slot}`);
                    return;
                }
                console.log(`Starting new game for slot ${slot}`);
                this.startNewGame(slot);
            });
        });
        
        const loadButtons = document.querySelectorAll('.load-btn');
        console.log(`Found ${loadButtons.length} load buttons`);
        
        loadButtons.forEach((btn, index) => {
            console.log(`Adding click listener to load button ${index + 1}`);
            btn.addEventListener('click', (e) => {
                console.log('Load button clicked!');
                const saveSlot = e.target.closest('.save-slot');
                if (!saveSlot) {
                    console.error('Could not find save-slot parent element');
                    return;
                }
                const slot = parseInt(saveSlot.dataset.slot);
                if (isNaN(slot) || slot < 1 || slot > 3) {
                    console.error(`Invalid slot number: ${slot}`);
                    return;
                }
                console.log(`Loading game for slot ${slot}`);
                this.loadGame(slot);
            });
        });
        
        console.log('Menu event listeners added successfully');
    }
    
    loadGame(slot) {
        console.log(`Loading game for slot ${slot}`);
        
        // Validate slot number
        if (slot < 1 || slot > 3) {
            console.error(`Invalid slot number: ${slot}`);
            return;
        }
        
        // Check if there's save data for this slot
        const saveKey = `gardenGameSave_${slot}`;
        const saveData = localStorage.getItem(saveKey);
        
        if (!saveData) {
            console.error(`No save data found for slot ${slot}`);
            alert(`No save data found for slot ${slot}. Please start a new game first.`);
            return;
        }
        
        // CRITICAL: Stop background processing immediately to prevent interference
        this.stopBackgroundProcessing();
        
        // CRITICAL: Clear all background games to prevent any interference
        this.backgroundGames.clear();
        
        if (this.currentGame) {
            console.log(`Stopping current game instance for slot ${this.currentGame.saveSlot}`);
            // Properly stop the old game instance
            this.currentGame.isRunning = false;
            this.currentGame.stopGame();
            
            // Clear any admin change timestamps from the old slot to prevent interference
            if (this.currentGame.saveSlot) {
                localStorage.removeItem(`adminChange_${this.currentGame.saveSlot}`);
            }
            
            // CRITICAL: Force garbage collection by clearing all references
            this.currentGame.garden = null;
            this.currentGame.shopInventory = null;
            this.currentGame.sprinklerInventory = null;
            this.currentGame.sprinklers = null;
            this.currentGame.achievementStats = null;
            
            // Clear the old game instance completely
            this.currentGame = null;
        }
        
        // CRITICAL: Clear any existing event listeners to prevent duplicates
        const menuBtn = document.getElementById('menuBtn');
        const saveBtn = document.getElementById('saveBtn');
        
        // Remove existing event listeners by cloning and replacing elements
        if (menuBtn) {
            const newMenuBtn = menuBtn.cloneNode(true);
            menuBtn.parentNode.replaceChild(newMenuBtn, menuBtn);
        }
        if (saveBtn) {
            const newSaveBtn = saveBtn.cloneNode(true);
            saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
        }
        
        // Hide menu and show game
        document.getElementById('mainMenu').style.display = 'none';
        document.getElementById('gameContainer').style.display = 'block';
        
        // CRITICAL: Clear any existing notifications from previous slots
        const existingMessages = document.querySelectorAll('[style*="position: fixed"][style*="top: 20px"][style*="right: 20px"]');
        existingMessages.forEach(msg => {
            if (msg.parentNode) {
                msg.parentNode.removeChild(msg);
            }
        });
        
        // CRITICAL: Clear any existing UI state to prevent bleeding
        this.clearUIState();
        
        // CRITICAL: Force a longer delay to ensure all cleanup is complete
        setTimeout(() => {
        // Create new game instance with the correct slot
        console.log(`About to create GardenGame with slot: ${slot}`);
        this.currentGame = new GardenGame(slot);
        console.log(`Created new GardenGame instance for slot ${slot}`);
        
        // Verify the game was created with the correct slot
        if (this.currentGame.saveSlot !== slot) {
            console.error(`Game created with wrong slot! Expected: ${slot}, Got: ${this.currentGame.saveSlot}`);
            console.error(`This could cause the slot loading issue you're experiencing`);
                // Force the correct slot and reload
            this.currentGame.saveSlot = slot;
                this.currentGame.loadGame(); // Reload with correct slot
                console.log(`Forced saveSlot to ${slot} and reloaded`);
        }
        
        console.log(`Current game slot is now: ${this.currentGame.saveSlot}`);
        console.log(`Current game instance ID: ${this.currentGame.instanceId}`);
        
        // Add event listeners to the new elements
        const newMenuBtn = document.getElementById('menuBtn');
        const newSaveBtn = document.getElementById('saveBtn');
        
        if (newMenuBtn) {
            newMenuBtn.addEventListener('click', () => {
                this.returnToMenu();
            });
        }
        
        if (newSaveBtn) {
            newSaveBtn.addEventListener('click', () => {
                this.currentGame.saveGame();
                this.currentGame.showMessage('Game saved manually!', 'success');
                this.updateSaveSlots();
            });
        }
        
        // Force update the save slots display to reflect the current state
        this.updateSaveSlots();
        
            // CRITICAL: Keep background processing disabled to prevent state bleeding
            console.log(`Background processing remains disabled to prevent cross-slot interference`);
        }, 200); // Increased delay to ensure cleanup is complete
    }
    
    startNewGame(slot) {
        console.log(`Starting new game for slot ${slot}`);
        
        // Validate slot number
        if (slot < 1 || slot > 3) {
            console.error(`Invalid slot number: ${slot}`);
            return;
        }
        
        // CRITICAL: Clear existing save data for this slot
        const saveKey = `gardenGameSave_${slot}`;
        localStorage.removeItem(saveKey);
        console.log(`Cleared existing save data for slot ${slot} before starting new game`);
        
        // CRITICAL: Stop background processing immediately to prevent interference
        this.stopBackgroundProcessing();
        
        // CRITICAL: Clear all background games to prevent any interference
        this.backgroundGames.clear();
        
            if (this.currentGame) {
            console.log(`Stopping current game instance for slot ${this.currentGame.saveSlot}`);
            // Properly stop the old game instance
            this.currentGame.isRunning = false;
            this.currentGame.stopGame();
            
            // Clear any admin change timestamps from the old slot to prevent interference
            if (this.currentGame.saveSlot) {
                localStorage.removeItem(`adminChange_${this.currentGame.saveSlot}`);
            }
            
            // CRITICAL: Force garbage collection by clearing all references
            this.currentGame.garden = null;
            this.currentGame.shopInventory = null;
            this.currentGame.sprinklerInventory = null;
            this.currentGame.sprinklers = null;
            this.currentGame.achievementStats = null;
            
            // Clear the old game instance completely
            this.currentGame = null;
        }
        
        // CRITICAL: Clear any existing event listeners to prevent duplicates
        const menuBtn = document.getElementById('menuBtn');
        const saveBtn = document.getElementById('saveBtn');
        
        // Remove existing event listeners by cloning and replacing elements
        if (menuBtn) {
            const newMenuBtn = menuBtn.cloneNode(true);
            menuBtn.parentNode.replaceChild(newMenuBtn, menuBtn);
        }
        if (saveBtn) {
            const newSaveBtn = saveBtn.cloneNode(true);
            saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
        }
        
        // Hide menu and show game
        document.getElementById('mainMenu').style.display = 'none';
        document.getElementById('gameContainer').style.display = 'block';
        
        // CRITICAL: Clear any existing notifications from previous slots
        const existingMessages = document.querySelectorAll('[style*="position: fixed"][style*="top: 20px"][style*="right: 20px"]');
        existingMessages.forEach(msg => {
            if (msg.parentNode) {
                msg.parentNode.removeChild(msg);
            }
        });
        
        // CRITICAL: Clear any existing UI state to prevent bleeding
        this.clearUIState();
        
        // CRITICAL: Force a longer delay to ensure all cleanup is complete
        setTimeout(() => {
            // Create new game instance with the correct slot
            console.log(`About to create GardenGame with slot: ${slot}`);
            this.currentGame = new GardenGame(slot);
            console.log(`Created new GardenGame instance for slot ${slot}`);
            
            // Verify the game was created with the correct slot
            if (this.currentGame.saveSlot !== slot) {
                console.error(`Game created with wrong slot! Expected: ${slot}, Got: ${this.currentGame.saveSlot}`);
                console.error(`This could cause the slot loading issue you're experiencing`);
                // Force the correct slot and reload
                this.currentGame.saveSlot = slot;
                this.currentGame.loadGame(); // Reload with correct slot
                console.log(`Forced saveSlot to ${slot} and reloaded`);
            }
            
            console.log(`Current game slot is now: ${this.currentGame.saveSlot}`);
            console.log(`Current game instance ID: ${this.currentGame.instanceId}`);
            
            // Add event listeners to the new elements
            const newMenuBtn = document.getElementById('menuBtn');
            const newSaveBtn = document.getElementById('saveBtn');
            
            if (newMenuBtn) {
                newMenuBtn.addEventListener('click', () => {
                    this.returnToMenu();
                });
            }
            
            if (newSaveBtn) {
                newSaveBtn.addEventListener('click', () => {
                    this.currentGame.saveGame();
                    this.currentGame.showMessage('Game saved manually!', 'success');
                    this.updateSaveSlots();
                });
            }
            
            // Force update the save slots display to reflect the current state
            this.updateSaveSlots();
            
            // CRITICAL: Keep background processing disabled to prevent state bleeding
            console.log(`Background processing remains disabled to prevent cross-slot interference`);
        }, 200); // Increased delay to ensure cleanup is complete
    }
    
    returnToMenu() {
        if (this.currentGame) {
            this.currentGame.stopGame();
        }
        document.getElementById('gameContainer').style.display = 'none';
        document.getElementById('mainMenu').style.display = 'flex';
        this.currentGame = null;
        window.game = null; // Clear global game reference
        this.updateSaveSlots();
    }
    
    clearUIState() {
        // Reset all UI elements to default/zero values
        if (document.getElementById('money')) {
            document.getElementById('money').textContent = '0';
        }
        if (document.getElementById('water')) {
            document.getElementById('water').textContent = '0';
        }
        if (document.getElementById('fertilizer')) {
            document.getElementById('fertilizer').textContent = '0';
        }
        if (document.getElementById('score')) {
            document.getElementById('score').textContent = '0';
        }
        if (document.getElementById('weather')) {
            document.getElementById('weather').textContent = 'Sunny';
        }
        
        // Clear achievements display
        const achievementsList = document.getElementById('achievements-list');
        if (achievementsList) {
            achievementsList.innerHTML = '';
        }
        
        // Clear shop items
        const shopContainer = document.getElementById('shop-container');
        if (shopContainer) {
            shopContainer.innerHTML = '';
        }
        
        // Clear tool upgrades
        const toolUpgradesContainer = document.getElementById('tool-upgrades-container');
        if (toolUpgradesContainer) {
            toolUpgradesContainer.innerHTML = '';
        }
        
        // Clear any existing notifications
        const existingMessages = document.querySelectorAll('[style*="position: fixed"][style*="top: 20px"][style*="right: 20px"]');
        existingMessages.forEach(msg => {
            if (msg.parentNode) {
                msg.parentNode.removeChild(msg);
            }
        });
    }
    
    startBackgroundProcessing() {
        // Process background games every 5 seconds
        this.backgroundInterval = setInterval(() => {
            this.processBackgroundGames();
        }, 5000);
    }
    
    stopBackgroundProcessing() {
        if (this.backgroundInterval) {
            clearInterval(this.backgroundInterval);
            this.backgroundInterval = null;
        }
        // Clear all background games
        this.backgroundGames.clear();
    }
    
    processBackgroundGames() {
        // If there's no current game, don't process anything
        if (!this.currentGame) {
            console.log('No current game, skipping background processing');
            return;
        }
        
        const activeSlot = this.currentGame.saveSlot;
        console.log(`Background processing: active slot is ${activeSlot} at ${new Date().toLocaleTimeString()}`);
        
        // Process all save slots except the current one
        for (let slot = 1; slot <= 3; slot++) {
            // Skip if this is the currently active game slot
            if (slot === activeSlot) {
                console.log(`Skipping background processing for active slot ${slot}`);
                continue;
            }
            
            // Skip if we have a background game instance for this slot that's still processing
            if (this.backgroundGames.has(slot)) {
                console.log(`Skipping background processing for slot ${slot} - already processing`);
                continue;
            }
            
            // Additional safety check - if there's no current game, don't process
            if (!this.currentGame) {
                console.log('No current game, stopping background processing');
                return;
            }
            
            // Extra safety check - ensure we're not processing the active slot
            if (this.currentGame.saveSlot === slot) {
                console.log(`Double-check: skipping background processing for active slot ${slot}`);
                continue;
            }
            
            // Final safety check - verify the current game instance is still valid
            if (!this.currentGame.instanceId) {
                console.log('Current game instance is invalid, stopping background processing');
                return;
            }
            
            const saveData = localStorage.getItem(`gardenGameSave_${slot}`);
            if (saveData) {
                try {
                    const data = JSON.parse(saveData);
                    this.processBackgroundGame(slot, data);
                } catch (error) {
                    console.error(`Error processing background game for slot ${slot}:`, error);
                    // Remove the background game instance on error to allow retry
                    this.backgroundGames.delete(slot);
                }
            }
        }
    }
    
    processBackgroundGame(slot, saveData) {
        // Critical check: Never process the active game slot in background
        if (this.currentGame && this.currentGame.saveSlot === slot) {
            console.log(`Skipping background processing for slot ${slot} - this is the active game`);
            return;
        }
        
        console.log(`Processing background game for slot ${slot}`);
        
        try {
            // Check if there was a recent admin change to this slot (within last 120 seconds)
            const adminChangeTime = localStorage.getItem(`adminChange_${slot}`);
            if (adminChangeTime) {
                const timeSinceAdminChange = Date.now() - parseInt(adminChangeTime);
                if (timeSinceAdminChange < 120000) { // 120 seconds (increased from 60)
                    console.log(`Skipping background processing for slot ${slot} due to recent admin change (${timeSinceAdminChange}ms ago)`);
                    return;
                }
            }
            
            // Check if the save data is recent (within last 60 seconds) before overwriting
            const lastSaveTime = localStorage.getItem(`lastSaveTime_${slot}`);
            if (lastSaveTime) {
                const timeSinceLastSave = Date.now() - parseInt(lastSaveTime);
                if (timeSinceLastSave < 60000) { // 60 seconds (increased from 30)
                    console.log(`Skipping save for slot ${slot} due to recent save (${timeSinceLastSave}ms ago)`);
                    return;
                }
            }
            
            // Create a temporary game instance for background processing
            const tempGame = new GardenGame(slot);
            tempGame.isRunning = false; // Ensure it doesn't start the game loop
            
            // Validate that the temp game was created with the correct slot
            if (tempGame.saveSlot !== slot) {
                console.error(`Background temp game created with wrong slot! Expected: ${slot}, Got: ${tempGame.saveSlot}`);
                tempGame.stopGame();
                return;
            }
            
            // Store the background game instance to prevent multiple instances
            this.backgroundGames.set(slot, tempGame);
            
            // Load the save data directly without calling loadGame() to avoid UI updates
            tempGame.money = Math.max(0, saveData.money || 100);
            tempGame.water = Math.max(0, saveData.water || 50);
            tempGame.fertilizer = Math.max(0, saveData.fertilizer || 20);
            tempGame.score = Math.max(0, saveData.score || 0);
            if (saveData.garden) tempGame.garden = saveData.garden;
            if (saveData.shopInventory) {
                tempGame.shopInventory = saveData.shopInventory;
                // Validate shop inventory data
                Object.keys(tempGame.shopInventory).forEach(seedType => {
                    if (tempGame.shopInventory[seedType].stock < 0) {
                        tempGame.shopInventory[seedType].stock = 0;
                    }
                });
            }
            tempGame.lastRestockTime = saveData.lastRestockTime || Date.now();
            if (saveData.toolLevels) tempGame.toolLevels = saveData.toolLevels;
            if (saveData.toolUpgradeCosts) tempGame.toolUpgradeCosts = saveData.toolUpgradeCosts;
            if (saveData.weather) tempGame.weather = saveData.weather;
            if (saveData.achievements) tempGame.achievements = saveData.achievements;
            if (saveData.achievementStats) {
                tempGame.achievementStats = saveData.achievementStats;
                if (Array.isArray(tempGame.achievementStats.differentPlantsPlanted)) {
                    tempGame.achievementStats.differentPlantsPlanted = new Set(tempGame.achievementStats.differentPlantsPlanted);
                } else if (!tempGame.achievementStats.differentPlantsPlanted) {
                    tempGame.achievementStats.differentPlantsPlanted = new Set();
                }
            }
            if (saveData.sprinklerInventory) {
                tempGame.sprinklerInventory = saveData.sprinklerInventory;
                // Validate sprinkler inventory data
                Object.keys(tempGame.sprinklerInventory).forEach(type => {
                    if (tempGame.sprinklerInventory[type] < 0) {
                        tempGame.sprinklerInventory[type] = 0;
                    }
                });
            }
            if (saveData.sprinklers) {
                // Handle both old and new sprinkler formats
                tempGame.sprinklers = saveData.sprinklers.map(sprinkler => {
                    if (sprinkler.expiresAt) {
                        return sprinkler; // Already has timer data
                    } else {
                        // Convert old format to new format with timer
                        const sprinklerData = tempGame.sprinklerTypes[sprinkler.type];
                        const now = Date.now();
                        return {
                            ...sprinkler,
                            placedAt: now,
                            expiresAt: now + sprinklerData.duration
                        };
                    }
                });
            }
            if (saveData.soundEnabled !== undefined) tempGame.soundEnabled = saveData.soundEnabled;
            
            // Process the game in silent mode (no notifications)
            tempGame.updatePlantsSilent();
            tempGame.checkRestockSilent();
            tempGame.updateWeatherSilent();
            tempGame.checkAutoSaveSilent();
            tempGame.checkAchievementsSilent();
            
            // Final check - ensure we're not overwriting the active game
            if (this.currentGame && this.currentGame.saveSlot === slot) {
                console.log(`Final check: skipping save for active slot ${slot}`);
                return;
            }
            
            // Save the updated game state
            tempGame.saveGame();
            
            // Clean up
            tempGame.stopGame();
        } catch (error) {
            console.error(`Error in background processing for slot ${slot}:`, error);
        } finally {
            // Always remove the background game instance when done
            this.backgroundGames.delete(slot);
        }
    }
    
    clearSlot(slot) {
        console.log(`Clearing save data for slot ${slot}`);
        
        // Validate slot number
        if (slot < 1 || slot > 3) {
            console.error(`Invalid slot number: ${slot}`);
            return;
        }
        
        // Clear the save data from localStorage
        const saveKey = `gardenGameSave_${slot}`;
        localStorage.removeItem(saveKey);
        
        // Clear any admin change timestamps
        localStorage.removeItem(`adminChange_${slot}`);
        
        console.log(`Cleared all save data for slot ${slot}`);
        
        // Update the save slots display
        this.updateSaveSlots();
        
        // Show confirmation message
        alert(`Slot ${slot} has been cleared!`);
    }
}

// Initialize the menu system when the page loads
let menuSystem;
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Checking authentication...');
    
    // Check if user is authenticated
    const token = localStorage.getItem('garden_game_token');
    if (!token) {
        console.log('No authentication token found, redirecting to login...');
        window.location.href = '/login';
        return;
    }
    
    // Verify token is valid by making a request to the server
    fetch('/api/auth/verify', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            console.log('Invalid token, redirecting to login...');
            localStorage.removeItem('garden_game_token');
            window.location.href = '/login';
            return;
        }
        
        console.log('Authentication verified, initializing MenuSystem...');
        try {
            menuSystem = new MenuSystem();
            console.log('MenuSystem created successfully');
            // Make menuSystem globally accessible for admin functions
            window.menuSystem = menuSystem;
            console.log('MenuSystem added to window object');
        } catch (error) {
            console.error('Error creating MenuSystem:', error);
            alert('Error initializing game. Please refresh the page.');
        }
    })
    .catch(error => {
        console.error('Error verifying token:', error);
        localStorage.removeItem('garden_game_token');
        window.location.href = '/login';
    });
});

// Clean up background processing when page is unloaded
window.addEventListener('beforeunload', () => {
    if (menuSystem) {
        menuSystem.stopBackgroundProcessing();
    }
});
