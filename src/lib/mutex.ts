export class PromiseSequencer {
    private running: boolean = false;
    private queue: SequencedPromiseHandle[] = [];

    public do<T>(fn: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.queue.push({
                trigger: fn,
                resolve,
                reject,
            });

            if (!this.running)
            {
                this.resume();
            }
        });
    }

    private resume()
    {
        this.running = !!this.queue.length;
        if (!this.running) return;

        let next = this.queue.shift();
        next.trigger().then(result => {
            next.resolve(result)
        }).catch(err => {
            next.reject(err);
        }).finally(() => this.resume());
    }
}

interface SequencedPromiseHandle
{
    trigger: () => Promise<any>;
    resolve: (result: any) => void;
    reject: (err: Error) => void;
}