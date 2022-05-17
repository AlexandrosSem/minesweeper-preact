import { useState, useMemo } from 'preact/hooks'
import style from '../cellContainer/style.css';

export const Cell = ({ number, onClick}) => {
	const [tClicked, setClicked] = useState(false);
	useMemo(() => onClick(number), [tClicked]);
	
	const fnClick = () => setClicked(true);

	return (
		<div id={`cell-${number}`} style={{backgroundColor: (tClicked) ? '#ffffff' : '#cccccc'}} class={style.cell} onClick={fnClick}></div>
	);
};