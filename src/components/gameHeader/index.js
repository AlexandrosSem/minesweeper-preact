import style from './style.css';
import { MineNumber } from '../mineNumber';
import { Reset } from '../reset';
import { Timer } from '../timer';

export const GameHeader = () => {
    return (
        <div class={style.gameHeader}>
            <MineNumber></MineNumber>
            <Reset></Reset>
            <Timer></Timer>
        </div>
    );
};