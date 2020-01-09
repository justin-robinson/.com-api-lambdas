const Fetcher = require('./_abstract');
// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({ region: process.env.AWS_REGION });

class NotificationFetcher extends Fetcher {
    constructor() {
        super("notifications");
        this.client = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
        console.log(`\nDynamoDB client created\n`)
    }
    fetch(userId) {
        const params = {
            TableName: "test",
            KeyConditionExpression: "PK = :user and begins_with(SK, :type)",
            ExpressionAttributeValues: {
                ":user": `user_${userId}`,
                ":type": "notification_"
            }
        };

        return new Promise((resolve, reject) => {
            this.client.query(params, (e, response) => {
                if (e) {
                    reject(e);
                } else {
                    resolve(response.Items.map(item => {
                        // can't rename attributes at query time in dynamo and we want the sort key to be an ID field for the api
                        item.id = item.SK;
                        delete item.SK;
                        return item;
                    }));
                }
            });
        });
    }
}

module.exports = NotificationFetcher;