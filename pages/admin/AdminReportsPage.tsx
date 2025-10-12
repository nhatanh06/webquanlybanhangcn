import React, { useMemo, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { OrderStatus, OrderItem } from '../../types';

// Icons for Stat Cards
const Icons = {
    Revenue: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>,
    Orders: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
    Customers: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
};

// Component Thẻ thống kê
const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4">
        <div className="bg-gray-100 p-3 rounded-full">{icon}</div>
        <div>
            <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
            <p className="text-2xl md:text-3xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const AdminReportsPage: React.FC = () => {
    const { orders, users, products } = useAppContext();
    const [copySuccess, setCopySuccess] = useState('');

    const reportData = useMemo(() => {
        const totalRevenue = orders.filter(o => o.status === OrderStatus.Completed).reduce((s, o) => s + o.total, 0);
        const orderStatusCounts = orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {} as { [key in OrderStatus]?: number });
        const totalCustomers = users.filter(user => user.role === 'customer').length;
        
        const productSales = new Map<string, { name: string, quantity: number, revenue: number }>();
        orders.forEach(order => {
            // FIX: Access the nested CartItem object (item.product) to correctly aggregate sales data.
            order.items.forEach((item: OrderItem) => {
                const cartItem = item.product;
                const existing = productSales.get(cartItem.product.id) || { name: cartItem.product.name, quantity: 0, revenue: 0 };
                existing.quantity += cartItem.quantity;
                existing.revenue += cartItem.quantity * cartItem.product.price;
                productSales.set(cartItem.product.id, existing);
            });
        });
        const bestSellingProducts = Array.from(productSales.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 10);

        return { totalRevenue, orderStatusCounts, totalCustomers, bestSellingProducts };
    }, [orders, users]);

    const copyToClipboard = (data: any[], headers: string[]) => {
        const csvContent = [headers.join('\t'), ...data.map(row => Object.values(row).join('\t'))].join('\n');
        navigator.clipboard.writeText(csvContent).then(() => {
            setCopySuccess('Đã sao chép!');
            setTimeout(() => setCopySuccess(''), 2000);
        }).catch(() => { setCopySuccess('Lỗi!'); setTimeout(() => setCopySuccess(''), 2000); });
    };

    return (
        <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-6 text-gray-900">Báo cáo & Thống kê</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard title="Doanh thu (Hoàn thành)" value={`${reportData.totalRevenue.toLocaleString('vi-VN')}₫`} icon={<Icons.Revenue />} />
                <StatCard title="Tổng đơn hàng" value={orders.length} icon={<Icons.Orders />} />
                <StatCard title="Tổng khách hàng" value={reportData.totalCustomers} icon={<Icons.Customers />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold mb-4 text-blue-700">Trạng thái đơn hàng</h2>
                    <div className="space-y-3">
                        {Object.values(OrderStatus).map(status => (
                            <div key={status} className="flex justify-between items-center text-gray-700">
                                <span>{status}</span>
                                <span className="font-bold text-gray-900">{reportData.orderStatusCounts[status] || 0}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-lg">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                        <h2 className="text-xl font-bold text-blue-700">Top sản phẩm bán chạy</h2>
                        <button onClick={() => copyToClipboard(reportData.bestSellingProducts, ['Sản phẩm', 'Số lượng', 'Doanh thu (VND)'])} className="bg-green-100 text-green-800 font-semibold py-2 px-3 rounded-lg hover:bg-green-200 transition-colors text-sm w-full sm:w-auto">
                            {copySuccess || 'Sao chép dữ liệu (CSV)'}
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[500px]">
                            <thead>
                                <tr className="bg-gray-50 border-b">
                                    <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                                    <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng bán</th>
                                    <th className="p-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Doanh thu</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {reportData.bestSellingProducts.map(product => (
                                    <tr key={product.name} className="hover:bg-gray-50">
                                        <td className="p-3 font-medium text-gray-900">{product.name}</td>
                                        <td className="p-3 text-center text-gray-700">{product.quantity}</td>
                                        <td className="p-3 text-right text-gray-700 whitespace-nowrap">{product.revenue.toLocaleString('vi-VN')}₫</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminReportsPage;