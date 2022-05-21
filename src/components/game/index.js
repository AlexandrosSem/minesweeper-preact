import style from './style.css';
import { GameHeader } from '../gameHeader';
import { difficulty as enumDifficulty } from '../../server/gameHandler';
import { Board } from '../board';
import { useState, useEffect } from 'preact/hooks';

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
            body: JSON.stringify({difficulty: diff})
        })).json();
        setData(tData);
    }, [diff]);

    const changeDifficulty = (pDiff) => {
        /// Client difficulty to server difficulty
        switch (pDiff) {
            case 'easy':
                setDiff(enumDifficulty.easy);
            break;
            case 'normal':
                setDiff(enumDifficulty.normal);
            break;
            case 'hard':
                setDiff(enumDifficulty.hard);
            break;
        }
        setDiff(pDiff)
    };

    if (!data) return <div class={style.game}>Loading...</div>

    return (
        <div class={style.game}>
            <GameHeader changeDifficulty={(pDiff) => changeDifficulty(pDiff)}></GameHeader>
            <Board id={data.id} size={data.size} blocks={data.blocks}></Board>
        </div>
    );
};