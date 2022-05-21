import { CellContainer } from '../cellContainer/index.js';

export const Board = ({ id, size, blocks }) => {
    
    const handleClick = (pNumber) => {
        tArrCells[pNumber].clicked = true;

        fetch('/api/open-block', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({ id, block: pNumber })
        }).then(resp => resp.json()).then(data => {
            console.log(data);
        });
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