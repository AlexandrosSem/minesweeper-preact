import style from './style.css';
import { GameHeader } from '../gameHeader';
import { difficulty as enumDifficulty, gameStatus as enumGameStatus } from 'server/src/util-enum';
import { Board } from '../board';
import { Debug } from '../debug';
import { useState, useEffect, useReducer } from 'preact/hooks';

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
    else if (pStatus === LOST) { return 'won'; }

    return 'starting';
}

export const Game = () => {
    const [ data, setData ] = useState(null);
    const [ diff, setDiff ] = useState('normal');
    const [ reset, setReset ] = useState(false);
    const [ status, setStatus ] = useState('starting');
    const [ flagStatus, setFlagStatus ] = useState('');
    const [ timer, setTimer ] = useState(0);
    const [ timerId, setTimerId ] = useState(0);
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
        setFlagStatus('');
    }, [ flagStatus ]);

    useEffect(async () => {
        clearInterval(timerId);
        if (!reset) { return; }

        setReset(false);
        const tData = await fnFetchData(diff);
        setData(tData);
        setStatus(mapServerToClientStatus(tData.status));
        setFlagStatus('');
        setTimer(0);
        const tTimerId = setInterval(async () => {
            const tTickData = await fnFetchTickData(tData.id);
            setTimer(tTickData.time);
            setStatus(mapServerToClientStatus(tTickData.gameStatus));
		}, 250);
        setTimerId(tTimerId);

		return () => { clearInterval(tTimerId); }
    }, [ reset ]);

    const fnFetchData = async (pDiff) => {
        return (await fetch('/api/new-game', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({ difficulty: mapClientToServerDiff(pDiff) })
        })).json();
    };

    const fnFetchOpenBlockData = async (pNumber) => {
        return (await fetch('/api/open-block', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({ id: data.id, block: pNumber })
        })).json();
    };

    const fnFetchFlagBlockData = async (pNumber) => {
        return (await fetch('/api/flag-block', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({ id: data.id, block: pNumber })
        })).json();
    };

    const fnFetchTickData = async (pId) => {
        return (await fetch('/api/update-tick', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({ id: pId })
        })).json();
    };

    const changeDifficulty = (pDiff) => {
        setDiff(pDiff);
        setReset(true);
    };

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
    }, [ reset, data ]);


    const handleSquareNormalClick = async (pNumber, pIsFlagged) => {
        if (pIsFlagged) { return; }

        const tData = await fnFetchOpenBlockData(pNumber);

        tData.blocks.forEach(pItem => {
            dispatchBlockData({
                index: pItem.index,
                options: {
                    status: pItem.status,
                    type: pItem.type,
                    value: pItem.value,
                },
            });
        });

        setStatus(mapServerToClientStatus(tData.gameStatus));
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

            if (tBlockStatus === 'closed') { setFlagStatus('increase'); }
            else if (tBlockStatus === 'flag') { setFlagStatus('decrease'); }
            else { setFlagStatus(''); }
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
            <GameHeader onChangeDifficulty={(pDiff) => changeDifficulty(pDiff)} reset={reset} flags={data.flags} flagStatus={flagStatus} timer={timer}></GameHeader>
            <Board onClick={(pNumber, pIsClickedWithControl) => handleSquareClick(pNumber, pIsClickedWithControl)} blockData={blockData} numberOfRows={data.size[1]} numberOfCols={data.size[0]}></Board>
            <Debug data={data} onSquareClick={handleSquareClick}></Debug>
        </div>
    );
};
