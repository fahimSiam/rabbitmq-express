import amqplib, { Channel, Connection } from "amqplib";
import express, { Request, Response } from "express";

const app = express();

// parse the request body
app.use(express.json());

// port where the service will run
const PORT = 4001;

// rabbitmq to be global variables
let channel: Channel, connection: Connection;

connect();

// connect to rabbitmq
async function connect() {
  try {
    // rabbitmq default port is 5672
    const amqpServer = "amqp://admin:password@localhost:5672";
    connection = await amqplib.connect(amqpServer);
    channel = await connection.createChannel();

    // make sure that the order channel is created, if not this statement will create it
    await channel.assertQueue("order");
  } catch (error) {
    console.log(error);
  }
}

app.post("/orders", (req: Request, res: Response) => {
  const data = req.body;
  console.log("orders index.js");
  // send a message to all the services connected to 'order' queue, add the date to differentiate between them
  channel.sendToQueue(
    "order",
    Buffer.from(
      JSON.stringify({
        ...data,
        date: new Date(),
      })
    )
  );

  res.send("Order submitted");
});

app.get("*", (req: Request, res: Response) => {
  res.status(404).send("Not found");
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
