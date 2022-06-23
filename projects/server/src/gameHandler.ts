import { Difficulty, BlockType, BlockStatus, GameStatus } from './util-enum';

export type RespBlockOpen = {
    index: number,
    status: BlockStatus.OPEN,
    type: BlockType,
    value: number,
};

export type RespBlockFlag = {
    index: number,
    status: BlockStatus.CLOSED | BlockStatus.FLAG,
    type: null,
    value: null,
};

export type RespJSON = {
    id: number,
    difficulty: Difficulty,
    status: GameStatus,
    time: [ start: number, end: number ],
    size: [ width: number, height: number ],
    flags: number,
    blocks: Array<RespBlockOpen | RespBlockFlag>,
}

export type RespAction<T> = [ false ] | [ boolean, T, Array<T> ];
export type RespGame = {
    openBlock: (index: number) => RespAction<RespBlockOpen>,
    flagBlock: (index: number) => RespAction<RespBlockFlag>,
    getStatus: () => GameStatus,
    getTime: () => number,
    toJSON: () => RespJSON,
    debugJSON: () => Omit<RespJSON, 'blocks'> & { blocks: Array<GameBlock> },
}

type GameBlock = {
    index: number,
    x: number,
    y: number,
    isOpen: boolean,
    isFlag: boolean,
    type: BlockType,
    value: number,
};

type GameRun = {
    status: GameStatus,
    start: number,
    end: number,
};

type SiblingMask = Array<[ offsetX: -1 | 0 | 1, offsetY: -1 | 0 | 1 ]>;

const getSizeByDifficulty = (diff: Difficulty): [ width: number, height: number, bombs: number ] => {
    switch (diff) {
        case Difficulty.EASY:
            return [9, 9, 10];
            break;
        case Difficulty.NORMAL:
            return [16, 16, 40];
            break;
        case Difficulty.HARD:
            return [30, 16, 99];
            break;
        default:
            throw new Error(`Invalid difficulty ${diff}`);
            break;
    }
};
const getIndexBombs = (size: number, numBombs: number): Array<number> => {
    const getRandomInt = () => Math.floor(Math.random() * size);
    const _newIndex = function*() {
        const lIndex: Set<number> = new Set([]);

        while (true) {
            const tIndex = getRandomInt();
            if (lIndex.has(tIndex)) { continue; }
            lIndex.add(tIndex);
            yield tIndex;
        }
    }

    const newIndex = _newIndex();
    const getNewIndex = () => newIndex.next().value;
    return Array.from({ length: numBombs }, getNewIndex);
}

const indexToCartesianBuilder = (width: number) => (index: number): [ x: number, y: number ] => [ index % width, Math.floor(index / width) ];
const cartesianToIndexBuilder = (width: number) => (x: number, y: number) => (y * width) + x;

const siblingMatrixSquare: SiblingMask = [
    [-1, -1], [+0, -1], [+1, -1],
    [-1, +0], /*     */ [+1, +0],
    [-1, +1], [+0, +1], [+1, +1],
];

const siblingMatrixCross: SiblingMask = [
    /*     */ [+0, -1] /*     */,
    [-1, +0], /*     */ [+1, +0],
    /*     */ [+0, +1] /*     */,
];

