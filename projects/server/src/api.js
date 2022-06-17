const express = require('express');
const bodyParser = require('body-parser');
const { hasGameId, getGameById, newGame } = require('./gameHandler');

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/', (req, res, next) => res.json({ OK: true }));

/// TODO: Remove
router.get('/debug/:id', (req, res, next) => {
    const { id } = req.params;
    const { consoleLog } = req.query;
    const log = (...args) => (consoleLog !== '0') && console.log(...args);

    if (!hasGameId(id)) {
        return res.status(404).json({ notFound: true });
    }

    const { debugJSON } = getGameById(id);
    const json = debugJSON();

    const [ x, y ] = json.size;
    const cartesianToIndex = (w, h) => (h * x) + w;

    Array.from({ length: 16 }, () => log(''));
    log(`Status: ${json.status}`);
    log('');

    const _OpenClose = {
        'closed': [ '[', ']' ],
        'flag': [ '{', '}' ],
        'open': [ ':', ':' ],
    };

    for (let h = 0; h < y; h++) {

        const lLine = [];
        for (let w = 0; w < x; w++) {
            const index = cartesianToIndex(w, h);
            const block = json.blocks[index];
            const { isOpen, isFlag, type, value } = block;
            const status = isOpen
                ? 'open'
                : isFlag
                    ? 'flag'
                    : 'closed'

            const addCell = text => {
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
                const getNumberFromValue = value => value;
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
    const { id, size, flags, blocks } = toJSON();

    return res.json({ id, gameStatus: getStatus(), size, flags, time: getTime(), blocks, difficulty });
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

    const { getStatus, getTime, toJSON } = getGameById(id);
    const { size, flags, blocks, difficulty } = toJSON();

    return res.json({ id, gameStatus: getStatus(), size, flags, time: getTime(), blocks, difficulty });
});

/// Open a block
router.post('/open-block', (req, res, next) => {
    const { id, block: blockNumber } = req.body;

    const { openBlock, getStatus } = getGameById(id);
    const [ ok, block = {} ] = openBlock(blockNumber);
    const ret = { gameStatus: getStatus(), ok, blocks: [] };

    if (!ok) { return res.json(ret); }

    const { index, status, type, value } = block;
    return res.json({
        ...ret,
        blocks: [ { index, status, type, value } ],
    });
});

/// flag a block
router.post('/flag-block', (req, res, next) => {
    const { id, block: blockNumber } = req.body;

    const { flagBlock, getStatus } = getGameById(id);
    const [ ok, block ] = {} = flagBlock(blockNumber);
    const ret = { gameStatus: getStatus(), ok, blocks: [] };

    if (!ok) { return res.json(ret); }

    const { index, status, type, value } = block;
    return res.json({
        ...ret,
        blocks: [ { index, status, type, value } ],
    });
});

router.post('/update-tick', (req, res, next) => {
    const { id } = req.body;

    const { getStatus, getTime } = getGameById(id);

    return res.json({
        time: getTime(),
        gameStatus: getStatus(),
    });
});

module.exports = router;
