# 🗳️ Blockchain E-Voting System

A complete decentralized voting application built with Ethereum Blockchain, Node.js Backend, and Android Mobile App.

[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue.svg)](https://soliditylang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Kotlin](https://img.shields.io/badge/Kotlin-1.9.20-purple.svg)](https://kotlinlang.org/)
[![Jetpack Compose](https://img.shields.io/badge/Jetpack_Compose-1.5.4-brightgreen.svg)](https://developer.android.com/jetpack/compose)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)


## 📘 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Security](#security)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Roadmap](#roadmap)


## 🌟 Overview

A **decentralized e-voting platform** built to ensure transparency, security, and immutability.  
This project consists of:

- **Smart Contract (Solidity)** — Voting logic on Ethereum
- **Backend API (Node.js + Express)** — Authentication, OTP, vote handling
- **Android App (Kotlin + Jetpack Compose)** — User-friendly interface for voters

### Highlights

- ⛓️ **Blockchain-backed voting**  
- 🔐 **Secure authentication** with OTP & encrypted wallets  
- 📊 **Real-time vote results**  
- 📝 **Audit logs** stored on-chain  
- 📱 **Modern UI/UX** Android app  


## ✨ Features

### 👥 User Features
- Secure registration with email OTP  
- Login with encrypted wallet  
- Cast vote with blockchain signature  
- See real-time candidate results  
- Check personal vote status  
- Candidate filtering by department (Prodi)

### 🛠 Admin Features
- Manage candidates (add/edit/deactivate)  
- Configure voting sessions  
- View voting statistics & participation  
- Emergency pause/resume voting  
- Detailed candidate insights  

### 🔒 Security Features
- AES-256-GCM encryption for private keys  
- Keccak256 password hashing  
- JWT-based authentication  
- Double-vote protection on-chain  
- Complete audit trail  
- Role-based access (User/Admin)


## 🏗 Architecture


┌────────────────────┐
│    Android App     │ (Kotlin + Compose)
└─────────┬──────────┘
│ REST API
▼
┌────────────────────┐
│   Backend API      │ (Node.js)
│ - Auth & OTP       │
│ - Vote Logic       │
│ - Prisma + DB      │
└─────────┬──────────┘
│ Web3.js
▼
┌────────────────────┐
│  Smart Contract    │ (Solidity)
└─────────┬──────────┘
│
▼
┌────────────────────┐
│  Ethereum Node     │ (Local/Testnet)
└────────────────────┘



## 🛠 Tech Stack

### 🔗 Blockchain
- Solidity 0.8.20  
- Hardhat  
- Ethers.js  
- OpenZeppelin  

### 🖥 Backend
- Node.js 18  
- Express.js  
- Web3.js  
- Prisma ORM  
- PostgreSQL  
- Nodemailer  
- JWT Authentication  

### 📱 Android App
- Kotlin 1.9  
- Jetpack Compose  
- Hilt DI  
- Retrofit  
- Coil  
- DataStore  


## 📁 Project Structure


blockchain-voting-system/
├── hardhat/               # Smart Contract
│   ├── contracts/
│   ├── scripts/
│   ├── test/
│   ├── hardhat.config.js
│   └── package.json
│
├── backend/               # Backend API
│   ├── src/
│   ├── prisma/
│   ├── .env.example
│   └── package.json
│
├── android/               # Android App
│   └── app/src/main/
│
└── docs/                  # Documentation



## 🚀 Getting Started

### Requirements
- Node.js ≥ 18  
- PostgreSQL ≥ 14  
- Android Studio  
- Git  


### 1️⃣ Clone Repository


git clone [https://github.com/yourusername/blockchain-voting-system.git](https://github.com/yourusername/blockchain-voting-system.git)
cd blockchain-voting-system


### 2️⃣ Setup Smart Contract


cd hardhat
npm install

npm run node        # Start local blockchain
npm run deploy      # Deploy contract
npm run setup       # Configure contract
npm run add-candidates



### 3️⃣ Setup Backend


cd backend
npm install

cp .env.example .env   # Fill database + contract address
npx prisma migrate dev
npm run dev


### 4️⃣ Setup Android App

1. Open Android Studio → **Open Project** → `android/`  
2. Update `BASE_URL` on `build.gradle (app)`  
3. Build & Run the project

## 📡 API Documentation

Base URL:

[http://localhost:3000/api](http://localhost:3000/api)

### 🔐 Auth Endpoints

#### Registerhttp
POST /auth/register

#### Verify OTP
http
POST /auth/verify-otp

#### Login
http
POST /auth/login

### 🗳 Voting
http
POST /vote/cast

### 📊 Results
http
GET /candidates/results

Full API docs → **docs/API.md**


## 🧪 Testing

### Smart Contract

cd hardhat
npm test
npm run coverage

### Backend

cd backend
npm test

Postman collection provided in:

backend/postman/


## 🔒 Security

Implemented measures:

* Password hashing (Keccak256)
* AES-256-GCM private key encryption
* JWT authentication
* Role-based access
* SQL injection & XSS protection
* Blockchain double-vote prevention
* Immutable audit log


## 👤 Default Admin Credentials

NIM      : 00000000
Password : admin123

⚠️ Change before production.


## 🌐 Deployment

### Smart Contract (Testnet)

npx hardhat run scripts/deploy.js --network sepolia

### Backend

npm run build
npm start

### Android APK

./gradlew assembleRelease

Full deployment guide → **docs/DEPLOYMENT.md**

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit & push
4. Open pull request

## 📝 License

MIT License — see `LICENSE`.


## 🗺 Roadmap

* [x] Basic voting system
* [x] Admin management panel
* [x] OTP email verification
* [ ] Multiple voting sessions
* [ ] iOS App
* [ ] Multi-language support
* [ ] Analytics dashboard
* [ ] Blockchain explorer integration

**Made with ❤️ using Blockchain Technology**
