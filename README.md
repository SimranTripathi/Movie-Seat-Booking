# Movie Seat Booking System

A web-based Movie Seat Booking System developed using React.js, Node.js, Express.js, and MongoDB.

## Project Overview

The Movie Seat Booking System allows users to view available movie seats, select a seat, temporarily hold it for 15 minutes, and complete the booking using the Pay at Counter option.

The system also prevents two users from booking the same seat simultaneously and generates a unique booking code with a PDF receipt.

##  Features

-  Movie and show details
-  Interactive seat selection
-  Available seat status
-  Temporarily held seat status
-  Booked seat status
-  15-minute transaction countdown
-  Automatic release of expired seats
-  Concurrent/double-booking protection
-  Pay at Counter option
-  Random booking code generation
-  PDF booking receipt
-  MongoDB database
-  React frontend
-  Node.js + Express backend

##  Technologies Used

### Frontend
- React.js
- JavaScript
- Axios
- CSS
- Vite

### Backend
- Node.js
- Express.js
- JavaScript
- Mongoose
- PDFKit

### Database
- MongoDB

##  Project Structure

```text
Movie Seat Booking/
│
├── movie-booking/
│   └── client/
│       ├── src/
│       │   ├── App.jsx
│       │   ├── App.css
│       │   └── main.jsx
│       ├── package.json
│       └── vite.config.js
│
├── server/
│   ├── config/
│   │   └── db.js
│   ├── src/
│   │   └── server.js
│   └── package.json
│
├── package.json
├── package-lock.json
└── .gitignore
Requirements
Node.js 18+
MongoDB running locally or a MongoDB Atlas connection string
1. Start MongoDB
For local MongoDB, make sure the MongoDB service is running.
2. Start backend
```bash
cd server
npm install
copy .env.example .env
npm run seed
npm run dev
```

## Requirement

Node.js 18+
MongoDB running locally or a MongoDB Atlas connection string
## 1. Start MongoDB
For local MongoDB, make sure the MongoDB service is running.
## 2. Start backend

On macOS/Linux, use `cp .env.example .env` instead of `copy`.
Edit `.env` if your MongoDB URI is different.
Backend: http://localhost:5000
##  3. Start frontend
Open another terminal:
```bash
cd client
npm install
npm run dev
```
Frontend: http://localhost:5173
How the 3 cases work
## Case 1
Movie Seat Booking home page showing movie details and seat layout.
<img width="2880" height="1704" alt="Screenshot 2026-09-06 201211" src="https://github.com/user-attachments/assets/3b479dcb-97af-4161-889b-5d0d2f583556" />


##  Case 2
 Selected seat with 15-minute transaction countdown and Pay at Counter button.`
 Seat is already booked. Select any other seat.`
<img width="2850" height="1568" alt="Screenshot 2026-09-06 204119" src="https://github.com/user-attachments/assets/092f2757-6079-4d9b-8690-8a7769ab5172" />


## Case 3
Successful transaction showing the generated booking code.:
```text
showId + seatNumber + status: AVAILABLE
```
<img width="2878" height="1486" alt="Screenshot 2026-09-06 204129" src="https://github.com/user-attachments/assets/43dcc737-42cb-4d58-af65-1477604cd558" />


## MongoDB allows only the first matching update to succeed. The other request gets HTTP 409.
Timeout
The 15-minute timer is a transaction window on the frontend. No database lock is created during selection. Therefore an expired or cancelled selection never freezes a seat. The seat remains AVAILABLE until a successful payment atomically books it.
