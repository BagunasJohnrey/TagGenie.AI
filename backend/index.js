const express = require('express');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(express.json());

app.use(cors({
    // origin: "http://localhost:5173",
    origin: "https://tag-genie-mpituchde-bagunasjohnreys-projects.vercel.app",
    credentials: true
}));

const PORT = process.env.PORT;

const tagRouter = require('./router/tagRoute');
app.use("/api/user", tagRouter);

app.use("/", (req, res) => {
    res.send('Hello World!');
})

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
})