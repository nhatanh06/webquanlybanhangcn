import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import InvoiceTemplate from '../../components/admin/InvoiceTemplate';
import { generateInvoicePdf } from '../../utils/pdfGenerator';

// Khai báo biến toàn cục từ CDN
declare var jspdf: any;
declare var html2canvas: any;

const AdminOrdersPage: React.FC = () => {
    const { orders, updateOrderStatus, isSubmitting, storeSettings } = useAppContext();
    const [orderToPrint, setOrderToPrint] = useState<Order | null>(null);
    const invoiceRef = useRef<HTMLDivElement>(null);

    const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
        updateOrderStatus(orderId, newStatus);
    };

    useEffect(() => {
        if (orderToPrint && invoiceRef.current) {
            const generatePdf = async () => {
                try {
                    await generateInvoicePdf(invoiceRef.current as HTMLElement, orderToPrint.id);
                } catch (error) {
                    console.error("Lỗi khi tạo PDF:", error);
                    alert("Không thể tạo hóa đơn PDF. Vui lòng thử lại.");
                } finally {
                    setOrderToPrint(null); // Reset sau khi tạo xong
                }
            };
            setTimeout(generatePdf, 100); 
        }
    }, [orderToPrint]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Quản lý đơn hàng</h1>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left table-auto min-w-[1000px]">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đặt</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Cập nhật Trạng thái</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {orders.map((order, index) => (
                                <tr key={order.id} className={`${index === 0 ? 'bg-blue-50' : ''} hover:bg-gray-50 transition-colors`}>
                                    <td className="p-3 font-medium text-blue-600 whitespace-nowrap">#{order.id}</td>
                                    <td className="p-3 text-gray-700">{order.productSummary || 'N/A'}</td>
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
                                    <td className="p-3">
                                        <button 
                                            onClick={() => setOrderToPrint(order)}
                                            className="bg-gray-200 text-gray-800 font-semibold py-1 px-3 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                                            disabled={isSubmitting}
                                        >
                                            In Hóa Đơn
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Component hóa đơn được render ẩn để chụp ảnh */}
            {orderToPrint && (
                <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '800px' }}>
                    <InvoiceTemplate ref={invoiceRef} order={orderToPrint} storeSettings={storeSettings} />
                </div>
            )}
        </div>
    );
};

export default AdminOrdersPage;