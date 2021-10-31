const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// add middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kzham.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('tour_mates');
        const productCollection = database.collection('packages');
        const ordersCollection = database.collection('myOrders');
        const contactCollection = database.collection('customerContact');
        const reviewCollection = database.collection('visitorsReview');

        //POST API add packages
        app.post('/addPackage', async (req, res) => {
            const result = await productCollection.insertOne(req.body);
            res.json(result);
        })

        //add contact
        app.post('/addContact', async (req, res) => {
            const result = await contactCollection.insertOne(req.body);
            res.json(result);
        })

        // GET products API
        app.get('/packages', async (req, res) => {
            const cursor = productCollection.find({});
            const packages = await cursor.toArray();
            res.send(packages);
        });

        //DELETE API
        app.delete('/deleteOrder/:id', async (req, res) => {
            const result = await ordersCollection.deleteOne({ _id: ObjectId(req.params.id) });
            res.send(result);
        });

        // Add order
        app.post('/addOrder', async (req, res) => {
            const order = await ordersCollection.insertOne(req.body);
            res.send(order);
        });

        // get my orders
        app.get('/myOrders/:email', async (req, res) => {
            const result = await ordersCollection.find({ email: req.params.email }).toArray();
            res.send(result);
        });

        // GET all orders API
        app.get('/allOrders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        });

        // GET reviews API
        app.get('/allReviews', async (req, res) => {
            const cursor = reviewCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        //get single order
        app.put('/updateStatus/:id', (req, res) => {
            const id = req.params.id;
            const updateStatus = req.body;
            ordersCollection.updateOne(
                { _id: ObjectId(id) },
                {
                    $set: {
                        status: updateStatus.status
                    },
                }
            )
                .then(result => {
                    res.send(result);
                });
        })
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running Food Runner Server');
});

app.listen(port, () => {
    console.log('Running server on port', port);
})