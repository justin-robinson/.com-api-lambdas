
const ChirpsFetcher = require("../fetchers/chirps");
const NotificationsFetcher = require("../fetchers/notifications");
const Performance = require("../performance");

module.exports = async function(event, context, metrics, actionName) {
    const p = new Performance();

    // get all the data fetchers we need
    const fetchers = [
        new ChirpsFetcher(),
        new NotificationsFetcher()
    ];

    const metricDimensions = [
        {
            Name: 'By Action Name',
            Value: actionName
        }
    ];
    

    // execute all the data fetchers
    const promises = fetchers.map((fetcher) => {
        fetcher.promise = new Promise(async (resolve, reject) => {
            try {
                p.start(fetcher.name);
                fetcher.data = await fetcher.fetch(
                    event.identity.sub,
                    process.env
                );
                const executionTime = p.end(fetcher.name);
                metrics.add(
                    fetcher.name,
                    executionTime,
                    metricDimensions,
                    'Milliseconds',
                    new Date()
                );
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
        return fetchers.reduce((out, fetcher) => {
            out[fetcher.name] = fetcher.data;
            return out;
        }, {});
    } catch (e) {
        throw e;
    } finally {
        // let all the fetchers do any cleanup they need to do
        for (let fetcher of fetchers) {
            fetcher.finally()
        }
    }
}