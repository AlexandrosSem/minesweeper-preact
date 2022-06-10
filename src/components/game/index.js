import style from './style.css';
import { GameHeader } from '../gameHeader';
import { difficulty as enumDifficulty, gameStatus as enumGameStatus } from '../../server/util-enum';
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

/// TODO: map block status from server to client
///     When status can be 'closed', 'flag' or 'open'. However we need to split in isOpen and isFlag.
///     so the client work properly (see handleSquareNormalClick and handleSquareControlPlusClick)

export const Game = () => {
    const [ data, setData ] = useState(null);
    const [ diff, setDiff ] = useState('normal');
    const [ reset, setReset ] = useState(false);
    const [ status, setStatus ] = useState('starting');
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
        if (!reset) { return; }

        setReset(false);
        const tData = await fnFetchData(diff);
        setData(tData);
        setStatus(mapServerToClientStatus(tData.status));
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
                clicked: false,
                flagged: false,
                type: 'blank',
                value: '',
            })),
        });
    }, [ reset, data ]);


    const handleSquareNormalClick = async (pNumber) => {
        const tData = await fnFetchOpenBlockData(pNumber);

        tData.blocks.forEach(pItem => {
            dispatchBlockData({
                index: pItem.index,
                options: {
                    clicked: true,
                    type: pItem.type,
                    value: pItem.value,
                },
            });
        });

        setStatus(mapServerToClientStatus(tData.gameStatus));
    };

    const handleSquareControlPlusClick = async (pNumber, pPrevFlagValue) => {
        const tData = await fnFetchFlagBlockData(pNumber);

        /// TODO: Server now handle toggle of flag values
        tData.blocks.forEach(pItem => {
            dispatchBlockData({
                index: pItem.index,
                options: {
                    flagged: !pPrevFlagValue,
                },
            });
        });

        setStatus(mapServerToClientStatus(tData.gameStatus));
    };

    const handleSquareClick = async (pEvent, pNumber) => {
        if ([ 'won', 'lost' ].includes(status)) { return; }

        const tBlock = blockData.find(pItem => pItem.number === pNumber);
        if (tBlock.clicked) { return; }

        const tPrevFlagValue = tBlock.flagged;
        const tIsNormalClick = !(pEvent?.ctrlKey ?? false);
        if ((tPrevFlagValue === true) && (tIsNormalClick)) { return; }

        if (tIsNormalClick) {
            await handleSquareNormalClick(pNumber);
        } else {
            await handleSquareControlPlusClick(pNumber, tPrevFlagValue);
        }
    };

    if (!blockData) return <div class={style.game}>Loading...</div>

    return (
        <div class={style.game}>
            <GameHeader onChangeDifficulty={(pDiff) => changeDifficulty(pDiff)} status={status}></GameHeader>
            <Board onClick={(pEvent, pNumber) => handleSquareClick(pEvent, pNumber)} blockData={blockData} numberOfRows={data.size[1]} numberOfCols={data.size[0]}></Board>
            <Debug data={data} onSquareClick={handleSquareClick}></Debug>
        </div>
    );
};
