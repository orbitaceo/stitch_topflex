// ============ Shared Types — LavaStore Pro ============
// Interfaces compartilhadas entre apps/web e apps/api

// ── Enums ──────────────────────────────────────────────────────────

export type UserRole = 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';

export type ProductCondition = 'EXCELLENT' | 'GOOD' | 'FAIR';

export type Voltage = 'V110' | 'V220' | 'BIVOLT';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'BANK_SLIP';

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'APPROVED'
  | 'REFUSED'
  | 'REFUNDED'
  | 'CANCELLED';

// ── Usuário ─────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  profile?: UserProfile;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

// ── Produto ─────────────────────────────────────────────────────────

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
  order: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  condition: ProductCondition;
  conditionNote?: string;
  originalPrice: number;
  salePrice: number;
  stock: number;
  brand: string;
  model: string;
  capacity: string;
  voltage: Voltage;
  color?: string;
  warrantyMonths: number;
  isActive: boolean;
  isFeatured: boolean;
  images: ProductImage[];
  categories: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

// ── Pedido ──────────────────────────────────────────────────────────

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ShippingAddress {
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

// ── Pagamento ────────────────────────────────────────────────────────

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  gatewayId?: string;
  paidAt?: string;
}

// ── Address ──────────────────────────────────────────────────────────

export interface Address {
  id: string;
  userId: string;
  label?: string;
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  isDefault: boolean;
}

// ── API Responses ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
}

// ── Carrinho (client-side) ────────────────────────────────────────────

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  imageUrl?: string;
  price: number;
  quantity: number;
  warrantyMonths: number;
  voltage: Voltage;
}

// ── Auth ──────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
}

export interface LoginResponse {
  user: Omit<User, 'profile'>;
  tokens: AuthTokens;
}
