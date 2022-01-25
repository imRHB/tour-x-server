const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
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

        /* const newBlog = {
            title: 'demo - 3',
            description: 'demo - 3 description'
        };
        const result = blogCollection.insertOne(newBlog);
        res.json(result); */

        // GET API
        app.get('/blogs', async (req, res) => {
            const cursor = blogCollection.find({});
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            let blogs;
            const count = await cursor.count();
            if (page) {
                blogs = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                blogs = await cursor.toArray();
            }
            res.send({
                blogs,
                count
            });
            // console.log(blogs);
        });

        // POST API : User
        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const result = userCollection.insertOne(newUser);
            res.json(result);
        });

        // PUT API : User
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateUser = {
                $set: {
                    name: user.name,
                    email: user.email
                }
            };
            const result = await userCollection.updateOne(filter, updateUser, options);
            res.json(result);
        });

        // PUT API : Set admin role
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateUser = {
                $set: {
                    role: 'admin'
                }
            };
            const result = await userCollection.updateOne(filter, updateUser);
            res.json(result);
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