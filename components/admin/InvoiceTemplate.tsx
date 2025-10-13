import React, { forwardRef } from 'react';
import { Order, StoreSettings, OrderItem } from '../../types';

interface InvoiceTemplateProps {
  order: Order;
  storeSettings: StoreSettings;
}

const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceTemplateProps>(({ order, storeSettings }, ref) => {

    const getPaymentMethodLabel = (method: 'COD' | 'Bank Transfer' | 'Momo') => {
        switch (method) {
            case 'COD': return 'Thanh toán khi nhận hàng (COD)';
            case 'Bank Transfer': return 'Chuyển khoản ngân hàng';
            case 'Momo': return 'Ví điện tử Momo';
            default: return method;
        }
    };

    return (
        <div ref={ref} className="p-10 bg-white font-sans text-gray-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 pb-4">
                <div>
                    {storeSettings.logo ? (
                        <img src={storeSettings.logo} alt="Store Logo" className="h-16 w-auto" />
                    ) : (
                        <h1 className="text-3xl font-bold text-blue-700">AkStore</h1>
                    )}
                    <p className="text-sm mt-2">Ấp Cầu Xéo, Xã Long Thành, Đồng Nai</p>
                    <p className="text-sm">support@akstore.com</p>
                    <p className="text-sm">Điện thoại: (081) 3121 270</p>
                </div>
                <div className="text-right">
                    <h2 className="text-4xl font-bold uppercase text-gray-600">Hóa Đơn</h2>
                    <p className="mt-2"><span className="font-semibold">Mã đơn:</span> #{order.id}</p>
                    <p><span className="font-semibold">Ngày đặt:</span> {new Date(order.orderDate).toLocaleDateString('vi-VN')}</p>
                </div>
            </div>

            {/* Customer Info */}
            <div className="mt-8">
                <h3 className="text-lg font-semibold border-b pb-2 mb-2">Thông tin khách hàng</h3>
                <p><strong>Tên khách hàng:</strong> {order.customerName}</p>
                <p><strong>Số điện thoại:</strong> {order.phone}</p>
                <p><strong>Địa chỉ giao hàng:</strong> {order.address}</p>
            </div>

            {/* Items Table */}
            <div className="mt-8">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-3 text-sm font-semibold uppercase">Sản phẩm</th>
                            <th className="p-3 text-sm font-semibold uppercase text-center">Số lượng</th>
                            <th className="p-3 text-sm font-semibold uppercase text-right">Đơn giá</th>
                            <th className="p-3 text-sm font-semibold uppercase text-right">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* FIX: Update logic to handle the nested OrderItem structure */}
                        {order.items.map((item: OrderItem) => {
                            const cartItem = item.product;
                            return (
                            <tr key={cartItem.product.id} className="border-b">
                                <td className="p-3">
                                    <p className="font-medium">{cartItem.product.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {Object.entries(cartItem.selectedOptions).map(([key, value]) => `${key}: ${value}`).join(', ')}
                                    </p>
                                </td>
                                <td className="p-3 text-center">{cartItem.quantity}</td>
                                <td className="p-3 text-right">{cartItem.product.price.toLocaleString('vi-VN')}₫</td>
                                <td className="p-3 text-right font-semibold">{(cartItem.product.price * cartItem.quantity).toLocaleString('vi-VN')}₫</td>
                            </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Total */}
            <div className="flex justify-end mt-8">
                <div className="w-full max-w-sm">
                    <div className="flex justify-between py-2 border-b">
                        <span className="font-semibold">Tạm tính:</span>
                        <span>{order.total.toLocaleString('vi-VN')}₫</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                        <span className="font-semibold">Phí vận chuyển:</span>
                        <span>Miễn phí</span>
                    </div>
                    <div className="flex justify-between py-2 text-xl font-bold bg-gray-100 px-2 rounded">
                        <span>Tổng cộng:</span>
                        <span>{order.total.toLocaleString('vi-VN')}₫</span>
                    </div>
                </div>
            </div>
            
            {/* Payment Method */}
            <div className="mt-8">
                <h3 className="text-lg font-semibold border-b pb-2 mb-2">Hình thức thanh toán</h3>
                <p>{getPaymentMethodLabel(order.paymentMethod)}</p>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center text-sm text-gray-500 border-t pt-4">
                <p>Cảm ơn quý khách đã mua sắm tại AkStore!</p>
                <p>www.akstore.com</p>
            </div>
        </div>
    );
});

export default InvoiceTemplate;