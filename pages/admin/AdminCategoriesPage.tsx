import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Category } from '../../types';
import CategoryFormModal from '../../components/admin/CategoryFormModal';

const AdminCategoriesPage: React.FC = () => {
    const { categories, addCategory, updateCategory, deleteCategory, isSubmitting } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const handleOpenAddModal = () => {
        setEditingCategory(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (category: Category) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    const handleSaveCategory = async (categoryData: Category | Omit<Category, 'id'>) => {
        if ('id' in categoryData) {
            await updateCategory(categoryData as Category);
        } else {
            await addCategory(categoryData);
        }
        handleCloseModal();
    };
    
    const handleDeleteCategory = async (category: Category) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${category.name}" không?`)) {
            try {
                await deleteCategory(category.id);
            } catch (error: any) {
                alert(`Không thể xóa: ${error.message}`);
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Quản lý Danh mục</h1>
                <button 
                    onClick={handleOpenAddModal}
                    className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Đang xử lý...' : 'Thêm danh mục mới'}
                </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left table-auto">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên danh mục</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {categories.map(category => (
                                <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-3 flex items-center">
                                        <img src={category.image} alt={category.name} className="w-12 h-12 object-cover rounded-md mr-4"/>
                                        <span className="font-medium text-gray-900">{category.name}</span>
                                    </td>
                                    <td className="p-3 whitespace-nowrap">
                                        <button onClick={() => handleOpenEditModal(category)} className="text-blue-600 hover:text-blue-800 mr-4 font-medium" disabled={isSubmitting}>Sửa</button>
                                        <button onClick={() => handleDeleteCategory(category)} className="text-red-600 hover:text-red-800 font-medium" disabled={isSubmitting}>Xóa</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <CategoryFormModal 
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveCategory}
                    category={editingCategory}
                />
            )}
        </div>
    );
};

export default AdminCategoriesPage;
