class FieldHockeyStatsTracker {
    constructor() {
        this.currentGame = null;
        this.players = [];
        this.games = [];
        this.timer = null;
        this.gameTime = 0;
        this.currentPeriod = 1;
        this.isTimerRunning = false;

        // For Event-First workflow
        this.pendingEvent = null;

        this.initializeApp();
        this.loadFromStorage();
        this.setupEventListeners();
    }

    initializeApp() {
        // Set default date/time to current
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        const dateTimeLocal = now.toISOString().slice(0, 16);
        document.getElementById('game-date').value = dateTimeLocal;

        // Initialize tabs
        this.showTab('setup');
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.showTab(tabName);
            });
        });

        // Game setup
        document.getElementById('start-game').addEventListener('click', () => this.startNewGame());

        // Player management
        document.getElementById('add-player').addEventListener('click', () => this.addPlayer());

        // Fast Entry Mode: Listen for Enter key on roster inputs
        const rosterInputs = ['player-name', 'player-number', 'player-position'];
        rosterInputs.forEach(id => {
            document.getElementById(id).addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addPlayer();
                }
            });
        });

        // Game controls
        document.getElementById('toggle-timer').addEventListener('click', () => this.toggleTimer());
        document.getElementById('set-game-time').addEventListener('click', () => this.applyTimeInput());
        document.getElementById('game-time-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.applyTimeInput();
            }
        });
        document.querySelectorAll('.time-adjust-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const adjust = parseInt(e.currentTarget.dataset.adjust, 10);
                this.adjustGameTime(adjust);
            });
        });

        // Statistics buttons (Event-First Workflow)
        document.querySelectorAll('.stat-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const stat = e.currentTarget.dataset.stat;
                const team = e.currentTarget.dataset.team;
                this.handleEventClick(stat, team);
            });
        });

        // Modal Controls
        document.getElementById('cancel-player-select').addEventListener('click', () => this.closePlayerSelector());
        document.getElementById('assign-unknown').addEventListener('click', () => this.assignUnknownPlayer());

        // Export stats
        document.getElementById('export-stats').addEventListener('click', () => this.exportStats());

        // Stats game filter
        document.getElementById('stats-game-select').addEventListener('change', (e) => {
            this.updateStatsDisplay(e.target.value);
        });
    }

    showTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Update tab styling
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active', 'border-indigo-600', 'text-indigo-600');
            btn.classList.add('border-transparent', 'text-gray-500');
        });

        // Show selected tab
        document.getElementById(tabName).classList.add('active');

        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        activeBtn.classList.add('active', 'border-indigo-600', 'text-indigo-600');
        activeBtn.classList.remove('border-transparent', 'text-gray-500');

        // Refresh content for specific tabs
        if (tabName === 'roster') {
            this.displayPlayers();
        } else if (tabName === 'stats') {
            this.updateStatsDisplay();
        } else if (tabName === 'setup') {
            this.displayRecentGames();
        }
    }

    startNewGame() {
        const homeTeam = document.getElementById('home-team').value.trim() || 'Our Team';
        const awayTeam = document.getElementById('away-team').value.trim() || 'Opponent';
        const gameDate = document.getElementById('game-date').value;
        const location = document.getElementById('game-location').value.trim();

        this.currentGame = {
            id: Date.now(),
            homeTeam,
            awayTeam,
            gameDate,
            location,
            homeScore: 0,
            awayScore: 0,
            period: 1,
            gameTime: 0,
            events: [],
            playerStats: {},
            isCompleted: false
        };

        // Initialize player stats for current game
        this.players.forEach(player => {
            this.currentGame.playerStats[player.id] = this.getEmptyStats();
        });

        this.games.push(this.currentGame);
        this.saveToStorage();

        // Update UI
        this.updateGameDisplay();
        this.showTab('game');
    }

    getEmptyStats() {
        return {
            goals: 0, assists: 0, shots: 0, saves: 0, turnovers: 0,
            fouls: 0, penaltyCorners: 0, greenCards: 0, yellowCards: 0, redCards: 0
        };
    }

    addPlayer() {
        const nameInput = document.getElementById('player-name');
        const numberInput = document.getElementById('player-number');
        const positionInput = document.getElementById('player-position');

        const name = nameInput.value.trim();
        const number = numberInput.value.trim();
        const position = positionInput.value;

        if (!name || !number) {
            // Flash red briefly to indicate error
            nameInput.classList.add('border-red-500', 'bg-red-50');
            setTimeout(() => nameInput.classList.remove('border-red-500', 'bg-red-50'), 500);
            return;
        }

        const player = {
            id: Date.now(),
            name,
            number: parseInt(number),
            position: position || 'Any'
        };

        this.players.push(player);
        this.saveToStorage();

        // Clear form for fast entry
        nameInput.value = '';
        numberInput.value = '';
        // Keep position as is, often multiple players are added for same position

        // Refocus name input for continuous typing
        nameInput.focus();

        this.displayPlayers();

        // Update player count
        document.getElementById('roster-count').textContent = `${this.players.length} Players`;
    }

    removePlayer(playerId) {
        if (confirm('Remove this player from the roster?')) {
            this.players = this.players.filter(p => p.id !== playerId);
            this.saveToStorage();
            this.displayPlayers();
            document.getElementById('roster-count').textContent = `${this.players.length} Players`;
        }
    }

    displayPlayers() {
        const playersList = document.getElementById('players-list');
        document.getElementById('roster-count').textContent = `${this.players.length} Players`;

        if (this.players.length === 0) {
            playersList.innerHTML = '<div class="col-span-full text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed">No players added yet. Use the form above to build your roster.</div>';
            return;
        }

        playersList.innerHTML = this.players.map(player => `
            <div class="bg-white border border-gray-200 p-3 rounded-lg shadow-sm relative group hover:border-blue-300 transition">
                <button class="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition focus:opacity-100" onclick="tracker.removePlayer(${player.id})">
                    <i class="fas fa-trash"></i>
                </button>
                <div class="flex items-center gap-3">
                    <div class="bg-blue-100 text-blue-800 font-bold text-lg w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                        ${player.number}
                    </div>
                    <div class="overflow-hidden">
                        <h4 class="font-bold text-gray-800 truncate" title="${player.name}">${player.name}</h4>
                        <p class="text-xs text-gray-500 uppercase tracking-wide">${player.position}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateGameDisplay() {
        if (!this.currentGame) return;

        document.getElementById('home-team-name').textContent = this.currentGame.homeTeam;
        document.getElementById('away-team-name').textContent = this.currentGame.awayTeam;
        document.getElementById('home-score').textContent = this.currentGame.homeScore;
        document.getElementById('away-score').textContent = this.currentGame.awayScore;
        document.getElementById('game-period').textContent = this.currentGame.period;

        this.displayGameEvents();
    }

    toggleTimer() {
        const btn = document.getElementById('toggle-timer');

        if (this.isTimerRunning) {
            this.stopTimer();
            btn.innerHTML = '<i class="fas fa-play mr-2"></i> Start Clock';
            btn.classList.remove('bg-red-600', 'hover:bg-red-500');
            btn.classList.add('bg-indigo-600', 'hover:bg-indigo-500');
        } else {
            this.startTimer();
            btn.innerHTML = '<i class="fas fa-pause mr-2"></i> Pause Clock';
            btn.classList.remove('bg-indigo-600', 'hover:bg-indigo-500');
            btn.classList.add('bg-red-600', 'hover:bg-red-500');
        }
    }

    startTimer() {
        this.isTimerRunning = true;
        this.timer = setInterval(() => {
            this.gameTime++;
            if (this.currentGame) this.currentGame.gameTime = this.gameTime;
            this.updateTimerDisplay();
        }, 1000);
    }

    stopTimer() {
        this.isTimerRunning = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.saveToStorage();
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = this.gameTime % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('game-timer').textContent = display;
        const timeInput = document.getElementById('game-time-input');
        if (timeInput) {
            timeInput.value = display;
        }
    }

    applyTimeInput() {
        const input = document.getElementById('game-time-input');
        if (!input) return;
        const parsedSeconds = this.parseTimeInput(input.value);
        if (parsedSeconds === null) {
            alert('Enter time as MM:SS');
            return;
        }
        this.setGameTime(parsedSeconds);
    }

    parseTimeInput(value) {
        if (!value) return null;
        const trimmed = value.trim();
        const match = trimmed.match(/^(\d{1,3})(?::([0-5]?\d))?$/);
        if (!match) return null;
        const minutes = parseInt(match[1], 10);
        const seconds = match[2] ? parseInt(match[2], 10) : 0;
        if (Number.isNaN(minutes) || Number.isNaN(seconds)) return null;
        return minutes * 60 + seconds;
    }

    adjustGameTime(deltaSeconds) {
        const nextTime = Math.max(0, this.gameTime + deltaSeconds);
        this.setGameTime(nextTime);
    }

    setGameTime(seconds) {
        this.gameTime = Math.max(0, seconds);
        if (this.currentGame) this.currentGame.gameTime = this.gameTime;
        this.updateTimerDisplay();
        this.saveToStorage();
    }

    // --- EVENT-FIRST WORKFLOW --- //

    handleEventClick(statType, team) {
        if (!this.currentGame) {
            alert('Please start a game first');
            this.showTab('setup');
            return;
        }

        // Capture timestamp instantly
        const eventTime = this.gameTime;

        if (team === 'away') {
            // Opponent action - log immediately
            this.logOpponentEvent(statType, eventTime);
        } else {
            // Home team action - open player selector
            this.pendingEvent = {
                statType,
                time: eventTime,
                period: this.currentGame.period
            };
            this.showPlayerSelector(statType);
        }
    }

    logOpponentEvent(statType, time) {
        if (statType === 'goal') {
            this.currentGame.awayScore++;
            document.getElementById('away-score').textContent = this.currentGame.awayScore;
        }

        const event = {
            time: time,
            period: this.currentGame.period,
            team: 'away',
            statType: statType,
            timestamp: new Date().toISOString()
        };

        this.currentGame.events.push(event);
        this.saveToStorage();
        this.displayGameEvents();
    }

    showPlayerSelector(statType) {
        const modal = document.getElementById('player-selector-modal');
        const title = document.getElementById('modal-title');
        const subtitle = document.getElementById('modal-subtitle');
        const grid = document.getElementById('modal-players-grid');

        title.textContent = `Who got the ${this.formatStatType(statType)}?`;
        subtitle.textContent = `Time: ${this.formatTime(this.pendingEvent.time)}`;

        // Populate grid
        grid.innerHTML = this.players.map(player => `
            <button onclick="tracker.assignPlayerToEvent(${player.id})" class="bg-gray-50 hover:bg-indigo-50 border-2 border-gray-200 hover:border-indigo-400 p-3 rounded-xl flex flex-col items-center justify-center transition focus:outline-none">
                <span class="text-2xl font-black text-gray-800">${player.number}</span>
                <span class="text-xs font-semibold text-gray-500 truncate w-full text-center mt-1">${player.name.split(' ')[0]}</span>
            </button>
        `).join('');

        modal.classList.remove('hidden');
    }

    closePlayerSelector() {
        document.getElementById('player-selector-modal').classList.add('hidden');
        this.pendingEvent = null;
    }

    assignUnknownPlayer() {
        if (!this.pendingEvent) return;
        this.finalizeHomeEvent(null);
    }

    assignPlayerToEvent(playerId) {
        if (!this.pendingEvent) return;
        this.finalizeHomeEvent(playerId);
    }

    finalizeHomeEvent(playerId) {
        const { statType, time, period } = this.pendingEvent;

        let playerName = 'Unknown Player';
        let playerNumber = '--';

        if (playerId) {
            const player = this.players.find(p => p.id === playerId);
            if (player) {
                playerName = player.name;
                playerNumber = player.number;

                // Update player stats
                if (!this.currentGame.playerStats[playerId]) {
                    this.currentGame.playerStats[playerId] = this.getEmptyStats();
                }
                this.currentGame.playerStats[playerId][this.getStatKey(statType)]++;
            }
        }

        // Handle special cases
        if (statType === 'goal') {
            this.currentGame.homeScore++;
            const scoreEl = document.getElementById('home-score');
            scoreEl.textContent = this.currentGame.homeScore;
            scoreEl.classList.add('pulse');
            setTimeout(() => scoreEl.classList.remove('pulse'), 1000);
        }

        // Create Event Record
        const event = {
            time,
            period,
            team: 'home',
            playerId,
            playerName,
            playerNumber,
            statType,
            timestamp: new Date().toISOString(),
            id: Date.now() // Unique ID for editing later
        };

        this.currentGame.events.push(event);
        this.saveToStorage();
        this.displayGameEvents();

        this.closePlayerSelector();

        // Optional: If it was a goal, prompt for an assist immediately
        if (statType === 'goal') {
            setTimeout(() => {
                if (confirm('Log an Assist for this Goal?')) {
                    this.handleEventClick('assist', 'home');
                }
            }, 300);
        }
    }

    // --- END EVENT-FIRST WORKFLOW --- //

    deleteEvent(eventId) {
        if (!confirm('Delete this event?')) return;

        const eventIndex = this.currentGame.events.findIndex(e => e.id === eventId);
        if (eventIndex === -1) return;

        const event = this.currentGame.events[eventIndex];

        // Reverse stats
        if (event.team === 'home') {
            if (event.statType === 'goal') {
                this.currentGame.homeScore = Math.max(0, this.currentGame.homeScore - 1);
                document.getElementById('home-score').textContent = this.currentGame.homeScore;
            }
            if (event.playerId && this.currentGame.playerStats[event.playerId]) {
                const statKey = this.getStatKey(event.statType);
                this.currentGame.playerStats[event.playerId][statKey] = Math.max(0, this.currentGame.playerStats[event.playerId][statKey] - 1);
            }
        } else if (event.team === 'away' && event.statType === 'goal') {
            this.currentGame.awayScore = Math.max(0, this.currentGame.awayScore - 1);
            document.getElementById('away-score').textContent = this.currentGame.awayScore;
        }

        // Remove from list
        this.currentGame.events.splice(eventIndex, 1);
        this.saveToStorage();
        this.displayGameEvents();
    }

    getStatKey(statType) {
        const statMap = {
            'goal': 'goals', 'assist': 'assists', 'shot': 'shots', 'save': 'saves',
            'turnover': 'turnovers', 'foul': 'fouls', 'penalty-corner': 'penaltyCorners',
            'green-card': 'greenCards', 'yellow-card': 'yellowCards', 'red-card': 'redCards'
        };
        return statMap[statType] || statType;
    }

    displayGameEvents() {
        const eventsList = document.getElementById('events-list');

        if (!this.currentGame || this.currentGame.events.length === 0) {
            eventsList.innerHTML = '<div class="text-center text-gray-400 py-8 italic text-sm">No events recorded yet. Start the game and log actions!</div>';
            return;
        }

        // Sort events by time (most recent first)
        const sortedEvents = [...this.currentGame.events].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

        eventsList.innerHTML = sortedEvents.map(event => {
            const timeStr = this.formatTime(event.time);
            const icon = this.getStatIcon(event.statType);
            const isHome = event.team === 'home';

            const bgColor = isHome ? 'bg-white border-l-4 border-indigo-500' : 'bg-gray-100 border-l-4 border-gray-500';
            const titleColor = isHome ? 'text-indigo-800' : 'text-gray-700';

            const actorStr = isHome
                ? `<span class="font-bold">#${event.playerNumber}</span> ${event.playerName}`
                : `Opponent`;

            return `
                <div class="${bgColor} p-3 rounded shadow-sm flex justify-between items-center mb-2">
                    <div class="flex items-center gap-3">
                        <div class="text-lg w-8 text-center">${icon}</div>
                        <div>
                            <p class="text-sm font-bold ${titleColor}">${this.formatStatType(event.statType)}</p>
                            <p class="text-xs text-gray-600">${actorStr}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="text-sm font-mono font-semibold text-gray-500 bg-gray-200 px-2 py-1 rounded">${timeStr}</span>
                        ${event.id ? `<button onclick="tracker.deleteEvent(${event.id})" class="text-gray-400 hover:text-red-500 p-1"><i class="fas fa-times"></i></button>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    getStatIcon(statType) {
        const icons = {
            'goal': '<span class="text-green-500"><i class="fas fa-futbol"></i></span>',
            'assist': '<span class="text-gray-500"><i class="fas fa-hands-helping"></i></span>',
            'shot': '<span class="text-blue-500"><i class="fas fa-crosshairs"></i></span>',
            'save': '<span class="text-teal-500"><i class="fas fa-shield-alt"></i></span>',
            'turnover': '<span class="text-orange-500"><i class="fas fa-exchange-alt"></i></span>',
            'foul': '<span class="text-red-500"><i class="fas fa-exclamation-triangle"></i></span>',
            'penalty-corner': '<span class="text-purple-500"><i class="fas fa-flag-checkered"></i></span>',
            'green-card': '<span class="text-green-600"><i class="fas fa-square"></i></span>',
            'yellow-card': '<span class="text-yellow-500"><i class="fas fa-square"></i></span>',
            'red-card': '<span class="text-red-600"><i class="fas fa-square"></i></span>'
        };
        return icons[statType] || '📝';
    }

    formatStatType(statType) {
        const formatted = {
            'goal': 'Goal', 'assist': 'Assist', 'shot': 'Shot', 'save': 'Save',
            'turnover': 'Turnover', 'foul': 'Foul', 'penalty-corner': 'Penalty Corner',
            'green-card': 'Green Card', 'yellow-card': 'Yellow Card', 'red-card': 'Red Card'
        };
        return formatted[statType] || statType;
    }

    displayRecentGames() {
        const gamesList = document.getElementById('games-list');

        if (this.games.length === 0) {
            gamesList.innerHTML = '<div class="p-6 bg-white rounded-lg border border-gray-200 text-center text-gray-500">No games recorded yet.</div>';
            return;
        }

        const sortedGames = [...this.games].reverse();

        gamesList.innerHTML = sortedGames.map(game => {
            const dateObj = new Date(game.gameDate);
            const date = dateObj.toLocaleDateString();
            const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // Determine result logic
            let resultClass = 'bg-gray-100 border-gray-300 text-gray-800';
            let resultText = 'TIE';
            if (game.homeScore > game.awayScore) {
                resultClass = 'bg-green-100 border-green-300 text-green-800';
                resultText = 'WIN';
            } else if (game.awayScore > game.homeScore) {
                resultClass = 'bg-red-100 border-red-300 text-red-800';
                resultText = 'LOSS';
            }

            return `
                <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:border-indigo-400 transition flex justify-between items-center" onclick="tracker.loadGame(${game.id})">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-xs font-bold px-2 py-0.5 rounded border ${resultClass}">${resultText}</span>
                            <span class="text-xs text-gray-500"><i class="far fa-calendar-alt mr-1"></i>${date} at ${time}</span>
                        </div>
                        <h4 class="font-bold text-gray-800 text-lg">${game.homeTeam} <span class="text-indigo-600">${game.homeScore}</span> - <span class="text-gray-500">${game.awayScore}</span> ${game.awayTeam}</h4>
                        <p class="text-sm text-gray-600"><i class="fas fa-map-marker-alt mr-1"></i>${game.location || 'Location TBD'}</p>
                    </div>
                    <i class="fas fa-chevron-right text-gray-300"></i>
                </div>
            `;
        }).join('');
    }

    loadGame(gameId) {
        const game = this.games.find(g => g.id === gameId);
        if (game) {
            this.currentGame = game;
            this.gameTime = game.gameTime || 0;
            this.currentPeriod = game.period || 1;
            this.updateGameDisplay();
            this.updateTimerDisplay();
            this.showTab('game');
        }
    }

    updateStatsDisplay(gameFilter = 'all') {
        const gameSelect = document.getElementById('stats-game-select');
        gameSelect.innerHTML = '<option value="all">All Games</option>' +
            this.games.map(game =>
                `<option value="${game.id}">${new Date(game.gameDate).toLocaleDateString()} vs ${game.awayTeam}</option>`
            ).join('');
        gameSelect.value = gameFilter;

        const gamesToInclude = gameFilter === 'all' ? this.games : this.games.filter(g => g.id === parseInt(gameFilter));

        this.updateSummaryStats(gamesToInclude);
        this.updatePlayerStatsTable(gamesToInclude);
    }

    updateSummaryStats(games) {
        const totalGames = games.length;
        let totalGoals = 0;
        let totalAssists = 0;
        let wins = 0;

        games.forEach(game => {
            totalGoals += game.homeScore || 0;

            Object.values(game.playerStats || {}).forEach(stats => {
                totalAssists += stats.assists || 0;
            });

            if ((game.homeScore || 0) > (game.awayScore || 0)) {
                wins++;
            }
        });

        const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

        document.getElementById('total-games').textContent = totalGames;
        document.getElementById('total-goals').textContent = totalGoals;
        document.getElementById('total-assists').textContent = totalAssists;
        document.getElementById('win-rate').textContent = `${winRate}%`;
    }

    updatePlayerStatsTable(games) {
        const tbody = document.getElementById('stats-tbody');

        if (this.players.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">No players on roster</td></tr>';
            return;
        }

        const aggregatedStats = {};

        this.players.forEach(player => {
            aggregatedStats[player.id] = {
                name: player.name,
                number: player.number,
                goals: 0, assists: 0, shots: 0, saves: 0, points: 0
            };
        });

        games.forEach(game => {
            Object.entries(game.playerStats || {}).forEach(([playerId, stats]) => {
                if (aggregatedStats[playerId]) {
                    aggregatedStats[playerId].goals += stats.goals || 0;
                    aggregatedStats[playerId].assists += stats.assists || 0;
                    aggregatedStats[playerId].shots += stats.shots || 0;
                    aggregatedStats[playerId].saves += stats.saves || 0;
                    aggregatedStats[playerId].points += (stats.goals || 0) + (stats.assists || 0);
                }
            });
        });

        const sortedPlayers = Object.values(aggregatedStats).sort((a, b) => b.points - a.points || b.goals - a.goals);

        tbody.innerHTML = sortedPlayers.map(player => `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="shrink-0 h-8 w-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-bold text-xs mr-3 border">${player.number}</div>
                        <div class="text-sm font-medium text-gray-900">${player.name}</div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">${player.goals}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${player.assists}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-bold bg-indigo-50/50">${player.points}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${player.shots}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${player.saves}</td>
            </tr>
        `).join('');
    }

    exportStats() {
        const statsData = {
            players: this.players,
            games: this.games,
            exportDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(statsData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = `field-hockey-stats-${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    saveToStorage() {
        const data = {
            players: this.players,
            games: this.games,
            currentGameId: this.currentGame ? this.currentGame.id : null
        };
        localStorage.setItem('fieldHockeyStats', JSON.stringify(data));
    }

    loadFromStorage() {
        const stored = localStorage.getItem('fieldHockeyStats');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                this.players = data.players || [];
                this.games = data.games || [];

                if (data.currentGameId) {
                    this.currentGame = this.games.find(g => g.id === data.currentGameId) || null;
                }
            } catch (e) {
                console.error('Error loading data from storage:', e);
            }
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tracker = new FieldHockeyStatsTracker();
});
