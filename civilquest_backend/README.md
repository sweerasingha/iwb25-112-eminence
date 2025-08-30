# CivilQuest API

A comprehensive community engagement platform built with Ballerina, enabling citizens to participate in community events, sponsor initiatives, and earn points for community contributions.

## Project Structure

```
civilquest_api/
├── main.bal                                 # Application entry point
├── Ballerina.toml                           # Project configuration
├── Config.toml                              # Application configuration
├── Dependencies.toml                        # Dependencies specification
├── keys/                                    # SSL certificates and keys
├── modules/                                 # Core application modules
│   ├── analytics/                           # Analytics and reporting
│   ├── audit/                               # Audit logging system
│   ├── auth/                                # Authentication & authorization
│   ├── bcrypt/                              # Password hashing utilities
│   ├── bootstrap/                           # System initialization
│   ├── cloudinary/                          # Image upload service
│   ├── database/                            # Database configuration
│   ├── email/                               # Email service
│   ├── events/                              # Event management
│   ├── middleware/                          # Authentication middleware
│   ├── notifications/                       # Notification system
│   ├── otp/                                 # OTP generation and verification
│   ├── participants/                        # Event participation
│   ├── points/                              # Points system
│   ├── server/                              # HTTP server and routing
│   ├── sponsors/                            # Sponsorship management
│   ├── token/                               # JWT token management
│   ├── user/                                # User management
│   └── utils/                               # Utilities and validation
└── target/                                   # Build artifacts
```

## Architecture Overview

### Core Modules

1. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control (RBAC)
   - Password reset functionality
   - User registration with OTP verification

2. **User Management**
   - User CRUD operations
   - Role hierarchy management
   - Profile management
   - Premium user workflow

3. **Event Management**
   - Event creation, approval, and lifecycle
   - Participation tracking
   - Event status management

4. **Sponsorship System**
   - User and official sponsorships
   - Sponsorship approval workflow
   - Amount and donation tracking

5. **Points & Rewards**
   - Configurable points system
   - Transaction history
   - Administrative adjustments
6. **Infrastructure**
   - MongoDB integration
   - Email service
   - Image upload and management

## Role Hierarchy

```
SUPER_ADMIN
    └── ADMIN (Provincial Council)
        └── ADMIN_OPERATOR (Urban Council)
            └── PREMIUM_USER (Premium Citizens)
                └── USER (Standard Citizens)
```

## Key Features

- **Multi-tier Administration**: Super Admin → Admin → Admin Operator hierarchy
- **Event Lifecycle Management**: Creation → Approval → Participation → Completion
- **Flexible Sponsorship**: Users and organizations can sponsor events
- **Points-based Rewards**: Configurable point system for community engagement
- **Comprehensive Auditing**: All administrative actions are logged
- **Real-time Notifications**: Users receive updates on relevant activities
- **Analytics Dashboard**: Insights into participation, events, and sponsorships

## Getting Started

### Prerequisites

- Ballerina Swan Lake 2201.9.2 or later
- MongoDB 4.4 or later
- Valid SMTP configuration for email
- Cloudinary account for image management

### Configuration

1. Copy `sample.config.toml` to `Config.toml`
2. Update configuration values:
   - MongoDB connection string
   - Email SMTP settings
   - Cloudinary credentials
   - JWT signing keys

### Running the Application

```bash
bal run
```

The API will start on the configured port (default: 4444).

### Initial Setup

The application automatically creates a SUPER_ADMIN account on first startup:

- **Email**: `superadmin@civilquest.com`
- **Password**: `SuperAdmin123!`
