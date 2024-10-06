import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { corsConfig } from './config/cors';
import { connectDB } from './config/db';
import tournamentRoutes from './routes/tournamentRoutes';
import morgan from 'morgan';

dotenv.config();
connectDB();

const app = express();
app.use(cors(corsConfig));

//Loggin
app.use(morgan('dev'));

//Leer datos del formulario
app.use(express.json());

//Routes
app.use('/api/tournaments', tournamentRoutes);


export default app;