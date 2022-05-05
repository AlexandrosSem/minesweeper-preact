import style from './style.css';
import MineNumber from '../mineNumber';
import Reset from '../reset';
import Timer from '../timer';

const GameHeader = () => (
    <>
        <MineNumber></MineNumber>
        <Reset></Reset>
        <Timer></Timer>
    </>
);

export default GameHeader;