let _id = 0;
const _games: Array<RespGame> = [];
const newId = () => (++_id);
export const hasGameId = (id: number) => (_games[id] !== undefined) ? true : false;
export const getGameById = (id: number) => hasGameId(id) ? _games[id] : null;
export const newGame = (difficulty: Difficulty) => {
    const id = newId();
    const [ width, height, numBombs ] = getSizeByDifficulty(difficulty);
    const totalSize = width * height;
    const lBomb = getIndexBombs(totalSize, numBombs);

    const indexToCartesian = indexToCartesianBuilder(width);
    const cartesianToIndex = cartesianToIndexBuilder(width);
    const getSiblings = ({ x, y }: GameBlock, siblingMask: SiblingMask = siblingMatrixSquare): Array<GameBlock> => {
        return siblingMask
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
    }

    const blocks: Array<GameBlock> = Array.from({ length: totalSize }, (_, index) => indexToCartesian(index))
        .map(([x, y], index) => ({
            index,
            x,
            y,
            isOpen: false,
            isFlag: false,
            type: lBomb.includes(index) ? BlockType.BOMB : BlockType.BLANK,
            value: 0,
        }));

    /// Populate numbers
    lBomb.forEach(index => {
        const block = blocks[index];
        getSiblings(block).filter(block => !lBomb.includes(block.index))
            .forEach(block => {
                block.type = BlockType.NUMBER;
                if (typeof block.value !== 'number') { block.value = 0; }
                block.value++;
            });
    });

    const gameRun: GameRun = {
        status: GameStatus.STARTING,
        start: 0,
        end: 0,
    };

    const getStatus = () => gameRun.status;
    const getTime = () => isGameRunning()
        ? (new Date().getTime() - gameRun.start)
        : isGameDone()
            ? (gameRun.end - gameRun.start)
            : 0;
    const startGame = () => void Object.assign(gameRun, {
        start: new Date().getTime(),
        status: GameStatus.RUNNING
    });
    const endGame = (isWin: boolean) => void Object.assign(gameRun, {
        end: new Date().getTime(),
        status: (isWin ? GameStatus.WON : GameStatus.LOST),
    });
    const isGameRunning = (): boolean => (gameRun.status === GameStatus.RUNNING);
    const isGameDone = (): boolean => ([ GameStatus.WON, GameStatus.LOST ].includes(gameRun.status));

    const checkBlockBoundary = <T>(fn: (block: GameBlock, index: number) => T) => (index: number) => {
        const block = blocks[index];
        if (!block) { throw new Error(`${index} is out of bounds`); }
        return fn(block, index);
    };

    const isBlockOpen = ({ isOpen }: GameBlock) => (isOpen === true);
    const isBlockFlag = ({ isFlag }: GameBlock) => (isFlag === true);

    const openBlock = checkBlockBoundary<ReturnType<RespGame["openBlock"]>>(block => {
        if (isGameDone()) { return [ false ]; }
        if (isBlockOpen(block)) { return [ false ]; }
        if (isBlockFlag(block)) { return [ false ]; }
        /// Start the game on the first block
        if (!isGameRunning()) { startGame(); }

        const { index, type, value } = block;
        const status = BlockStatus.OPEN;

        Object.assign(block, { isOpen: true });

        const siblings: Array<RespBlockOpen> = [];
        if (type === BlockType.BLANK) {
            const _siblings = getSiblings(block, siblingMatrixCross)
                .filter(block => (block.type === BlockType.BLANK) && !isBlockOpen(block) && !isBlockFlag(block));

            for (const sibling of _siblings) {
                const [ ok, _, deepSiblings ] = openBlock(sibling.index);
                if (!ok) { continue; }

                const { index, type, value } = sibling;
                siblings.push({ index, status, type, value }, ...deepSiblings);
            }
        }

        /// Check for win / lose conditions
        if (type === BlockType.BOMB) {
            endGame(false);
        } else if (blocks.filter(block => block.type !== BlockType.BOMB).every(block => isBlockOpen(block))) {
            endGame(true);
        }

        return [ true, { index, status, type, value }, siblings ];
    });

    const flagBlock = checkBlockBoundary<ReturnType<RespGame["flagBlock"]>>(block => {
        if (isGameDone()) { return [ false ]; }
        /// Start the game on the first block
        if (!isGameRunning()) { startGame(); }

        const { index } = block;
        const isFlag = !isBlockFlag(block);
        const status = isFlag ? BlockStatus.FLAG : BlockStatus.CLOSED;

        Object.assign(block, { isFlag });
        const siblings: Array<RespBlockFlag> = [];

        return [ true, { index, status, type: null, value: null }, siblings ];
    });

    const toJSON: RespGame["toJSON"] = () => ({
        id,
        difficulty,
        status: gameRun.status,
        time: [ gameRun.start, gameRun.end ],
        size: [ width, height ],
        flags: numBombs,
        blocks: blocks
            .filter(i => isBlockOpen(i) || isBlockFlag(i))
            .map(block => {
                const { index, isFlag, type, value } = block;

                if (isFlag) {
                    return { index, status: BlockStatus.FLAG, type: null, value: null};
                }

                return { index, status: BlockStatus.OPEN, type, value };
            }),
    });

    const debugJSON: RespGame["debugJSON"] = () => ({
        ...toJSON(),
        blocks: blocks.map(i => ({ ...i })),
    })

    const game: RespGame = {
        openBlock,
        flagBlock,
        getStatus,
        getTime,
        toJSON,
        debugJSON,
    };

    _games[id] = game;
    return game;
};
