import dotenv from 'dotenv';
import express from 'express';
import studentRouter from './routes/studentRoutes.js';
import {MongoClient} from "mongodb";
import {init} from "./repository/studentRepository.js";

dotenv.config();
const port = process.env.PORT || 3000;
const app = express();
const client = new MongoClient(process.env.MONGO_URI);

app.use(express.json());
app.use(studentRouter);
app.use((req, res) => {
    res.status(404).type('text/plain; charset=utf-8').send('Not Found')
});
async function startServer() {
    try {
        await client.connect();
        const database = client.db(process.env.DB_NAME);
        init(database);
        app.listen(port, () => console.log(`Server started on port ${port}. Press Ctrl-C to finish`));
    } catch (e) {
        console.log('Failed connecting to MongoDB: ', e)
    }
}
startServer();