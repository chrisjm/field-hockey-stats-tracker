const SetupTab = ({
    homeTeamInput,
    setHomeTeamInput,
    awayTeamInput,
    setAwayTeamInput,
    gameDateInput,
    setGameDateInput,
    locationInput,
    setLocationInput,
    handleStartGame,
    games,
    handleLoadGame,
    handleEditGame,
    handleCancelEditGame,
    editingGameId
}) => (
    <section>
        <div className="pb-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-2">Recent Games</h2>
            <div className="space-y-3">
                {games.length === 0 && (
                    <div className="p-6 bg-white rounded-lg border border-gray-200 text-center text-gray-500">
                        No games recorded yet.
                    </div>
                )}
                {games.slice().reverse().map(game => {
                    const dateObj = new Date(game.gameDate);
                    const date = dateObj.toLocaleDateString();
                    const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    let resultClass = 'bg-gray-100 border-gray-300 text-gray-800';
                    let resultText = 'TIE';
                    if (game.homeScore > game.awayScore) {
                        resultClass = 'bg-green-100 border-green-300 text-green-800';
                        resultText = 'WIN';
                    } else if (game.awayScore > game.homeScore) {
                        resultClass = 'bg-red-100 border-red-300 text-red-800';
                        resultText = 'LOSS';
                    }

                    return (
                        <div
                            key={game.id}
                            className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:border-indigo-400 transition flex justify-between items-center"
                            onClick={() => handleLoadGame(game.id)}
                        >
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${resultClass}`}>{resultText}</span>
                                    <span className="text-xs text-gray-500"><i className="far fa-calendar-alt mr-1"></i>{date} at {time}</span>
                                </div>
                                <h4 className="font-bold text-gray-800 text-lg">
                                    {game.homeTeam} <span className="text-indigo-600">{game.homeScore}</span> - <span className="text-gray-500">{game.awayScore}</span> {game.awayTeam}
                                </h4>
                                <p className="text-sm text-gray-600"><i className="fas fa-map-marker-alt mr-1"></i>{game.location || 'Location TBD'}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        handleEditGame(game.id);
                                    }}
                                    className="text-xs font-semibold text-indigo-600 border border-indigo-200 px-2 py-1 rounded hover:bg-indigo-50"
                                >
                                    Edit
                                </button>
                                <i className="fas fa-chevron-right text-gray-300"></i>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-2">Games</h2>
        <div className="bg-gray-50 p-4 rounded-lg mb-8 space-y-4 border border-gray-100">
            {editingGameId && (
                <div className="bg-amber-100 border border-amber-200 text-amber-800 text-sm rounded-md p-3 flex items-center justify-between">
                    <span><i className="fas fa-pen mr-2"></i>Editing game details</span>
                    <button
                        onClick={handleCancelEditGame}
                        className="text-amber-900 font-semibold hover:text-amber-700"
                    >
                        Cancel
                    </button>
                </div>
            )}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Our Team (Home):</label>
                <input
                    type="text"
                    value={homeTeamInput}
                    onChange={(event) => setHomeTeamInput(event.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    placeholder="Enter team name"
                />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Opponent (Away):</label>
                <input
                    type="text"
                    value={awayTeamInput}
                    onChange={(event) => setAwayTeamInput(event.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    placeholder="Enter opponent name"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Game Date &amp; Time:</label>
                    <input
                        type="datetime-local"
                        value={gameDateInput}
                        onChange={(event) => setGameDateInput(event.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Location:</label>
                    <input
                        type="text"
                        value={locationInput}
                        onChange={(event) => setLocationInput(event.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Enter game location"
                    />
                </div>
            </div>
            <button
                onClick={handleStartGame}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md shadow transition duration-200"
            >
                {editingGameId ? 'Save Game Changes' : 'Start New Game'}
            </button>
        </div>
    </section>
);

export default SetupTab;
