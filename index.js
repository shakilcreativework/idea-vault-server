const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// mongodb uri
const uri = process.env.MONGODB_URI;

// middleware
app.use(cors());
app.use(express.json());

// ----------------------- mongodb start ---------------------------
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    await client.connect();
    // ----------- server db code start --------------
    const db = client.db("ideavaultDB");
    const ideaCollection = db.collection("ideas");
    const commentCollection = db.collection("comment");

    // get
    app.get("/add-ideas", async (req, res) => {
      const result = await ideaCollection.find().toArray();
      console.log(result);
      res.json(result);
    });

    app.get("/add-ideas/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };

      const result = await ideaCollection.findOne(query);

      res.send(result);
    });

    // comment read
    app.get('/comments', async(req, res) => {
      const result = await commentCollection.find().toArray();
      console.log(result);
      res.json(result);
    });

    // Get ideas by user email
    app.get("/add-ideas", async(req, res) => {
      const email = req.query.email;
      let query = {};

      // If email exists, filter by email
      if (email) {
        query = {
          userEmail: email,
        };
      }

      const result = await ideaCollection.find(query).toArray();

      res.json(result);
    });

    // post
    app.post("/add-ideas", async (req, res) => {
      const ideaData = req.body;

      // Add current date & time
      const newData = {
        ...ideaData,
        createdAt: new Date(),
      };
      console.log(newData);
      const result = await ideaCollection.insertOne(newData);
      res.json(result);
    });

    // comments
    app.post('/comments', async(req, res) => {
      const commentData = req.body;

      const newComment = {
        ...commentData,
        createdAt: new Date(),
      }

      console.log(newComment);
      const result = await commentCollection.insertOne(newComment);
      res.json(result);
    });

    // update and patch

    // delete
    // ----------- server db code ends ---------------
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);
// ----------------------- mongodb ends ----------------------------

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
