// Just a draft requires more work
import { encodeData, decodeData } from 'common';

const CreateWebSocket = (() => {
    const _constructorCallCheck = (pInstance, pConstructor) => {
        if (!(pInstance instanceof pConstructor)) { throw new Error("Call the constructor with 'new' keyword"); }
    };

    const _setPropertiesToDefault = (pObj) => {
        pObj.URL = '';
        pObj.socket = null;
        pObj.isOpen = false;
        pObj.isClosed = false;
        pObj.isThereAMessage = false;
        pObj.open = null;
        pObj.close = null;
        pObj.messageDefault = (pEvent) => pEvent.data;
        pObj.message = pObj.messageDefault;
        pObj.error = (pEvent) => { console.log(pEvent); };
    };

    const CreateWebSocket = function(pURL) {
        _constructorCallCheck(this, CreateWebSocket);
        _setPropertiesToDefault(this);
        this.URL = pURL;
    };
    CreateWebSocket.prototype.setError = function(pFunc = (pEvent) => { console.log(pEvent); }) { this.error = pFunc; };

    CreateWebSocket.prototype.getData = function(pType, pData) {
        this.socket.send(encodeData({ type: pType, data: pData }));

        return new Promise((resolve) => {
            const tIntervalId = setInterval(() => {
                if (this.isThereAMessage) {
                    clearInterval(tIntervalId);
                    const tData = decodeData(this.message());
                    this.isThereAMessage = false;
                    this.message = this.messageDefault;
                    resolve(tData);
                }
            }, 10);
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
                    _setPropertiesToDefault(this);
                }
            }, 10);
        });
    };

    CreateWebSocket.prototype.init = function(pFunc = (() => {})) {
        this.open = pFunc;
        this.socket = new WebSocket(this.URL);
        this.socket.addEventListener('open', (pEvent) => {
            this.open = this.open.bind(null, pEvent);
            this.isOpen = true;
        });
        this.socket.addEventListener('close', (pEvent) => {
            this.close = this.close.bind(null, pEvent);
            this.isClosed = true;
        });
        this.socket.addEventListener('message', (pEvent) => {
            this.message = this.message.bind(null, pEvent);
            this.isThereAMessage = true;
        });
        this.socket.addEventListener('error', (pEvent) => {
            this.error(pEvent);
            _setPropertiesToDefault(this);
        });

        return new Promise((resolve) => {
            const tIntervalId = setInterval(async () => {
                if (this.isOpen) {
                    clearInterval(tIntervalId);
                    resolve(await this.open());
                }
            }, 10);
        });
    };

    return CreateWebSocket;
})();

export default CreateWebSocket;
