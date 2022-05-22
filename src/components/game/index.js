import style from './style.css';
import { GameHeader } from '../gameHeader';
import { difficulty as enumDifficulty } from '../../server/util-enum';
import { Board } from '../board';
import { useState, useEffect } from 'preact/hooks';

const mapClientToServerDiff = pDiff => {
    if (pDiff === 'easy') {
        return enumDifficulty.easy;
    }
    if (pDiff === 'hard') {
        return enumDifficulty.hard;
    }
    return enumDifficulty.normal;
};

export const Game = () => {
    const [data, setData] = useState(null);
    const [diff, setDiff] = useState(enumDifficulty.normal);

    useEffect(async () => {
        const tData = await (await fetch('/api/new-game', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({ difficulty: mapClientToServerDiff(diff) })
        })).json();
        setData(tData);
    }, [diff]);

    const changeDifficulty = (pDiff) => setDiff(pDiff);

    if (!data) return <div class={style.game}>Loading...</div>

    return (
        <div class={style.game}>
            <GameHeader onChangeDifficulty={(pDiff) => changeDifficulty(pDiff)}></GameHeader>
            <Board id={data.id} size={data.size} blocks={data.blocks}></Board>
        </div>
    );
};
