const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r3tx4xp.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const foodItemCollection = client.db("FoooDrop").collection("FoodItem");
    const userCollection = client.db("FoooDrop").collection("User");

    // user input
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { userEmail: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };

      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    // find all users
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    // findSingleUser

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { userEmail: email };
      const result = await userCollection.findOne(filter);
      res.send(result);
    });

    //single user delete

    app.delete("/userDelete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    // user request for seller

    app.put("/requestSeller/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const filter = { userEmail: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          requestFor: "seller",
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    // user request for seller
    app.put("/requestRider/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const filter = { userEmail: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          requestFor: "rider",
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    // update client to seller
    app.put("/updateSeller/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { userEmail: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          requestFor: "",
          userRole: "seller",
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    // this is all food find part
    app.get("/allFood", async (req, res) => {
      const result = await foodItemCollection.find().toArray();
      res.send(result);
    });

    // this is singleFoodFind part
    app.get("/allFood/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodItemCollection.findOne(query);
      res.send(result);
    });

    // this food review part
    app.put("/reviewFood/:id", async (req, res) => {
      const id = req.params.id;

      const body = req.body;
      const options = { upsert: true };
      const filter = { _id: new ObjectId(id) };

      const doc = {
        $set: {
          reviews: [body],
        },
      };

      const result = await foodItemCollection.updateOne(filter, doc, options);
      res.send(result);
    });

    // add food in form
    app.post("/addFoods", async (req, res) => {
      const food = req.body;
      const result = await foodItemCollection.insertOne(food);
      res.send(result);
    });

    // find my food for seller
    app.get("/findFoodOwner/:email", async (req, res) => {
      const email = req.params.email;
      const query = { "host.email": email };
      const result = await foodItemCollection.find(query).toArray();
      res.send(result);
    });

    // seller delete his single food

    app.delete("/deleteMySingleFood/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodItemCollection.deleteOne(query);
      res.send(result);
    });

    //seller update his single food

    app.put("/updateSingleFood/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateBody = req.body;
      const options = { upsert: true };
      const updateDoc = {
        $set: updateBody,
      };
      const result = await foodItemCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });
    // food approve or deny from admin
    app.put("/updateFoodRequestApprove/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          request: "approve",
        },
      };
      const result = await foodItemCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.put("/updateFoodRequestDeny/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          request: "deny",
        },
      };
      const result = await foodItemCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Food Drop Project  Server is running..");
});

app.listen(port, () => {
  console.log(`Food Drop Project is running on port ${port}`);
});
