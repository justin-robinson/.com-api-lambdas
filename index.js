const Performance = require("./performance");
const Metrics = require("./metrics");

exports.handler = async function (event, context, callback) {
    const actionName = event.arguments.action;
    if (!actionName) {
        callback('You must define an action at "event.arguments.action"');
        return;
    }
    const metrics = new Metrics("Lambda");
    const p = new Performance();
    try {
        p.start(actionName);
        const action = require(`./actions/${actionName}`);

        if (!action) {
            callback(`Unknown Action: ${actionName}`);
        } else if (typeof action != 'function'){
            callback(`Action should be a function: ${actionName}`);
        } else {
            const result = await action(event, context, metrics, actionName);
            callback(null, result);
        }
    } catch (e) {
        callback(`Error from Action: ${actionName} : ${e}`);
    } finally {
        const executionTime = p.end(actionName);
        metrics.add(
            actionName,
            executionTime,
            [{Name: 'By Function Name', Value: context.functionName}],
            'Milliseconds',
            new Date()
        )
        metrics.publish();
    }
}