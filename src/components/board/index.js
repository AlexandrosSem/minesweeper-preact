import style from './style.css';
import Cell from '../cell';

const Board = (props) => {
    const tNumberOfCells = +props.numberOfCells;
    return (
        <>
        {Array(tNumberOfCells)
            .fill(null)
            .map((_pItem, pIndex) => <Cell number={pIndex + 1}></Cell>)}
        </>
    );
};

export default Board;