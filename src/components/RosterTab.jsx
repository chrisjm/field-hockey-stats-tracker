const RosterTab = ({
    playerName,
    setPlayerName,
    playerNumber,
    setPlayerNumber,
    playerPosition,
    setPlayerPosition,
    inputError,
    handleAddPlayer,
    players,
    handleRemovePlayer,
    handleEditPlayer,
    handleCancelEditPlayer,
    editingPlayerId
}) => (
    <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-2">Team Roster</h2>
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6">
            {editingPlayerId && (
                <div className="bg-amber-100 border border-amber-200 text-amber-800 text-sm rounded-md p-3 flex items-center justify-between mb-4">
                    <span><i className="fas fa-pen mr-2"></i>Editing player details</span>
                    <button
                        onClick={handleCancelEditPlayer}
                        className="text-amber-900 font-semibold hover:text-amber-700"
                    >
                        Cancel
                    </button>
                </div>
            )}
            <p className="text-sm text-blue-800 mb-3">
                <i className="fas fa-info-circle mr-1"></i> <strong>Fast Entry Mode:</strong> Type details and press Enter to quickly add players without using the mouse.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-5">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Player Name</label>
                    <input
                        type="text"
                        value={playerName}
                        onChange={(event) => setPlayerName(event.target.value)}
                        onKeyDown={(event) => event.key === 'Enter' && handleAddPlayer()}
                        className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none ${inputError && !playerName ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                        placeholder="e.g. Sarah Smith"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Jersey #</label>
                    <input
                        type="number"
                        value={playerNumber}
                        onChange={(event) => setPlayerNumber(event.target.value)}
                        onKeyDown={(event) => event.key === 'Enter' && handleAddPlayer()}
                        className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none ${inputError && !playerNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                        placeholder="#"
                        min="0"
                        max="99"
                    />
                </div>
                <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Position (Opt)</label>
                    <select
                        value={playerPosition}
                        onChange={(event) => setPlayerPosition(event.target.value)}
                        onKeyDown={(event) => event.key === 'Enter' && handleAddPlayer()}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                        <option value="">Any</option>
                        <option value="Forward">Forward</option>
                        <option value="Midfielder">Mid</option>
                        <option value="Defender">Defense</option>
                        <option value="Goalkeeper">Goalie</option>
                    </select>
                </div>
                <div className="md:col-span-2">
                    <button
                        onClick={handleAddPlayer}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition shadow-sm"
                    >
                        {editingPlayerId ? 'Save Changes' : 'Add'}
                    </button>
                </div>
            </div>
        </div>

        <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex justify-between items-center">
                Current Roster <span className="text-sm bg-gray-200 text-gray-600 py-1 px-2 rounded-full">{players.length} Players</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {players.length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                        No players added yet. Use the form above to build your roster.
                    </div>
                )}
                {players.map(player => (
                    <div key={player.id} className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm relative group hover:border-blue-300 transition">
                        <div className="absolute top-2 right-2 flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition focus-within:opacity-100">
                            <button
                                onClick={() => handleEditPlayer(player.id)}
                                className="text-xs text-indigo-600 border border-indigo-200 px-2 py-0.5 rounded hover:bg-indigo-50"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleRemovePlayer(player.id)}
                                className="text-gray-400 hover:text-red-500"
                            >
                                <i className="fas fa-trash"></i>
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 text-blue-800 font-bold text-lg w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                                {player.number}
                            </div>
                            <div className="overflow-hidden">
                                <h4 className="font-bold text-gray-800 truncate" title={player.name}>{player.name}</h4>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">{player.position}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default RosterTab;
