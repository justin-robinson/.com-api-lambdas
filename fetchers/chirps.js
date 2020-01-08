const Fetcher = require('./_abstract');
const gremlin = require('gremlin');
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection;
const Graph = gremlin.structure.Graph;

const __ = gremlin.process.statics;

const endpoint = 'wss://neptunedbcluster-ijdq0cuhfs8v.cluster-ro-c70rvttfi8ag.us-east-1.neptune.amazonaws.com:8182/gremlin';

class ChirpFetcher extends Fetcher {
    constructor() {
        super("chirps");
        this.dc = new DriverRemoteConnection(
            endpoint,
            { mimeType: "application/vnd.gremlin-v2.0+json" }
        );
        console.log(`\nNeptune connection opened\n`)
    }
    fetch(userId) {
        const graph = new Graph();
        const g = graph.traversal().withRemote(this.dc);

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