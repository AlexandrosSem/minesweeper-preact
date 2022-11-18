export class Defer<T> {
    resolve: (pValue: T) => void;
    reject: (pValue: T) => void;
    promise: Promise<T>;
    constructor() {
        this.resolve = () => {};
        this.reject = () => {};
        this.promise = new Promise<T>((res, rej) => {
            this.resolve = res;
            this.reject = rej;
        }).finally(() => {
            this.resolve = this.reject = () => {};
        });
    }
}
