const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://mongodbuser1:${process.env.DB_PASS}@cluster0.kcjkm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();

    const database = client.db("assignment11");
    const servicesCollection = database.collection("services");
    const orderCollection = database.collection("orders");

    app.get("/services", async (req, res) => {
      const cursor = servicesCollection.find({});
      const services = await cursor.toArray();
      console.log(services);
      res.send(services);
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const services = await servicesCollection.findOne(query);
      // console.log('load services with id: ', id);
      res.send(services);
    });

    app.get("/order/:id", async (req, res) => {
      const id = req.params.id;
      console.log("load service with id: ", id);

      const query = { _id: ObjectId(id) };
      const service = await servicesCollection.findOne(query);
      // console.log("service: ", service);
      res.send(service);
    });

    app.post("/service", async (req, res) => {
      const newService = req.body;
      console.log("got new service", req.body);
      const result = await servicesCollection.insertOne(newService);
      console.log("added service", result);
      res.json(result);
    });
    app.post("/add-order", async (req, res) => {
      const newOrder = req.body;
      console.log("got new order", req.body);
      const result = await orderCollection.insertOne(newOrder);
      console.log("added order", result);
      res.json(result);
    });

    app.post("/my-orders", async (req, res) => {
      const customerEmail = req.body.customerEmail;
      // console.log(customerEmail);
      // const query = { customerEmail: customerEmail };
      const query = { customerEmail };

      // console.log(query);

      const cursor = orderCollection.find(query);
      const orders = await cursor.toArray();

      // console.log(orders[0]._id);
      // console.log(orders);

      const arrayOfIds = [];

      for (let index = 0; index < orders.length; index++) {
        const order = orders[index];

        arrayOfIds.push(ObjectId(order.serviceId));
      }

      // console.log(arrayOfIds);

      const servicesCollectionCursor = servicesCollection.find({
        _id: { $in: arrayOfIds },
      });

      const services = await servicesCollectionCursor.toArray();

      const order = orders[0];

      res.json({ services, order });
    });

    app.delete("/delete-order", async (req, res) => {
      const id = req.body.id;
      // console.log(id);

      const query = { serviceId: id };
      const result = await orderCollection.deleteOne(query);
      // const result = await orderCollection.findOne(query);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server");
});

app.listen(port, () => {
  console.log("Running on port", port);
});
