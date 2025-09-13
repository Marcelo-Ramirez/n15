import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Tipo para el usuario (basado en el modelo Prisma)
export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
}

// Instancia global de Prisma Client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Función para crear un nuevo usuario
export async function createUser(email: string, name: string, password: string): Promise<User | null> {
  try {
    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('El usuario ya existe');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear el nuevo usuario
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return newUser;
  } catch (error) {
    console.error('Error creando usuario:', error);
    throw error;
  }
}

// Función para verificar las credenciales del usuario
export async function verifyUser(email: string, password: string): Promise<User | null> {
  try {
    // Buscar el usuario por email (incluyendo password para verificación)
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    // Verificar la contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return null;
    }

    // Retornar el usuario sin la contraseña
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error verificando usuario:', error);
    return null;
  }
}

// Función para obtener un usuario por ID
export async function getUserById(id: number): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Error obteniendo usuario por ID:', error);
    return null;
  }
}

// Función para obtener un usuario por email
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Error obteniendo usuario por email:', error);
    return null;
  }
}
