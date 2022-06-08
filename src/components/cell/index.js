import { useMemo, useState } from 'preact/hooks';
import style from '../cellContainer/style.css';

export const Cell = ({ cellInfo, onClick}) => {
	const tClicked = cellInfo.clicked;
	const tFlagged = cellInfo.flagged;
	const tNumber = cellInfo.number;
	const fnActionClick = (pEvent) => onClick(pEvent, tNumber);

	const tType = cellInfo.type;
	const tValue = cellInfo.value;
	let tValueToDisplay = '';
	if (tClicked) {
		if (tType === 'number') { tValueToDisplay = tValue; }
		else if (tType === 'bomb') { tValueToDisplay = 'B'; }
	} else if (tFlagged) {
		tValueToDisplay = 'F';
	}

	return (
		<div id={`cell-${tNumber}`} style={{backgroundColor: (tClicked) ? '#ffffff' : '#cccccc'}} class={style.cell} onClick={(pEvent) => fnActionClick(pEvent)}>{tValueToDisplay}</div>
	);
};