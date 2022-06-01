import style from './style.css';
import { MineNumber } from '../mineNumber';
import { Reset } from '../reset';
import { Timer } from '../timer';

export const GameHeader = ({ onChangeDifficulty, status }) => {
    return (
        <div class={style.gameHeader}>
            <MineNumber></MineNumber>
            <div class={style.gameDiffContainer}>
                <Reset key="0" title="E" difficulty="easy" onChangeDifficulty={onChangeDifficulty}></Reset>
                <Reset key="1" title="N" difficulty="normal" onChangeDifficulty={onChangeDifficulty}></Reset>
                <Reset key="2" title="H" difficulty="hard" onChangeDifficulty={onChangeDifficulty}></Reset>
            </div>
            <div class={style.gameTimerContainer}>
                <Timer status={status}></Timer>
            </div>
        </div>
    );
};
