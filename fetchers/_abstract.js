class Fetcher {
    constructor(name) {
        this.name = name;
        this.promise = null;
        this.data = null;
    }

    // called after all fetcher responses have been processed
    finally() {}
}

module.exports = Fetcher