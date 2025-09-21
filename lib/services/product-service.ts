import { apiClient } from './api-client'
import { PaginatedResponse, PaginationParams } from '../utils/pagination'

export interface Product {
  id: number
  name: string
  description: string | null
  price: number
  categoryId: number
  imageUrl: string | null
  isActive: boolean
  stock: number
  createdAt: string
  updatedAt: string
  category?: {
    id: number
    name: string
  }
}

export interface CreateProductData {
  name: string
  description?: string
  price: number
  categoryId: number
  imageUrl?: string
  stock: number
}

export interface UpdateProductData extends Partial<CreateProductData> {
  isActive?: boolean
}

export class ProductService {
  private basePath = '/public/products'

  // Get all products (public)
  async getProducts(params?: PaginationParams): Promise<PaginatedResponse<Product>> {
    return apiClient.get<PaginatedResponse<Product>>(this.basePath, params)
  }

  // Get product by ID (public)
  async getProduct(id: number): Promise<Product> {
    return apiClient.get<Product>(`${this.basePath}/${id}`)
  }

  // Get products by category (public)
  async getProductsByCategory(
    categoryId: number, 
    params?: PaginationParams
  ): Promise<PaginatedResponse<Product>> {
    return apiClient.get<PaginatedResponse<Product>>(
      `${this.basePath}/category/${categoryId}`, 
      params
    )
  }

  // Search products (public)
  async searchProducts(
    query: string, 
    params?: PaginationParams
  ): Promise<PaginatedResponse<Product>> {
    return apiClient.get<PaginatedResponse<Product>>(
      `${this.basePath}/search`, 
      { ...params, q: query }
    )
  }
}

// System product service (admin/internal)
export class SystemProductService {
  private basePath = '/system/products'

  // Get all products (system)
  async getProducts(params?: PaginationParams): Promise<PaginatedResponse<Product>> {
    return apiClient.get<PaginatedResponse<Product>>(this.basePath, params)
  }

  // Get product by ID (system)
  async getProduct(id: number): Promise<Product> {
    return apiClient.get<Product>(`${this.basePath}/${id}`)
  }

  // Create product
  async createProduct(data: CreateProductData): Promise<Product> {
    return apiClient.post<Product>(this.basePath, data)
  }

  // Update product
  async updateProduct(id: number, data: UpdateProductData): Promise<Product> {
    return apiClient.put<Product>(`${this.basePath}/${id}`, data)
  }

  // Delete product
  async deleteProduct(id: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`${this.basePath}/${id}`)
  }

  // Toggle product status
  async toggleProductStatus(id: number): Promise<Product> {
    return apiClient.patch<Product>(`${this.basePath}/${id}/toggle-status`)
  }
}

export const productService = new ProductService()
export const systemProductService = new SystemProductService()
