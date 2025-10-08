import React from 'react';
import { Order } from '../types';

interface OrderSuccessModalProps {
  order: Order;
  onClose: () => void;
}

const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg animate-fade-in-up transform transition-all duration-300">
        <div className="p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>
          <h2 className="text-3xl font-bold text-gray-900">Đặt hàng thành công!</h2>
          <p className="text-gray-600 mt-2">Cảm ơn bạn đã tin tưởng và mua sắm tại AkStore.</p>
          
          <div className="text-left bg-gray-50 p-4 rounded-lg mt-6 border text-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Thông tin đơn hàng</h3>
            <div className="space-y-2">
                <p><strong className="font-medium text-gray-600">Mã đơn hàng:</strong> <span className="font-semibold text-blue-600 font-mono">{order.id}</span></p>
                <p><strong className="font-medium text-gray-600">Người nhận:</strong> <span className="font-semibold text-gray-800">{order.customerName}</span></p>
                <p><strong className="font-medium text-gray-600">Tổng cộng:</strong> <span className="font-bold text-lg text-gray-900">{order.total.toLocaleString('vi-VN')}₫</span></p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default OrderSuccessModal;
