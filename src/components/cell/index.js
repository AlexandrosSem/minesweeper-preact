import { useMemo, useState } from 'preact/hooks';
import style from '../cellContainer/style.css';

export const Cell = ({ cellInfo, onClick}) => {
	const tBlockStatus = cellInfo.status;
	const tIsOpen = (tBlockStatus === 'open');
	const tIsFlagged = (tBlockStatus === 'flag');
	const tNumber = cellInfo.number;
	const fnActionClick = (pEvent) => onClick(tNumber, pEvent.ctrlKey);

	const tType = cellInfo.type;
	const tValue = cellInfo.value;
	let tValueToDisplay = '';
	if (tIsOpen) {
		if (tType === 'number') { tValueToDisplay = tValue; }
		else if (tType === 'bomb') { tValueToDisplay = 'B'; }
	} else if (tIsFlagged) {
		tValueToDisplay = 'F';
	}

	return (
		<div id={`cell-${tNumber}`} style={{backgroundColor: (tIsOpen) ? '#ffffff' : '#cccccc'}} class={style.cell} onClick={(pEvent) => fnActionClick(pEvent)}>{tValueToDisplay}</div>
	);
};