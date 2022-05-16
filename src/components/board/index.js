import style from './style.css';
import { Cell } from '../cell';

export const Board = ({ numberOfCells }) => {
    const tNumberOfCellsPerRow = numberOfCells.rows;
    const tNumberOfCellsPerCol = numberOfCells.cols;
    const tNumberOfCells = tNumberOfCellsPerRow * tNumberOfCellsPerCol;
    const lCell = Array.from({ length: tNumberOfCells }, (_, pIndex) => ({
        number: pIndex,
        clicked: false,
    }));

    const handleClick = (pNumber) => {
        lCell[pNumber].clicked = true;
    }

    const buildCell = (pIndex, pBreakLine) => {
        return (
            <>
                <Cell number={pIndex} onClick={() => handleClick(pIndex)}></Cell>
                {pBreakLine && <br />}
            </>
        );
    };

    return (
        <div class={style.board}>
            {lCell
                .map((_, pIndex, pArr) => {
                    const tNumber = pIndex + 1;
                    const tBreakLine = (tNumber !== pArr.length) && ((tNumber % tNumberOfCellsPerCol) === 0);
                    return buildCell(pIndex, tBreakLine);
                })
            }
        </div>
    );
};