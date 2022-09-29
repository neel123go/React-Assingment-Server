const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// Use Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1pylstp.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productsCollection = client.db("Flipcart").collection("products");
        const cartCollection = client.db("Flipcart").collection("cart");

        // get all items
        app.get('/items', async (req, res) => {
            const query = {};
            const cursor = productsCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        });

        // get cart items
        app.get('/cartItems', async (req, res) => {
            const query = {};
            const cursor = cartCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        });

        // get single item by id
        app.get('/items/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.findOne(query);
            res.send(result);
        });

        // insert user cart product
        app.post('/cart', async (req, res) => {
            const cart = req.body;
            const result = await cartCollection.insertMany([cart]);
            res.send(result);
        });

        // update cart product quantity
        app.patch('/cart/:id', async (req, res) => {
            const id = req.params.id;
            const { quantity } = req.body;
            const filter = { _id: ObjectId(id) };
            const updatedDoc = {
                $set: {
                    quantity: `${quantity}`
                }
            }
            const updatedOrder = await cartCollection.updateOne(filter, updatedDoc);
            res.send(updatedOrder);
        });

        // delete cart product by id
        app.delete('/cart/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await cartCollection.deleteOne(query);
            res.send(result);
        });

    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello From React Assignment')
})

app.listen(port, () => {
    console.log(`Listening to the port ${port}`)
})