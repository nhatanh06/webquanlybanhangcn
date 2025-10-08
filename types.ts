// types.ts

// Định nghĩa cấu trúc cho một đánh giá sản phẩm
export interface Review {
  id: number;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

// Định nghĩa cấu trúc cho các thông số kỹ thuật của sản phẩm
export interface ProductSpecs {
  [key: string]: string;
}

// Định nghĩa cấu trúc cho một sản phẩm
export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  images: string[];
  description: string;
  shortDescription: string;
  specs: ProductSpecs;
  options: {
    [key: string]: string[];
  };
  rating: number;
  reviewCount: number;
  reviews: Review[];
  isFeatured?: boolean;
  isBestSeller?: boolean;
}

// Định nghĩa cấu trúc cho một danh mục sản phẩm
export interface Category {
  id: string;
  name: string;
  image: string;
}

// Định nghĩa cấu trúc cho một thương hiệu
export interface Brand {
  id: string;
  name: string;
  logo: string;
}

// Định nghĩa cấu trúc cho một sản phẩm trong giỏ hàng
export interface CartItem {
  product: Product;
  quantity: number;
  selectedOptions: {
    [key: string]: string;
  };
}

// Định nghĩa các trạng thái của đơn hàng
export enum OrderStatus {
  Pending = 'Chờ xác nhận',
  Processing = 'Đang xử lý',
  Shipped = 'Đang giao hàng',
  Completed = 'Hoàn thành',
  Cancelled = 'Đã hủy',
}

// Định nghĩa cấu trúc cho một đơn hàng
export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  orderDate: string;
  paymentMethod: 'COD' | 'Bank Transfer' | 'Momo';
  productSummary?: string; // Tóm tắt sản phẩm trong đơn hàng
}

// Định nghĩa cấu trúc cho người dùng
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: string[];
  role: 'admin' | 'customer';
}

// Định nghĩa cấu trúc cho một slide quảng cáo
export interface Slide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  link: string;
}

// Định nghĩa cấu trúc cho cài đặt cửa hàng
export interface StoreSettings {
  logo: string;
  slides: Slide[];
}