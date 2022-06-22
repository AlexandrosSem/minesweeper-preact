import style from './style.css';
import { FlagNumber } from '../flagNumber';
import { Reset } from '../reset';
import { Timer } from '../timer';
import { GameGiveUp } from '../gameGiveUp';

export const GameHeader = ({ onChangeDifficulty, reset, flags, timer, onClickGiveUp }) => {
    return (
        <div class={style.gameHeader}>
            <div class={style.gameFlagContainer}>
                <FlagNumber reset={reset} flags={flags}></FlagNumber>
            </div>
            <div class={style.gameDiffContainer}>
                <Reset key="0" title="E" difficulty="easy" onChangeDifficulty={onChangeDifficulty}></Reset>
                <Reset key="1" title="N" difficulty="normal" onChangeDifficulty={onChangeDifficulty}></Reset>
                <Reset key="2" title="H" difficulty="hard" onChangeDifficulty={onChangeDifficulty}></Reset>
            </div>
            <div class={style.gameGiveUp}>
                <GameGiveUp onClickGiveUp={onClickGiveUp}></GameGiveUp>
            </div>
            <div class={style.gameTimerContainer}>
                <Timer timer={timer}></Timer>
            </div>
        </div>
    );
};
