const ChirpFetcher = require("./fetchers/chirps");

exports.handler = async function handler(event, context, callback) {
    const fetchers = [
        new ChirpFetcher()
    ]
    const userId = event.id;

    const promises = fetchers.map((fetcher) => {
        fetcher.promise = new Promise(async (resolve, reject) => {
            try {
                fetcher.data = await fetcher.fetch(userId);
                resolve();
            } catch (e) {
                reject(e);
            }
        });
        return fetcher.promise;
    });
    
    let output;
    try {
        await Promise.all(promises);
        output = fetchers.reduce((out, fetcher) => {
            out[fetcher.name] = fetcher.data;
            return out;
        }, {});
    } catch (e) {
        console.log(`ERROR: ${e}`)
        callback(`Traversal failed: ${e}`);
    } finally {
        for (let fetcher of fetchers) {
            fetcher.finally()
        }
    }

    callback(null, output);
}