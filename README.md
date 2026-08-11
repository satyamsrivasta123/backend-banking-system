# Banking System API

A secure, transaction-safe RESTful API for a banking system built with **Node.js**, **Express**, and **MongoDB/Mongoose**. It features user authentication, account creation, real-time balance inquiries, and atomic funds transfers using MongoDB's database transactions (sessions) and double-entry ledger book-keeping.

---

## Features
- **User Authentication**: Secure JWT-based registration and login with cookie/header token storage.
- **Double-Entry Ledger**: Accounts do not have a hardcoded `balance` field. Instead, balance is dynamically calculated by aggregating credit and debit ledger entries for maximum integrity and auditability.
- **Atomic Transactions**: Funds transfers between accounts are executed inside Mongoose database sessions (`session.startTransaction()`) to guarantee ACID compliance.
- **Idempotency**: Transactions require an `idompotencyKey` to prevent double-charging or duplicate transfers.
- **Email Notifications**: Email notifications are sent on user registration and whenever a transaction is completed.
- **System Initial Funds**: Dedicated admin/system endpoints to inject initial funds into client accounts.

---

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB & Mongoose
- **Security**: bcryptjs & jsonwebtoken (JWT)
- **Mailing**: Nodemailer

---

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account or local MongoDB instance

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/satyamsrivasta123/backend-banking-system.git
   cd backend-banking-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your configurations:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   EMAIL_USER=your_email_user_for_nodemailer
   REFRESH_TOKEN=your_oauth2_refresh_token
   CLIENT_ID=your_oauth2_client_id
   CLIENT_SECRET=your_oauth2_client_secret
   ```

4. Start the server:
   ```bash
   # Development mode with nodemon
   npm run dev
   ```

---

## API Endpoints Reference

### 1. Authentication
All authentication requests return a JWT token in both the JSON response and set it as a cookie named `token`.

#### Register User
* **URL**: `/api/auth/register`
* **Method**: `POST`
* **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "johndoe@example.com",
    "password": "securepassword123"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "user": {
      "_id": "6a7b525465cffbc3d10c98d4",
      "email": "johndoe@example.com",
      "name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
  ```

#### Login User
* **URL**: `/api/auth/login`
* **Method**: `POST`
* **Request Body**:
  ```json
  {
    "email": "johndoe@example.com",
    "password": "securepassword123"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "user": {
      "_id": "6a7b525465cffbc3d10c98d4",
      "email": "johndoe@example.com",
      "name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
  ```

---

### 2. Accounts
*Requires authentication token in cookies (`token`) or header (`Authorization: Bearer <token>`).*

#### Create Account
* **URL**: `/api/accounts`
* **Method**: `POST`
* **Success Response (201 Created)**:
  ```json
  {
    "account": {
      "_id": "6a7b526465cffbc3d10c98d5",
      "user": "6a7b525465cffbc3d10c98d4",
      "currency": "INR",
      "status": "ACTIVE",
      "createdAt": "2026-08-11T16:48:36.120Z",
      "updatedAt": "2026-08-11T16:48:36.120Z"
    }
  }
  ```

#### Get User Accounts
* **URL**: `/api/accounts`
* **Method**: `GET`
* **Success Response (200 OK)**:
  ```json
  {
    "accounts": [
      {
        "_id": "6a7b526465cffbc3d10c98d5",
        "user": "6a7b525465cffbc3d10c98d4",
        "currency": "INR",
        "status": "ACTIVE"
      }
    ]
  }
  ```

#### Get Account Balance
*Dynamically aggregates credit/debit entries from the ledger to compute the current balance.*
* **URL**: `/api/accounts/balance/:accountId`
* **Method**: `GET`
* **Success Response (200 OK)**:
  ```json
  {
    "accountId": "6a7b526465cffbc3d10c98d5",
    "balance": 2500
  }
  ```

---

### 3. Transactions
*Requires authentication token in cookies (`token`) or header (`Authorization: Bearer <token>`).*

#### Create Client Transfer
*Executes a transfer from your account to another client account.*
* **URL**: `/api/transactions`
* **Method**: `POST`
* **Request Body**:
  ```json
  {
    "fromAccount": "6a7b526465cffbc3d10c98d5",
    "toAccount": "6a7b53c83323d5d9a9923e80",
    "amount": 500,
    "idompotencyKey": "unique-transfer-uuid-12345"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "message": "Transaction completed successfully",
    "transaction": {
      "_id": "6a7c83f982b14c33d8389ee9",
      "fromAccount": "6a7b526465cffbc3d10c98d5",
      "toAccount": "6a7b53c83323d5d9a9923e80",
      "amount": 500,
      "idompotencyKey": "unique-transfer-uuid-12345",
      "status": "COMPLETED",
      "createdAt": "2026-08-12T00:50:00.000Z"
    }
  }
  ```

#### Inject Initial Funds (System User Only)
*Allows a designated system user account to issue initial funds to client accounts. Since this represents the generation of funds, the system user's account is debited without requiring a balance check (allowing it to go negative) while the recipient account is credited.*
* **URL**: `/api/transactions/system/initial-funds`
* **Method**: `POST`
* **Request Body**:
  ```json
  {
    "toAccount": "6a7b526465cffbc3d10c98d5",
    "amount": 10000,
    "idompotencyKey": "system-fund-uuid-99999"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "message": "Initial funds transaction completed succesfully",
    "transaction": {
      "_id": "6a7c91a03f443b77ce4188dd",
      "fromAccount": "6a7b53c83323d5d9a9923e7f",
      "toAccount": "6a7b526465cffbc3d10c98d5",
      "amount": 10000,
      "idompotencyKey": "system-fund-uuid-99999",
      "status": "COMPLETED",
      "createdAt": "2026-08-12T00:52:00.000Z"
    }
  }
  ```

---

## Database Design

### User Model (`user`)
- `email`: String (Unique, Indexed)
- `name`: String
- `password`: String (Stored as bcrypt hash, selected false by default)
- `systemUser`: Boolean (Designates system/admin users, selected false by default)

### Account Model (`accound`)
- `user`: ObjectId (References `user`, Indexed)
- `status`: String (`ACTIVE`, `FROZEN`, `CLOSED`)
- `currency`: String (Default: `INR`)

### Ledger Model (`ledger`)
- `account`: ObjectId (References `accound`, Indexed)
- `amount`: Number
- `type`: String (`DEBIT`, `CREDIT`)
- `transaction`: ObjectId (References `transaction`)

### Transaction Model (`transaction`)
- `fromAccount`: ObjectId (References `accound`)
- `toAccount`: ObjectId (References `accound`)
- `amount`: Number
- `idompotencyKey`: String (Unique)
- `status`: String (`PENDING`, `COMPLETED`, `FAILED`, `REVERSED`)
