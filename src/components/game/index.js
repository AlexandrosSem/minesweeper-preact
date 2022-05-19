import style from './style.css';
import { GameHeader } from '../gameHeader';
import { Board } from '../board';
import { useState, useEffect } from 'preact/hooks';

export const Game = () => {
    const [data, setData] = useState(null);
    const [diff, setDiff] = useState('normal');

    useEffect(async () => {
        const tData = await (await fetch('/api/new-game', { method: 'POST', body: JSON.stringify({difficulty: diff}) })).json();
        setData(tData);
    }, [diff]);

    const changeDifficulty = (pDiff) => setDiff(pDiff);

    if (!data) return <div class={style.game}>Loading...</div>

    return (
        <div class={style.game}>
            <GameHeader changeDifficulty={(pDiff) => changeDifficulty(pDiff)}></GameHeader>
            <Board id={data.id} size={data.size} blocks={data.blocks}></Board>
        </div>
    );
};