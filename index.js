const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const res = require("express/lib/response");
require('dotenv').config();

const app = express();
const port = process.env.PORT | 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.whfic.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();

        // TourX database
        const database = client.db('tour-x');

        // Collection
        const blogCollection = database.collection('blogs');
        const userCollection = database.collection('users');

        const newBlog = {
            title: 'demo - 3',
            description: 'demo - 3 description'
        };
        const result = blogCollection.insertOne(newBlog);
        res.json(result);

        // GET API
        app.get('/blogs', async (req, res) => {
            const blogs = await blogCollection.find({}).toArray();
            res.json(blogs);
        });
    }

    finally {
        // client.close();
    }
};

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('TourX server is running');
});

app.listen(port, (req, res) => {
    console.log('TourX server is runnig at port', port);
});