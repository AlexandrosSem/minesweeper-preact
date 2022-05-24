import { useState } from 'preact/hooks'
import style from '../cellContainer/style.css';

export const Cell = ({ cellInfo, onClick}) => {
	const tNumber = cellInfo.number;
	const tType = cellInfo.type;
	const tValue = cellInfo.value;
	const [tClicked, setClicked] = useState(false);
	const fnActionClick = () => {
		if (tClicked) { return; }

		onClick(tNumber);
		setClicked(true);
	};
	if (!tClicked && cellInfo.clicked) { setClicked(true); }
	if (tClicked && !cellInfo.clicked) { setClicked(false); }

	let tValueToDisplay = '';
	if (tType === 'bomb') { tValueToDisplay = 'B'; }
	else if (tType === 'flag') { tValueToDisplay = 'F'; }
	else if (tType === 'number') { tValueToDisplay = tValue; }

	return (
		<div id={`cell-${tNumber}`} style={{backgroundColor: (tClicked) ? '#ffffff' : '#cccccc'}} class={style.cell} onClick={fnActionClick}>{tValueToDisplay}</div>
	);
};