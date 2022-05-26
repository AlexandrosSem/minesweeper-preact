import { CellContainer } from '../cellContainer/index.js';
import { useMemo, useState } from 'preact/hooks';

export const Board = ({ id, size, blocks, status }) => {
    const [ data, setData ] = useState({id: 0, data: []});
    const tSizeRow = size[0];
    const tSizeCol = size[1];
    useMemo(() => {
        setData({
            id,
            data: Array.from({ length: tSizeRow * tSizeCol }, (_, pIndex) => ({
                number: pIndex,
                clicked: false,
                type: 'blank',
                value: '',
            })),
        });
    }, [id]);

    const tBlockData = data.data;
    if (tBlockData.length === 0) { return null; }

    const handleClick = async (pNumber) => {
        const tData = await (await fetch('/api/open-block', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({ id, block: pNumber })
        })).json();

        tData.blocks.forEach(pItem => {
            const tIndex = pItem.index;
            tBlockData[tIndex] = {
                ...tBlockData[tIndex],
                clicked: true,
                type: pItem.type,
                value: pItem.value,
            };
        });

        setData({
            id: id,
            data: tBlockData,
        });
    };

    const tArrCellContainer = Array.from({ length: tSizeRow }, (_, pIndex) => {
        const tStartIndex = (pIndex * tSizeCol);
        const tEndIndex = tStartIndex + tSizeCol;
        return <CellContainer key={pIndex} number={pIndex} onClick={(pNumber) => handleClick(pNumber)} cellsInfo={tBlockData.slice(tStartIndex, tEndIndex)}></CellContainer>;
    });

    return (
        <div>
            {tArrCellContainer}
        </div>
    );
};