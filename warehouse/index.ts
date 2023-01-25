import amqplib, { Channel, Connection } from "amqplib";
import express, { Request, Response } from "express";

const app = express();

// parse the request body
app.use(express.json());

// port where the service will run
const PORT = 4000;

// rabbitmq to be global variables
let channel: Channel, connection: Connection;

connect();

async function connect() {
  try {
    const amqpServer = "amqp://admin:password@localhost:5672";
    connection = await amqplib.connect(amqpServer);
    channel = await connection.createChannel();

    // consume all the orders that are not acknowledged
    await channel.consume("order", (data) => {
      console.log("warehouse index.js");
      console.log(`Received ${Buffer.from(data!.content)}`);
      channel.ack(data!);
    });
  } catch (error) {
    console.log(error);
  }
}

app.get("*", (req: Request, res: Response) => {
  res.status(404).send("Not found");
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
