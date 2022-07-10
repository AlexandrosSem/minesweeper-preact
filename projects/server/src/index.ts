import http from 'node:http';
import ws from 'ws';
import express from 'express';
import { router as APIRouter, handleWSS } from './api';

const { PORT = 8081 } = process.env;

// API
const app = express();
app.use('/', APIRouter);

// Server
const server = http.createServer(app);
server.listen(PORT, () => console.log(`Server started on port ${PORT}!`));

// API ws
handleWSS(new ws.Server({ server }));
