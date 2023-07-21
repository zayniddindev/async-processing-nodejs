const amqp = require('amqplib');
const logger = require('pino')();
const RMQ_URL = process.env.RMQ_URL || 'amqp://localhost:5672'

async function createRabbitMQConnection() {
    try {
        const connection = await amqp.connect(RMQ_URL);
        const channel = await connection.createChannel();

        const queueName = 'task_queue';
        await channel.assertQueue(queueName, { durable: true });

        return { connection, channel, queueName };
    } catch (error) {
        pino.error('Error creating RabbitMQ connection:', error);
        process.exit(1);
    }
}

async function publishTaskToRabbitMQ(task) {
    try {
        const { connection, channel, queueName } = await createRabbitMQConnection();

        const message = JSON.stringify(task);
        channel.sendToQueue(queueName, Buffer.from(message), { persistent: true });

        await channel.close();
        await connection.close();
    } catch (error) {
        logger.error('Error publishing task to RabbitMQ:', error);
    }
}

async function waitForResponseFromM2AndLog(task) {
    try {
        const connection = await amqp.connect(RMQ_URL);
        const channel = await connection.createChannel();

        const queue = 'responses_queue';
        await channel.assertQueue(queue, { durable: true });

        channel.consume(queue, (message) => {
            const response = JSON.parse(message.content.toString());
            logger.info('Response received from M2:', response);
            channel.ack(message);
        });

        logger.info('M1 microservice is waiting for responses from M2...');
    } catch (error) {
        console.error(error);
        logger.error('Error consuming response from RabbitMQ:', error);
    }
}


module.exports = { publishTaskToRabbitMQ, waitForResponseFromM2AndLog }