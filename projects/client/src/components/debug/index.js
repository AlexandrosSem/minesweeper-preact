import style from './style.css';

export const Debug = ({ data, onSquareClick }) => {
    const requestDebug = async (pConsoleLog) => {
        const tData = await (await fetch(`/api/debug/${data.id}?consoleLog=${pConsoleLog}`, {
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            method: 'GET',
        })).json();

        console.log(tData);

        return tData;
    }

    const requestBoardRefresh = async () => {
        const tData = await (await fetch(`/api/board-refresh`, {
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify({ id: data.id })
        })).json();

        return tData;
    }

    return (
        <div id="DEBUG" style="text-align: right;">
            <button title="WIN" onClick={async () => {
                const tData = await requestDebug(0);
                await Promise.all(
                    tData.blocks.filter(block => block.type !== 'bomb')
                        .map(block => onSquareClick(block.index))
                );

                await requestDebug(1);
            }}>🥅</button>
            |
            <button title="DEBUG" onClick={async () => {
                const tData = await requestDebug(1);
            }}>🐞</button>
            |
            <button title="Refresh board" onClick={async () => {
                const tData = await requestBoardRefresh();
                console.log(tData);
            }}>🔄</button>
        </div>
	);
};
