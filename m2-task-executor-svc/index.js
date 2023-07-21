const { consumeAndProcessTaskFromRabbitMQ, logger } = require('./rabbitmq')

async function processTask(task) {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const result = { ...task, status: 'completed' };
    logger.info('Task processed:', result);

    return result;
}

consumeAndProcessTaskFromRabbitMQ(processTask)