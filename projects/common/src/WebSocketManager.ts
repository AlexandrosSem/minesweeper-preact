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
        pObj.openFunc = null;
        pObj.closeFunc = null;
        pObj.messageDefaultFunc = (pEvent) => pEvent.data;
        pObj.messageFunc = pObj.messageDefaultFunc;
        pObj.errorFunc = null;
    };

    const CreateWebSocket = function(pURL) {
        _constructorCallCheck(this, CreateWebSocket);
        _setPropertiesToDefault(this);
        this.URL = pURL;
    };

    CreateWebSocket.prototype.getData = function(pType, pData) {
        this.socket.send(encodeData({ type: pType, data: pData }));

        return new Promise((resolve) => {
            const tIntervalId = setInterval(() => {
                if (this.isThereAMessage) {
                    clearInterval(tIntervalId);
                    const tData = decodeData(this.messageFunc());
                    this.isThereAMessage = false;
                    this.messageFunc = this.messageDefaultFunc;
                    resolve(tData);
                }
            }, 10);
        });
    };

    CreateWebSocket.prototype.close = function(pCloseFunc = (() => {})) {
        this.closeFunc = pCloseFunc;
        this.socket.close();
        return new Promise((resolve) => {
            const tIntervalId = setInterval(async () => {
                if (this.isClosed) {
                    clearInterval(tIntervalId);
                    resolve(await this.closeFunc());
                    _setPropertiesToDefault(this);
                }
            }, 10);
        });
    };

    CreateWebSocket.prototype.init = function(pOpenFunc = (() => {}), pErrorFunc = (pEvent) => { console.log(pEvent); }) {
        this.openFunc = pOpenFunc;
        this.errorFunc = pErrorFunc;
        this.socket = new WebSocket(this.URL);
        this.socket.addEventListener('open', (pEvent) => {
            this.openFunc = this.openFunc.bind(null, pEvent);
            this.isOpen = true;
        });
        this.socket.addEventListener('close', (pEvent) => {
            this.closeFunc = this.closeFunc.bind(null, pEvent);
            this.isClosed = true;
        });
        this.socket.addEventListener('message', (pEvent) => {
            this.messageFunc = this.messageFunc.bind(null, pEvent);
            this.isThereAMessage = true;
        });
        this.socket.addEventListener('error', (pEvent) => {
            this.errorFunc(pEvent);
            this.close();
        });

        return new Promise((resolve) => {
            const tIntervalId = setInterval(async () => {
                if (this.isOpen) {
                    clearInterval(tIntervalId);
                    resolve(await this.openFunc());
                }
            }, 10);
        });
    };

    return CreateWebSocket;
})();

export default CreateWebSocket;
