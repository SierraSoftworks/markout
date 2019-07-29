export class PromiseSequencer {
    private lock: Promise<any> = null;

    public do<T>(fn: () => Promise<T>): Promise<T> {
        if (!this.lock)
            return this.lock = fn();

        return this.lock = this.lock.then(() => fn());
    }
}