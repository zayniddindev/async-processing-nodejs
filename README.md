# Job Test - NodeJS Developer

## Run with Docker:

```bash
$ docker compose build
$ docker compose up -d
```

## Run without Docker (requires RabbitMQ installed and running locally):

```bash
$ node m1-http-svc/index.js
$ node m2-task-executor-svc/index.js
```

## Test:

### Send POST request to [http://localhost:3000/process](http://localhost:3000/process) with body and see the logs
