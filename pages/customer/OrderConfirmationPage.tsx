import React, { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Order } from '../../types';

const OrderConfirmationPage: React.FC = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { orders } = useAppContext();
    
    // Lấy orderId từ state được truyền qua navigate
    const orderId = state?.orderId;
    const order: Order | undefined = orders.find(o => o.id === orderId);

    // Nếu không có orderId hoặc không tìm thấy order, điều hướng về trang chủ
    useEffect(() => {
        if (!order) {
            navigate('/', { replace: true });
        }
    }, [order, navigate]);

    if (!order) {
        return null; // Hoặc một component loading
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 my-16">
            <div className="max-w-2xl mx-auto bg-white p-8 shadow-lg rounded-lg text-center">
                <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <h1 className="text-3xl font-bold text-gray-900 mt-4">Đặt hàng thành công!</h1>
                <p className="text-gray-600 mt-2">Cảm ơn bạn đã mua sắm. Đơn hàng của bạn đang được xử lý.</p>
                <div className="text-left bg-gray-50 p-6 rounded-lg mt-8 border">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Chi tiết đơn hàng</h2>
                    <p className="mb-2"><strong className="text-gray-700">Mã đơn hàng:</strong> <span className="text-blue-600 font-mono">{order.id}</span></p>
                    <p className="mb-2"><strong className="text-gray-700">Người nhận:</strong> {order.customerName}</p>
                    <p className="mb-2"><strong className="text-gray-700">Địa chỉ giao hàng:</strong> {order.address}</p>
                    <p className="mb-2"><strong className="text-gray-700">Tổng cộng:</strong> <span className="font-bold text-lg">{order.total.toLocaleString('vi-VN')}₫</span></p>
                </div>
                <Link
                    to="/"
                    className="inline-block mt-8 bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Tiếp tục mua sắm
                </Link>
            </div>
        </div>
    );
};

export default OrderConfirmationPage;