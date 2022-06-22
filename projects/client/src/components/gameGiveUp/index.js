import style from './style.css';

export const GameGiveUp = ({ onClickGiveUp }) => {
    const fnClick = () => onClickGiveUp();

	return <span class={`${style.click} ${style.space}`} title="Give up" onClick={fnClick}>G</span>;
};