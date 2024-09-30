import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import tournamentRoutes from './routes/tournamentRoutes';

dotenv.config();

connectDB();
const app = express();

app.use(express.json());

//Routes
app.use('/api/tournaments', tournamentRoutes);


export default app;