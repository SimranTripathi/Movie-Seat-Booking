import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import PDFDocument from "pdfkit";
import crypto from "crypto";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/movie_booking";
const HOLD_TIME = 15 * 60 * 1000;


// ================= DATABASE =================

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((error) => {
    console.log("MongoDB Error:", error.message);
  });


// ================= SEAT MODEL =================

const seatSchema = new mongoose.Schema({
  seatNumber: {
    type: String,
    unique: true
  },

  status: {
    type: String,
    enum: ["AVAILABLE", "HELD", "BOOKED"],
    default: "AVAILABLE"
  },

  holdToken: {
    type: String,
    default: null
  },

  holdExpiresAt: {
    type: Date,
    default: null
  },

  bookingCode: {
    type: String,
    default: null
  }
});

const Seat = mongoose.model("Seat", seatSchema);


// ================= BOOKING MODEL =================

const bookingSchema = new mongoose.Schema({

  seatNumber: String,

  movieName: String,

  showDate: String,

  showTime: String,

  bookingCode: String,

  paymentMode: String,

  createdAt: {
    type: Date,
    default: Date.now
  }

});

const Booking = mongoose.model(
  "Booking",
  bookingSchema
);


// ================= RANDOM CODE =================

function generateCode() {

  return crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase();

}


// ================= RELEASE EXPIRED SEATS =================

async function releaseExpiredSeats() {

  await Seat.updateMany(

    {
      status: "HELD",

      holdExpiresAt: {
        $lte: new Date()
      }
    },

    {
      $set: {

        status: "AVAILABLE",

        holdToken: null,

        holdExpiresAt: null

      }
    }

  );

}


// ================= TEST API =================

app.get("/", (req, res) => {

  res.json({
    message: "Movie Booking Backend Running"
  });

});


// ================= GET SEATS =================

app.get("/api/seats", async (req, res) => {

  try {

    await releaseExpiredSeats();

    const seats = await Seat
      .find()
      .sort({ seatNumber: 1 });

    res.json(seats);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


// ================= CREATE SEATS =================

app.post("/api/seats/seed", async (req, res) => {

  try {

    const count = await Seat.countDocuments();

    if (count > 0) {

      return res.json({
        message: "Seats already exist"
      });

    }

    const seats = [];

    const rows = [
      "A",
      "B",
      "C",
      "D",
      "E"
    ];

    for (const row of rows) {

      for (let i = 1; i <= 10; i++) {

        seats.push({

          seatNumber: `${row}${i}`,

          status: "AVAILABLE"

        });

      }

    }

    await Seat.insertMany(seats);

    res.json({

      message: "50 seats created"

    });

  } catch (error) {

    res.status(500).json({

      message: error.message

    });

  }

});


// ================= START TRANSACTION =================

app.post(
  "/api/transaction/start",
  async (req, res) => {

    try {

      const { seatNumber } = req.body;

      await releaseExpiredSeats();

      const token =
        crypto.randomUUID();

      const expiry =
        new Date(Date.now() + HOLD_TIME);


      /*
       IMPORTANT:

       This operation is ATOMIC.

       Two users cannot successfully
       hold the same available seat.
      */

      const seat =
        await Seat.findOneAndUpdate(

          {
            seatNumber: seatNumber,

            $or: [

              {
                status: "AVAILABLE"
              },

              {
                status: "HELD",

                holdExpiresAt: {
                  $lte: new Date()
                }

              }

            ]

          },

          {

            $set: {

              status: "HELD",

              holdToken: token,

              holdExpiresAt: expiry

            }

          },

          {
            new: true
          }

        );


      if (!seat) {

        return res.status(409).json({

          message:
            "Seat is already booked. Select another seat."

        });

      }


      res.json({

        seatNumber:
          seat.seatNumber,

        holdToken:
          token,

        expiresAt:
          expiry

      });


    } catch (error) {

      res.status(500).json({

        message: error.message

      });

    }

  }
);


// ================= CANCEL TRANSACTION =================

app.post(
  "/api/transaction/cancel",
  async (req, res) => {

    try {

      const {
        seatNumber,
        holdToken
      } = req.body;


      await Seat.updateOne(

        {

          seatNumber,

          status: "HELD",

          holdToken

        },

        {

          $set: {

            status: "AVAILABLE",

            holdToken: null,

            holdExpiresAt: null

          }

        }

      );


      res.json({

        message:
          "Transaction cancelled"

      });


    } catch (error) {

      res.status(500).json({

        message: error.message

      });

    }

  }
);


// ================= PAY AT COUNTER =================

app.post(
  "/api/transaction/pay-at-counter",
  async (req, res) => {

    try {

      const {

        seatNumber,

        holdToken,

        movieName,

        showDate,

        showTime

      } = req.body;


      const bookingCode =
        generateCode();


      /*
       IMPORTANT:

       Only the user who currently
       owns the valid hold can book.

       This prevents double booking.
      */

      const seat =
        await Seat.findOneAndUpdate(

          {

            seatNumber,

            status: "HELD",

            holdToken,

            holdExpiresAt: {
              $gt: new Date()
            }

          },

          {

            $set: {

              status: "BOOKED",

              bookingCode,

              holdToken: null,

              holdExpiresAt: null

            }

          },

          {
            new: true
          }

        );


      if (!seat) {

        return res.status(409).json({

          message:
            "The seat is already booked. Select any other seat."

        });

      }


      const booking =
        await Booking.create({

          seatNumber,

          movieName,

          showDate,

          showTime,

          bookingCode,

          paymentMode:
            "PAY_AT_COUNTER"

        });


      res.json({

        message:
          "Transaction complete",

        booking

      });


    } catch (error) {

      res.status(500).json({

        message: error.message

      });

    }

  }
);


// ================= PDF RECEIPT =================

app.get(
  "/api/bookings/:code/pdf",
  async (req, res) => {

    try {

      const booking =
        await Booking.findOne({

          bookingCode:
            req.params.code

        });


      if (!booking) {

        return res.status(404).json({

          message:
            "Booking not found"

        });

      }


      res.setHeader(
        "Content-Type",
        "application/pdf"
      );


      const pdf =
        new PDFDocument();


      pdf.pipe(res);


      pdf
        .fontSize(22)
        .text(
          "MOVIE TICKET RECEIPT",
          {
            align: "center"
          }
        );


      pdf.moveDown();


      pdf
        .fontSize(14)
        .text(
          `Movie: ${booking.movieName}`
        );


      pdf.text(
        `Date: ${booking.showDate}`
      );


      pdf.text(
        `Time: ${booking.showTime}`
      );


      pdf.text(
        `Seat: ${booking.seatNumber}`
      );


      pdf.text(
        `Payment: Pay at Counter`
      );


      pdf.moveDown();


      pdf
        .fontSize(18)
        .text(
          `Booking Code: ${booking.bookingCode}`
        );


      pdf.moveDown();


      pdf
        .fontSize(13)
        .text(
          "Show this receipt at the counter to pay and get the ticket."
        );


      pdf.end();


    } catch (error) {

      res.status(500).json({

        message: error.message

      });

    }

  }
);


// ================= START SERVER =================

app.listen(
  PORT,
  () => {

    console.log(
      `Server running on http://localhost:${PORT}`
    );

  }
);