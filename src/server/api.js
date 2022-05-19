const express = require('express');
const bodyParser = require('body-parser');

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/', (req, res, next) => res.json({ OK: true }));

/// TODO: Extract game logic and objects to a module
/// For now we will keep it here to make tests easier
const GameHandler = new (function () {
    let _ID = 0;
    const _NewID = () => (++_ID);
    const _Games = [];

    const NewGame = difficulty => {
        const id = _NewID();
        
        return _Games[id] = {
            id, difficulty,
            size: [10, 10],
            blocks: [],
        };
    }

    const HasGameID = id => (_Games[id] !== undefined) ? true : false;
    const GetGameByID = id => HasGameID(id) ? _Games[id] : null;

    this.NewGame = NewGame;
    this.HasGameID = HasGameID;
    this.GetGameByID = GetGameByID;
});

/// Create a new game
router.post('/new-game', (req, res, next) => {
    const { difficulty } = req.params;
    const { id, size } = GameHandler.NewGame(difficulty);
    res.json({ id, size, blocks: [] });
});

/// Make sure we receive a game ID
router.use((req, res, next) => {
    const { id } = req.params;

    if (!GameHandler.HasGameID(id)) {
        return res.status(401).json({ authorized: false });
    }

    next();
});

/// Open a block
router.post('/open-block', (req, res, next) => {
    const { id, block } = req.params;

    res.json({ type: 'number', value: 1, blocks: [], opened: true })
});

module.exports = router;
