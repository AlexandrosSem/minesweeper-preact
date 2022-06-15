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
        case difficulty.EASY:
            return [9, 9, 10];
            break;
        case difficulty.NORMAL:
            return [16, 16, 40];
            break;
        case difficulty.HARD:
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
    let status = gameStatus.STARTING;

    const getStatus = _ => status;
    const startGame = () => { status = gameStatus.RUNNING };
    const endGame = (isWin) => { status = isWin ? gameStatus.WON : gameStatus.LOST; };
    const isGameRunning = () => (status === gameStatus.RUNNING);
    const isGameDone = () => ([ gameStatus.WON, gameStatus.LOST ].includes(status));

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
            isOpen: false,
            isFlag: false,
            type: lBomb.includes(index) ? blockType.BOMB : blockType.BLANK,
            value: '',
        }));

    /// Populate numbers
    lBomb.forEach(index => {
        const block = blocks[index];
        getSiblings(block).filter(block => !lBomb.includes(block.index))
            .forEach(block => {
                block.type = blockType.NUMBER;
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

    const isBlockOpen = block => (block.isOpen === true);
    const isBlockFlag = block => (block.isFlag === true);

    const openBlock = checkBlockBoundary(block => {
        if (isGameDone()) { return [ false ]; }
        if (isBlockOpen(block)) { return [ false ]; }
        if (isBlockFlag(block)) { return [ false ]; }
        /// Start the game on the first block
        if (!isGameRunning()) { startGame(); }

        const { index, type, value } = block;
        const status = blockStatus.OPEN;

        Object.assign(block, { isOpen: true });
        /// Check for win / lose conditions
        if (type === blockType.BOMB) {
            endGame(false);
        } else if (blocks.filter(block => block.type !== blockType.BOMB).every(block => isBlockOpen(block))) {
            endGame(true);
        }

        return [ true, { index, status, type, value } ];
    });

    const flagBlock = checkBlockBoundary(block => {
        if (isGameDone()) { return [ false ]; }
        /// Start the game on the first block
        if (!isGameRunning()) { startGame(); }

        const { index } = block;
        const isFlag = !isBlockFlag(block);
        const status = isFlag ? blockStatus.FLAG : blockStatus.CLOSED;

        Object.assign(block, { isFlag });

        return [ true, { index, status, type: null, value: null } ];
    });

    const toJSON = _ => ({
        id,
        difficulty,
        status,
        size: [ width, height ],
        flags: numBombs,
        blocks: blocks.filter(i => isBlockOpen(i)).map(i => ({ ...i })),
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
    hasGameId,
    newGame,
    getGameById,
};