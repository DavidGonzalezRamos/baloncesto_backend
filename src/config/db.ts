/*import mongoose from "mongoose";
import colors from "colors";
import { exit } from 'node:process';


export const connectDB = async () => {
  try {
    const {connection} = await mongoose.connect(process.env.DATABASE_URL_DOCKER)
  //  const {connection} = await mongoose.connect(process.env.DATABASE_URL)
    const url = `${connection.host}:${connection.port}/${connection.name}`;
    console.log(colors.bgMagenta(`Connected to MongoDB: ${url}`));
  } catch (error) {
    console.log(colors.bgRed(`Error al conectar MongoDB: ${error.message}`));
    exit(1);
    
  }
}*/
//Configuracion para pruebas
import mongoose from "mongoose";
import colors from "colors";
import { exit } from 'node:process';

let isConnected: boolean | mongoose.ConnectionStates; // Variable para verificar si ya hay una conexión

export const connectDB = async () => {
  if (isConnected) {
    return; // Ya estamos conectados, no hacemos nada
  }

  try {
    const { connection } = await mongoose.connect(process.env.DATABASE_URL_DOCKER_PRUEBAS);
    isConnected = connection.readyState; // Establecer el estado de conexión
    const url = `${connection.host}:${connection.port}/${connection.name}`;
    console.log(colors.bgMagenta(`Connected to MongoDB: ${url}`));
  } catch (error) {
    console.log(colors.bgRed(`Error al conectar MongoDB: ${error.message}`));
    exit(1);
  }
};

export const disconnectDB = async () => {
  if (isConnected) {
    await mongoose.disconnect(); // Desconectar de la base de datos
    isConnected = false; // Reiniciar el estado de conexión
    console.log(colors.bgGreen('Disconnected from MongoDB'));
  }
};
