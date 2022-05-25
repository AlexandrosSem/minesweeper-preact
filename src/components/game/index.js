import style from './style.css';
import { GameHeader } from '../gameHeader';
import { difficulty as enumDifficulty } from '../../server/util-enum';
import { Board } from '../board';
import { useState, useEffect } from 'preact/hooks';

const mapClientToServerDiff = pDiff => {
    if (pDiff === 'easy') { return enumDifficulty.easy; }
    if (pDiff === 'hard') { return enumDifficulty.hard; }
    
    return enumDifficulty.normal;
};

export const Game = () => {
    const [data, setData] = useState(null);
    useEffect(async () => {
        await fnFetchAndSetData(enumDifficulty.normal);
    }, []);

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

    const fnFetchAndSetData = async (pDiff) => {
        const tData = await fnFetchData(pDiff);
        setData(tData);
    };

    const changeDifficulty = async (pDiff) => await fnFetchAndSetData(pDiff);

    if (!data) return <div class={style.game}>Loading...</div>
    
    return (
        <div class={style.game}>
            <GameHeader onChangeDifficulty={(pDiff) => changeDifficulty(pDiff)}></GameHeader>
            <Board id={data.id} size={data.size} blocks={data.blocks} status={data.status}></Board>
        </div>
    );
};
