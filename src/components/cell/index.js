import { useState } from 'preact/hooks'
import style from '../cellContainer/style.css';

export const Cell = ({ cellInfo, onClick}) => {
	const tNumber = cellInfo.number;
	const [tClicked, setClicked] = useState(false);
	const fnClick = () => {
		onClick(tNumber);
		setClicked(true);
	};

	if (tClicked && !cellInfo.clicked) { setClicked(false); }

	return (
		<div id={`cell-${tNumber}`} style={{backgroundColor: (tClicked) ? '#ffffff' : '#cccccc'}} class={style.cell} onClick={fnClick}></div>
	);
};