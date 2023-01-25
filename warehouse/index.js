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
const PORT = 4000;
// rabbitmq to be global variables
let channel, connection;
connect();
function connect() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const amqpServer = "amqp://admin:password@localhost:5672";
            connection = yield amqplib_1.default.connect(amqpServer);
            channel = yield connection.createChannel();
            // consume all the orders that are not acknowledged
            yield channel.consume("order", (data) => {
                console.log("warehouse index.js");
                console.log(`Received ${Buffer.from(data.content)}`);
                channel.ack(data);
            });
        }
        catch (error) {
            console.log(error);
        }
    });
}
app.get("*", (req, res) => {
    res.status(404).send("Not found");
});
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});
