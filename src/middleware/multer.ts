import fs from 'fs';
import multer, { StorageEngine } from 'multer';
import path from 'path';
import { Request } from 'express';

// Configuración de almacenamiento
const storage: StorageEngine = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void): void {
    const uploadPath = 'jugadores/';
    
    // Verificar si la carpeta existe y, si no, crearla
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, 'jugadores/'); // Carpeta donde se guardarán los archivos
  },
  filename: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void): void {
    // Obtener el nombre del jugador (puedes obtenerlo de req.body o req.player)
    const playerName = req.body.name || 'jugador_desconocido'; // Si no se pasa el nombre, usar un valor por defecto
    const lastName = req.body.lastName || 'jugador_desconocido'; // Si no se pasa el apellido, usar un valor por defecto

    // Crear un nombre único para el archivo, usando el nombre del jugador y el tipo de archivo
    const originalName = path.basename(file.originalname, path.extname(file.originalname));
    const fileExtension = path.extname(file.originalname); // Obtener la extensión del archivo
    const uniqueSuffix = Math.random().toString(36).substring(2, 8); // Generar un sufijo más corto y aleatorio

    // Usar el nombre del jugador, el nombre original del archivo y el sufijo único
    const filename = `${playerName}-${lastName}-${originalName}-${uniqueSuffix}${fileExtension}`;
    //console.log('Nombre de archivo generado:', filename);

    cb(null, filename); // Pasar el nombre del archivo a la función de callback
  }
});


// Configuración del middleware Multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Tamaño máximo de 5 MB
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
    //console.log('Procesando archivo:', file.originalname);
    const fileTypes = /pdf|jpg|png/; // Tipos de archivos permitidos
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase()); // Validar extensión
    const mimeType = fileTypes.test(file.mimetype); // Validar tipo MIME
  
    if (extname && mimeType) {
      return cb(null, true); // Aceptar archivo
    }
    //console.error('Archivo rechazado:', file.originalname);

    // Si el archivo no cumple los criterios, pasar un error y rechazar
    cb(new Error('El archivo debe ser un PDF, JPG o PNG'), false);
  }
  
});

export default upload;
