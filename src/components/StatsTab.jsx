const StatsTab = ({
    statsFilter,
    setStatsFilter,
    games,
    summaryStats,
    playerStatsRows,
    players,
    handleExportStats
}) => (
    <section>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-bold text-gray-800">Team Statistics</h2>
            <div className="flex w-full md:w-auto gap-2">
                <select
                    value={statsFilter}
                    onChange={(event) => setStatsFilter(event.target.value)}
                    className="flex-1 md:w-48 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                >
                    <option value="all">All Games</option>
                    {games.map(game => (
                        <option key={game.id} value={game.id}>{new Date(game.gameDate).toLocaleDateString()} vs {game.awayTeam}</option>
                    ))}
                </select>
                <button
                    onClick={handleExportStats}
                    className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded shadow transition text-sm font-semibold flex items-center whitespace-nowrap"
                >
                    <i className="fas fa-download mr-2"></i> Export
                </button>
            </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 text-white shadow-md">
                <p className="text-indigo-100 text-sm font-semibold mb-1 uppercase tracking-wide">Games Played</p>
                <p className="text-3xl font-bold">{summaryStats.totalGames}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-md">
                <p className="text-green-100 text-sm font-semibold mb-1 uppercase tracking-wide">Our Goals</p>
                <p className="text-3xl font-bold">{summaryStats.totalGoals}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-md">
                <p className="text-blue-100 text-sm font-semibold mb-1 uppercase tracking-wide">Total Assists</p>
                <p className="text-3xl font-bold">{summaryStats.totalAssists}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-md">
                <p className="text-purple-100 text-sm font-semibold mb-1 uppercase tracking-wide">Win Rate</p>
                <p className="text-3xl font-bold">{summaryStats.winRate}%</p>
            </div>
        </div>

        <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Player Statistics</h3>
            <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Player</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Goals</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Assists</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pts</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Shots</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Saves</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {players.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">No players on roster</td>
                            </tr>
                        )}
                        {players.length > 0 && playerStatsRows.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">No data available</td>
                            </tr>
                        )}
                        {playerStatsRows.map(player => (
                            <tr key={player.name} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="shrink-0 h-8 w-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-bold text-xs mr-3 border">{player.number}</div>
                                        <div className="text-sm font-medium text-gray-900">{player.name}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{player.goals}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.assists}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-bold bg-indigo-50/50">{player.points}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.shots}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.saves}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </section>
);

export default StatsTab;
