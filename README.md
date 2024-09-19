# Firelens Server

This is a Node.js API server created by [LeonardoSya](https://github.com/LeonardoSya) and designed to provide data to [Firelens System](https://github.com/LeonardoSya/Firelens-System). The server fetches and processes fire data, offering it through API endpoints.

## Features

- **RESTful API**: Provides geoJSON data for various date ranges and filters.
- **Express.js**: Utilizes Express.js for routing and middleware.
- **MongoDB Integration**: Fetches geoJSON data from a MongoDB database.
- **CORS Enabled**: Configured to allow requests from specific domains.

## Getting Started

### Prerequisites

- Node.js (>=20.x)
- npm (>=6.x)
- MongoDB (>=4.x)

### Installation
```bash
git clone https://github.com/LeonardoSya/firelens-server.git
cd Firelens-Server
npm install
npm start
```
The server will run on http://localhost:3001.
