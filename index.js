const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ut0vo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const bikeCollection = client.db("motorBike").collection("inventories");

    //get inventory items from mongoDb
    app.get("/inventories", async (req, res) => {
      if (req.query.email) {
        const email = req.query.email;
        const query = { email: email };
        const cursor = bikeCollection.find(query);
        const inventories = await cursor.toArray();
        res.send(inventories);
      } else {
        const query = {};
        const cursor = bikeCollection.find(query);
        const inventories = await cursor.toArray();
        res.send(inventories);
      }
    });

    //get single item by id
    app.get("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const inventory = await bikeCollection.findOne(query);
      res.send(inventory);
    });

    //update stock
    app.put("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const updateQuantity = req.body.quantity;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          quantity: updateQuantity,
        },
      };
      const result = await bikeCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    //post data
    app.post("/inventories", async (req, res) => {
      const newItem = req.body;
      const result = await bikeCollection.insertOne(newItem);
      res.send(result);
    });

    //delete a user
    app.delete("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bikeCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server running");
});

app.listen(port, () => {
  console.log("Listening to port", port);
});
