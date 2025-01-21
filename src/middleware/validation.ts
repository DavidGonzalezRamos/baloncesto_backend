import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
 
export const handleInputErrors = (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let errors = validationResult(req);
 
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
 
  next();
  return;
};

/*export const validationAttachments = (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const errors = validationResult(req); // Captura los errores de la validación
  if (!errors.isEmpty()) {
    // Si hay errores, elimina los archivos cargados
    if (req.files) {
      Object.keys(req.files).forEach((field) => {
        req.files[field].forEach((file: any) => {
          fs.unlinkSync(file.path); // Elimina el archivo
        });
      });
    }
    res.status(400).json({ errors: errors.array() }); // Devuelve los errores de validación
    return
  }
  next(); // Si no hay errores, pasa al siguiente middleware
};
*/
