
***

# 📄 README.md (Root Project)

```markdown
# 🗳️ Blockchain E-Voting System

A complete decentralized voting application built with Ethereum blockchain, Node.js backend, and Android mobile app.

[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue.svg)](https://soliditylang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Kotlin](https://img.shields.io/badge/Kotlin-1.9.20-purple.svg)](https://kotlinlang.org/)
[![Jetpack Compose](https://img.shields.io/badge/Jetpack_Compose-1.5.4-brightgreen.svg)](https://developer.android.com/jetpack/compose)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

A **decentralized voting system** that leverages blockchain technology to ensure transparent, secure, and immutable voting processes. The system consists of:

- **Smart Contract** (Solidity) - Handles voting logic on Ethereum blockchain
- **Backend API** (Node.js + Express) - RESTful API with blockchain integration
- **Mobile App** (Android + Kotlin + Jetpack Compose) - User-friendly voting interface

### Key Highlights

✅ **Blockchain-based** - All votes stored immutably on Ethereum  
✅ **Secure Authentication** - OTP verification + encrypted private keys  
✅ **Admin Panel** - Complete management system for candidates & sessions  
✅ **Real-time Results** - Live vote counting from blockchain  
✅ **Audit Trail** - Complete transaction history  
✅ **User-friendly** - Modern Material 3 design

---

## ✨ Features

### For Users
- 🔐 **Secure Registration** with email OTP verification
- 👤 **User Authentication** with encrypted wallet creation
- 🗳️ **Vote for Candidates** with blockchain signature
- 📊 **View Real-time Results** from blockchain
- 🔍 **Check Vote Status** and transaction history
- 👥 **Prodi-based Filtering** for candidates

### For Administrators
- 📝 **Manage Candidates** (Add, Edit, Deactivate)
- 📅 **Manage Voting Sessions** (Create, Activate, Deactivate)
- 👥 **View User Statistics** and participation rate
- 🚨 **Emergency Pause** voting functionality
- 📈 **Monitor Real-time Stats** from blockchain
- 🔍 **View Detailed Candidate Info** with vote counts

### Security Features
- 🔒 **AES-256-GCM Encryption** for private keys
- 🔐 **Keccak256 Hashing** for passwords
- 🎫 **JWT Authentication** for API access
- ⛓️ **Blockchain Verification** for all votes
- 📝 **Immutable Audit Logs** on-chain
- 🛡️ **Role-based Access Control** (Admin/User)

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Android App   │ (Kotlin + Jetpack Compose)
└────────┬────────┘
         │ REST API
         ↓
┌─────────────────┐
│  Backend API    │ (Node.js + Express)
│  - Auth         │
│  - Vote Logic   │
│  - Email OTP    │
└────────┬────────┘
         │ Web3.js
         ↓
┌─────────────────┐
│ Smart Contract  │ (Solidity)
│  - VotingSystem │
│  - Blockchain   │
└─────────────────┘
         │
         ↓
┌─────────────────┐
│  Ethereum Node  │ (Hardhat Local / Testnet)
└─────────────────┘
```

---

## 🛠️ Tech Stack

### Blockchain
- **Solidity** ^0.8.20
- **Hardhat** - Development environment
- **Ethers.js** - Ethereum library
- **OpenZeppelin** - Secure smart contract library

### Backend
- **Node.js** 18.x
- **Express.js** - REST API framework
- **Web3.js** - Blockchain interaction
- **Nodemailer** - Email service
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication

### Frontend (Android)
- **Kotlin** 1.9.20
- **Jetpack Compose** - Modern UI toolkit
- **Material 3** - Design system
- **Hilt** - Dependency injection
- **Retrofit** - HTTP client
- **Coil** - Image loading
- **DataStore** - Local storage

---

## 📁 Project Structure

