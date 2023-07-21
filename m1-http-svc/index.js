const express = require('express');
const bodyParser = require('body-parser');
const pino = require('pino')();
const { publishTaskToRabbitMQ, waitForResponseFromM2AndLog } = require("./rabbitmq")

const app = express();
const PORT = process.env.PORT || 3001;
app.use(bodyParser.json());

app.post('/process', async (req, res) => {
    try {
        const task = req.body;

        await publishTaskToRabbitMQ(task)

        pino.info('Task sent to RabbitMQ:', task);
        res.status(200).json({ status: 'Task received and sent for processing.' });

        waitForResponseFromM2AndLog();
    } catch (error) {
        pino.error('Error processing HTTP request:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

app.listen(PORT, () => {
    pino.info(`M1 Microservice is running on port ${PORT}`);
});
