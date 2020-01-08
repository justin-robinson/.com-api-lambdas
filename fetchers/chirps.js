const Fetcher = require('./_abstract');
const gremlin = require('gremlin');
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection;
const Graph = gremlin.structure.Graph;

const __ = gremlin.process.statics;

class ChirpFetcher extends Fetcher {
    constructor() {
        super("chirps");
    }
    fetch(event, env) {
        const endpoint = env.NEPTUNE_ENDPOINT;
        const userId = event.id;
        this.dc = new DriverRemoteConnection(
            endpoint,
            { mimeType: "application/vnd.gremlin-v2.0+json" }
        );
        console.log(`\nNeptune connection opened\n`);

        const graph = new Graph();
        const g = graph.traversal().withRemote(this.dc);

        // get chirps of this user's friends
        return g.V(`user_${userId}`)
                    .both('friends_with')
                    .out('chirped')
                    .project('id', 'prompt', 'response')
                    .by(__.id())
                    .by('prompt')
                    .by('response')
                    .toList();
    }
    finally() {
        if (this.dc && typeof this.dc.close === 'function') {
            console.log(`\nNeptune connection closed\n`)
            this.dc.close();
        }
    }
}

module.exports = ChirpFetcher;