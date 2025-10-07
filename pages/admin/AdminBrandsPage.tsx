import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Brand } from '../../types';
import BrandFormModal from '../../components/admin/BrandFormModal';

const AdminBrandsPage: React.FC = () => {
    const { brands, addBrand, updateBrand, deleteBrand, commitChanges } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);

    const handleOpenAddModal = () => {
        setEditingBrand(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (brand: Brand) => {
        setEditingBrand(brand);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBrand(null);
    };

    const handleSaveBrand = (brandData: Brand | Omit<Brand, 'id'>) => {
        if ('id' in brandData) {
            updateBrand(brandData as Brand);
        } else {
            addBrand(brandData);
        }
        handleCloseModal();
    };
    
    const handleDeleteBrand = (brand: Brand) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa thương hiệu "${brand.name}" không?`)) {
            try {
                deleteBrand(brand.id);
            } catch (error: any) {
                alert(`Không thể xóa: ${error.message}`);
            }
        }
    };

    const handleSaveChanges = () => {
        commitChanges();
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 2000);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Quản lý Thương hiệu</h1>
                <div className="flex items-center space-x-3">
                    {showSaveSuccess && <span className="text-green-600 font-semibold">Đã lưu thành công!</span>}
                    <button 
                        onClick={handleSaveChanges}
                        className="bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                    >
                        Lưu thay đổi
                    </button>
                    <button 
                        onClick={handleOpenAddModal}
                        className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Thêm thương hiệu mới
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left table-auto">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên thương hiệu</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {brands.map(brand => (
                                <tr key={brand.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-3 flex items-center">
                                        <img src={brand.logo} alt={brand.name} className="w-16 h-12 object-contain mr-4"/>
                                        <span className="font-medium text-gray-900">{brand.name}</span>
                                    </td>
                                    <td className="p-3 whitespace-nowrap">
                                        <button onClick={() => handleOpenEditModal(brand)} className="text-blue-600 hover:text-blue-800 mr-4 font-medium">Sửa</button>
                                        <button onClick={() => handleDeleteBrand(brand)} className="text-red-600 hover:text-red-800 font-medium">Xóa</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <BrandFormModal 
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveBrand}
                    brand={editingBrand}
                />
            )}
        </div>
    );
};

export default AdminBrandsPage;
