import style from './style.css';
import { GameHeader } from '../gameHeader';
import { Difficulty as enumDifficulty, GameStatus as enumGameStatus } from 'server/src/util-enum';
import { Board } from '../board';
import { Debug } from '../debug';
import { useState, useEffect, useReducer } from 'preact/hooks';
import { encodeData, decodeData, ActionType } from 'common';

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
}

export const Game = () => {
    const [ data, setData ] = useState(null);
    const [ diff, setDiff ] = useState('normal');
    const [ reset, setReset ] = useState(false);
    const [ status, setStatus ] = useState('starting');
    const [ timer, setTimer ] = useState(0);
    const [ timerId, setTimerId ] = useState(0);
    const [ flags, setFlags ] = useState(0);
    const [ webSocket, setWebSocket ] = useState(null);
    const [ webSocketStatus, setWebSocketStatus ] = useState(false);
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

    useEffect(() => {
        if (!reset) { return; }

        fnInitializeCommunication();
    }, [ reset ]);

    useEffect(async () => {
        if ((!reset) || (!webSocketStatus)) { return; }

        const tSavedId = +localStorage.getItem('MinesweeperId');
        const tObj = await getData(tSavedId, diff);
        const tData = tObj.data;
        const tGameId = tData.id;
        if (tObj.setLocalStorage) { localStorage.setItem('MinesweeperId', tGameId); }

        setData(tData);
        const tSize = tData.size;
        dispatchBlockData({
            blockData: Array.from({ length: tSize[0] * tSize[1] }, (_, pIndex) => ({
                number: pIndex,
                status: 'closed',
                type: 'blank',
                value: '',
            })),
        });
        updateBoard(tData);
        const tNumberOfFlagsOnBoard = numberOfFlagsOnBoard(tData.blocks);
        setFlags(tData.flags - tNumberOfFlagsOnBoard);

        setTimer(0);
        clearInterval(timerId);
        const tTimerId = setInterval(async () => {
            const tTickData = await fnFetchTickData(tGameId);
            setTimer(tTickData.time);
            setStatus(mapServerToClientStatus(tTickData.gameStatus));
		}, 250);
        setTimerId(tTimerId);

		return () => { clearInterval(tTimerId); }
    }, [ reset, webSocketStatus ]);

    useEffect(() => {
        if (!reset) { return; }

        setReset(false);
    }, [ reset ]);

    const fnInitializeCommunication = () => {
        if (webSocket) { return; }

        const tSocket = new WebSocket('ws://localhost:8080/api');
        setWebSocket(tSocket);
        tSocket.addEventListener('open', (_pEvent) => setWebSocketStatus(true));
        tSocket.addEventListener('close', (_pEvent) => {
            setWebSocketStatus(false);
            setWebSocket(null);
        });
        tSocket.addEventListener('error', (pEvent) => console.log('WebSocket error:', pEvent));
    };

    const fnNormalizeDataByType = (pData, pType) => {
        const tData = decodeData(pData);
        if (tData.type !== pType) { return null; }

        return tData.data;
    };

    const fnGetResponseData = (pData, pType, pCallBack) => {
        const tResponse = fnNormalizeDataByType(pData, pType);
        if (!tResponse) { return; }

        pCallBack(tResponse);
    };

    const fnFetchData = (pDiff) => {
        return new Promise((resolve) => {
            const tType = ActionType.NEW_GAME;
            const tData = { difficulty: mapClientToServerDiff(pDiff) };
            const fnMessageAction = (pEvent) => {
                fnGetResponseData(pEvent.data, tType, (pResponse) => {
                    webSocket.removeEventListener('message', fnMessageAction);
                    resolve(pResponse);
                });
            };
            webSocket.addEventListener('message', fnMessageAction);
            webSocket.send(encodeData({ type: tType, data: tData }));
        });
    };

    const fnFetchOpenBlockData = (pNumber) => {
        return new Promise((resolve) => {
            const tType = ActionType.OPEN_BLOCK;
            const tData = { id: data.id, block: pNumber };
            const fnMessageAction = (pEvent) => {
                fnGetResponseData(pEvent.data, tType, (pResponse) => {
                    webSocket.removeEventListener('message', fnMessageAction);
                    resolve(pResponse);
                });
            };
            webSocket.addEventListener('message', fnMessageAction);
            webSocket.send(encodeData({ type: tType, data: tData }));
        });
    };

    const fnFetchFlagBlockData = (pNumber) => {
        return new Promise((resolve) => {
            const tType = ActionType.FLAG_BLOCK;
            const tData = { id: data.id, block: pNumber };
            const fnMessageAction = (pEvent) => {
                fnGetResponseData(pEvent.data, tType, (pResponse) => {
                    webSocket.removeEventListener('message', fnMessageAction);
                    resolve(pResponse);
                });
            };
            webSocket.addEventListener('message', fnMessageAction);
            webSocket.send(encodeData({ type: tType, data: tData }));
        });
    };

    const fnFetchTickData = (pId) => {
        return new Promise((resolve) => {
            const tType = ActionType.UPDATE_TICK;
            const tData = { id: pId };
            const fnMessageAction = (pEvent) => {
                fnGetResponseData(pEvent.data, tType, (pResponse) => {
                    webSocket.removeEventListener('message', fnMessageAction);
                    resolve(pResponse);
                });
            };
            webSocket.addEventListener('message', fnMessageAction);
            webSocket.send(encodeData({ type: tType, data: tData }));
        });
    };

    const fnFetchBoardRefresh = (pId) => {
        return new Promise((resolve) => {
            const tType = ActionType.BOARD_REFRESH;
            const tData = { id: pId };
            const fnMessageAction = (pEvent) => {
                fnGetResponseData(pEvent.data, tType, (pResponse) => {
                    webSocket.removeEventListener('message', fnMessageAction);
                    resolve(pResponse);
                });
            };
            webSocket.addEventListener('message', fnMessageAction);
            webSocket.send(encodeData({ type: tType, data: tData }));
        });
    }

    const fnFetchEndGameData = (pId) => {
        return new Promise((resolve) => {
            const tType = ActionType.END_GAME;
            const tData = { id: pId };
            const fnMessageAction = (pEvent) => {
                fnGetResponseData(pEvent.data, tType, (pResponse) => {
                    webSocket.removeEventListener('message', fnMessageAction);
                    resolve(pResponse);
                });
            };
            webSocket.addEventListener('message', fnMessageAction);
            webSocket.send(encodeData({ type: tType, data: tData }));
        });
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
