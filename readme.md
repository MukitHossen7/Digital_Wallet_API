# Digital Wallet API

- A secure, modular, and role-based backend API for a digital wallet system inspired by real-world platforms like **bKash** and **Nagad**. Built with **Express.js** and **Mongoose**, this system handles user authentication, wallet operations, and transaction management with robust business rules and validations.

---

## Live Link

```
https://neopay-api.vercel.app/
```

## Admin And Agent Email, Password

```
Admin:
  email: admin@gmail.com,
  password: Admin123@

Agent:
 email: mukithossen7@gmail.com
 password: Agent123@

 User:
 email: hossenmukit7@gmail.com
 password: User123@
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
- If a user is not verified, they cannot log in. After verification, an email will be sent to the user, and then they can log in.

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
- **cloudinary**
- **multer**
- **nodemailer**
- **multer-storage-cloudinary**
- **passport**
- **redis**

---

## Installation & Setup

```
git clone https://github.com/MukitHossen7/Digital_Wallet_API
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
POST /api/v1/users/register
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

#### 5.Update Profile (User,Agent, Admin)

```
PATCH /api/v1/users/updateProfile
```

```json
Request Body:
{
  "name": "abc",
  "phone": "01365479546",
  "address":"Dhaka Bangladesh",
  "image": "image.jpg"
}
```

#### 6.Block User (Admin)

```
PATCH /api/v1/users/block/:id
```

```json
Response:
{
  "success": true,
  "message": "User has been blocked",
  "data": null
}
```

#### 7.UnBlock User (Admin)

```
PATCH /api/v1/users/unblock/:id
```

```json
Response:
{
  "success": true,
  "message": "User has been unblock",
  "data": null
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

#### 3.Create Refresh Token

```
POST /api/v1/auth/refresh-token
```

#### 4.Change Password

```
POST /api/v1/auth/change-password
```

```json
Request Body:
{
  "newPassword": "123456789",
  "oldPassword": "Password@123",
}

```

#### 5.Google Login

```
GET /api/v1/auth/google
```

#### 6.Send OTP

```
POST /api/v1/otp/send
```

#### 7.Verify OTP

```
POST /api/v1/otp/verify
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
    "amount": 100,
    "agent-email": "abc@gmail.com",
    "type": "ADDMONEY"
}
```

#### 2.Withdraw Money (User)

```
POST /api/v1/transactions/withdraw
```

```json
Request Body:
{
     "amount": 100,
    "agent-email": "abc@gmail.com",
    "type": "WITHDRAW"
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
    "user-email": "abc@gmail.com",
    "type": "SENDMONEY"
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
    "amount": 200,
    "user-email": "hossenmukit7@gmail.com",
    "type": "ADDMONEY"
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
    "user-email": "hossenmukit7@gmail.com",
    "type": "WITHDRAW"
}
```

---

## Dependencies

- "bcryptjs": "^3.0.2",
- "cloudinary": "^1.41.3",
- "cookie-parser": "^1.4.7",
- "cors": "^2.8.5",
- "dotenv": "^17.2.0",
- "ejs": "^3.1.10",
- "express": "^5.1.0",
- "express-session": "^1.18.2",
- "http-status-codes": "^2.3.0",
- "jsonwebtoken": "^9.0.2",
- "mongoose": "^8.16.4",
- "multer": "^2.0.2",
- "multer-storage-cloudinary": "^4.0.0",
- "nodemailer": "^7.0.5",
- "passport": "^0.7.0",
- "passport-google-oauth20": "^2.0.0",
- "passport-local": "^1.0.0",
- "redis": "^5.8.2",
- "zod": "^3.25.76"

## DevDependencies

- "@types/cookie-parser": "^1.4.9",
- "@types/cors": "^2.8.19",
- "@types/express": "^5.0.3",
- "@types/express-session": "^1.18.2",
- "@types/jsonwebtoken": "^9.0.10",
- "@types/passport": "^1.0.17",
- "@types/passport-google-oauth20": "^2.0.16",
- "@types/passport-local": "^1.0.38",
- "ts-node-dev": "^2.0.0",
- "typescript": "^5.8.3",
- "@types/ejs": "^3.1.5",
- "@types/multer": "^2.0.0",
- "@types/nodemailer": "^7.0.1"

---
