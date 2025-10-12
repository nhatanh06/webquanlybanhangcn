import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Order, OrderStatus, OrderItem } from '../../types';

const AccountPage: React.FC = () => {
  const { user, logout, orders, cancelOrder } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const handleCancelOrder = (orderId: string) => {
    if(window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
        cancelOrder(orderId);
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
      setExpandedOrders(prev => {
          const newSet = new Set(prev);
          if (newSet.has(orderId)) {
              newSet.delete(orderId);
          } else {
              newSet.add(orderId);
          }
          return newSet;
      });
  };

  // Lọc và sắp xếp đơn hàng theo ngày mới nhất
  const userOrders = orders
    .filter(order => order.customerName === user.name)
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

  const getPaymentMethodLabel = (method: 'COD' | 'Bank Transfer' | 'Momo') => {
    switch (method) {
        case 'COD': return 'Thanh toán khi nhận hàng (COD)';
        case 'Bank Transfer': return 'Chuyển khoản ngân hàng';
        case 'Momo': return 'Ví điện tử Momo';
        default: return method;
    }
  };

  // Component render nội dung của từng tab
  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Thông tin cá nhân</h2>
            <div className="space-y-3 text-gray-700">
              <p><strong className="text-gray-900 font-semibold">Họ tên:</strong> {user.name}</p>
              <p><strong className="text-gray-900 font-semibold">Email:</strong> {user.email}</p>
              <p><strong className="text-gray-900 font-semibold">Số điện thoại:</strong> {user.phone}</p>
            </div>
          </div>
        );
      case 'orders':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Lịch sử đơn hàng</h2>
            {userOrders.length > 0 ? (
                <div className="space-y-4">
                    {userOrders.map((order: Order) => {
                        const isExpanded = expandedOrders.has(order.id);
                        return (
                            <div key={order.id} className="border p-4 rounded-lg text-gray-700 bg-gray-50 transition-shadow hover:shadow-md">
                                <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleOrderExpansion(order.id)}>
                                    <div>
                                        <p className="font-bold text-blue-700">Mã đơn: #{order.id}</p>
                                        <p className="text-sm"><strong className="text-gray-800">Ngày đặt:</strong> {new Date(order.orderDate).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        order.status === OrderStatus.Completed ? 'bg-green-100 text-green-800' : 
                                        order.status === OrderStatus.Cancelled ? 'bg-red-100 text-red-800' : 
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {order.status}
                                    </span>
                                </div>
                                
                                {isExpanded && (
                                    <div className="mt-4 border-t pt-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                                            <div>
                                                <p className="font-semibold text-gray-600 mb-1">Địa chỉ giao hàng:</p>
                                                <p className="text-gray-800">{order.address}</p>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-600 mb-1">Phương thức thanh toán:</p>
                                                <p className="text-gray-800">{getPaymentMethodLabel(order.paymentMethod)}</p>
                                            </div>
                                        </div>

                                        <h4 className="font-semibold text-gray-800 mb-2 border-t pt-4">Chi tiết sản phẩm:</h4>
                                        <div className="space-y-3">
                                            {/* FIX: Update logic to access nested product data via item.product.product */}
                                            {order.items.map((item: OrderItem) => (
                                                <div key={item.product_id} className="flex justify-between items-center text-sm">
                                                    <div className="flex items-center">
                                                        <img src={item.product.product.images[0]} alt={item.product.product.name} className="w-12 h-12 object-contain bg-gray-100 p-1 rounded-md mr-4 border" />
                                                        <div>
                                                            <p className="font-medium text-gray-800">{item.product.product.name}</p>
                                                            <p className="text-gray-500">Số lượng: {item.product.quantity}</p>
                                                        </div>
                                                    </div>
                                                    <span className="font-medium">{(item.product.product.price * item.product.quantity).toLocaleString('vi-VN')}₫</span>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="mt-4 pt-2 border-t text-right"><strong className="text-gray-800">Tổng tiền:</strong> <span className="font-bold text-lg text-blue-600">{order.total.toLocaleString('vi-VN')}₫</span></p>
                                        
                                        {order.status === OrderStatus.Pending && (
                                            <div className="text-right mt-4">
                                                <button 
                                                    onClick={() => handleCancelOrder(order.id)}
                                                    className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors text-sm"
                                                >
                                                    Hủy đơn hàng
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            ) : (
                <p className="text-gray-700">Bạn chưa có đơn hàng nào.</p>
            )}
          </div>
        );
      case 'addresses':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Địa chỉ giao hàng</h2>
            {user.addresses.map((address, index) => (
              <p key={index} className="mb-2 p-3 bg-gray-100 rounded text-gray-800">{address}</p>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-16">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Tài khoản của tôi</h1>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-1/4">
          <nav className="flex flex-row flex-wrap gap-2 md:flex-col md:space-y-2 md:gap-0">
            <button onClick={() => setActiveTab('profile')} className={`text-center md:text-left p-3 rounded-md transition-colors font-medium flex-grow ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-800 hover:bg-blue-100 hover:text-blue-700'}`}>Thông tin</button>
            <button onClick={() => setActiveTab('orders')} className={`text-center md:text-left p-3 rounded-md transition-colors font-medium flex-grow ${activeTab === 'orders' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-800 hover:bg-blue-100 hover:text-blue-700'}`}>Đơn hàng</button>
            <button onClick={() => setActiveTab('addresses')} className={`text-center md:text-left p-3 rounded-md transition-colors font-medium flex-grow ${activeTab === 'addresses' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-800 hover:bg-blue-100 hover:text-blue-700'}`}>Địa chỉ</button>
            <button onClick={handleLogout} className="text-center md:text-left p-3 rounded-md hover:bg-red-50 text-red-600 font-medium transition-colors w-full">Đăng xuất</button>
          </nav>
        </aside>
        
        {/* Content */}
        <main className="w-full md:w-3/4 bg-white p-6 shadow-lg rounded-lg">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AccountPage;