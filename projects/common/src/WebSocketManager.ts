// Just a draft requires more work
import { encodeData, decodeData, ActionType, ActionData, ActionPayload } from './PayloadManager';
import { Defer } from './Defer';

enum State {
    Pending,
    Open,
    Closed,
};

export class WebSocketManager {
    URL: string;
    socket: WebSocket;
    state: State;
    deferOpen: Defer<Event>;
    deferClose: Defer<Event>;
    deferMessageId: number;
    deferMessage: Array<{ id: number, defer: Defer<ActionPayload> }>;

    constructor(pURL: string) {
        this.URL = pURL;
        this.state = State.Pending;
        this.deferOpen = new Defer<Event>();
        this.deferClose = new Defer<Event>();
        this.deferMessageId = 0;
        this.deferMessage = [];

        const socket = this.socket = new WebSocket(pURL);
        socket.addEventListener('open', (pEvent) => {
            this.state = State.Open;
            this.deferOpen.resolve(pEvent);
        });

        socket.addEventListener('close', (pEvent) => {
            this.state = State.Closed;
            this.deferClose.resolve(pEvent);
        });

        socket.addEventListener('error', (pEvent) => {
            this.deferOpen.reject(pEvent);
            this.deferClose.reject(pEvent);
            this.close();
        });

        socket.addEventListener('message', (pEvent) => {
            const messageData = decodeData(pEvent.data);

            const deferMessage = this.deferMessage.find(({ id }) => id === messageData.id);
            if (deferMessage) {
                deferMessage.defer.resolve(messageData);
                this.deferMessage = this.deferMessage.filter(i => i !== deferMessage);
            } else {
                throw new Error('Unexpected message: ' + JSON.stringify(pEvent.data, null, 2));
            }
        });
    };

    async onOpen() {
        return this.deferOpen.promise;
    };

    async onClose() {
        return this.deferClose.promise;
    };

    async ready() {
        if (this.state !== State.Open) {}

        return this.onOpen();
    };

    async close(code?: number, reason?: string) {
        if (this.state !== State.Closed) {
            this.socket.close(code, reason);
        }

        return this.onClose();
    };
    
    async requestData(type: ActionType, data: ActionData) {
        const defer = new Defer<ActionPayload>();
        const id = this.deferMessageId++;
        this.deferMessage.push({ id, defer });

        const sendData = encodeData({ id, type, data });
        this.socket.send(sendData);

        return defer.promise;
    };
}
