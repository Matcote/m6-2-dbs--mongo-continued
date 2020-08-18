const seats = [];
const row = ["A", "B", "C", "D", "E", "F", "G", "H"];
for (let r = 0; r < row.length; r++) {
  for (let s = 1; s < 13; s++) {
    seats.push({
      _id: `${row[r]}-${s}`,
      price: 225,
      isBooked: false,
    });
  }
}

const assert = require("assert");
const { MongoClient } = require("mongodb");

require("dotenv").config();
const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const batchImport = async () => {
  const client = await MongoClient(MONGO_URI, options);
  try {
    // TODO: connect...
    await client.connect();
    // TODO: declare 'db'
    const db = client.db("mongo_workshop_2");
    // We are using the 'exercises' database
    // and creating a new collection 'greetings'
    const r = await db.collection("seats").insertMany(seats);
    assert.equal(seats.length, r.insertedCount);
    console.log("success");
  } catch (err) {
    console.log(err.stack);
  }

  // TODO: close...
  client.close();
};

batchImport();
