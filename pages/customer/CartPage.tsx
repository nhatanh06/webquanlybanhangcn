import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import QuantitySelector from '../../components/QuantitySelector'; // Import component mới

const CartPage: React.FC = () => {
    const { cart, updateQuantity, removeFromCart, getCartTotal } = useAppContext();
    const navigate = useNavigate();
    const total = getCartTotal();

    if (cart.length === 0) {
        return (
            <div className="container mx-auto px-4 text-center py-20">
                <h1 className="text-3xl font-bold mb-4 text-gray-900">Giỏ hàng của bạn đang trống</h1>
                <p className="text-gray-600 mb-8">Hãy khám phá các sản phẩm tuyệt vời của chúng tôi!</p>
                <Link to="/shop" className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors">
                    Tiếp tục mua sắm
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Giỏ hàng</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2">
                    <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
                        {cart.map(item => (
                            <div key={item.product.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                                <img src={item.product.images[0]} alt={item.product.name} className="w-24 h-24 object-contain bg-gray-100 p-1 rounded-md flex-shrink-0" />
                                <div className="flex-grow">
                                    <h3 className="font-semibold text-lg text-gray-800">{item.product.name}</h3>
                                    <p className="text-gray-500 text-sm">
                                        {Object.entries(item.selectedOptions).map(([key, value]) => `${key}: ${value}`).join(', ')}
                                    </p>
                                    <p className="text-blue-600 font-bold mt-1 sm:hidden">{(item.product.price).toLocaleString('vi-VN')}₫</p>
                                </div>
                                <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-4">
                                    <QuantitySelector 
                                        quantity={item.quantity}
                                        onQuantityChange={(newQuantity) => updateQuantity(item.product.id, newQuantity)}
                                    />
                                    <p className="font-semibold w-24 text-right hidden sm:block">{(item.product.price * item.quantity).toLocaleString('vi-VN')}₫</p>
                                    <button onClick={() => removeFromCart(item.product.id)} className="text-red-500 hover:text-red-700 font-bold text-2xl ml-4 sm:ml-0">
                                        &times;
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cart Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white shadow rounded-lg p-6 sticky top-24">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Tóm tắt giỏ hàng</h2>
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
                        <button 
                            onClick={() => navigate('/checkout')}
                            className="w-full mt-6 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors">
                            Tiến hành thanh toán
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;