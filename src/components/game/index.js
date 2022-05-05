import style from './style.css';
import GameHeader from '../gameHeader';
import Board from '../board';

const Game = () => (
    <>
        <GameHeader></GameHeader>
        <Board numberOfCells="6"></Board>
    </>
);

export default Game;