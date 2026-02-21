export const emptyStats = () => ({
    goals: 0,
    assists: 0,
    shots: 0,
    saves: 0,
    turnovers: 0,
    fouls: 0,
    penaltyCorners: 0,
    greenCards: 0,
    yellowCards: 0,
    redCards: 0
});

export const formatStatType = (statType) => ({
    goal: 'Goal',
    assist: 'Assist',
    shot: 'Shot',
    save: 'Save',
    turnover: 'Turnover',
    foul: 'Foul',
    'penalty-corner': 'Penalty Corner',
    'green-card': 'Green Card',
    'yellow-card': 'Yellow Card',
    'red-card': 'Red Card'
}[statType] || statType);

export const getStatKey = (statType) => ({
    goal: 'goals',
    assist: 'assists',
    shot: 'shots',
    save: 'saves',
    turnover: 'turnovers',
    foul: 'fouls',
    'penalty-corner': 'penaltyCorners',
    'green-card': 'greenCards',
    'yellow-card': 'yellowCards',
    'red-card': 'redCards'
}[statType] || statType);

export const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const parseTimeInput = (value) => {
    if (!value) return null;
    const trimmed = value.trim();
    const match = trimmed.match(/^(\d{1,3})(?::([0-5]?\d))?$/);
    if (!match) return null;
    const minutes = parseInt(match[1], 10);
    const seconds = match[2] ? parseInt(match[2], 10) : 0;
    if (Number.isNaN(minutes) || Number.isNaN(seconds)) return null;
    return minutes * 60 + seconds;
};
