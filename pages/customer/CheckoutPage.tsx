import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const CheckoutPage: React.FC = () => {
    const { cart, getCartTotal, placeOrder, user, isSubmitting } = useAppContext();
    const navigate = useNavigate();
    const [customerInfo, setCustomerInfo] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || '',
        address: user?.addresses[0] || '',
        paymentMethod: 'COD' as 'COD' | 'Bank Transfer' | 'Momo',
    });

    const total = getCartTotal();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCustomerInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const order = await placeOrder(customerInfo);
        if (!order) {
            alert('Giỏ hàng trống hoặc có lỗi xảy ra, vui lòng thử lại.');
        }
        // Việc điều hướng sẽ được xử lý bởi modal trong App.tsx
    };

    if (cart.length === 0 && !isSubmitting) {
        navigate('/cart', { replace: true });
        return null;
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-16">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">Thanh toán</h1>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Customer Information */}
                <div className="lg:col-span-2 bg-white p-6 shadow-lg rounded-lg">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Thông tin giao hàng</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                            <input type="text" name="name" id="name" required value={customerInfo.name} onChange={handleChange} placeholder="Nguyễn Văn A" className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-black font-semibold placeholder-gray-400 px-3 py-2"/>
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                            <input type="tel" name="phone" id="phone" required value={customerInfo.phone} onChange={handleChange} placeholder="09xxxxxxxx" className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-black font-semibold placeholder-gray-400 px-3 py-2"/>
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" name="email" id="email" required value={customerInfo.email} onChange={handleChange} placeholder="email@example.com" className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-black font-semibold placeholder-gray-400 px-3 py-2"/>
                        </div>
                        <div className="md:col-span-2">
                             <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                            <input type="text" name="address" id="address" required value={customerInfo.address} onChange={handleChange} placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố" className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-black font-semibold placeholder-gray-400 px-3 py-2"/>
                        </div>
                    </div>
                    
                    <h2 className="text-xl font-bold mt-8 mb-4 text-gray-800">Phương thức thanh toán</h2>
                    <div className="space-y-3">
                       <label className={`flex items-center p-3 border rounded-lg hover:border-blue-500 transition-all cursor-pointer ${customerInfo.paymentMethod === 'COD' ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200'}`}>
                           <input type="radio" name="paymentMethod" value="COD" checked={customerInfo.paymentMethod === 'COD'} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500"/>
                           <span className="ml-3 text-gray-800">Thanh toán khi nhận hàng (COD)</span>
                       </label>
                        <label className={`flex items-center p-3 border rounded-lg hover:border-blue-500 transition-all cursor-pointer ${customerInfo.paymentMethod === 'Bank Transfer' ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200'}`}>
                           <input type="radio" name="paymentMethod" value="Bank Transfer" checked={customerInfo.paymentMethod === 'Bank Transfer'} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500"/>
                           <span className="ml-3 text-gray-800">Chuyển khoản ngân hàng</span>
                       </label>
                        <label className={`flex items-center p-3 border rounded-lg hover:border-blue-500 transition-all cursor-pointer ${customerInfo.paymentMethod === 'Momo' ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200'}`}>
                           <input type="radio" name="paymentMethod" value="Momo" checked={customerInfo.paymentMethod === 'Momo'} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500"/>
                           <span className="ml-3 text-gray-800">Thanh toán qua ví Momo</span>
                       </label>
                    </div>

                     {customerInfo.paymentMethod === 'Bank Transfer' && (
                        <div className="mt-6 p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                            <h3 className="font-bold text-lg text-blue-800">Thông tin chuyển khoản</h3>
                            <p className="text-sm text-gray-700 mt-2">Vui lòng quét mã QR hoặc chuyển khoản theo thông tin dưới đây để hoàn tất đơn hàng.</p>
                            <div className="mt-4 flex flex-col md:flex-row items-center gap-6">
                                <img src='https://img.vietqr.io/image/vietinbank-113366668888-compact.jpg' alt="Mã QR thanh toán" className="w-48 h-48 rounded-md shadow-md"/>
                                <div className="text-gray-800 space-y-2">
                                    <p><strong>Ngân hàng:</strong> <span className="font-medium">Vietinbank</span></p>
                                    <p><strong>Số tài khoản:</strong> <span className="font-medium">113366668888</span></p>
                                    <p><strong>Chủ tài khoản:</strong> <span className="font-medium">TECHSHOP DEMO</span></p>
                                    <p className="mt-2">
                                        <strong>Nội dung:</strong>
                                        <code className="block mt-1 bg-gray-200 text-red-700 font-mono p-2 rounded w-full">{`TT Don hang ${customerInfo.phone}`}</code>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 shadow-lg rounded-lg sticky top-24">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Tóm tắt đơn hàng</h2>
                        <div className="space-y-2 mb-4 max-h-64 overflow-y-auto pr-2">
                            {cart.map(item => (
                                <div key={item.product.id} className="flex justify-between items-start">
                                    <div className="flex">
                                        <img src={item.product.images[0]} alt={item.product.name} className="w-16 h-16 object-contain bg-gray-100 p-1 rounded"/>
                                        <div className="ml-2">
                                            <p className="text-sm font-semibold">{item.product.name}</p>
                                            <p className="text-xs text-gray-500">SL: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm">{(item.product.price * item.quantity).toLocaleString('vi-VN')}₫</p>
                                </div>
                            ))}
                        </div>
                        <div className="border-t pt-4">
                            <div className="flex justify-between mb-2 text-gray-700">
                                <span>Tạm tính</span>
                                <span>{total.toLocaleString('vi-VN')}₫</span>
                            </div>
                             <div className="flex justify-between mb-4 text-gray-700">
                                <span>Phí vận chuyển</span>
                                <span>Miễn phí</span>
                            </div>
                            <div className="border-t pt-4 flex justify-between font-bold text-lg text-gray-900">
                                <span>Tổng cộng</span>
                                <span>{total.toLocaleString('vi-VN')}₫</span>
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full mt-6 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow hover:shadow-lg transform hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CheckoutPage;