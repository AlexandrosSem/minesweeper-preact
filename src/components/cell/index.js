import { useState } from 'preact/hooks'
import style from './style.css';


export const Cell = ({ number, onClick}) => {
	const [tClicked, setClicked] = useState(false);

	const fnClick = () => {
		if (tClicked) { return; }
		
		setClicked(true);
		onClick(number);
	};

	return (
		<div style={{backgroundColor: (tClicked) ? '#ffffff' : '#cccccc'}} class={style.cell} onClick={fnClick}></div>
	);
};