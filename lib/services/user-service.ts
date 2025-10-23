import { apiClient } from './api-client'
import { PaginatedResponse, PaginationParams } from '../utils/pagination'

export interface User {
  id: number
  username: string
  email: string
  role: 'admin' | 'almacen' | 'ventas'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateUserData {
  username: string
  email: string
  password: string
  role: 'admin' | 'almacen' | 'ventas'
}

export interface UpdateUserData {
  username?: string
  email?: string
  role?: 'admin' | 'almacen' | 'ventas'
  isActive?: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}

export class UserService {
  private basePath = '/system/users'

  // Get all users
  async getUsers(params?: PaginationParams): Promise<PaginatedResponse<User>> {
    return apiClient.get<PaginatedResponse<User>>(this.basePath, params)
  }

  // Get user by ID
  async getUser(id: number): Promise<User> {
    return apiClient.get<User>(`${this.basePath}/${id}`)
  }

  // Create user
  async createUser(data: CreateUserData): Promise<User> {
    return apiClient.post<User>(this.basePath, data)
  }

  // Update user
  async updateUser(id: number, data: UpdateUserData): Promise<User> {
    return apiClient.put<User>(`${this.basePath}/${id}`, data)
  }

  // Delete user
  async deleteUser(id: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`${this.basePath}/${id}`)
  }

  // Toggle user status
  async toggleUserStatus(id: number): Promise<User> {
    return apiClient.patch<User>(`${this.basePath}/${id}/toggle-status`)
  }

  // Change user password
  async changePassword(
    id: number, 
    data: { currentPassword: string; newPassword: string }
  ): Promise<{ message: string }> {
    return apiClient.patch<{ message: string }>(`${this.basePath}/${id}/password`, data)
  }
}

export class AuthService {
  private basePath = '/auth'

  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(`${this.basePath}/login`, credentials)
  }

  // Register
  async register(data: CreateUserData): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(`${this.basePath}/register`, data)
  }

  // Logout
  async logout(): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`${this.basePath}/logout`)
  }

  // Get current user
  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>(`${this.basePath}/me`)
  }

  // Refresh token
  async refreshToken(): Promise<{ token: string }> {
    return apiClient.post<{ token: string }>(`${this.basePath}/refresh`)
  }
}

export const userService = new UserService()
export const authService = new AuthService()
