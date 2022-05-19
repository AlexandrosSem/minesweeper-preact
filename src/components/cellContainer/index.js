import style from './style.css';
import { Cell } from '../cell/index.js';

export const CellContainer = ({ number, cellsInfo, onClick }) => {
    const tArrCells = cellsInfo.map(pItem => {
        return <Cell key={pItem.number} cellInfo={pItem} onClick={onClick}></Cell>;
    });

	return (
        <div id={`cell-container-${number}`} class={style.cellContainer}>
            {tArrCells}
        </div>
	);
};