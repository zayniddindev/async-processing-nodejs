const amqp = require('amqplib');
const logger = require('pino')();
const RMQ_URL = process.env.RMQ_URL || 'amqp://localhost:5672'

async function consumeAndProcessTaskFromRabbitMQ(processFunction) {
    try {
        const connection = await amqp.connect(RMQ_URL);
        const channel = await connection.createChannel();

        const queue = 'task_queue';
        await channel.assertQueue(queue, { durable: true });

        channel.consume(queue, async (message) => {
            const task = JSON.parse(message.content.toString());

            const response = await processFunction(task);

            await publishResponseToRabbitMQ(response);

            channel.ack(message);
        });

        logger.info('M2 microservice is waiting for tasks from RabbitMQ...');
    } catch (error) {
        logger.error('Error consuming task from RabbitMQ:', error);
        console.error(error);
    }
}

async function publishResponseToRabbitMQ(response) {
    try {
        const connection = await amqp.connect(RMQ_URL);
        const channel = await connection.createChannel();

        const queue = 'responses_queue';
        await channel.assertQueue(queue, { durable: true });

        const message = JSON.stringify(response);
        channel.sendToQueue(queue, Buffer.from(message), { persistent: true });

        logger.info('Response published to RabbitMQ:', message);

        await channel.close();
        await connection.close();
    } catch (error) {
        logger.error('Error publishing response to RabbitMQ:', error);
    }
}

module.exports = { consumeAndProcessTaskFromRabbitMQ, logger }

