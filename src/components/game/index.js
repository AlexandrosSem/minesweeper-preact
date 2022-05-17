import style from './style.css';
import { GameHeader } from '../gameHeader';
import { Board } from '../board';
import { useState } from 'preact/hooks';

export const Game = () => {
    /// Fetch needed here
    const { id, size } = {id: 1, size: [9, 9], blocks: []};
    return (
        <div class={style.game}>
            <GameHeader></GameHeader>
            <Board size={size}></Board>
        </div>
    );
};