# Finance Backend System

## Features
- User and Role Management
- Financial Records CRUD
- Role-Based Access Control
- Dashboard Summary API

## Roles
- Admin: Full access
- Viewer: View records
- Analyst: View + summary

## How to Run
1. npm install
2. node app.js

## APIs
- POST /users
- GET /users
- POST /records
- GET /records
- PUT /records/:id
- DELETE /records/:id
- GET /summary

## Notes
- Used in-memory storage for simplicity
- Role is passed via request headers