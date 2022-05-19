import style from './style.css';
import { MineNumber } from '../mineNumber';
import { Reset } from '../reset';
import { Timer } from '../timer';

export const GameHeader = ({ changeDifficulty }) => {
    return (
        <div class={style.gameHeader}>
            <MineNumber></MineNumber>
            <Reset key="0" title="E" difficulty="easy" changeDifficulty={changeDifficulty}></Reset>
            <Reset key="1" title="N" difficulty="normal" changeDifficulty={changeDifficulty}></Reset>
            <Reset key="2" title="H" difficulty="hard" changeDifficulty={changeDifficulty}></Reset>
            <Timer></Timer>
        </div>
    );
};