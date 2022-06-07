const { difficulty, blockType, blockStatus, gameStatus } = require('./util-enum');

let _id = 0;
const _games = [];

/// Handler methods
const newId = () => (++_id);
const hasGameId = id => (_games[id] !== undefined) ? true : false;
const getGameById = id => hasGameId(id) ? _games[id] : null;

/// Game methods
const getSizeByDifficulty = diff => {
    switch (diff) {
        case difficulty.easy:
            return [9, 9, 10];
            break;
        case difficulty.normal:
            return [16, 16, 40];
            break;
        case difficulty.hard:
            return [30, 16, 99];
            break;
        default:
            throw new Error(`Invalid difficulty ${diff}`);
            break;
    }
};
const getIndexBombs = (size, numBombs) => {
    const getRandomInt = _ => Math.floor(Math.random() * size);
    const _newIndex = function*() {
        const lIndex = new Set([]);

        while (true) {
            const tIndex = getRandomInt();
            if (lIndex.has(tIndex)) { continue; }
            lIndex.add(tIndex);
            yield tIndex;
        }
    }

    const newIndex = _newIndex();
    const getNewIndex = _ => newIndex.next().value;
    return Array.from({ length: numBombs }, getNewIndex);
}
const indexToCartesianBuilder = width => (index) => [ index % width, Math.floor(index / width) ];
const cartesianToIndexBuilder = width => (x, y) => (y * width) + x;
const getSiblingMatrix = () => [
        [-1, -1], [+0, -1], [+1, -1],
        [-1, +0],           [+1, +0],
        [-1, +1], [+0, +1], [+1, +1],
    ];

const newGame = difficulty => {
    const id = newId();
    const [ width, height, numBombs ] = getSizeByDifficulty(difficulty);
    let status = gameStatus.starting;

    const indexToCartesian = indexToCartesianBuilder(width);
    const cartesianToIndex = cartesianToIndexBuilder(width);

    const getSiblings = ({ x, y }) => getSiblingMatrix()
        .map(([ offsetX, offsetY ]) => cartesianToIndex(x + offsetX, y + offsetY))
        .map(index => blocks[index])
        .filter(i => i !== undefined)
        .filter(block => {
            const { x: blockX } = block;

            /// Check for board boundaries
            if ((x === 0) && (blockX === 15)) { return false; }
            if ((x === 15) && (blockX === 0)) { return false; }
            return true;
        });

    const totalSize = width * height;
    const lBomb = getIndexBombs(totalSize, numBombs);
    const blocks = Array.from({ length: totalSize }, (_, index) => indexToCartesian(index))
        .map(([x, y], index) => ({
            index,
            x,
            y,
            status: blockStatus.initial,
            type: lBomb.includes(index) ? blockType.bomb : blockType.blank,
            value: '',
        }));

    /// Populate numbers
    lBomb.forEach(index => {
        const block = blocks[index];
        getSiblings(block).filter(block => !lBomb.includes(block.index))
            .forEach(block => {
                block.type = blockType.number;
                if (typeof block.value !== 'number') { block.value = 0; }
                block.value++;
            });
    });

    const checkBlockBoundary = fn => {
        return index => {
            const block = blocks[index];
            if (!block) { throw new Error(`${index} is out of bounds`); }
            return fn(block, index);
        };
    };

    const getStatus = _ => status;
    const setStatus = pStatus => { status = pStatus };
    const isBlockOpen = block => block.status === blockStatus.open;
    const isBlockFlag = block => block.status === blockStatus.flag;
    const isBlockInitial = block => block.status === blockStatus.initial;
    const isWinner = () => (getStatus() === gameStatus.won);
    const isLoser = () => (getStatus() === gameStatus.lost);
    const isGameRunning = () => (getStatus() === gameStatus.running);
    const isGameDone = () => (isWinner() || isLoser());

    const openBlock = checkBlockBoundary(block => {
        if (isGameDone()) { return [ false ]; }
        if (!isBlockInitial(block)) { return [ false ]; }

        const { index, type, value } = block;

        /// Start the game on the first block
        if (!isGameRunning()) { setStatus(gameStatus.running); }
        Object.assign(block, { status:  blockStatus.open });
        /// Check for win / lose conditions
        if (type === blockType.bomb) {
            setStatus(gameStatus.lost);
        } else if (blocks.filter(block => block.type !== blockType.bomb).every(block => block.status === blockStatus.open)) {
            setStatus(gameStatus.won);
        }

        return [ true, { index, type, value } ];
    });

    const flagBlock = checkBlockBoundary(block => {
        if (isGameDone()) { return [ false ]; }
        if (!isBlockInitial(block)) { return [ false ]; }

        const { index } = block;

        /// Start the game on the first block
        if (!isGameRunning()) { setStatus(gameStatus.running); }
        Object.assign(block, { status:  blockStatus.flag });

        return [ true, { index } ];
    });

    const toJSON = _ => ({
        id,
        difficulty,
        status,
        size: [ width, height ],
        flags: numBombs,
        blocks: blocks.filter(i => !isBlockInitial(i)).map(i => ({ ...i })),
    });

    /// TODO: Remove
    const debugJSON = _ => ({
        id,
        difficulty,
        status,
        size: [ width, height ],
        blocks: blocks.map(i => ({ ...i })),
    })

    const game = {
        openBlock,
        flagBlock,
        getStatus,
        toJSON,
        debugJSON,
    };

    _games[id] = game;
    return game;
};

module.exports = {
    difficulty,
    blockType,
    blockStatus,
    gameStatus,
    hasGameId,
    newGame,
    getGameById,
};