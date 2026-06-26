import { API_URL } from "./utils";

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  role: string;
  profile_photo?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  short_description?: string;
  full_description?: string;
  sku: string;
  regular_price: number;
  sale_price?: number;
  effective_price: number;
  stock_quantity: number;
  featured: boolean;
  best_seller: boolean;
  new_arrival: boolean;
  customizable: boolean;
  gift_box_item: boolean;
  pickup_available: boolean;
  delivery_available: boolean;
  category_name?: string;
  average_rating: number;
  review_count: number;
  images: { id: string; image_path: string; is_cover: boolean }[];
  variations: { id: string; variation_name: string; price: number; stock: number }[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  is_featured: boolean;
  product_count: number;
}

export interface Occasion {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  product_count: number;
}

export interface Order {
  id: string;
  order_number: string;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  payment_status: string;
  order_status: string;
  delivery_method: string;
  gift_message?: string;
  created_at: string;
  items: OrderItem[];
  payment?: { till_number?: string; amount: number; status: string };
  delivery_info?: { recipient_name: string; address: string; city: string };
  pickup_info?: { pickup_date?: string; pickup_time?: string; collected: boolean };
}

export interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  customization?: string;
}

export interface BusinessSettings {
  business_name: string;
  logo?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  pickup_location?: string;
  google_maps_link?: string;
  google_maps_embed?: string;
  business_hours?: string;
  currency: string;
  mpesa_till_number?: string;
  delivery_charge: number;
  social_links?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  button_text?: string;
  button_link?: string;
  image_path: string;
}

class ApiClient {
  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }

  async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Request failed" }));
      throw new Error(err.detail || "Request failed");
    }
    return res.json();
  }

  // Auth
  login(email: string, password: string) {
    return this.fetch<{ access_token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  register(data: { first_name: string; last_name: string; email: string; phone_number?: string; password: string }) {
    return this.fetch<{ access_token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  getMe() {
    return this.fetch<User>("/auth/me");
  }

  // Catalog
  getCategories() {
    return this.fetch<Category[]>("/catalog/categories");
  }

  getOccasions() {
    return this.fetch<Occasion[]>("/catalog/occasions");
  }

  getProducts(params?: Record<string, string | number | boolean>) {
    const query = params ? "?" + new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString() : "";
    return this.fetch<{ items: Product[]; total: number; pages: number; page: number }>(`/catalog/products${query}`);
  }

  getProduct(slug: string) {
    return this.fetch<Product>(`/catalog/products/${slug}`);
  }

  // Orders
  placeOrder(data: unknown) {
    return this.fetch<Order>("/orders", { method: "POST", body: JSON.stringify(data) });
  }

  trackOrder(orderNumber: string) {
    return this.fetch<Order>(`/orders/track/${orderNumber}`);
  }

  getMyOrders() {
    return this.fetch<Order[]>("/orders/my-orders");
  }

  // Content
  getSettings() {
    return this.fetch<BusinessSettings>("/settings");
  }

  getBanners() {
    return this.fetch<Banner[]>("/banners");
  }

  getGallery() {
    return this.fetch<{ id: string; image_path: string; title?: string }[]>("/gallery");
  }

  getReviews(productId?: string) {
    const q = productId ? `?product_id=${productId}` : "";
    return this.fetch<{ id: string; rating: number; comment?: string; user_name?: string; guest_name?: string; created_at: string }[]>(`/reviews${q}`);
  }

  submitContact(data: { name: string; phone?: string; email: string; subject: string; message: string }) {
    return this.fetch("/contact", { method: "POST", body: JSON.stringify(data) });
  }

  submitReview(data: { product_id: string; rating: number; comment?: string; guest_name?: string }) {
    return this.fetch("/reviews", { method: "POST", body: JSON.stringify(data) });
  }

  // Admin
  getDashboard() {
    return this.fetch<Record<string, unknown>>("/admin/dashboard");
  }

  getAdminOrders(params?: Record<string, string>) {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return this.fetch<{ items: Order[]; total: number }>(`/orders${query}`);
  }

  updateOrderStatus(orderId: string, order_status: string, internal_notes?: string) {
    return this.fetch(`/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ order_status, internal_notes }),
    });
  }

  verifyPayment(orderId: string, data?: { mpesa_reference?: string; payer_phone?: string }) {
    return this.fetch(`/orders/${orderId}/verify-payment`, {
      method: "POST",
      body: JSON.stringify(data || {}),
    });
  }

  getCustomers() {
    return this.fetch<Record<string, unknown>[]>("/admin/customers");
  }

  getSalesReport(period = "month") {
    return this.fetch<Record<string, unknown>>(`/admin/reports/sales?period=${period}`);
  }

  updateSettings(data: Partial<BusinessSettings>) {
    return this.fetch("/settings", { method: "PUT", body: JSON.stringify(data) });
  }
}

export const api = new ApiClient();
