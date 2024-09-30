import mongoose from "mongoose";
import colors from "colors";
import { exit } from 'node:process';


export const connectDB = async () => {
  try {
    const {connection} = await mongoose.connect(process.env.DATABASE_URL)
    const url = `${connection.host}:${connection.port}/${connection.name}`;
    console.log(colors.bgMagenta(`Connected to MongoDB: ${url}`));
  } catch (error) {
    console.log(colors.bgRed(`Error al conectar MongoDB: ${error.message}`));
    exit(1);
    
  }
}