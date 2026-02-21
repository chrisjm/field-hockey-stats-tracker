const PlayerModal = ({
    show,
    modalTitle,
    modalSubtitle,
    players,
    finalizeHomeEvent,
    closePlayerSelector
}) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex flex-col justify-end md:justify-center items-center">
            <div className="bg-white w-full md:w-3/4 max-w-2xl rounded-t-2xl md:rounded-xl p-4 md:p-6 shadow-2xl animate-slide-up transform transition-all">
                <div className="flex justify-between items-center mb-4 pb-2 border-b">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{modalTitle}</h2>
                        <p className="text-sm text-gray-500">{modalSubtitle}</p>
                    </div>
                    <button onClick={closePlayerSelector} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                        <i className="fas fa-times text-2xl"></i>
                    </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[60vh] overflow-y-auto p-1">
                    {players.map(player => (
                        <button
                            key={player.id}
                            onClick={() => finalizeHomeEvent(player.id)}
                            className="bg-gray-50 hover:bg-indigo-50 border-2 border-gray-200 hover:border-indigo-400 p-3 rounded-xl flex flex-col items-center justify-center transition focus:outline-none"
                        >
                            <span className="text-2xl font-black text-gray-800">{player.number}</span>
                            <span className="text-xs font-semibold text-gray-500 truncate w-full text-center mt-1">{player.name.split(' ')[0]}</span>
                        </button>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t flex justify-between">
                    <button
                        onClick={() => finalizeHomeEvent(null)}
                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition"
                    >
                        Skip / Unknown Player
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlayerModal;
