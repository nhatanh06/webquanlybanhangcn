import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { OrderStatus } from '../../types';

const AdminOrdersPage: React.FC = () => {
    const { orders, updateOrderStatus, isSubmitting } = useAppContext();
    
    const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
        updateOrderStatus(orderId, newStatus);
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Quản lý đơn hàng</h1>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left table-auto">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đặt</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {orders.map((order, index) => (
                                <tr key={order.id} className={`${index === 0 ? 'bg-blue-50' : ''} hover:bg-gray-50 transition-colors`}>
                                    <td className="p-3 font-medium text-blue-600 whitespace-nowrap">#{order.id}</td>
                                    <td className="p-3 text-gray-700">{order.customerName}</td>
                                    <td className="p-3 text-gray-700 whitespace-nowrap">{new Date(order.orderDate).toLocaleDateString('vi-VN')}</td>
                                    <td className="p-3 text-gray-700 whitespace-nowrap">{order.total.toLocaleString('vi-VN')}₫</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                                            order.status === OrderStatus.Completed ? 'bg-green-100 text-green-800' : 
                                            order.status === OrderStatus.Cancelled ? 'bg-red-100 text-red-800' : 
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                            className="border rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 bg-white disabled:bg-gray-200 disabled:cursor-not-allowed w-full"
                                            disabled={isSubmitting || order.status === OrderStatus.Completed || order.status === OrderStatus.Cancelled}
                                        >
                                            {Object.values(OrderStatus).map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminOrdersPage;
