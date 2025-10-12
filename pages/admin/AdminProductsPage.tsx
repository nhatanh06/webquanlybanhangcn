import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Product } from '../../types';
import ProductFormModal from '../../components/admin/ProductFormModal';

const AdminProductsPage: React.FC = () => {
    const { products, addProduct, updateProduct, deleteProduct, isSubmitting } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const handleOpenAddModal = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleSaveProduct = async (productData: Product | Omit<Product, 'id' | 'rating' | 'reviewCount' | 'reviews'>) => {
        if ('id' in productData) {
            await updateProduct(productData as Product);
        } else {
            await addProduct(productData);
        }
        handleCloseModal();
    };
    
    const handleDeleteProduct = async (productId: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) {
            await deleteProduct(productId);
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
                <button 
                    onClick={handleOpenAddModal}
                    className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Đang xử lý...' : 'Thêm sản phẩm mới'}
                </button>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left table-auto min-w-[800px]">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên sản phẩm</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thương hiệu</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {products.map(product => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-3 flex items-center">
                                        <img src={Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : ''} alt={product.name} className="w-12 h-12 object-contain bg-gray-100 p-1 rounded-md mr-4"/>
                                        <span className="font-medium text-gray-900">{product.name}</span>
                                    </td>
                                    <td className="p-3 text-gray-700">{product.category}</td>
                                    <td className="p-3 text-gray-700">{product.brand}</td>
                                    <td className="p-3 text-gray-700 whitespace-nowrap">{product.price.toLocaleString('vi-VN')}₫</td>
                                    <td className="p-3 whitespace-nowrap">
                                        <button onClick={() => handleOpenEditModal(product)} className="text-blue-600 hover:text-blue-800 mr-4 font-medium" disabled={isSubmitting}>Sửa</button>
                                        <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-800 font-medium" disabled={isSubmitting}>Xóa</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <ProductFormModal 
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveProduct}
                    product={editingProduct}
                />
            )}
        </div>
    );
};

export default AdminProductsPage;