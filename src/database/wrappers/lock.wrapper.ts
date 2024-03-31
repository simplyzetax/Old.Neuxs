export class Lock {
    private locks: Record<string, boolean> = {};

    acquire(key: string): Promise<void> {
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (!this.locks[key]) {
                    this.locks[key] = true;
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        });
    }

    release(key: string): void {
        delete this.locks[key];
    }
}