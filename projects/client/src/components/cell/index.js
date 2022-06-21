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

	let tValueToDisplay = '🔳';
	let backgroundColor = '#e6e7e8';

	if (tIsOpen) {
		tValueToDisplay = '⬜';
		if (tType === 'number') { tValueToDisplay = tValue; }
		else if (tType === 'bomb') {
			tValueToDisplay = '💥';
			// backgroundColor = '#fc5b5b';
		}
	} else if (tIsFlagged) {
		tValueToDisplay = '🚩';
	}

	const _Classes = Object.entries({
		[style.cell]: true,
		[style.cellBomb]: (tIsOpen && ( tType === 'bomb' )),
	});

	const classes = _Classes.map(([ className, condition ]) => {
		if (condition === true) { return className };
		return null;
	}).filter(i => i !== null).join(' ');

	return (
		<div id={`cell-${tNumber}`} class={classes} onClick={(pEvent) => fnActionClick(pEvent)}>{tValueToDisplay}</div>
	);
};