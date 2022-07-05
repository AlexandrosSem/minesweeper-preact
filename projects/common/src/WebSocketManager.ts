// Just a draft requires more work
import { encodeData, decodeData } from 'common';

const CreateWebSocket = (function() {
    const _constructorCallCheck = (pInstance, pConstructor) => {
        if (!(pInstance instanceof pConstructor)) { throw new Error("Call the constructor with 'new' keyword"); }
    };

    const CreateWebSocket = function(pURL) {
        _constructorCallCheck(this, CreateWebSocket);
        this.URL = pURL;
        this.socket = null;
        this.isOpen = false;
        this.isClosed = false;
        this.isThereAMessage = false;
        this.open = () => {};
        this.close = () => {};
        this.message = (pEvent) => pEvent.data;
        this.error = (pEvent) => { console.log(pEvent); };
    };
    CreateWebSocket.prototype.setError = function(pFunc) { this.error = pFunc };

    CreateWebSocket.prototype.getData = function(pType, pData) {
        this.socket.send(encodeData({ type: pType, data: pData }));

        return new Promise((resolve) => {
            const tIntervalId = setInterval(async () => {
                if (this.isThereAMessage) {
                    clearInterval(tIntervalId);
                    this.isThereAMessage = false;
                    resolve(decodeData(this.message()));
                }
            }, 250);
        });
    };
    
    CreateWebSocket.prototype.close = function(pFunc = (() => {})) {
        this.close = pFunc;
        this.socket.close();
        return new Promise((resolve) => {
            const tIntervalId = setInterval(async () => {
                if (this.isClosed) {
                    clearInterval(tIntervalId);
                    resolve(await this.close());
                }
            }, 250);
        });
    };

    CreateWebSocket.prototype.init = function(pFunc = (() => {})) {
        this.open = pFunc;
        this.socket = new WebSocket(this.URL);
        this.socket.addEventListener('open', (pEvent) => {
            this.open = this.open.bind(this, pEvent);
            this.isOpen = true;
        });
        this.socket.addEventListener('close', (pEvent) => {
            this.close = this.close.bind(this, pEvent);
            this.isClosed = true;
        });
        this.socket.addEventListener('message', (pEvent) => {
            this.message = this.message.bind(this, pEvent);
            this.isThereAMessage = true;
        });
        this.socket.addEventListener('error', (pEvent) => {
            this.error(pEvent);
        });

        return new Promise((resolve) => {
            const tIntervalId = setInterval(async () => {
                if (this.isOpen) {
                    clearInterval(tIntervalId);
                    resolve(await this.open());
                }
            }, 250);
        });
    };

    return CreateWebSocket;
})();

export default CreateWebSocket;
