import React from 'react';
import { useAppContext } from '../../context/AppContext';

// Icons for Stat Cards
const Icons = {
    Revenue: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>,
    Orders: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
    Products: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
};


const DashboardPage: React.FC = () => {
    const { products, orders } = useAppContext();

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;

    // Các thẻ thống kê
    const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
        <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4 hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="bg-gray-100 p-3 rounded-full">
                {icon}
            </div>
            <div>
                <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
                <p className="text-3xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
    
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Dashboard</h1>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Tổng doanh thu" value={`${totalRevenue.toLocaleString('vi-VN')}₫`} icon={<Icons.Revenue />} />
                <StatCard title="Tổng số đơn hàng" value={totalOrders} icon={<Icons.Orders />} />
                <StatCard title="Tổng số sản phẩm" value={totalProducts} icon={<Icons.Products />} />
            </div>

             {/* Recent Orders Table */}
             <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-blue-700">Đơn hàng gần đây</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.slice(0, 5).map(order => (
                                <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                                    <td className="p-3 font-medium text-blue-600">#{order.id}</td>
                                    <td className="p-3 text-gray-700">{order.productSummary || 'N/A'}</td>
                                    <td className="p-3 text-gray-700">{order.customerName}</td>
                                    <td className="p-3 text-gray-700">{order.total.toLocaleString('vi-VN')}₫</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'Hoàn thành' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {order.status}
                                        </span>
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

export default DashboardPage;