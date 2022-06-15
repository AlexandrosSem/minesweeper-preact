/// Enums
const difficulty = Object.freeze({
    EASY: 'easy',
    NORMAL: 'normal',
    HARD: 'hard',
})

const blockType = Object.freeze({
    BOMB: 'bomb',
    NUMBER: 'number',
    BLANK: 'blank',
});

const blockStatus = Object.freeze({
    CLOSED: 'closed',
    OPEN: 'open',
    FLAG: 'flag',
})

const gameStatus = Object.freeze({
    STARTING: 'starting',
    RUNNING: 'running',
    WON: 'won',
    LOST: 'lost',
});

module.exports = {
    difficulty,
    blockType,
    blockStatus,
    gameStatus,
};
