import dotenv from 'dotenv';
import express from 'express';
import studentRouter from './routes/studentRoutes.js';
import mongoose from "mongoose";


dotenv.config();
const port = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(studentRouter);
app.use((req, res) => {
    res.status(404).type('text/plain; charset=utf-8').send('Not Found')
});
async function startServer() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: process.env.DB_NAME
        });
        console.log('Connected to MongoDB');
        app.listen(port, () => console.log(`Server started on port ${port}. Press Ctrl-C to finish`));
    } catch (e) {
        console.log('Failed connecting to MongoDB: ', e)
    }
}
startServer();