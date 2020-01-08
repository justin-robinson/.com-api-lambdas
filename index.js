const fetcherClasses = require("./fetchers/index");

exports.handler = async function handler(event, context, callback) {

    // get all the data fetchers we need
    const fetchers = fetcherClasses.map(c => new c());

    // execute all the data fetchers
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
    
    try {
        // wait for them all the complete
        await Promise.all(promises);

        // map the data to key/value pairs
        const output = fetchers.reduce((out, fetcher) => {
            out[fetcher.name] = fetcher.data;
            return out;
        }, {});

        callback(null, output);
    } catch (e) {
        console.log(`ERROR: ${e}`)
        callback(`Fetching Error: ${e}`);
    } finally {
        // let all the fetchers do any cleanup they need to do
        for (let fetcher of fetchers) {
            fetcher.finally()
        }
    }
}