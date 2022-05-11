import style from './style.css';
import { Cell } from '../cell';

export const Board = ({ numberOfCells }) => {
    const tNumberOfCellsPerRow = numberOfCells.rows;
    const tNumberOfCellsPerCol = numberOfCells.cols;
    const tNumberOfCells = tNumberOfCellsPerRow * tNumberOfCellsPerCol;
    const lCell = Array(tNumberOfCells)
        .fill(null)
        .map((_, pIndex) => ({
            number: pIndex,
            clicked: false,
        }));

    const handleClick = (pNumber) => {
        lCell[pNumber].clicked = true;
    }

    return (
        <div class={style.board}>
            {lCell
                .map((_pItem, pIndex) => {
                    const tArrEl = [
                        <br />,
                        <Cell number={pIndex} onClick={(pNumber) => handleClick(pNumber)}></Cell>,
                    ];
                    const tConditionToBreakLines = (pIndex !== 0) && ((pIndex % tNumberOfCellsPerCol) === 0);
                    return (
                        (!tConditionToBreakLines) ? tArrEl[1] : tArrEl
                    );
                })
            }
        </div>
    );
};