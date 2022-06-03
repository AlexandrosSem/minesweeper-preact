const express = require('express');
const bodyParser = require('body-parser');
const gameHandler = require('./gameHandler');

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/', (req, res, next) => res.json({ OK: true }));

/// TODO: Remove
router.get('/debug/:id', (req, res, next) => {
    const { id } = req.params;

    if (!gameHandler.hasGameId(id)) {
        return res.status(404).json({ notFound: true });
    }

    const game = gameHandler.getGameById(id);
    const json = game.debugJSON();

    const [ x, y ] = json.size;
    const cartesianToIndex = (w, h) => (h * x) + w;

    Array.from({ length: 16 }, () => console.log(''));

    const _OpenClose = {
        'initial': [ '[', ']' ],
        'flag': [ '{', '}' ],
        'open': [ ':', ':' ],
        '#': [ '#', '#' ],
    }

    for (let h = 0; h < y; h++) {

        const lLine = [];
        for (let w = 0; w < x; w++) {
            const index = cartesianToIndex(w, h);
            const block = json.blocks[index];
            const { status, type, value } = block;
            const addCell = text => {
                const [ open, close ] = _OpenClose[status] ?? _OpenClose['#'];
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
                addCell(' ' + value);
                continue;
            }
        }

        console.log(`${lLine.join(' ')}`);
    }

    res.json(json);
})

/// Create a new game
router.post('/new-game', (req, res, next) => {
    const { difficulty } = req.body;
    const game = gameHandler.newGame(difficulty);
    res.json(game.toJSON());
});

/// Make sure we receive a game ID
router.use((req, res, next) => {
    const { id } = req.body;

    if (!gameHandler.hasGameId(id)) {
        return res.status(401).json({ authorized: false });
    }

    next();
});

/// Open a block
router.post('/open-block', (req, res, next) => {
    const { id, block } = req.body;
    const game = gameHandler.getGameById(id);
    const gameStatus = game.status;

    const _block = game.openBlock(block);
    if (!_block) {
        return res.json({
            gameStatus,
            ok: false,
            blocks: [],
        });
    }

    const { index, type, value } = _block;
    return res.json({
        gameStatus,
        ok: true,
        blocks: [ { index, type, value } ]
    });
});

/// flag a block
router.post('/flag-block', (req, res, next) => {
    const { id, block } = req.body;
    const game = gameHandler.getGameById(id);

    const _block = game.flagBlock(block);
    if (!_block) {
        return res.json({
            gameStatus,
            ok: false,
            blocks: [],
        });
    }

    const { index } = _block;
    return res.json({
        gameStatus,
        ok: true,
        blocks: [ { index } ]
    });
});

module.exports = router;
