# UdhaarBook Backend

REST API built using Express.js, MongoDB, and Razorpay integration.

---

## Tech Stack

| Technology    | Purpose               |
| ------------- | --------------------- |
| Node.js       | Runtime               |
| Express.js    | API Server            |
| MongoDB       | Database              |
| Mongoose      | ODM                   |
| JWT           | Authentication        |
| bcrypt        | Password Security     |
| Razorpay SDK  | Payment Processing    |
| cookie-parser | Cookie Handling       |
| cors          | Cross-Origin Requests |

---

## Structure

```text
Backend/
│
├── API/
│   ├── commonApi.js
│   ├── customerApi.js
│   ├── transactionsApi.js
│   ├── paymentApi.js
│   └── razorpayApi.js
│
├── middlewares/
│   └── VerifyToken.js
│
├── models/
│   ├── UserModel.js
│   ├── CustomerModel.js
│   └── TransactionModel.js
│
├── server.js
└── .env
```

---

## Installation

```bash
cd Backend
npm install
```

---

## Environment Variables

```env
PORT=4000

DB_URL=mongodb+srv://username:password@cluster.mongodb.net/udhaarbook

SECRET_KEY=your_jwt_secret

RAZORPAY_KEY_ID=rzp_live_xxxxxxxxx

RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
```

---

## Run Server

Development:

```bash
npm run dev
```

Production:

```bash
node server.js
```

---

## Authentication Flow

```text
User Login
      ↓
Password Verification
      ↓
JWT Generation
      ↓
HTTP Only Cookie
      ↓
Protected Routes
```

Production Cookie Configuration:

```js
res.cookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
});
```

---

## API Modules

### Authentication

```text
/api/common
```

Endpoints:

* Signup
* Signin
* Signout
* Check Auth
* Change Password

---

### Customers

```text
/api/customers
```

Endpoints:

* Create Customer
* Get Customers
* Update Customer
* Delete Customer

---

### Transactions

```text
/api/transactions
```

Endpoints:

* Credit Entry
* Debit Entry
* Soft Delete
* Restore
* Hard Delete
* Trash Retrieval

---

### Payments

```text
/api/payment
```

Endpoints:

* Create Order
* Verify Payment
* Customer Payment Settlement

---

## Database Models

### User

```text
Name
Email
Password
Role
isActive
Razorpay Details
```

### Customer

```text
UserId
Name
Phone
```

### Transaction

```text
UserId
CustomerId
Type
Amount
Status
Description
PaymentId
isDeleted
deletedAt
```

---

## Razorpay Payment Flow

```text
Create Order
      ↓
Save Order ID
      ↓
User Pays
      ↓
Verify Signature
      ↓
Update Status = PAID
```

---

## Deployment

### Render

Build Command

```bash
npm install
```

Start Command

```bash
node server.js
```

---

## Production CORS

```js
app.use(
  cors({
    origin: "https://your-frontend.vercel.app",
    credentials: true,
  })
);
```

---

## Author

**Jaya Dewa Ravi Chandra**
