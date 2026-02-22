import { formatStatType, formatTime } from '../helpers';

const statIcons = {
    goal: <span className="text-green-500"><i className="fas fa-futbol"></i></span>,
    assist: <span className="text-gray-500"><i className="fas fa-hands-helping"></i></span>,
    shot: <span className="text-blue-500"><i className="fas fa-crosshairs"></i></span>,
    save: <span className="text-teal-500"><i className="fas fa-shield-alt"></i></span>,
    turnover: <span className="text-orange-500"><i className="fas fa-exchange-alt"></i></span>,
    foul: <span className="text-red-500"><i className="fas fa-exclamation-triangle"></i></span>,
    'penalty-corner': <span className="text-purple-500"><i className="fas fa-flag-checkered"></i></span>,
    'green-card': <span className="text-green-600"><i className="fas fa-square"></i></span>,
    'yellow-card': <span className="text-yellow-500"><i className="fas fa-square"></i></span>,
    'red-card': <span className="text-red-600"><i className="fas fa-square"></i></span>
};

const GameTab = ({
    currentGame,
    homeScorePulse,
    gameTime,
    timeInput,
    setTimeInput,
    handleApplyTime,
    handleAdjustTime,
    handleSelectPeriod,
    handleEventClick,
    sortedEvents,
    handleEditEvent,
    handleEditEventTime,
    handleDeleteEvent
}) => (
    <section>
        <div className="bg-gray-900 text-white rounded-xl p-4 mb-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

            <div className="flex justify-between items-center mb-4">
                <div className="text-center w-5/12">
                    <h3 className="text-sm md:text-base font-bold text-gray-300 truncate">{currentGame?.homeTeam || 'Our Team'}</h3>
                    <div className={`text-5xl md:text-6xl font-black text-white mt-1 ${homeScorePulse ? 'pulse' : ''}`}>{currentGame?.homeScore ?? 0}</div>
                </div>

                <div className="w-2/12 flex flex-col items-center justify-center">
                    <span className="text-xs text-gray-400 font-bold tracking-widest uppercase mb-1">Period</span>
                    <span className="text-xl font-bold text-indigo-400 mb-2">{currentGame?.period ?? 1}</span>

                    <div className="bg-gray-800 rounded px-3 py-1 text-center font-mono w-full">
                        <span className="text-xl md:text-2xl font-bold text-yellow-400">{formatTime(gameTime)}</span>
                    </div>
                </div>

                <div className="text-center w-5/12">
                    <h3 className="text-sm md:text-base font-bold text-gray-300 truncate">{currentGame?.awayTeam || 'Opponent'}</h3>
                    <div className="text-5xl md:text-6xl font-black text-gray-400 mt-1">{currentGame?.awayScore ?? 0}</div>
                </div>
            </div>

            <div className="mt-3 bg-gray-800/60 rounded-lg p-3">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-gray-300 uppercase">Last Entered Time</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={timeInput}
                            onChange={(event) => setTimeInput(event.target.value)}
                            onKeyDown={(event) => event.key === 'Enter' && handleApplyTime()}
                            placeholder="MM:SS"
                            className="w-20 bg-gray-900 text-yellow-300 font-mono text-sm rounded px-2 py-1 border border-gray-700 focus:outline-none focus:border-yellow-400"
                        />
                        <button
                            onClick={handleApplyTime}
                            className="px-2.5 py-1 bg-yellow-500 hover:bg-yellow-400 text-gray-900 text-xs font-bold rounded shadow"
                        >
                            Apply
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="time-adjust-btn px-2 py-1 bg-gray-700 hover:bg-gray-600 text-xs font-semibold rounded" onClick={() => handleAdjustTime(-60)}>-1:00</button>
                        <button className="time-adjust-btn px-2 py-1 bg-gray-700 hover:bg-gray-600 text-xs font-semibold rounded" onClick={() => handleAdjustTime(-10)}>-0:10</button>
                        <button className="time-adjust-btn px-2 py-1 bg-gray-700 hover:bg-gray-600 text-xs font-semibold rounded" onClick={() => handleAdjustTime(-5)}>-0:05</button>
                        <button className="time-adjust-btn px-2 py-1 bg-gray-700 hover:bg-gray-600 text-xs font-semibold rounded" onClick={() => handleAdjustTime(5)}>+0:05</button>
                        <button className="time-adjust-btn px-2 py-1 bg-gray-700 hover:bg-gray-600 text-xs font-semibold rounded" onClick={() => handleAdjustTime(10)}>+0:10</button>
                        <button className="time-adjust-btn px-2 py-1 bg-gray-700 hover:bg-gray-600 text-xs font-semibold rounded" onClick={() => handleAdjustTime(60)}>+1:00</button>
                    </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-gray-300 uppercase">Quarter</span>
                    {[1, 2, 3, 4, 'OT'].map(period => {
                        const isActive = (currentGame?.period ?? 1) === period;
                        const label = period === 'OT' ? 'OT' : `Q${period}`;
                        return (
                            <button
                                key={label}
                                onClick={() => handleSelectPeriod(period)}
                                className={`h-9 w-9 rounded-full border text-xs font-bold transition shadow-sm ${isActive
                                    ? 'bg-yellow-400 text-gray-900 border-yellow-300'
                                    : 'bg-gray-900 text-gray-300 border-gray-700 hover:border-yellow-300 hover:text-yellow-300'
                                    }`}
                                title={`Set period to ${label}`}
                            >
                                {label}
                            </button>
                        );
                    })}
                    <span className="text-[11px] text-gray-400">Changing periods resets time to 15:00.</span>
                </div>
                <p className="mt-2 text-[11px] text-gray-400">Tip: enter time as MM:SS and hit Apply.</p>
            </div>
        </div>

        <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 border-b pb-1">Our Actions (Tap to Record)</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                {[
                    { stat: 'goal', label: 'Goal', icon: 'fa-futbol', classes: 'bg-green-100 hover:bg-green-200 border-2 border-green-500 text-green-800' },
                    { stat: 'shot', label: 'Shot', icon: 'fa-crosshairs', classes: 'bg-blue-50 hover:bg-blue-100 border-2 border-blue-400 text-blue-800' },
                    { stat: 'penalty-corner', label: 'Corner', icon: 'fa-flag-checkered', classes: 'bg-purple-50 hover:bg-purple-100 border-2 border-purple-400 text-purple-800' },
                    { stat: 'save', label: 'Save', icon: 'fa-shield-alt', classes: 'bg-teal-50 hover:bg-teal-100 border-2 border-teal-400 text-teal-800' }
                ].map(button => (
                    <button
                        key={button.stat}
                        className={`stat-btn font-bold py-4 rounded-lg shadow-sm transition flex flex-col items-center justify-center gap-1 ${button.classes}`}
                        onClick={() => handleEventClick(button.stat, 'home')}
                    >
                        <i className={`fas ${button.icon} text-2xl mb-1`}></i>
                        <span className={button.stat === 'penalty-corner' ? 'text-xs md:text-base' : ''}>{button.label}</span>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-6">
                {[
                    { stat: 'assist', label: 'Assist', icon: 'fa-hands-helping', classes: 'bg-gray-50 hover:bg-gray-100 border border-gray-300 text-gray-700' },
                    { stat: 'turnover', label: 'Turnover', icon: 'fa-exchange-alt', classes: 'bg-orange-50 hover:bg-orange-100 border border-orange-300 text-orange-800' },
                    { stat: 'foul', label: 'Foul', icon: 'fa-exclamation-triangle', classes: 'bg-red-50 hover:bg-red-100 border border-red-300 text-red-800' },
                    { stat: 'green-card', label: 'Green Card', icon: 'fa-square', classes: 'bg-green-100 hover:bg-green-200 border border-green-400 text-green-800' },
                    { stat: 'yellow-card', label: 'Yellow Card', icon: 'fa-square', classes: 'bg-yellow-100 hover:bg-yellow-200 border border-yellow-400 text-yellow-800' }
                ].map(button => (
                    <button
                        key={button.stat}
                        className={`stat-btn py-2 rounded shadow-sm text-sm font-semibold transition flex flex-col items-center ${button.classes}`}
                        onClick={() => handleEventClick(button.stat, 'home')}
                    >
                        <i className={`fas ${button.icon} mb-1 ${button.stat === 'assist' ? 'text-gray-500' : ''} ${button.stat === 'turnover' ? 'text-orange-500' : ''} ${button.stat === 'foul' ? 'text-red-500' : ''} ${button.stat === 'green-card' ? 'text-green-600' : ''} ${button.stat === 'yellow-card' ? 'text-yellow-500' : ''}`}></i>
                        {button.label}
                    </button>
                ))}
            </div>

            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 border-b pb-1">Opponent Actions</h3>
            <div className="grid grid-cols-3 gap-2">
                {[
                    { stat: 'goal', label: 'Opp Goal', classes: 'bg-gray-800 hover:bg-gray-700 border-2 border-gray-900 text-white' },
                    { stat: 'shot', label: 'Opp Shot', classes: 'bg-gray-200 hover:bg-gray-300 border border-gray-400 text-gray-800' },
                    { stat: 'penalty-corner', label: 'Opp Corner', classes: 'bg-gray-200 hover:bg-gray-300 border border-gray-400 text-gray-800' }
                ].map(button => (
                    <button
                        key={button.stat}
                        className={`stat-btn font-bold py-3 rounded-lg shadow-sm transition flex flex-col items-center justify-center gap-1 ${button.classes}`}
                        onClick={() => handleEventClick(button.stat, 'away')}
                    >
                        <span className={button.stat === 'penalty-corner' ? 'text-xs md:text-sm' : ''}>{button.label}</span>
                    </button>
                ))}
            </div>
        </div>

        <div>
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center"><i className="fas fa-history mr-2 text-indigo-500"></i>Timeline</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 h-64 overflow-y-auto space-y-2">
                {sortedEvents.length === 0 && (
                    <div className="text-center text-gray-400 py-8 italic text-sm">No events recorded yet. Start the game and log actions!</div>
                )}
                {sortedEvents.map(event => {
                    const isHome = event.team === 'home';
                    const bgColor = isHome ? 'bg-white border-l-4 border-indigo-500' : 'bg-gray-100 border-l-4 border-gray-500';
                    const titleColor = isHome ? 'text-indigo-800' : 'text-gray-700';
                    const actorStr = isHome
                        ? <span><span className="font-bold">#{event.playerNumber}</span> {event.playerName}</span>
                        : 'Opponent';

                    return (
                        <div key={event.id} className={`${bgColor} p-3 rounded shadow-sm flex justify-between items-center mb-2`}>
                            <div className="flex items-center gap-3">
                                <div className="text-lg w-8 text-center">{statIcons[event.statType] || '📝'}</div>
                                <div>
                                    <p className={`text-sm font-bold ${titleColor}`}>{formatStatType(event.statType)}</p>
                                    <p className="text-xs text-gray-600">{actorStr}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-semibold text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                        {event.period === 'OT' ? 'OT' : `Q${event.period ?? 1}`}
                                    </span>
                                    <span className="text-sm font-mono font-semibold text-gray-500 bg-gray-200 px-2 py-1 rounded">{formatTime(event.time)}</span>
                                </div>
                                <button onClick={() => handleEditEventTime(event.id)} className="text-gray-400 hover:text-indigo-600 p-1" title="Edit time">
                                    <i className="fas fa-clock"></i>
                                </button>
                                {isHome && (
                                    <button onClick={() => handleEditEvent(event.id)} className="text-gray-400 hover:text-indigo-600 p-1" title="Edit player">
                                        <i className="fas fa-user-edit"></i>
                                    </button>
                                )}
                                <button onClick={() => handleDeleteEvent(event.id)} className="text-gray-400 hover:text-red-500 p-1" title="Delete event">
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </section>
);

export default GameTab;
