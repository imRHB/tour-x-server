const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
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

        const reviewCollection = database.collection('reviews');


        // GET API : Blogs ACTIVE
        /* app.get('/blogs', async (req, res) => {
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
        }); */

        /* test */
        app.get('/blogs', async (req, res) => {
            const query = req.query;
            const blogs = blogCollection.find(query);
            const result = await blogs.toArray();
            res.json(result);
        });

        // GET API : Single blog
        app.get('/blogs/:bolgId', async (req, res) => {
            const bolgId = req.params.bolgId;
            const query = { _id: ObjectId(bolgId) };
            const result = await blogCollection.findOne(query);
            res.json(result);
        });

        // POST API : Blog
        app.post('/blogs', async (req, res) => {
            const newBlog = req.body;
            const result = await blogCollection.insertOne(newBlog);
            res.json(result);
        });

        // POST API : User
        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const result = userCollection.insertOne(newUser);
            res.json(result);
        });

        // PUT API : Update blog status
        app.put('/blogs/:id', async (req, res) => {
            const id = req.params;
            const filter = { _id: ObjectId(id) };
            const updateStatus = {
                $set: {
                    status: req.body.status
                }
            };
            const result = await blogCollection.updateOne(filter, updateStatus);
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

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });

        // DELETE API : Blog
        app.delete('/blogs/:blogId', async (req, res) => {
            const blogId = req.params.blogId;
            const query = { _id: ObjectId(blogId) };
            const result = await blogCollection.deleteOne(query);
            res.json(result);
        });



        /* testing api */
        /* active */
        /* app.get('/reviews', async (req, res) => {
            const reviews = await reviewCollection.find({}).toArray();
            res.json(reviews);
        }); */

        /* app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find({});
            // const page = parseInt(req.query.page);
            // const size = parseInt(req.query.size);
            let reviews;
            const count = await cursor.count();
            reviews = await cursor.toArray();
            res.send({
                reviews,
                count
            });
        }); */

        app.get('/reviews', async (req, res) => {
            const query = req.query;
            const reviews = reviewCollection.find(query);
            const result = await reviews.toArray();
            res.json(result);
            console.log(result);
        });

        app.put('/reviews/:id', async (req, res) => {
            const id = req.params;
            const filter = { _id: ObjectId(id) };
            const updateStatus = {
                $set: {
                    status: req.body.status
                }
            };
            const result = await reviewCollection.updateOne(filter, updateStatus);
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