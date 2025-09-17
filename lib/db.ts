import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Tipo para el usuario (basado en el modelo Prisma)
export interface User {
  id: number;
  username: string;
  name: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string | null;
  twoFactorUpdatedAt?: Date | null;
  createdAt: Date;
}

// Instancia global de Prisma Client
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// =================== FUNCIONES USUARIO ===================

// Función para crear un nuevo usuario
export async function createUser(username: string, name: string, password: string): Promise<User | null> {
  try {
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) throw new Error("El usuario ya existe");

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: { username, name, password: hashedPassword },
      select: {
        id: true,
        username: true,
        name: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        twoFactorUpdatedAt: true,
        createdAt: true,
      },
    });

    return newUser;
  } catch (error) {
    console.error("Error creando usuario:", error);
    throw error;
  }
}

// Función para verificar las credenciales del usuario
export async function verifyUser(username: string, password: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        name: true,
        password: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        twoFactorUpdatedAt: true,
        createdAt: true,
      },
    });

    if (!user) return null;

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return null;

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error("Error verificando usuario:", error);
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
        username: true,
        name: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        twoFactorUpdatedAt: true,
        createdAt: true,
      },
    });
    return user;
  } catch (error) {
    console.error("Error obteniendo usuario por ID:", error);
    return null;
  }
}

// Función para obtener un usuario por username
export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        name: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        twoFactorUpdatedAt: true,
        createdAt: true,
      },
    });
    return user;
  } catch (error) {
    console.error("Error obteniendo usuario por username:", error);
    return null;
  }
}

// =================== FUNCIONES PRODUCTOS ===================

// Tipos de productos (según ProductInput)
export interface Product {
  id: number;
  name: string;
  unitPrice: number;
  costPerUnit: number;
  annualConsumption: number;
  createdAt: Date;
}

// Traer todos los productos
export async function getProducts(): Promise<Product[]> {
  return prisma.product.findMany();
}

// Crear un producto
export async function createProduct(data: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
  return prisma.product.create({ data });
}

// Traer un producto por ID
export async function getProductById(id: number): Promise<Product | null> {
  return prisma.product.findUnique({ where: { id } });
}

// Actualizar un producto
export async function updateProduct(id: number, data: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<Product> {
  return prisma.product.update({ where: { id }, data });
}

// Borrar un producto
export async function deleteProduct(id: number): Promise<Product> {
  return prisma.product.delete({ where: { id } });
}
