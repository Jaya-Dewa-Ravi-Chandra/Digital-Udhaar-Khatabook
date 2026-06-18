# UdhaarBook — Digital Khata Management

A full-stack web application for Indian small business owners to manage customer credit/debit (udhaar), collect payments via Razorpay, and maintain a complete digital khata — replacing paper ledgers.

---

## Features

### For Merchants

* Secure JWT Authentication
* Customer Management
* Credit (Udhaar) Tracking
* Debit (Payment) Tracking
* Razorpay Online Payments
* Cash Payment Settlement
* Soft Delete & Trash Bin
* Password Management

### For Admins

* View All Users
* Block / Unblock Accounts
* Monitor Platform Usage

---

## Tech Stack

### Frontend

* React 18
* Vite
* Tailwind CSS
* React Router
* Zustand
* Axios
* Razorpay Checkout

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt
* Razorpay SDK

---

## Repository Structure

```text
Digital-Udhaar-Khatabook/
│
├── Backend/
│   ├── API/
│   ├── middlewares/
│   ├── models/
│   └── server.js
│
├── Frontend/
│   └── frontend/
│
├── README.md
├── README-frontend.md
└── README-backend.md
```

---


### Backend Setup

```bash
cd Backend
npm install
npm run dev
```

### Frontend Setup

```bash
cd Frontend/frontend
npm install
npm run dev
```

---

## Application Workflow

```text
User Login
     ↓
Add Customers
     ↓
Add Udhaar Transactions
     ↓
Receive Payments
     ↓
Pay Online (Razorpay)
         OR
Pay by Cash
     ↓
Transaction Marked Paid
     ↓
Soft Delete / Restore
```

---

## Author

**Jaya Dewa Ravi Chandra**

---

## Documentation

* README-frontend.md
* README-backend.md
