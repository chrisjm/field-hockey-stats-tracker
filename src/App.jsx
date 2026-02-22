import { useEffect, useMemo, useRef, useState } from 'react';
import { emptyStats, formatStatType, formatTime, getStatKey, parseTimeInput } from './helpers';
import SetupTab from './components/SetupTab';
import RosterTab from './components/RosterTab';
import GameTab from './components/GameTab';
import StatsTab from './components/StatsTab';
import PlayerModal from './components/PlayerModal';

const DEFAULT_PERIOD_TIME = 15 * 60;

const App = () => {
    const [activeTab, setActiveTab] = useState('games');
    const [players, setPlayers] = useState([]);
    const [games, setGames] = useState([]);
    const [currentGameId, setCurrentGameId] = useState(null);
    const [gameTime, setGameTime] = useState(0);
    const [pendingEvent, setPendingEvent] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [statsFilter, setStatsFilter] = useState('all');
    const [homeTeamInput, setHomeTeamInput] = useState('');
    const [awayTeamInput, setAwayTeamInput] = useState('');
    const [gameDateInput, setGameDateInput] = useState('');
    const [locationInput, setLocationInput] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [playerNumber, setPlayerNumber] = useState('');
    const [playerPosition, setPlayerPosition] = useState('');
    const [inputError, setInputError] = useState(false);
    const [timeInput, setTimeInput] = useState('00:00');
    const [homeScorePulse, setHomeScorePulse] = useState(false);
    const [appReady, setAppReady] = useState(false);
    const [hasLoadedStorage, setHasLoadedStorage] = useState(false);
    const [editingGameId, setEditingGameId] = useState(null);
    const [editingPlayerId, setEditingPlayerId] = useState(null);
    const previousGameIdRef = useRef(null);

    const currentGame = useMemo(
        () => games.find(game => game.id === currentGameId) || null,
        [games, currentGameId]
    );

    const gamesToInclude = useMemo(() => {
        if (statsFilter === 'all') return games;
        const parsed = parseInt(statsFilter, 10);
        return games.filter(game => game.id === parsed);
    }, [games, statsFilter]);

    const summaryStats = useMemo(() => {
        const totalGames = gamesToInclude.length;
        let totalGoals = 0;
        let totalAssists = 0;
        let wins = 0;

        gamesToInclude.forEach(game => {
            totalGoals += game.homeScore || 0;
            Object.values(game.playerStats || {}).forEach(stats => {
                totalAssists += stats.assists || 0;
            });
            if ((game.homeScore || 0) > (game.awayScore || 0)) {
                wins += 1;
            }
        });

        const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
        return { totalGames, totalGoals, totalAssists, winRate };
    }, [gamesToInclude]);

    const playerStatsRows = useMemo(() => {
        if (players.length === 0) return [];
        const aggregatedStats = {};

        players.forEach(player => {
            aggregatedStats[player.id] = {
                name: player.name,
                number: player.number,
                goals: 0,
                assists: 0,
                shots: 0,
                saves: 0,
                points: 0
            };
        });

        gamesToInclude.forEach(game => {
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

        return Object.values(aggregatedStats).sort((a, b) => b.points - a.points || b.goals - a.goals);
    }, [gamesToInclude, players]);

    const sortedEvents = useMemo(() => {
        if (!currentGame) return [];
        return [...(currentGame.events || [])].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    }, [currentGame]);

    useEffect(() => {
        const stored = localStorage.getItem('fieldHockeyStats');
        if (!stored) {
            setHasLoadedStorage(true);
            return;
        }
        try {
            const data = JSON.parse(stored);
            setPlayers(data.players || []);
            setGames(data.games || []);
            setCurrentGameId(data.currentGameId || null);
        } catch (error) {
            console.error('Error loading data from storage:', error);
        } finally {
            setHasLoadedStorage(true);
        }
    }, []);

    useEffect(() => {
        if (!gameDateInput) {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            setGameDateInput(now.toISOString().slice(0, 16));
        }
    }, [gameDateInput]);

    useEffect(() => {
        const timeout = setTimeout(() => setAppReady(true), 50);
        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        if (!currentGameId) {
            previousGameIdRef.current = null;
            return;
        }
        if (previousGameIdRef.current === currentGameId) return;
        const nextGame = games.find(game => game.id === currentGameId);
        setGameTime(nextGame?.gameTime || 0);
        previousGameIdRef.current = currentGameId;
    }, [currentGameId, games]);

    useEffect(() => {
        setTimeInput(formatTime(gameTime));
        if (!currentGameId) return;
        setGames(prev => prev.map(game => {
            if (game.id !== currentGameId) return game;
            if (game.gameTime === gameTime) return game;
            return { ...game, gameTime };
        }));
    }, [gameTime, currentGameId]);

    useEffect(() => {
        if (!hasLoadedStorage) return;
        const data = { players, games, currentGameId };
        localStorage.setItem('fieldHockeyStats', JSON.stringify(data));
    }, [players, games, currentGameId, hasLoadedStorage]);

    const updateCurrentGame = (updater) => {
        if (!currentGame) return;
        setGames(prev => prev.map(game => {
            if (game.id !== currentGame.id) return game;
            const cloned = {
                ...game,
                events: [...(game.events || [])],
                playerStats: Object.fromEntries(
                    Object.entries(game.playerStats || {}).map(([id, stats]) => [id, { ...stats }])
                )
            };
            return updater(cloned);
        }));
    };

    const handleStartGame = () => {
        const homeTeam = homeTeamInput.trim() || 'Our Team';
        const awayTeam = awayTeamInput.trim() || 'Opponent';
        const location = locationInput.trim();
        const gameDate = gameDateInput;

        if (editingGameId) {
            setGames(prev => prev.map(game => (
                game.id === editingGameId
                    ? {
                        ...game,
                        homeTeam,
                        awayTeam,
                        location,
                        gameDate
                    }
                    : game
            )));
            setEditingGameId(null);
            return;
        }

        const game = {
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

        players.forEach(player => {
            game.playerStats[player.id] = emptyStats();
        });

        setGames(prev => [...prev, game]);
        setCurrentGameId(game.id);
        setGameTime(DEFAULT_PERIOD_TIME);
        setActiveTab('game');
    };

    const handleEditGame = (gameId) => {
        const game = games.find(item => item.id === gameId);
        if (!game) return;
        setHomeTeamInput(game.homeTeam || '');
        setAwayTeamInput(game.awayTeam || '');
        setGameDateInput(game.gameDate || '');
        setLocationInput(game.location || '');
        setEditingGameId(game.id);
        setActiveTab('games');
    };

    const handleCancelEditGame = () => {
        setEditingGameId(null);
        setHomeTeamInput('');
        setAwayTeamInput('');
        setGameDateInput('');
        setLocationInput('');
    };

    const handleAddPlayer = () => {
        const name = playerName.trim();
        const number = playerNumber.toString().trim();
        const position = playerPosition || 'Any';

        if (!name || !number) {
            setInputError(true);
            setTimeout(() => setInputError(false), 500);
            return;
        }

        if (editingPlayerId) {
            setPlayers(prev => prev.map(player => (
                player.id === editingPlayerId
                    ? { ...player, name, number, position }
                    : player
            )));
            setGames(prev => prev.map(game => ({
                ...game,
                events: (game.events || []).map(event => (
                    event.playerId === editingPlayerId
                        ? { ...event, playerName: name, playerNumber: number }
                        : event
                ))
            })));
            setEditingPlayerId(null);
        } else {
            const player = {
                id: Date.now(),
                name,
                number,
                position
            };
            setPlayers(prev => [...prev, player]);
        }
        setPlayerName('');
        setPlayerNumber('');
        setPlayerPosition('');
    };

    const handleEditPlayer = (playerId) => {
        const player = players.find(item => item.id === playerId);
        if (!player) return;
        setPlayerName(player.name || '');
        setPlayerNumber(player.number?.toString() || '');
        setPlayerPosition(player.position || '');
        setEditingPlayerId(player.id);
        setActiveTab('roster');
    };

    const handleCancelEditPlayer = () => {
        setEditingPlayerId(null);
        setPlayerName('');
        setPlayerNumber('');
        setPlayerPosition('');
    };

    const handleRemovePlayer = (playerId) => {
        if (!window.confirm('Remove this player from the roster?')) return;
        setPlayers(prev => prev.filter(player => player.id !== playerId));
        if (editingPlayerId === playerId) {
            handleCancelEditPlayer();
        }
    };

    const handleApplyTime = () => {
        const parsed = parseTimeInput(timeInput);
        if (parsed === null) {
            alert('Enter time as MM:SS');
            return;
        }
        setGameTime(Math.max(0, parsed));
    };

    const handleAdjustTime = (delta) => {
        setGameTime(prev => Math.max(0, prev + delta));
    };

    const handleSelectPeriod = (period) => {
        if (!currentGame) return;
        updateCurrentGame(game => ({
            ...game,
            period
        }));
        setGameTime(DEFAULT_PERIOD_TIME);
    };

    const openPlayerSelector = (statType, time, mode = 'create', eventId = null) => {
        setPendingEvent({ statType, time, period: currentGame?.period || 1, mode, eventId });
        setShowModal(true);
    };

    const closePlayerSelector = () => {
        setShowModal(false);
        setPendingEvent(null);
    };

    const handleEventClick = (statType, team) => {
        if (!currentGame) {
            alert('Please start a game first');
            setActiveTab('games');
            return;
        }

        const eventTime = gameTime;
        if (team === 'away') {
            updateCurrentGame(game => {
                if (statType === 'goal') {
                    game.awayScore += 1;
                }
                game.events.push({
                    time: eventTime,
                    period: game.period,
                    team: 'away',
                    statType,
                    timestamp: new Date().toISOString(),
                    id: Date.now()
                });
                return game;
            });
            return;
        }

        openPlayerSelector(statType, eventTime);
    };

    const finalizeHomeEvent = (playerId) => {
        if (!pendingEvent || !currentGame) return;
        const { statType, time, period, mode, eventId } = pendingEvent;

        if (mode === 'edit') {
            updateCurrentGame(game => {
                const eventIndex = game.events.findIndex(event => event.id === eventId);
                if (eventIndex === -1) return game;

                const event = game.events[eventIndex];
                const statKey = getStatKey(event.statType);

                if (event.playerId && game.playerStats[event.playerId]) {
                    game.playerStats[event.playerId][statKey] = Math.max(0, game.playerStats[event.playerId][statKey] - 1);
                }

                let playerNameValue = 'Unknown Player';
                let playerNumberValue = '--';

                if (playerId) {
                    const player = players.find(person => person.id === playerId);
                    if (player) {
                        playerNameValue = player.name;
                        playerNumberValue = player.number;

                        if (!game.playerStats[playerId]) {
                            game.playerStats[playerId] = emptyStats();
                        }
                        game.playerStats[playerId][statKey] += 1;
                    }
                }

                game.events[eventIndex] = {
                    ...event,
                    playerId,
                    playerName: playerNameValue,
                    playerNumber: playerNumberValue,
                    timestamp: new Date().toISOString()
                };

                return game;
            });
            closePlayerSelector();
            return;
        }

        updateCurrentGame(game => {
            let playerNameValue = 'Unknown Player';
            let playerNumberValue = '--';

            if (playerId) {
                const player = players.find(person => person.id === playerId);
                if (player) {
                    playerNameValue = player.name;
                    playerNumberValue = player.number;

                    if (!game.playerStats[playerId]) {
                        game.playerStats[playerId] = emptyStats();
                    }
                    game.playerStats[playerId][getStatKey(statType)] += 1;
                }
            }

            if (statType === 'goal') {
                game.homeScore += 1;
                setHomeScorePulse(true);
                setTimeout(() => setHomeScorePulse(false), 1000);
            }

            game.events.push({
                time,
                period,
                team: 'home',
                playerId,
                playerName: playerNameValue,
                playerNumber: playerNumberValue,
                statType,
                timestamp: new Date().toISOString(),
                id: Date.now()
            });

            return game;
        });

        closePlayerSelector();

        if (statType === 'goal') {
            setTimeout(() => {
                if (window.confirm('Log an Assist for this Goal?')) {
                    handleEventClick('assist', 'home');
                }
            }, 300);
        }
    };

    const handleDeleteEvent = (eventId) => {
        if (!window.confirm('Delete this event?')) return;
        updateCurrentGame(game => {
            const eventIndex = game.events.findIndex(event => event.id === eventId);
            if (eventIndex === -1) return game;

            const event = game.events[eventIndex];
            if (event.team === 'home') {
                if (event.statType === 'goal') {
                    game.homeScore = Math.max(0, game.homeScore - 1);
                }
                if (event.playerId && game.playerStats[event.playerId]) {
                    const statKey = getStatKey(event.statType);
                    game.playerStats[event.playerId][statKey] = Math.max(0, game.playerStats[event.playerId][statKey] - 1);
                }
            } else if (event.team === 'away' && event.statType === 'goal') {
                game.awayScore = Math.max(0, game.awayScore - 1);
            }

            game.events.splice(eventIndex, 1);
            return game;
        });
    };

    const handleEditEvent = (eventId) => {
        if (!currentGame) return;
        const event = currentGame.events.find(item => item.id === eventId);
        if (!event || event.team !== 'home') return;
        openPlayerSelector(event.statType, event.time, 'edit', event.id);
    };

    const handleEditEventTime = (eventId) => {
        if (!currentGame) return;
        const event = currentGame.events.find(item => item.id === eventId);
        if (!event) return;
        const nextValue = window.prompt('Enter new time (MM:SS)', formatTime(event.time));
        if (nextValue === null) return;
        const parsed = parseTimeInput(nextValue);
        if (parsed === null) {
            alert('Enter time as MM:SS');
            return;
        }
        updateCurrentGame(game => {
            const eventIndex = game.events.findIndex(item => item.id === eventId);
            if (eventIndex === -1) return game;
            game.events[eventIndex] = {
                ...game.events[eventIndex],
                time: Math.max(0, parsed),
                timestamp: new Date().toISOString()
            };
            return game;
        });
    };

    const handleExportStats = () => {
        const statsData = { players, games, exportDate: new Date().toISOString() };
        const dataStr = JSON.stringify(statsData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `field-hockey-stats-${new Date().toISOString().split('T')[0]}.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const handleLoadGame = (gameId) => {
        setCurrentGameId(gameId);
        setActiveTab('game');
    };

    const tabButtonClass = (tab) =>
        `flex-1 py-3 px-2 text-sm font-medium border-b-2 focus:outline-none transition-colors ${activeTab === tab
            ? 'border-indigo-600 text-indigo-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
        }`;

    const modalTitle = pendingEvent
        ? pendingEvent.mode === 'edit'
            ? `Update ${formatStatType(pendingEvent.statType)} Player`
            : `Who got the ${formatStatType(pendingEvent.statType)}?`
        : 'Who did it?';

    const modalSubtitle = pendingEvent
        ? pendingEvent.mode === 'edit'
            ? `Editing time: ${formatTime(pendingEvent.time)}`
            : `Time: ${formatTime(pendingEvent.time)}`
        : 'Assigning to action';

    return (
        <div className={`max-w-3xl mx-auto md:p-4 ${appReady ? 'app-enter' : ''}`}>
            <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-b-xl shadow-md mb-4 text-center">
                <h1 className="text-3xl font-bold mb-2"><i className="fas fa-hockey-puck mr-2"></i>Field Hockey Stats</h1>
                <p className="text-blue-100 opacity-90">Track your niece&apos;s games instantly</p>
            </header>

            <nav className="flex bg-white rounded-t-xl overflow-hidden shadow-sm mx-2 md:mx-0">
                <button className={tabButtonClass('games')} onClick={() => setActiveTab('games')}>Games</button>
                <button className={tabButtonClass('roster')} onClick={() => setActiveTab('roster')}>Roster</button>
                <button className={tabButtonClass('game')} onClick={() => setActiveTab('game')}>Live Game</button>
                <button className={tabButtonClass('stats')} onClick={() => setActiveTab('stats')}>Stats</button>
            </nav>

            <main className="bg-white rounded-b-xl shadow-md p-4 md:p-6 mb-8 mx-2 md:mx-0 min-h-[500px]">
                {activeTab === 'games' && (
                    <SetupTab
                        homeTeamInput={homeTeamInput}
                        setHomeTeamInput={setHomeTeamInput}
                        awayTeamInput={awayTeamInput}
                        setAwayTeamInput={setAwayTeamInput}
                        gameDateInput={gameDateInput}
                        setGameDateInput={setGameDateInput}
                        locationInput={locationInput}
                        setLocationInput={setLocationInput}
                        handleStartGame={handleStartGame}
                        games={games}
                        handleLoadGame={handleLoadGame}
                        handleEditGame={handleEditGame}
                        handleCancelEditGame={handleCancelEditGame}
                        editingGameId={editingGameId}
                    />
                )}

                {activeTab === 'roster' && (
                    <RosterTab
                        playerName={playerName}
                        setPlayerName={setPlayerName}
                        playerNumber={playerNumber}
                        setPlayerNumber={setPlayerNumber}
                        playerPosition={playerPosition}
                        setPlayerPosition={setPlayerPosition}
                        inputError={inputError}
                        handleAddPlayer={handleAddPlayer}
                        players={players}
                        handleRemovePlayer={handleRemovePlayer}
                        handleEditPlayer={handleEditPlayer}
                        handleCancelEditPlayer={handleCancelEditPlayer}
                        editingPlayerId={editingPlayerId}
                    />
                )}

                {activeTab === 'game' && (
                    <GameTab
                        currentGame={currentGame}
                        homeScorePulse={homeScorePulse}
                        gameTime={gameTime}
                        timeInput={timeInput}
                        setTimeInput={setTimeInput}
                        handleApplyTime={handleApplyTime}
                        handleAdjustTime={handleAdjustTime}
                        handleSelectPeriod={handleSelectPeriod}
                        handleEventClick={handleEventClick}
                        sortedEvents={sortedEvents}
                        handleEditEvent={handleEditEvent}
                        handleEditEventTime={handleEditEventTime}
                        handleDeleteEvent={handleDeleteEvent}
                    />
                )}

                {activeTab === 'stats' && (
                    <StatsTab
                        statsFilter={statsFilter}
                        setStatsFilter={setStatsFilter}
                        games={games}
                        summaryStats={summaryStats}
                        playerStatsRows={playerStatsRows}
                        players={players}
                        handleExportStats={handleExportStats}
                    />
                )}
            </main>

            <PlayerModal
                show={showModal}
                modalTitle={modalTitle}
                modalSubtitle={modalSubtitle}
                players={players}
                finalizeHomeEvent={finalizeHomeEvent}
                closePlayerSelector={closePlayerSelector}
            />
        </div>
    );
};

export default App;
