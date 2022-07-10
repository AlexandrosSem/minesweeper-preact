// Just a draft requires more work
import { encodeData, decodeData } from './PayloadManager';

const defaultFunc = ({ data }) => data;
export const CreateWebSocket = function(pURL) {
    if (!(this instanceof CreateWebSocket)) { throw new Error("Call the constructor with 'new' keyword"); }

    Object.assign(this, {
        URL: pURL,
        socket: null,
        isOpen: false,
        isClosed: false,
        isThereAMessage: false,
        openFunc: null,
        closeFunc: null,
        messageFunc: defaultFunc,
        errorFunc: null,
    });
};

Object.assign(CreateWebSocket.prototype, {
    getData: function(pType, pData) {
        this.socket.send(encodeData({ type: pType, data: pData }));

        return new Promise((resolve) => {
            const tIntervalId = setInterval(() => {
                if (this.isThereAMessage) {
                    clearInterval(tIntervalId);
                    const tData = decodeData(this.messageFunc());
                    this.isThereAMessage = false;
                    this.messageFunc = defaultFunc;
                    resolve(tData);
                }
            }, 10);
        });
    },
    close: function(pCloseFunc = (() => {})) {
        this.closeFunc = pCloseFunc;
        this.socket.close();
        return new Promise((resolve) => {
            const tIntervalId = setInterval(async () => {
                if (this.isClosed) {
                    clearInterval(tIntervalId);
                    resolve(await this.closeFunc());
                }
            }, 10);
        });
    },
    init: function(pOpenFunc = (() => {}), pErrorFunc = (pEvent) => { console.log(pEvent); }) {
        this.openFunc = pOpenFunc;
        this.errorFunc = pErrorFunc;
        this.socket = new WebSocket(this.URL);

        this.socket.addEventListener('open', (pEvent) => {
            this.openFunc = this.openFunc.bind(null, pEvent);
            this.isOpen = true;
        });

        this.socket.addEventListener('close', (pEvent) => {
            this.URL = '';
            this.socket = null;
            this.isOpen = false;
            this.isClosed = false;
            this.isThereAMessage = false;
            this.openFunc = null;
            this.closeFunc = null;
            this.messageFunc = defaultFunc;
            this.errorFunc = null;

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
    },
});
