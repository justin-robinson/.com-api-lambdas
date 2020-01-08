const fetcherClasses = require("./fetchers/index");

exports.handler = async function handler(event, context, callback) {
    const fetchers = fetcherClasses.map(c => new c());

    const promises = fetchers.map((fetcher) => {
        fetcher.promise = new Promise(async (resolve, reject) => {
            try {
                fetcher.data = await fetcher.fetch(event, process.env);
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
        callback(`Fetching Error: ${e}`);
    } finally {
        for (let fetcher of fetchers) {
            fetcher.finally()
        }
    }

    callback(null, output);
}