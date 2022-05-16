import { useState, useMemo } from 'preact/hooks'
import style from './style.css';


export const Cell = ({ number, onClick}) => {
	const [tClicked, setClicked] = useState(false);
	useMemo(() => onClick(), [tClicked]);
	
	const fnClick = () => setClicked(true);

	return (
		<div id={number} style={{backgroundColor: (tClicked) ? '#ffffff' : '#cccccc'}} class={style.cell} onClick={fnClick}></div>
	);
};