```
blockchain-voting-system/
├── hardhat/                    # Smart Contract
│   ├── contracts/
│   │   └── VotingContract.sol
│   ├── scripts/
│   │   ├── deploy.js
│   │   ├── setup.js
│   │   └── add-candidates.js
│   ├── test/
│   │   └── VotingContract.test.js
│   ├── hardhat.config.js
│   └── package.json
│
├── backend/                    # Backend API
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── server.js
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env.example
│   └── package.json
│
├── android/                    # Android App
│   ├── app/
│   │   ├── src/
│   │   │   ├── main/
│   │   │   │   ├── java/com/voting/app/
│   │   │   │   │   ├── data/
│   │   │   │   │   ├── ui/
│   │   │   │   │   ├── viewmodel/
│   │   │   │   │   ├── utils/
│   │   │   │   │   └── MainActivity.kt
│   │   │   │   └── AndroidManifest.xml
│   │   │   └── build.gradle
│   │   └── build.gradle
│   └── settings.gradle
│
├── docs/                       # Documentation
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── TESTING.md
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** or **yarn**
- **PostgreSQL** >= 14
- **Android Studio** (for mobile app)
- **Git**

### Installation

#### 1. Clone Repository

```
git clone https://github.com/yourusername/blockchain-voting-system.git
cd blockchain-voting-system
```

#### 2. Setup Smart Contract (Hardhat)

```
cd hardhat
npm install

# Start local blockchain
npm run node

# In new terminal - Deploy contract
npm run deploy

# Setup initial configuration
npm run setup

# Add sample candidates
npm run add-candidates
```

#### 3. Setup Backend API

```
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# - Update CONTRACT_ADDRESS from deployment
# - Configure PostgreSQL database
# - Set email credentials (optional for OTP)

# Run database migrations
npx prisma migrate dev

# Start server
npm run dev
```

#### 4. Setup Android App

```
# Open Android Studio
# File -> Open -> Select android/ folder

# Update build.gradle (app level)
# Change BASE_URL to your backend API
buildConfigField "String", "BASE_URL", "\"http://10.0.2.2:5000/api/\""

# Sync Gradle
# Build -> Make Project

# Run on emulator or device
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "John Doe",
  "nim": "12345678",
  "prodi": "Teknik Informatika",
  "password": "password123"
}
```

#### Verify OTP
```
POST /auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "nim": "12345678",
  "password": "password123"
}
```

### Voting Endpoints

#### Cast Vote
```
POST /vote/cast
Authorization: Bearer <token>
Content-Type: application/json

{
  "candidateId": 1,
  "encryptedPrivateKey": {
    "encrypted": "...",
    "iv": "...",
    "authTag": "..."
  }
}
```

#### Get Results
```
GET /candidates/results
```

### Admin Endpoints

#### Add Candidate
```
POST /admin/candidate
Content-Type: application/json

{
  "id": 1,
  "name": "Candidate Name",
  "description": "Vision and mission",
  "imageUrl": "https://...",
  "prodi": "Teknik Informatika"
}
```

**Full API Documentation:** [API.md](docs/API.md)

---

## 🧪 Testing

### Smart Contract Tests

```
cd hardhat
npm test

# Coverage
npm run coverage
```

### Backend API Tests

```
cd backend
npm test
```

### Manual Testing

Use the provided **Postman Collection**:
```
backend/postman/Voting-API.postman_collection.json
```

---

## 🔒 Security

### Implemented Security Measures

1. **Password Security**
   - Keccak256 hashing before storage
   - Never stored in plain text

2. **Private Key Encryption**
   - AES-256-GCM encryption
   - User password as encryption key
   - Stored securely on device

3. **Authentication**
   - JWT tokens with expiration
   - OTP email verification
   - Role-based access control

4. **Blockchain Security**
   - Immutable vote records
   - Double-voting prevention
   - Audit trail on-chain

5. **API Security**
   - Rate limiting
   - Input validation
   - SQL injection prevention
   - XSS protection

---

## 📱 Admin Credentials

Default admin access:
- **NIM:** `00000000`
- **Password:** `admin123`

⚠️ **Change this in production!**

---

## 🌐 Deployment

### Smart Contract Deployment

```
# Deploy to testnet (e.g., Sepolia)
cd hardhat
npx hardhat run scripts/deploy.js --network sepolia
```

### Backend Deployment

```
# Build
npm run build

# Start production
npm start
```

### Android App Release

```
# Generate signed APK
./gradlew assembleRelease

# Output: app/build/outputs/apk/release/app-release.apk
```

**Detailed deployment guide:** [DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- OpenZeppelin for secure smart contract libraries
- Hardhat for excellent development tools
- Jetpack Compose for modern Android UI
- The blockchain community for inspiration

---

## 📞 Support

For support, email support@yourproject.com or open an issue on GitHub.

---

## 🗺️ Roadmap

- [x] Basic voting functionality
- [x] Admin panel
- [x] OTP verification
- [ ] Multiple voting sessions
- [ ] Multi-language support
- [ ] iOS app
- [ ] Result analytics dashboard
- [ ] Blockchain explorer integration

---

**Made with ❤️ using Blockchain Technology**
```
