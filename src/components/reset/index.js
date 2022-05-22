import style from './style.css';

export const Reset = ({ title, difficulty, changeDifficulty }) => {
	const fnClick = () => changeDifficulty(difficulty);

	return (
		<span class={style.click} onClick={fnClick}>{title}</span>
	);
};
