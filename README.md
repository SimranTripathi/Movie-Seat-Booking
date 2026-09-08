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
