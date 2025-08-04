# Digital Wallet API

- A secure, modular, and role-based backend API for a digital wallet system inspired by real-world platforms like **bKash** and **Nagad**. Built with **Express.js** and **Mongoose**, this system handles user authentication, wallet operations, and transaction management with robust business rules and validations.

---

## Live Link

```
https://digital-wallet-server-nine.vercel.app/
```

## Features

- JWT-based login and registration
- Role-based access control (`admin`, `agent`, `user`)
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
{
  "success": true,
  "message": "User logged out successfully"
}
```
