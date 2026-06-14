# UdhaarBook Frontend

Frontend application built using React and Vite for managing customer udhaar transactions digitally.

---

## Tech Stack

| Technology        | Purpose           |
| ----------------- | ----------------- |
| React 18          | User Interface    |
| Vite              | Build Tool        |
| Tailwind CSS      | Styling           |
| React Router DOM  | Routing           |
| Zustand           | State Management  |
| Axios             | API Requests      |
| Razorpay Checkout | Payment Interface |

---

## Structure

```text
Frontend/frontend/
│
├── public/
│   └── hero.gif
│
├── src/
│   ├── pages/
│   ├── authStore.js
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
│
├── index.html
├── package.json
└── vite.config.js
```

---

## Installation

```bash
cd Frontend/frontend
npm install
```

---

## Environment Variables

Create:

```env
VITE_API_URL=https://your-backend.onrender.com
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxx
```

---

## Run Project

Development:

```bash
npm run dev
```

Production Build:

```bash
npm run build
```

Preview Build:

```bash
npm run preview
```

---

## Available Routes

| Route                    | Access |
| ------------------------ | ------ |
| /                        | Public |
| /signin                  | Public |
| /signup                  | Public |
| /dashboard               | User   |
| /customers//transactions | User   |
| /trash                   | User   |
| /admin                   | Admin  |

---

## Key Features

### Authentication

* Login
* Registration
* Session Persistence
* Protected Routes

### Customer Management

* Create Customers
* Edit Customers
* Delete Customers

### Transaction Management

* Add Credit
* Add Debit
* Mark Paid
* Razorpay Payments
* Cash Payments

### Trash Management

* Restore Deleted Transactions
* Permanently Delete Transactions

### Admin Dashboard

* View Users
* Block Users
* Unblock Users

---

## Razorpay Integration

```text
Create Order
      ↓
Open Checkout
      ↓
Payment Success
      ↓
Verify Signature
      ↓
Update Transaction Status
```

---

## Deployment

### Vercel

Build Command

```bash
npm run build
```

Output Directory

```text
dist
```

Environment Variables:

```env
VITE_API_URL=https://your-backend.onrender.com
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxx
```
