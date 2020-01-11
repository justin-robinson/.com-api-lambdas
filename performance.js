/**
 * Measures in milliseconds the time between two events referenced by name
 * 
 * EX:
 * const p = new Performance();
 * 
 * p.start('someFunction');
 * const value = await someFunction();
 * const executionTime = p.end('someFunction');
 */
class Performance {
    constructor() {
        this.timers = {};
    }

    start(name) {
        this.timers[name] = process.hrtime.bigint();
    }

    end(name) {
        return Number((process.hrtime.bigint() - (this.timers[name] || BigInt(0))) / 1000000n);
    }
}

module.exports = Performance;