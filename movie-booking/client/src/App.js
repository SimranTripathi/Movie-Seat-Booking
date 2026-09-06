import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:5000/api";

function App() {
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [holdToken, setHoldToken] = useState(null);
  const [expiry, setExpiry] = useState(null);

  const [timeLeft, setTimeLeft] = useState(0);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [booking, setBooking] = useState(null);

  // ---------------- GET SEATS ----------------

  const getSeats = async () => {
    try {
      const response = await axios.get(`${API}/seats`);
      setSeats(response.data);
    } catch (error) {
      setMessage("Backend server is not running.");
      setMessageType("error");
    }
  };

  // ---------------- INITIAL LOAD ----------------

  useEffect(() => {
    getSeats();
  }, []);

  // ---------------- COUNTDOWN ----------------

  useEffect(() => {
    if (!expiry) return;

    const timer = setInterval(() => {

      const remaining = Math.max(
        0,
        Math.ceil(
          (new Date(expiry).getTime() - Date.now()) / 1000
        )
      );

      setTimeLeft(remaining);

      // TIMEOUT
      if (remaining === 0) {

        clearInterval(timer);

        cancelTransaction();

        setMessage(
          "Transaction cancelled. Seat is available again."
        );

        setMessageType("error");

      }

    }, 1000);

    return () => clearInterval(timer);

  }, [expiry]);

  // ---------------- SELECT SEAT ----------------

  const selectSeat = async (seat) => {

    if (seat.status === "BOOKED") {

      setMessage(
        "Seat is already booked. Select another seat."
      );

      setMessageType("error");

      return;
    }

    if (selectedSeat) {

      setMessage(
        "Please complete or cancel your current transaction."
      );

      setMessageType("error");

      return;
    }

    try {

      const response = await axios.post(
        `${API}/transaction/start`,
        {
          seatNumber: seat.seatNumber
        }
      );

      setSelectedSeat(
        response.data.seatNumber
      );

      setHoldToken(
        response.data.holdToken
      );

      setExpiry(
        response.data.expiresAt
      );

      setMessage(
        `Seat ${seat.seatNumber} selected.`
      );

      setMessageType("success");

      getSeats();

    } catch (error) {

      setMessage(
        error.response?.data?.message ||
        "Seat is not available."
      );

      setMessageType("error");

      getSeats();
    }
  };

  // ---------------- CANCEL ----------------

  const cancelTransaction = async () => {

    if (!selectedSeat || !holdToken) return;

    try {

      await axios.post(
        `${API}/transaction/cancel`,
        {
          seatNumber: selectedSeat,
          holdToken: holdToken
        }
      );

    } catch (error) {
      console.log(error);
    }

    setSelectedSeat(null);
    setHoldToken(null);
    setExpiry(null);
    setTimeLeft(0);

    getSeats();
  };

  // ---------------- PAY AT COUNTER ----------------

  const payAtCounter = async () => {

    try {

      const response = await axios.post(
        `${API}/transaction/pay-at-counter`,
        {
          seatNumber: selectedSeat,
          holdToken: holdToken,

          movieName: "Avengers: Endgame",

          showDate: "10 September 2026",

          showTime: "7:00 PM"
        }
      );

      setBooking(
        response.data.booking
      );

      setMessage(
        "Transaction complete! Seat booked permanently."
      );

      setMessageType("success");

      setSelectedSeat(null);
      setHoldToken(null);
      setExpiry(null);
      setTimeLeft(0);

      getSeats();

    } catch (error) {

      setMessage(
        error.response?.data?.message ||
        "Seat is already booked."
      );

      setMessageType("error");

      setSelectedSeat(null);
      setHoldToken(null);
      setExpiry(null);

      getSeats();
    }
  };

  // ---------------- PDF ----------------

  const generatePDF = () => {

    if (!booking) return;

    window.open(
      `${API}/bookings/${booking.bookingCode}/pdf`,
      "_blank"
    );
  };

  // ---------------- SEAT ROWS ----------------

  const rows = ["A", "B", "C", "D", "E"];

  return (

    <div className="container">

      {/* HEADER */}

      <h1>🎬 Movie Seat Booking</h1>

      <h2>Avengers: Endgame</h2>

      <p>
        10 September 2026 | 7:00 PM
      </p>


      {/* MESSAGE */}

      {message && (

        <div
          className={`message ${messageType}`}
        >
          {message}
        </div>

      )}


      {/* BOOKING COMPLETE */}

      {booking ? (

        <div className="booking">

          <h2>✅ Transaction Complete</h2>

          <p>
            Your seat{" "}
            <strong>
              {booking.seatNumber}
            </strong>{" "}
            is permanently booked.
          </p>

          <h3>Booking Code</h3>

          <div className="code">
            {booking.bookingCode}
          </div>

          <p>
            The seat is booked. You can
            show/provide the above code at
            the counter to pay and get the ticket.
          </p>

          <button
            onClick={generatePDF}
            className="payButton"
          >
            📄 Generate PDF Receipt
          </button>

          <br /><br />

          <button
            onClick={() => {
              setBooking(null);
              setMessage("");
            }}
          >
            Back to Seat Selection
          </button>

        </div>

      ) : (

        <>

          {/* SCREEN */}

          <div className="screen">
            SCREEN
          </div>


          {/* SEATS */}

          <div className="seatContainer">

            {rows.map(row => (

              <div
                className="row"
                key={row}
              >

                <span className="rowName">
                  {row}
                </span>

                {seats
                  .filter(
                    seat =>
                      seat.seatNumber.startsWith(row)
                  )
                  .map(seat => (

                    <button
                      key={seat.seatNumber}

                      className={`
                        seat
                        ${seat.status.toLowerCase()}
                        ${
                          selectedSeat ===
                          seat.seatNumber
                            ? "selected"
                            : ""
                        }
                      `}

                      disabled={
                        seat.status === "BOOKED" ||
                        selectedSeat !== null
                      }

                      onClick={() =>
                        selectSeat(seat)
                      }
                    >
                      {seat.seatNumber}
                    </button>

                  ))}

              </div>

            ))}

          </div>


          {/* PAYMENT */}

          {selectedSeat && (

            <div className="payment">

              <h2>
                Selected Seat:
                {" "}
                {selectedSeat}
              </h2>

              <h2>
                ⏱ Time Remaining:
                {" "}
                {Math.floor(timeLeft / 60)
                  .toString()
                  .padStart(2, "0")}
                :
                {(timeLeft % 60)
                  .toString()
                  .padStart(2, "0")}
              </h2>

              <button
                className="payButton"
                onClick={payAtCounter}
              >
                💳 Pay at Counter
              </button>

              <button
                className="cancelButton"
                onClick={cancelTransaction}
              >
                Cancel Transaction
              </button>

            </div>

          )}

        </>

      )}

    </div>

  );
}

export default App;