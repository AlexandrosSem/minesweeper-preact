const { difficulty, blockType, blockStatus, gameStatus } = require('./util-enum');

let _id = 0;
const _games = [];

/// Handler methods
const newId = () => (++_id);
const hasGameId = id => (_games[id] !== undefined) ? true : false;
const getGameById = id => hasGameId(id) ? _games[id] : null;

/// Game methods
const getSizeByDifficulty = difficulty => [10, 10, 3];
const getIndexBombs = size => [0, 11, 22, 33, 44, 55, 66, 77, 88, 99];
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
        .filter(i => i !== undefined);

    const totalSize = width * height;
    const lBomb = getIndexBombs(totalSize);
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
    new Set(
        lBomb.map(index => blocks[index])
            .map(block => getSiblings(block))
            .flat()
    ).forEach(block => {
        if (block.type === blockType.bomb) { return; }

        const tNumber = getSiblings(block)
            .map(block => (block.type === blockType.bomb) ? 1 : 0)
            .reduce((acc, number) => acc + number, 0);

        if (tNumber > 0) {
            block.type = blockType.number;
            block.value = tNumber.toString();
        }
    });

    const checkBlockBoundary = fn => {
        return index => {
            const block = blocks[index];
            if (!block) { throw new Error(`${index} is out of bounds`); }
            return fn(block, index);
        };
    };

    const getStatus = _ => status;
    const isBlockOpen = block => block.status === blockStatus.open;
    const isBlockFlag = block => block.status === blockStatus.flag;
    const isBlockInitial = block => block.status === blockStatus.initial;

    const openBlock = checkBlockBoundary(block => {
        if (!isBlockInitial(block)) { return null; }

        const { index, type, value } = block;
        return ({ index, type, value });
    });

    const flagBlock = checkBlockBoundary(block => {
        if (!isBlockInitial(block)) { return null; }

        block.status = blockStatus.flag;

        const { index } = block;
        return ({ index });
    });

    const toJSON = _ => ({
        id,
        difficulty,
        status,
        size: [ width, height ],
        blocks: blocks.filter(i => !isBlockInitial(i)).map(i => ({ ...i })),
    });

    const game = {
        openBlock,
        flagBlock,
        getStatus,
        toJSON,
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