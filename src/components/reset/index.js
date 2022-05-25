import style from './style.css';

export const Reset = ({ title, difficulty, onChangeDifficulty }) => {
	const fnClick = () => onChangeDifficulty(difficulty);

	const fnDisplayDifficulty = (pDiff) => `${pDiff.slice(0, 1).toUpperCase()}${pDiff.slice(1).toLowerCase()}`;

	return (
		<span class={`${style.click} ${style.space}`} title={fnDisplayDifficulty(difficulty)} onClick={fnClick}>{title}</span>
	);
};
