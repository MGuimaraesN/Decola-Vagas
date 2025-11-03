import { JwtPayload } from 'jsonwebtoken';

// Define a interface para o payload do usuário,
// baseado no que você assinou no user.controller.ts
interface UserPayload extends JwtPayload {
  firstName: string;
  lastName: string;
  email: string;
}

// Estende a interface Request do Express
declare namespace Express {
  export interface Request {
    user?: UserPayload; // Adiciona a propriedade 'user' opcional
  }
}