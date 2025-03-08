require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.upbqh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// console.log(DB_USER)

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    
    const campaignCollection = client.db("campaignDB").collection("campaigns");
    const myCampaignCollection = client.db("campaignDB").collection("personal");
    const donateCollection = client.db("campaignDB").collection("donate");

    app.get("/running-campaign",async(req,res)=>{
        const campaign = campaignCollection.find().limit(6);
        const result = await campaign.toArray();
        res.send(result);
    })

    app.get("/all/:id",async(req,res)=>{
    const id = req.params.id;
    const query = {_id:new ObjectId(id)};
    const result = await campaignCollection.findOne(query);
    res.send(result);
  })

  app.get("/all",async(req,res)=>{
    const campaign = campaignCollection.find();
    const result = await campaign.toArray();
    res.send(result);
  })

  app.post("/myCampaign",async(req,res)=>{
    const newCampaign = req.body;
    const result = await myCampaignCollection.insertOne(newCampaign);
    res.send(result);
  })

  app.get("/myCampaign/:email", async (req, res) => {
    try {
      const email = req.params.email;
      const query = { email: email };
  
      const campaigns = await myCampaignCollection.find(query).toArray();
      res.send(campaigns);
    } catch (error) {
      res.status(500).send({ error: "Failed to fetch campaigns" });
    }
  });

  app.get("/myCampaigns/:id",async(req,res)=>{
    const id = req.params.id;
    const query = {_id : new ObjectId(id)};
    const result = await myCampaignCollection.findOne(query);
    res.send(result);
  })

  app.patch("/myCampaigns/:id",async(req,res)=>{
    const id = req.params.id;
    const filter = {_id : new ObjectId(id)};
    const update = req.body;
    const docs = {
        $set:{
            image:update.image,
            title:update.title,
            category:update.category,
            description:update.description,
            goalAmount:update.goalAmount,
            deadline:update.deadline,
            email:update.email,
            username:update.username,

        }
    }
    const result = await myCampaignCollection.updateOne(filter,docs);
    res.send(result);
  })

  app.delete("/myCampaign/:id", async (req, res) => {
    try {
        const id = req.params.id;

        // Validate ObjectId format
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid campaign ID format" });
        }

        const filter = { _id: new ObjectId(id) };
        const result = await myCampaignCollection.deleteOne(filter);

        if (result.deletedCount === 1) {
            res.json({ success: true, message: "Campaign deleted successfully!" });
        } else {
            res.status(404).json({ error: "Campaign not found!" });
        }
    } catch (error) {
        console.error("Error deleting campaign:", error);
        res.status(500).json({ error: "Failed to delete campaign" });
    }
});

// donate 

app.post("/donate",async(req,res)=>{
    const donation = req.body;
    const result = await donateCollection.insertOne(donation);
    res.send(result); 
})

app.get("/donate",async(req,res)=>{
    const donation = donateCollection.find();
    const result = await donation.toArray();
    res.send(result)
})

app.get("/donate/:email", async (req, res) => {
    const email = req.params.email;
    const filter = { email: email };
    const result = await donateCollection.find(filter).toArray();
    res.send(result);
});






    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/",(req,res)=>{
    res.send("This Backend Server is Running")
});

app.listen(port,()=>{
    console.log(`Server is listening from port : ${port}`);
})