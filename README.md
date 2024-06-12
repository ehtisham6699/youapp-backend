# YouApp Backend

This project is a backend implementation for a messaging application called YouApp. It provides various functionalities such as user registration, login, profile management, private and group conversations, and real-time messaging via Socket.io.

## Table of Contents
- [Features](#features)
- [Technologies](#technologies)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Docker Setup](#docker-setup)
- [API Endpoints](#api-endpoints)
- [Socket.io Events](#socketio-events)
- [License](#license)

## Features

- **User Management**
  - User Registration
  - User Login
  - Profile Update
  - View Profile

- **Conversations**
  - Create Private Conversations
  - Create Group Conversations
  - View All Messages of a Conversation
  - Send Message via Socket.io
  - Seen/Unseen Message Status
  - Unseen Message Count

## Technologies

- **NestJS**: Framework for building efficient, reliable, and scalable server-side applications.
- **Mongoose**: MongoDB object modeling tool.
- **Socket.io**: Real-time, bidirectional and event-based communication.
- **JWT**: JSON Web Tokens for authentication.
- **Docker**: Containerization platform.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Docker (for containerized setup)
- MongoDB (local instance or Dockerized)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/ehtisham6699/youapp-backend.git
   cd youapp-backend
   ```
2. Install dependencies:
   ```
npm install

## Configuration
- Create a .env file in the root directory and add your configuration variables:
```
PORT=4000
MONGODB_URI=mongodb://your_mongodb_uri
JWT_SECRET=your_jwt_secret
```
## Running the Application

There are two ways to run the application: locally and using Docker.

### Locally

**Prerequisites:**

* Ensure you have MongoDB running on your system.

**Start the Application:**

1. Open a terminal window.
2. Navigate to the root directory of your project.
3. Run the following command:

   ```
   npm start

### Docker Setup
#### Build the Docker image:

```
docker build -t youapp-backend .
```
#### Run the Docker container:

```
docker run -p 4000:4000 --name youapp-backend-container youapp-backend
```
To connect to a MongoDB container, you can use Docker Compose or link containers using Docker network.
***OR*** 
Create a docker-compose.yml file

### API Endpoints
**Swagger documentation is provided for testing**

## Socket.io Events
**Swagger documentation is provided for testing**
```
localhost:4000/api
```
### License
This project is licensed under the MIT License. See the LICENSE file for details.


