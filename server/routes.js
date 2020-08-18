const router = require("express").Router();

const NUM_OF_ROWS = 8;
const SEATS_PER_ROW = 12;

const assert = require("assert");
const { MongoClient } = require("mongodb");

require("dotenv").config();
const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Code that is generating the seats.
// ----------------------------------
// const seats = {};
// const row = ["A", "B", "C", "D", "E", "F", "G", "H"];
// for (let r = 0; r < row.length; r++) {
//   for (let s = 1; s < 13; s++) {
//     seats[`${row[r]}-${s}`] = {
//       price: 225,
//       isBooked: false,
//     };
//   }
// }
// ----------------------------------
//////// HELPERS
const getRowName = (rowIndex) => {
  return String.fromCharCode(65 + rowIndex);
};

// const randomlyBookSeats = (num) => {
//   const bookedSeats = {};

//   while (num > 0) {
//     const row = Math.floor(Math.random() * NUM_OF_ROWS);
//     const seat = Math.floor(Math.random() * SEATS_PER_ROW);

//     const seatId = `${getRowName(row)}-${seat + 1}`;

//     bookedSeats[seatId] = true;

//     num--;
//   }

//   return bookedSeats;
// };

let state;
const seats = {};
router.get("/api/seat-availability", async (req, res) => {
  // if (!state) {
  //   state = {
  //     bookedSeats: randomlyBookSeats(30),
  //   };
  // }
  const client = await MongoClient(MONGO_URI, options);
  await client.connect();
  const db = client.db("mongo_workshop_2");
  const mongoSeats = await db.collection("seats").find().toArray();
  mongoSeats.forEach((seat) => {
    seats[seat._id] = seat;
  });

  // if (seats.length > 0) {
  //   res
  //     .status(200)
  //     .json({ status: 200, data: seats });
  // } else {
  //   res.status(404);
  // }
  client.close();
  return res.status(200).json({
    seats: seats,
    // bookedSeats: state.bookedSeats,
    numOfRows: 8,
    seatsPerRow: 12,
  });
});

router.post("/api/book-seat", async (req, res) => {
  const { seatId, creditCard, expiration } = req.body;

  if (seats[seatId].isBooked) {
    return res.status(400).json({
      message: "This seat has already been booked!",
    });
  }

  if (!creditCard || !expiration) {
    return res.status(400).json({
      status: 400,
      message: "Please provide credit card information!",
    });
  }
  try {
    const client = await MongoClient(MONGO_URI, options);
    await client.connect();
    const db = client.db("mongo_workshop_2");
    const _id = seatId;
    const r = await db
      .collection("seats")
      .updateOne({ _id }, { $set: { isBooked: true } });
    assert.equal(1, r.matchedCount);
    assert.equal(1, r.modifiedCount);
    seats[seatId].isBooked = true;
    return res.status(200).json({
      status: 200,
      success: true,
    });
  } catch (err) {
    console.log(err.stack);
    return res
      .status(500)
      .json({ status: 500, data: { ...req.body }, message: err.message });
  }
});

module.exports = router;
