import style from './style.css';
import { GameHeader } from '../gameHeader';
import { Board } from '../board';

export const Game = () => {
    const numberOfCells = {
        rows: 9,
        cols: 9,
    };
    return (
        <div class={style.game}>
            <GameHeader></GameHeader>
            <Board numberOfCells={numberOfCells}></Board>
        </div>
    );
};