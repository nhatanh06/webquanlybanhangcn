// services/api.ts

export const API_BASE_URL = 'http://localhost:5001/api';

/**
 * Hàm chung để thực hiện các yêu cầu API đến backend.
 * @param endpoint Đường dẫn API (ví dụ: '/products')
 * @param method Phương thức HTTP (ví dụ: 'GET', 'POST')
 * @param body Dữ liệu gửi đi (cho các phương thức POST, PUT)
 * @returns Promise chứa dữ liệu JSON từ server
 */
export async function apiRequest<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'Lỗi không xác định từ server');
    }
    // Trả về đối tượng rỗng nếu status là 204 No Content, ngược lại trả về JSON
    return response.status === 204 ? ({} as T) : response.json();
}
