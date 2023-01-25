"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const amqplib_1 = __importDefault(require("amqplib"));
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
// parse the request body
app.use(express_1.default.json());
// port where the service will run
const PORT = 4001;
// rabbitmq to be global variables
let channel, connection;
connect();
// connect to rabbitmq
function connect() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // rabbitmq default port is 5672
            const amqpServer = "amqp://admin:password@localhost:5672";
            connection = yield amqplib_1.default.connect(amqpServer);
            channel = yield connection.createChannel();
            // make sure that the order channel is created, if not this statement will create it
            yield channel.assertQueue("order");
        }
        catch (error) {
            console.log(error);
        }
    });
}
app.post("/orders", (req, res) => {
    const data = req.body;
    console.log("orders index.js");
    // send a message to all the services connected to 'order' queue, add the date to differentiate between them
    channel.sendToQueue("order", Buffer.from(JSON.stringify(Object.assign(Object.assign({}, data), { date: new Date() }))));
    const transporter = nodemailer.createTransport({
        host: "smtp.example.com",
        port: 587,
        secure: false,
        auth: {
            user: "username",
            pass: "password",
        },
    });
    // Start listening for messages on the queue
    channel.consume("orders", (data) => __awaiter(void 0, void 0, void 0, function* () {
        // Parse the message
        const message = JSON.parse(data.content.toString());
        // Send the email
        yield transporter.sendMail({
            from: "sender@example.com",
            to: message.to,
            subject: message.subject,
            text: message.body,
        });
        console.log("Sent email");
        // Acknowledge the message
        channel.ack(data);
    }));
    res.send("Order submitted");
});
app.get("*", (req, res) => {
    res.status(404).send("Not found");
});
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});
