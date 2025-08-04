# Digital Wallet API

- A secure, modular, and role-based backend API for a digital wallet system inspired by real-world platforms like **bKash** and **Nagad**. Built with **Express.js** and **Mongoose**, this system handles user authentication, wallet operations, and transaction management with robust business rules and validations.

---

## Live Link

```
https://digital-wallet-server-nine.vercel.app/
```

## Admin And Agent Email, Password

```
Admin:
  email: admin@gmail.com,
  password: Admin123@

Agent:
 email: mim@gmail.com
 password: Password@123
```

## Features

- JWT-based login and registration
- Role-based access control (`admin`, `agent`, `user`)
- Admin can retrieve all transaction history with support for pagination, sorting (by fields like amount, date), and filtering (by transaction type, status, user, etc.)
- Automatic wallet creation on registration.
- Add money, withdraw, send money, and view transaction history
- Agents can perform cash-in/out for users
- Admins can manage wallets, users, agents, and transactions
- Complete transaction tracking and validation
- Modular, scalable project structure

---

## Technologies Used

- **Node.js**
- **Express.js**
- **TypeScript**
- **MongoDB**
- **Mongoose**
- **ts-node-dev**
- **dotenv**
- **bcryptjs**
- **cookie-parser**
- **http-status-codes**
- **jsonwebtoken**

---

## Installation & Setup

```
git clone https://github.com/MukitHossen7/Digital_Wallet_API.git
```

```
cd Digital_Wallet_API
```

```
npm install
```

```
npm run dev
```

```
Make sure you have a MongoDB connection string set in your `.env` file:
```

## Project Structure

```bash
src/
├── app/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.service.ts
│   │
│   │   ├── user/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.interface.ts
│   │   │   ├── user.model.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── user.service.ts
│   │   │   └── user.zod.validation.ts
│   │
│   │   ├── wallet/
│   │   │   ├── wallet.controller.ts
│   │   │   ├── wallet.interface.ts
│   │   │   ├── wallet.model.ts
│   │   │   ├── wallet.routes.ts
│   │   │   ├── wallet.service.ts
│   │   │   └── wallet.zod.validation.ts
│   │
│   │   ├── transaction/
│   │   │   ├── transaction.controller.ts
│   │   │   ├── transaction.interface.ts
│   │   │   ├── transaction.model.ts
│   │   │   ├── transaction.routes.ts
│   │   │   ├── transaction.service.ts
│   │   │   └── transaction.zod.validation.ts
│
│   ├── routes/
│   │   └── routes.ts
│
│   ├── middlewares/
│   │   ├── checkAuth.ts
│   │   ├── globalErrorHandler.ts
│   │   └── notFound.ts
│
│   ├── utils/
│   │   ├── catchAsync.ts
│   │   ├── sendResponse.ts
│   │   └── setToken.ts
│
│   └── errorHelpers/
│       └── AppError.ts
│
├── config/
│   └── index.ts
│
├── app.ts
├── server.ts
└── .env
```

---

## API Endpoints

### User Endpoints

#### 1.User Registration

```
POST /api/v1/register
```

```json
Request Body:
{
  "name": "Toma",
  "email": "toma@gmail.com",
  "password": "Password@123",
  "phone": "+8801706835770",
  "address": "123 Gulshan Avenue, Dhaka, Bangladesh"
}
```

#### 2. Get All Users or Agents (Admin)

```
GET /api/v1/users?role=USER|AGENT
```

```json
Response:
{
  "success": true,
  "message": "USER Retrieve Successfully",
  "data": [ /* array of user or agent objects */ ]
}
```

#### 3.Approve Agent (Admin)

```
PATCH /api/v1/users/approve/:id
```

```json
Response:
{
  "success": true,
  "message": "User has been promoted to AGENT",
  "data": {
    /* agent user object */
  }
}
```

#### 4.Suspend Agent (Admin)

```
PATCH /api/v1/users/suspend/:id
```

```json
Response:
{
  "success": true,
  "message": "AGENT suspend Successfully",
  "data": {
    /* suspended agent user object */
  }
}
```

### Auth Endpoints

#### 1.User Login

```
POST /api/v1/auth/login
```

```json
Request Body:
{
  "email": "admin@gmail.com",
  "password": "Admin123@"
}
```

#### 2.User Logout

```
POST /api/v1/auth/logout
```

```json
Response:
{
  "success": true,
  "message": "User logged out successfully"
}
```

### Wallet Endpoints

#### 1.Get All Wallets (Admin)

```
GET /api/v1/wallets?role=USER|AGENT
```

```json
Response:
"success": true,
"message": `All Wallets for role ${role} Retrieved Successfully`,
"data": [{}],
```

#### 2. Get My Wallet (Agent, User)

```
GET /api/v1/wallets/me
```

```json
Response:
"success": true,
"message": "Your Wallet Retrieved Successfully",
"data": {},
```

#### 3.Block a Wallet (Admin)

```
PATCH /api/v1/wallets/block/:id
```

```json
Response:
"success": true,
"message": "Wallet Blocked Successfully",
```

#### 4.Unblock a Wallet (Admin)

```
PATCH /api/v1/wallets/unblock/:id
```

```json
Response:
"success": true,
"message": "Wallet UnBlocked Successfully",
```

### Transaction Endpoints

#### 1.Add Money (User)

```
POST /api/v1/transactions/add-money
```

```json
Request Body:
{
    "amount": 50
}
```

#### 2.Withdraw Money (User)

```
POST /api/v1/transactions/withdraw
```

```json
Request Body:
{
    "amount": 500
}
```

#### 3. Send Money to Another User (User)

```
POST /api/v1/transactions/send-money
```

```json
Request Body:
{
    "amount": 100,
    "receiverId": "688e3cf5dbe9c3cb7b0cd266"
}
```

#### 4.Get My Transaction History (User,Agent)

```
GET /api/v1/transactions/me
```

```json
Response:
"success": true,
"message": "Transaction history retrieved successfully",
"data" : [{}]
```

#### 5.Get All Transactions (Admin)

Admin can retrieve all transaction history with support for pagination, sorting (by fields like amount, date), and filtering (by transaction type, status, user, etc.)

```
GET /api/v1/transactions

GET/api/v1/transactions?type=ADD_MONEY&page=1&sort=-amount&limit=5
```

```json
Response:
"success": true,
"message": "All transaction history retrieved successfully",
"data" : [{}]
```

#### 6.Cash-In (Agent)

```
POST /api/v1/transactions/cash-in
```

```json
Request Body:
{
    "amount": 50,
    "receiverId": "688e3cf5dbe9c3cb7b0cd266"

}
```

#### 7.Cash-Out (Agent)

```
POST /api/v1/transactions/cash-out
```

```json
Request Body:
{
    "amount": 2000,
    "senderId": "688e3cf5dbe9c3cb7b0cd266"

}
```

---

## Dependencies

- "bcryptjs": "^3.0.2",
- "cookie-parser": "^1.4.7",
- "cors": "^2.8.5",
- "dotenv": "^17.2.0",
- "express": "^5.1.0",
- "http-status-codes": "^2.3.0",
- "jsonwebtoken": "^9.0.2",
- "mongoose": "^8.16.4",
- "zod": "^3.25.76"

## DevDependencies

- "@types/cookie-parser": "^1.4.9",
- "@types/cors": "^2.8.19",
- "@types/express": "^5.0.3",
- "@types/jsonwebtoken": "^9.0.10",
- "ts-node-dev": "^2.0.0",
- "typescript": "^5.8.3"

---
