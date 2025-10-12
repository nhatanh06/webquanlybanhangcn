import React from 'react';
import { useAppContext } from '../../context/AppContext';

const AdminUsersPage: React.FC = () => {
    const { users } = useAppContext();
    
    // Lọc ra chỉ các tài khoản của khách hàng
    const customerUsers = users.filter(user => user.role === 'customer');

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Quản lý tài khoản khách hàng</h1>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số điện thoại</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Địa chỉ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customerUsers.map(user => (
                                <tr key={user.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-medium text-gray-900">{user.name}</td>
                                    <td className="p-3 text-gray-700">{user.email}</td>
                                    <td className="p-3 text-gray-700">{user.phone}</td>
                                    <td className="p-3 text-gray-700">{user.addresses.join(', ')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUsersPage;