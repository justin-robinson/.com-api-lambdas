class Metrics {
    constructor(Namespace) {
        this.metric = {
            Namespace,
            MetricData: []
        }
    }
    add(MetricName, Value, Dimensions, Unit, Timestamp) {
        this.metric.MetricData.push({
            MetricName,
            Dimensions,
            Timestamp,
            Unit,
            Value
        });
    }
    publish() {
        if (!this.metric.MetricData.length) {
            return;
        }

        const AWS = require('aws-sdk');
        AWS.config.update({ region: process.env.AWS_REGION });

        const client = new AWS.CloudWatch({ apiVersion: '2010-08-01' });
        client.putMetricData(this.metric, (err, data) => {
            if (err) {
                console.log(err, err.stack); // an error occurred
            } else {
                console.log(data);           // successful response
            }
        });
    }
}

module.exports = Metrics;