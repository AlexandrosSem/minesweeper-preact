import style from './style.css';
import { GameHeader } from '../gameHeader';
import { Difficulty as enumDifficulty, GameStatus as enumGameStatus, ActionType, WebSocketManager } from 'common';
import { Board } from '../board';
import { Debug } from '../debug';
import { useState, useEffect, useReducer } from 'preact/hooks';

/// TODO: i need to perform tests when server have sockets
const mapClientToServerDiff = pDiff => {
    const { EASY, NORMAL, HARD } = enumDifficulty;
    if (pDiff === 'easy') { return EASY; }
    else if (pDiff === 'hard') { return HARD; }

    return NORMAL;
};

const mapServerToClientStatus = pStatus => {
    const { RUNNING, WON, LOST } = enumGameStatus;
    if (pStatus === RUNNING) { return 'running'; }
    else if (pStatus === WON) { return 'won'; }
    else if (pStatus === LOST) { return 'lost'; }

    return 'starting';
};

export const Game = () => {
    const [ data, setData ] = useState(null);
    const [ diff, setDiff ] = useState('normal');
    const [ reset, setReset ] = useState(false);
    const [ status, setStatus ] = useState('starting');
    const [ timer, setTimer ] = useState(0);
    const [ timerId, setTimerId ] = useState(0);
    const [ flags, setFlags ] = useState(0);
    const [ webSocketManager, setWebSocketManager ] = useState(null);
    const [ blockData, dispatchBlockData ] = useReducer((pState, pData) => {
        const tBlockData = pData.blockData;
        if (tBlockData) { return tBlockData; }

        const tIndex = pData.index;
        pState[tIndex] = { ...pState[tIndex], ...pData.options };

        return [ ...pState ];
    }, null);

    useEffect(() => {
        setReset(true);
    }, [ diff ]);

    useEffect(async () => {
        if ((!reset) || webSocketManager) { return; }

        await fnInitializeCommunication();
    }, [ reset ]);

    useEffect(async () => {
        if ((!reset) || (!webSocketManager)) { return; }

        const tSavedId = +localStorage.getItem('MinesweeperId');
        const tObj = await getData(tSavedId, diff);
        const tData = tObj.data;
        if (tObj.setLocalStorage) { localStorage.setItem('MinesweeperId', tData.id); }

        setData(tData);
    }, [ reset, webSocketManager ]);

    useEffect(() => {
        if (!data) { return; }

        const tSize = data.size;
        dispatchBlockData({
            blockData: Array.from({ length: tSize[0] * tSize[1] }, (_, pIndex) => ({
                number: pIndex,
                status: 'closed',
                type: 'blank',
                value: '',
            })),
        });
    }, [ data ]);

    useEffect(() => {
        if (!data) { return; }

        updateBoard(data);
    }, [ data ]);

    useEffect(() => {
        if (!data) { return; }

        setFlags(data.flags - numberOfFlagsOnBoard(data.blocks));
    }, [ data ]);

    useEffect(() => {
        if (!data) { return; }
        
        setTimer(0);
        clearInterval(timerId);
        const tTimerId = setInterval(async () => {
            const tTickData = await fnFetchTickData(data.id);
            setTimer(tTickData.time);
            setStatus(mapServerToClientStatus(tTickData.gameStatus));
		}, 250);
        setTimerId(tTimerId);

		return () => { clearInterval(tTimerId); }
    }, [ data ]);

    useEffect(() => {
        if (!reset) { return; }

        setReset(false);
    }, [ reset ]);

    const fnInitializeCommunication = async () => {
        const tWebSocketManager = new WebSocketManager('ws://localhost:8080/api');
        await tWebSocketManager.ready();
        setWebSocketManager(tWebSocketManager);
    };

    const fnFetchData = (pDiff) => {
        const tType = ActionType.NEW_GAME;
        const tData = { difficulty: mapClientToServerDiff(pDiff) };
        return webSocketManager.requestData({ type: tType, data: tData });
    };

    const fnFetchOpenBlockData = (pNumber) => {
        const tType = ActionType.OPEN_BLOCK;
        const tData = { id: data.id, block: pNumber };
        return webSocketManager.requestData({ type: tType, data: tData });
    };

    const fnFetchFlagBlockData = (pNumber) => {
        const tType = ActionType.FLAG_BLOCK;
        const tData = { id: data.id, block: pNumber };
        return webSocketManager.requestData({ type: tType, data: tData });
    };

    const fnFetchTickData = (pId) => {
        const tType = ActionType.UPDATE_TICK;
        const tData = { id: pId };
        return webSocketManager.requestData({ type: tType, data: tData });
    };

    const fnFetchBoardRefresh = (pId) => {
        const tType = ActionType.BOARD_REFRESH;
        const tData = { id: pId };
        return webSocketManager.requestData({ type: tType, data: tData });
    }

    const fnFetchEndGameData = (pId) => {
        const tType = ActionType.END_GAME;
        const tData = { id: pId };
        return webSocketManager.requestData({ type: tType, data: tData });
    };

    const endGame = async () => {
        const tData = await fnFetchEndGameData(data.id);
        if (tData.authorized === false) { return; }
        
        updateBoard(tData);
    };

    const updateBoard = (pData) => {
        processBlockData(pData.blocks);
        setStatus(mapServerToClientStatus(pData.gameStatus));
    };

    const numberOfFlagsOnBoard = (pData) => pData.filter(pItem => (pItem.status === 'flag')).length;

    const getData = async (pId, pDiff) => {
        let tData = null;
        let tSetLocalStorage = false;
        const fnFetchNewGame = () => {
            tSetLocalStorage = true;
            return fnFetchData(pDiff);
        };

        if (pId) {
            tData = await fnFetchBoardRefresh(pId);
            /// Recover the app if the id not found
            /// We need to find a better way of course
            if (tData.authorized === false) {
                localStorage.removeItem('MinesweeperId');
                tData = await fnFetchNewGame();
            }
        } else {
            tData = await fnFetchNewGame();
        }

        return { data: tData, setLocalStorage: tSetLocalStorage };
    };

    const changeDifficulty = (pDiff) => {
        setDiff(pDiff);
        setReset(true);
        localStorage.removeItem('MinesweeperId');
    };

    const processBlockData = (pData) => {
        pData.forEach(pItem => {
            dispatchBlockData({
                index: pItem.index,
                options: {
                    status: pItem.status,
                    type: pItem.type,
                    value: pItem.value,
                },
            });
        });
    };

    const handleSquareNormalClick = async (pNumber, pIsFlagged) => {
        if (pIsFlagged) { return; }

        const tData = await fnFetchOpenBlockData(pNumber);
        updateBoard(tData);
    };

    const handleSquareControlPlusClick = async (pNumber) => {
        const tData = await fnFetchFlagBlockData(pNumber);

        tData.blocks.forEach(pItem => {
            const tBlockStatus = pItem.status;
            dispatchBlockData({
                index: pItem.index,
                options: {
                    status: tBlockStatus,
                },
            });

            if (tBlockStatus === 'closed') { setFlags(flags + 1); }
            else if (tBlockStatus === 'flag') { setFlags(flags - 1); }
        });

        setStatus(mapServerToClientStatus(tData.gameStatus));
    };

    const handleSquareClick = async (pNumber, pIsClickedWithControl = false) => {
        if ([ 'won', 'lost' ].includes(status)) { return; }

        const tBlock = blockData.find(pItem => pItem.number === pNumber);
        const tBlockStatus = tBlock.status;
        if (tBlockStatus === 'open') { return; }

        const tIsFlagged = (tBlockStatus === 'flag');
        const tIsNormalClick = !pIsClickedWithControl;

        if (tIsNormalClick) {
            await handleSquareNormalClick(pNumber, tIsFlagged);
        } else {
            await handleSquareControlPlusClick(pNumber);
        }
    };

    if (!blockData) return <div class={style.game}>Loading...</div>
    
    return (
        <div class={style.game}>
            <GameHeader onChangeDifficulty={(pDiff) => changeDifficulty(pDiff)} reset={reset} flags={flags} timer={timer} onClickGiveUp={() => endGame()}></GameHeader>
            <Board onClick={(pNumber, pIsClickedWithControl) => handleSquareClick(pNumber, pIsClickedWithControl)} blockData={blockData} numberOfRows={data.size[1]} numberOfCols={data.size[0]}></Board>
            <Debug data={data} onSquareClick={handleSquareClick}></Debug>
        </div>
    );
};
