export class Debounce {
    constructor(public action: () => void, public delay: number = 500) {

    }

    private triggerHandle: any = null;

    public trigger() {
        if (this.triggerHandle)
            clearTimeout(this.triggerHandle);

        this.triggerHandle = setTimeout(() => {
            this.action();
            this.triggerHandle = null;
        }, this.delay);
    }
}