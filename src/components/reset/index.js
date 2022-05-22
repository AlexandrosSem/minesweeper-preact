import style from './style.css';

export const Reset = ({ title, difficulty, onChangeDifficulty }) => {
	const fnClick = () => onChangeDifficulty(difficulty);

	return (
		<span class={style.click} onClick={fnClick}>{title}</span>
	);
};
