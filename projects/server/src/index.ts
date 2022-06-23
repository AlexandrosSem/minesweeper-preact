import express from 'express';
import { router as APIRouter } from './api';

const app = express();
const { PORT = 8081 } = process.env;

// API
app
    .use('/', APIRouter)
    .listen(PORT, () => console.log(`Server started on port ${PORT}!`));
