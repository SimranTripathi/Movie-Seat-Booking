# Movie Seat Booking System

A web-based **Movie Seat Booking System** built using **React.js, Node.js, Express.js, and MongoDB**. The application provides a simple and secure way for users to view available movie seats, select their preferred seats, and complete the booking process.

## Project Overview

The **Movie Seat Booking System** allows users to browse available seats and select their preferred seats for a movie. Selected seats are temporarily **held for 15 minutes**, giving users sufficient time to complete their booking.

The system includes a **Pay at Counter** payment option and uses a **seat-locking mechanism** to prevent multiple users from booking the same seat simultaneously.

After a successful booking, the system generates a **unique booking code** and creates a **PDF receipt** containing important booking details such as the movie, selected seats, booking information, and payment method.

### Key Features

* View available and booked seats
* Select preferred movie seats
* 15-minute temporary seat hold
* Prevents duplicate or simultaneous seat bookings
* Pay at Counter payment option
* Unique booking code generation
* PDF booking receipt generation
* React.js-based user interface
* Node.js and Express.js backend
* MongoDB database integration

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
-  frontend+ express 

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

## Case 4
 Generated PDF receipt containing the booking details.

<img width="1648" height="1078" alt="Screenshot 2026-09-06 204144" src="https://github.com/user-attachments/assets/66ac8e67-c41b-40ba-8560-231a0f9a4f9d" />

### Concurrent Booking

MongoDB ensures that only the first matching update succeeds when multiple users try to book the same seat simultaneously. Any subsequent request fails and returns an **HTTP 409 Conflict** response.

### Timeout Handling

The **15-minute timer** acts as a transaction window on the frontend. No database lock is created while a seat is being selected. If the selection is cancelled or the timer expires, the seat is automatically available for others. A seat is marked as **BOOKED** only after a successful payment through an atomic database update.

