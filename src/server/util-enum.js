/// Enums
const difficulty = Object.freeze({
    easy: 'easy',
    normal: 'normal',
    hard: 'hard',
})

const blockType = Object.freeze({
    bomb: 'bomb',
    number: 'number',
    blank: 'blank',
});

const blockStatus = Object.freeze({
    initial: 'initial',
    open: 'open',
    flag: 'flag',
})

const gameStatus = Object.freeze({
    starting: 'starting',
    running: 'running',
    won: 'won',
    lost: 'lost',
});

module.exports = {
    difficulty,
    blockType,
    blockStatus,
    gameStatus,
};
