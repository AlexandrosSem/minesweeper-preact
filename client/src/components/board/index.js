import { CellContainer } from '../cellContainer/index.js';

export const Board = ({ blockData, numberOfRows, numberOfCols, onClick }) => {
    const tArrCellContainer = Array.from({ length: numberOfRows }, (_, pIndex) => {
        const tStartIndex = (pIndex * numberOfCols);
        const tEndIndex = tStartIndex + numberOfCols;

        return <CellContainer key={pIndex} number={pIndex} onClick={onClick} cellsInfo={blockData.slice(tStartIndex, tEndIndex)}></CellContainer>;
    });

    return (
        <div>
            {tArrCellContainer}
        </div>
    );
};