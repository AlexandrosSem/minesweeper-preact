import { useMemo, useState } from 'preact/hooks';
import style from '../cellContainer/style.css';

export const Cell = ({ cellInfo, onClick}) => {
	const tClicked = cellInfo.clicked;
	const tNumber = cellInfo.number;
	const fnActionClick = () => onClick(tNumber);
	
	const tType = cellInfo.type;
	const tValue = cellInfo.value;
	let tValueToDisplay = '';
	if (tType === 'bomb') { tValueToDisplay = 'B'; }
	else if (tType === 'flag') { tValueToDisplay = 'F'; }
	else if (tType === 'number') { tValueToDisplay = tValue; }

	return (
		<div id={`cell-${tNumber}`} style={{backgroundColor: (tClicked) ? '#ffffff' : '#cccccc'}} class={style.cell} onClick={fnActionClick}>{tValueToDisplay}</div>
	);
};