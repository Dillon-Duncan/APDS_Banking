# APDS Banking Platform - Secure Transaction Management System

Welcome to the APDS Banking Platform, a **Secure Transaction Management System** designed with robust security measures at every layer. This README provides a comprehensive overview of the application’s security features, system architecture, core functionality, and instructions on how to pull and run the project locally.

---

## Table of Contents

1. [Project Overview](#project-overview)  
2. [Key Security Features](#key-security-features)  
3. [System Architecture](#system-architecture)  
4. [Core Functionality](#core-functionality)  
5. [Local Development Setup](#local-development-setup)  
6. [Security Implementation Details](#security-implementation-details)  
   - [Cryptography](#1-cryptography)  
   - [Authentication & Session Security](#2-authentication--session-security)  
   - [Input Validation & Sanitization](#3-input-validation--sanitization)  
   - [Transport Security](#4-transport-security)  
   - [Rate Limiting & Abuse Prevention](#5-rate-limiting--abuse-prevention)  
   - [Fraud Detection](#6-fraud-detection)  
   - [Audit & Monitoring](#7-audit--monitoring)  
   - [Database Security](#8-database-security)  
   - [Infrastructure Security](#9-infrastructure-security)  
   - [Client-Side Protections](#10-client-side-protections)  
7. [API Documentation](#api-documentation)  
8. [Auditing & Monitoring](#auditing--monitoring)  
9. [Deployment Considerations](#deployment-considerations)  

---

## 1. Project Overview

**APDS Banking Platform** is a web-based solution that handles user registration, authentication, and financial transactions. The platform prioritizes security and compliance, offering:

- **Multi-Layer Authentication** (JWT, role-based access, session fingerprinting)  
- **Advanced Authorization** (RBAC, transaction verification workflows)  
- **Fraud Detection & Risk Scoring** (SWIFT code validation, transaction velocity checks)  
- **Infrastructure & Data Protection** (Docker secrets, CSP/HSTS, XSS sanitization)

---

## 2. Key Security Features

1. **Multi-Layer Authentication**  
   - **JWT-based sessions** using HMAC-SHA256.  
   - **Session Fingerprinting** (IP + User-Agent hash) to detect session hijacking.  
   - **Admin Role Verification** middleware for privileged endpoints.  

   ```js
   // Session validation
   exports.sessionValidation = async (req, res, next) => {
     // Add early return for unauthenticated requests
     if (!req.user) return next();

     const clientFingerprint = crypto.createHash('sha256')
       .update(`${req.ip}${req.headers['user-agent']}`)
       .digest('hex');

     if(req.cookies.sessionFingerprint !== clientFingerprint) {
       await User.updateOne(
         { _id: req.user.id },
         { $set: { sessions: [] } }
       );
       return res.status(401).clearCookie('token').json({ 
         message: "Session validation failed" 
       });
     }
     next();
   };
   ```

2. **Advanced Authorization**  
   - **Role-Based Access Control (RBAC)** for admin and customer roles.  
   - **Transaction Verification Workflow** for high-value or suspicious transfers.  
   - **Session Invalidation** on fingerprint mismatch.

3. **Financial Security**  
   - **SWIFT Code Validation** (ISO 9362 standard).  
   - **Transaction Risk Scoring System** for fraud detection.  
   - **Multi-Factor Analysis**: velocity checks, historical rejections, country risk.

   ```js
   const fraudDetection = async (req, transaction, user) => {
     const riskFactors = {
       countryRisk: 0,
       amountRisk: 0,
       velocityRisk: 0,
       historicalRisk: 0
     };
   
     // ... logic shown in snippet ...
   
     const totalRisk = Object.values(riskFactors).reduce((a, b) => a + b, 0);
   
     await AuditLog.create({
       eventType: 'fraud_attempt',
       userId: user.id,
       ipAddress: req.ip,
       outcome: totalRisk < RISK_THRESHOLD ? 'success' : 'failed',
       metadata: {
           riskScore: totalRisk,
           factors: riskFactors,
           transactionId: transaction._id
       }
     });
   
     return {
       valid: totalRisk < RISK_THRESHOLD,
       riskScore: totalRisk,
       reason: totalRisk >= RISK_THRESHOLD ? 'High risk transaction detected' : ''
     };
   };
   ```

4. **Infrastructure Protection**  
   - **Rate Limiting** with dynamic thresholds based on IP reputation and user session status.  
   - **Security Headers** (CSP, HSTS, X-XSS-Protection) via `helmet`.  
   - **Docker Secrets Management** for sensitive credentials.

5. **Data Protection**  
   - **Input Sanitization** for XSS prevention on server and client sides.  
   - **DOM Purification** in client components before rendering user-generated content.

   ```jsx
   <p>Recipient: {DOMPurify.sanitize(transaction.recipientAccountInfo.accountName)}</p>
   // ... repeated for accountNumber, bankName ...
   ```

---

## 3. System Architecture

1. **Server (Node.js/Express)**  
   - Handles REST API endpoints, session management, security checks, auditing, and fraud detection logic.  
   - Integrates with MongoDB for data persistence.

2. **Client (React)**  
   - Provides the user interface for customers and admins (transaction forms, verification dashboards, etc.).  
   - Implements DOMPurify for client-side XSS protection.

3. **Database (MongoDB)**  
   - Stores user records, transactions, audit logs, and session data.  
   - Includes robust schema validation (regex patterns, field constraints).

4. **Docker & Docker Compose**  
   - Simplifies environment setup (e.g., separate services for app, MongoDB).  
   - External secrets management.

---

## 4. Core Functionality

1. **User Management**  
   - Secure registration with password policy enforcement.  
   - Session management with automatic cleanup.  
   - **Password Breach Checking** (Have I Been Pwned integration - optional).

   ```js
   const passwordPolicy = {
     minLength: 12,
     minUppercase: 1,
     minLowercase: 1,
     minNumbers: 1,
     minSymbols: 1,
     bannedPasswords: ['Password123!', 'Admin123!']
   };

   function validatePassword(password) {
       const errors = [];
       if (password.length < 8) errors.push("Minimum 8 characters");
       if (!/[A-Z]/.test(password)) errors.push("At least one uppercase letter");
       if (!/[a-z]/.test(password)) errors.push("At least one lowercase letter");
       if (!/[0-9]/.test(password)) errors.push("At least one number");
       if (!/[!@#$%^&*]/.test(password)) errors.push("At least one special character");
       return errors;
   }
   ```

2. **Transaction Processing**  
   - Multi-currency support (ZAR, USD, EUR, GBP).  
   - SWIFT code validation with regex.  
   - Risk-based approval for large or suspicious transactions.

3. **Admin Features**  
   - Real-time transaction monitoring and dashboards.  
   - Manual transaction verification workflow (approve/reject).  
   - System health checks.

---

## 5. Local Development Setup

### Prerequisites
- **Node.js** v16+  
- **MongoDB** 5.0+  
- **Docker** 20.10+ (optional but recommended for containerized setup)

Below is an updated set of instructions that incorporates both the original steps and the new considerations about creating a `.env` file in the `src` folder and installing `dotenv` if needed.

---

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Dillon-Duncan/APDS_Banking.git
cd APDS_Banking
```

### 2. Server Setup
1. Navigate into the **server** directory:
   ```bash
   cd server
   ```
2. Install server dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file to store your environment variables. You can either:
   - **Copy the example**:
     ```bash
     cp .env.example .env
     ```
     Then edit the `.env` file to set your variables.
   - **Or manually create** a `.env` file (often in the `src` folder or the server root—make sure your code references the correct location). The contents should include something like:
     ```bash
     JWT_SECRET=your_strong_secret_here
     CSRF_SECRET=your_strong_secret_here
     DB_URI=mongodb://localhost:27017/your-db-name
     PORT=5000
     ```
   Make sure your server code is configured to load `.env` from the correct path.

4. If you do **not** have `dotenv` installed, install it now (though it should already be included if you ran `npm install`):
   ```bash
   npm install dotenv
   ```

### 3. Client Setup
1. Navigate to the **client** directory:
   ```bash
   cd ../client
   ```
2. Install client dependencies:
   ```bash
   npm install
   ```

### 4. (Optional) Generate/Rotate Secrets
You can use the provided script to generate or rotate strong secrets for JWT and CSRF:

```bash
node scripts/secret-rotation.js
```
This will output new secrets and prompt a service restart if needed.

---

## Running Locally

### 1. Start MongoDB
- If you are using Docker Compose:
  ```bash
  docker-compose up -d mongodb
  ```
- Otherwise, ensure your local MongoDB service is running.

### 2. Run the Server
1. Navigate back to the **server** directory (if not already there):
   ```bash
   cd ../server
   ```
2. Start the server:
   ```bash
   cd src
   node app.js
   ```
   The server will start on the configured port (default: [http://localhost:5000](http://localhost:5000)).

### 3. Run the Client
1. Navigate to the **client** directory (if not already there):
   ```bash
   cd ../../client
   ```
2. Start the React application:
   ```bash
   npm start
   ```
   By default, the client runs at [http://localhost:3000](http://localhost:3000).

---

**Note**: Ensure that your `.env` file values match the setup in your server code (e.g., `DB_URI`, `PORT`, etc.) and that the server is indeed loading them (via `dotenv` or another method).
---

# Default admin credentials (from server/src/scripts/admin.js)
Username: admin
Password: Admin321?

## 6. Security Implementation Details

Below is a deeper look into the core security features implemented in this platform.

### 1. Cryptography

- **JWT Secret Rotation**:
  ```js
  const rotateSecrets = () => {
    const newSecrets = {
      JWT_SECRET: crypto.randomBytes(64).toString('base64'),
      CSRF_SECRET: crypto.randomBytes(64).toString('base64')
    };
    
    writeFileSync('.env', 
      Object.entries(newSecrets)
        .map(([k,v]) => `${k}=${v}`)
        .join('\n')
    );
    
    console.log('Secrets rotated. Restart services!');
  };
  ```
  - Automated rotation for **JWT_SECRET** and **CSRF_SECRET**.  
  - Uses cryptographically secure random bytes (512 bits of entropy).

- **BCrypt** password hashing (10 rounds).  
- **Environment variable** validation to ensure secrets are present and strong.

### 2. Authentication & Session Security

- **BCrypt** for password hashing with salt rounds set to 10.  
- **Session Fingerprinting** with IP + User-Agent to detect session hijacking.  
- **Secure Cookies** (`HttpOnly`, `SameSite=Lax`) to store JWT tokens.  
- **Brute-Force Protection** with a timed delay on invalid login attempts.

  ```js
  async function login(req, res) {
      try {
          let { username } = req.body;
          const { password } = req.body;
          username = username.trim().toLowerCase();

          if (!username || !password) {
              return res.status(400).json({ message: "Invalid credentials" });
          }

          const existingUser = await User.findOne({ 
              username: username
          }).select('+password');

          if (!existingUser || !(await comparePassword(password, existingUser.password))) {
              await new Promise(resolve => setTimeout(resolve, 2000)); // Delay brute-force
              return res.status(401).json({ message: "Invalid credentials" });
          }

          const token = generateToken(existingUser);
          
          // Store session
          existingUser.sessions.push({
              token,
              ip: req.ip,
              userAgent: req.headers['user-agent']
          });
          await existingUser.save();

          res.cookie('token', token, {
              httpOnly: true,
              sameSite: 'Lax',
              maxAge: 3600000 // 1 hour
          }).json({
              token,
              user: existingUser.toObject({ virtuals: true })
          });

      } catch (error) {
          console.error('Login error:', error);
          res.status(500).json({ message: "Server error" });
      }
  }
  ```

### 3. Input Validation & Sanitization

- **XSS Protection** middleware on the server:
  ```js
  exports.sanitizeInput = (req, res, next) => {
    const sanitize = (obj) => {
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'string') {
          obj[key] = xss(obj[key].trim());
        }
      });
    };

    sanitize(req.body);
    sanitize(req.query);
    sanitize(req.params);

    next();
  };
  ```
- **DOMPurify** on the client side to sanitize user-generated content before rendering.

### 4. Transport Security

- **Strict CSP Headers** via `helmet`, including nonce-based `script-src`:
  ```js
  exports.securityHeaders = (req, res, next) => {
    const nonce = crypto.randomBytes(16).toString('base64');
    res.locals.nonce = nonce;
    
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'none'"],
          scriptSrc: ["'self'", `'nonce-${nonce}'`],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:"],
          connectSrc: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
          baseUri: ["'self'"]
        }
      }
    })(req, res, next);
  };
  ```
- **HSTS** can be enabled via `helmet` for production HTTPS deployments.  
- **CORS** restricted to specific origins if required.  
- **CSRF Protection** using double-submit cookie pattern.

### 5. Rate Limiting & Abuse Prevention

- **Tiered Rate Limiting** using `express-rate-limit`:
  ```js
  exports.globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: (req) => req.ipReputation?.score > 0.7 ? 100 : 50,
    message: 'Too many requests',
    validate: { trustProxy: false }
  });
  ```
- Separate limiters for login endpoints (`/api/auth/login`) and user-based endpoints.

### 6. Fraud Detection

- **Risk Scoring** based on:
  - Country risk (HIGH_RISK_COUNTRIES)  
  - Amount risk (> $5,000)  
  - Velocity risk (more than 15 transactions/day)  
  - Historical rejections

  ```js
  const totalRisk = Object.values(riskFactors).reduce((a, b) => a + b, 0);
  // ...
  return {
    valid: totalRisk < RISK_THRESHOLD,
    riskScore: totalRisk,
    reason: totalRisk >= RISK_THRESHOLD ? 'High risk transaction detected' : ''
  };
  ```

### 7. Audit & Monitoring

- **Security Event Logging**:  
  ```js
  exports.logSecurityEvent = async (req, eventType, outcome, metadata = {}) => {
    try {
      await AuditLog.create({
        eventType,
        userId: req.user?.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        outcome,
        metadata
      });
    } catch (error) {
      console.error('Audit log error:', error);
    }
  };
  ```
- Audit logs stored in MongoDB with event type, user details, IP address, and outcome.

### 8. Database Security

- **Strict Schema Validation**:
  ```js
  const userSchema = new mongoose.Schema({
    sessions: [{
      token: String,
      ip: String,
      userAgent: String,
      createdAt: { type: Date, default: Date.now }
    }],
    failedLoginAttempts: { type: Number, default: 0 },
    accountLockedUntil: Date,
    // ...
    username: {
      type: String,
      required: true,
      match: /^[a-zA-Z0-9_]{3,20}$/,
      unique: true
    },
    // ...
    role: {
      type: String,
      enum: ["admin", "customer"],
      default: "customer"
    },
    createdAt: { type: Date, default: Date.now }
  });
  ```
- **Failed Login Tracking** and account lockout mechanisms.  
- **Password History** can be tracked by storing the last password change date.

### 9. Infrastructure Security

- **Docker Secrets** used for JWT and CSRF secrets.  
- **Environment Isolation** for different stages (dev/test/prod).  
- **Process Separation** to ensure minimal privileges for each container.

### 10. Client-Side Protections

- **DOMPurify** usage to sanitize dynamic content:
  ```jsx
  <p>Recipient: {DOMPurify.sanitize(transaction.recipientAccountInfo.accountName)}</p>
  {/* ...similar for accountNumber and bankName... */}
  <textarea
    placeholder="Verification notes..."
    value={selectedTransaction?.verificationNotes || ''}
    onChange={(e) => {
      const sanitizedValue = DOMPurify.sanitize(e.target.value.substring(0, 200));
      setSelectedTransaction({
        ...transaction,
        verificationNotes: sanitizedValue
      })
    }}
    onKeyPress={(e) => {
      if(!/[a-zA-Z0-9\s.,!?@()-]/.test(e.key)) {
        e.preventDefault();
      }
    }}
  />
  ```
- **Keyboard Event Filtering** for certain text fields to disallow malicious characters.  
- **Output Encoding** for displaying transaction notes (using `dangerouslySetInnerHTML` but sanitized).

---

## 7. API Documentation

The following are common endpoints (a full specification can be found in `/documentation/api-spec.yaml` if available):

| Endpoint                 | Method | Description                     | Auth Required |
|--------------------------|--------|---------------------------------|---------------|
| `/api/auth/login`        | POST   | User authentication             | Public        |
| `/api/transaction`       | POST   | Create a new transaction        | User          |
| `/api/transaction/admin` | GET    | Get pending transactions        | Admin         |

---

## 8. Auditing & Monitoring

1. **Security Event Logging** for all authentication and transaction events.  
2. **Fraud Attempt Tracking** in `AuditLog` with relevant metadata (IP, user, risk score).  
3. **Session Activity Recording** to track user devices, IP addresses, and usage patterns.

```js
const auditLogSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: ['login_attempt', 'transaction', 'admin_action', 'fraud_attempt']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ipAddress: String,
  userAgent: String,
  outcome: {
    type: String,
    required: true,
    enum: ['success', 'failed', 'pending']
  },
  metadata: mongoose.Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

---
