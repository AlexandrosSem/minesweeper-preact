import { CellContainer } from '../cellContainer/index.js';

export const Board = ({ size }) => {
    const handleClick = (pNumber) => {
        tArrCells[pNumber].clicked = true;
    };
    const tSizeRow = size[0];
    const tSizeCol = size[1];
    const tArrCells = Array.from({ length: tSizeRow * tSizeCol }, (_, pIndex) => ({
        number: pIndex,
        clicked: false,
    }));

    const tArrCellContainer = Array.from({ length: tSizeRow }, (_, pIndex) => {
        const tStartIndex = (pIndex * tSizeCol);
        const tEndIndex = tStartIndex + tSizeCol;
        return <CellContainer key={pIndex} number={pIndex} onClick={(pNumber) => handleClick(pNumber)} cellsInfo={tArrCells.slice(tStartIndex, tEndIndex)}></CellContainer>;
    });

    return (
        <div>
            {tArrCellContainer}
        </div>
    );
};