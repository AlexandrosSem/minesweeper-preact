import express, { Request } from 'express';
import bodyParser from 'body-parser';
import { hasGameId, getGameById, newGame } from './gameHandler';
import { Server } from 'ws';

export const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/', (req, res, next) => res.json({ OK: true }));

/// TODO: Remove
router.get('/debug/:id', (req: Request<{id: number}>, res, next) => {
    const { id } = req.params;
    const { consoleLog } = req.query;
    const log = (consoleLog !== '0')
        ? (...args: Array<any>): void => { console.log(...args) }
        : () => {};

    if (!hasGameId(id)) {
        return res.status(404).json({ notFound: true });
    }

    const game = getGameById(id);
    if (!game) { return next(); }

    const { debugJSON } = game;
    const json = debugJSON();

    const [ x, y ] = json.size;
    const cartesianToIndex = (w: number, h: number): number => (h * x) + w;

    Array.from({ length: 16 }, () => log(''));
    log(`Status: ${json.status}`);
    log('');

    const _OpenClose = {
        'closed': [ '[', ']' ],
        'flag': [ '{', '}' ],
        'open': [ ':', ':' ],
    };

    for (let h = 0; h < y; h++) {

        const lLine: Array<string> = [];
        for (let w = 0; w < x; w++) {
            const index = cartesianToIndex(w, h);
            const block = json.blocks[index];
            const { isOpen, isFlag, type, value } = block;
            const status = isOpen
                ? 'open'
                : isFlag
                    ? 'flag'
                    : 'closed'

            const addCell = (text: string): void => {
                const [ open, close ] = _OpenClose[status];
                lLine.push(open + text + close);
            }

            if (type === 'bomb') {
                addCell('💥');
                continue;
            }
            if (type === 'blank') {
                addCell('  ');
                continue;
            }
            if (type === 'number') {
                const getNumberFromValue = (value: number): number => value;
                addCell(' ' + getNumberFromValue(value));
                continue;
            }
        }

        log(`${lLine.join(' ')}`);
    }

    res.json(json);
});

/// Create a new game
router.post('/new-game', (req, res, next) => {
    const { difficulty } = req.body;

    const { getStatus, getTime, toJSON } = newGame(difficulty);
    const { id, size, flags } = toJSON();

    return res.json({ id, gameStatus: getStatus(), size, flags, time: getTime(), blocks: [], difficulty });
});

/// Create a new game
router.post('/has-game', (req, res, next) => {
    const { id } = req.body;

    res.json({ exists: hasGameId(id) });
});

/// Make sure we receive a game ID
router.use((req, res, next) => {
    const { id } = req.body;

    if (!hasGameId(id)) {
        return res.status(401).json({ authorized: false });
    }

    next();
});

router.post('/board-refresh', (req, res, next) => {
    const { id } = req.body;

    const game = getGameById(id);
    if (!game) { return next(); }

    const { getStatus, getTime, toJSON } = game;
    const { size, flags, blocks, difficulty } = toJSON();

    return res.json({ id, gameStatus: getStatus(), size, flags, time: getTime(), blocks, difficulty });
});

/// Open a block
router.post('/open-block', (req, res, next) => {
    const { id, block: blockNumber } = req.body;

    const game = getGameById(id);
    if (!game) { return next(); }

    const { openBlock, getStatus } = game;
    const [ ok, block, siblings ] = openBlock(blockNumber);
    const ret = { gameStatus: getStatus(), ok, blocks: [] };

    if (!ok) { return res.json(ret); }

    const { index, status, type, value } = block;
    return res.json({
        ...ret,
        blocks: [
            { index, status, type, value },
            ...siblings,
        ],
    });
});

/// flag a block
router.post('/flag-block', (req, res, next) => {
    const { id, block: blockNumber } = req.body;

    const game = getGameById(id);
    if (!game) { return next(); }

    const { flagBlock, getStatus } = game;
    const [ ok, block, siblings ] = {} = flagBlock(blockNumber);
    const ret = { gameStatus: getStatus(), ok, blocks: [] };

    if (!ok) { return res.json(ret); }

    const { index, status, type, value } = block;
    return res.json({
        ...ret,
        blocks: [
            { index, status, type, value },
            ...siblings,
        ],
    });
});

router.post('/update-tick', (req, res, next) => {
    const { id } = req.body;

    const game = getGameById(id);
    if (!game) { return next(); }

    const { getStatus, getTime } = game;

    return res.json({
        time: getTime(),
        gameStatus: getStatus(),
    });
});


export const handleWSS = (wss: Server) => {
    wss.on('connection', (ws) => {
        console.log('Connection');
        console.log('Size', wss.clients.size);

        ws.on('message', (msg) => {
            ws.send(msg);
        }).on('close', () => {
            console.log('close');
            console.log('Size', wss.clients.size);
        });

    });
};
