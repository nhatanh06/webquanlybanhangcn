import React, { useState, useEffect } from 'react';
import { Category } from '../../types';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Category | Omit<Category, 'id'>) => void;
  category: Category | null;
}

// Helper function to convert file to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};


const CategoryFormModal: React.FC<CategoryFormModalProps> = ({ isOpen, onClose, onSave, category }) => {
  const [formData, setFormData] = useState({ name: '', image: '' });
  
  const formInputClasses = "mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-black font-semibold placeholder-gray-400 px-3 py-2 transition-colors hover:bg-gray-100";

  useEffect(() => {
    if (category) {
      setFormData({ name: category.name, image: category.image });
    } else {
      setFormData({ name: '', image: '' });
    }
  }, [category, isOpen]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, name: e.target.value }));
  };
  
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64Image = await fileToBase64(e.target.files[0]);
        setFormData(prev => ({ ...prev, image: base64Image }));
      } catch (error) {
        console.error("Lỗi khi chuyển đổi ảnh:", error);
        alert("Không thể tải ảnh lên, vui lòng thử lại.");
      }
    }
  };
  
  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (category) {
      onSave({ ...formData, id: category.id });
    } else {
      onSave(formData);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">{category ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tên danh mục</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleNameChange} required className={formInputClasses}/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Hình ảnh</label>
                <input type="file" id="image-upload" accept="image/*" onChange={handleImageChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                {formData.image && (
                    <div className="mt-4 relative w-32 h-32 group">
                        <p className="text-sm font-medium text-gray-700 mb-2 absolute -top-6">Xem trước:</p>
                        <img src={formData.image} alt="Xem trước danh mục" className="h-full w-full object-cover rounded-md shadow-md"/>
                        <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Xóa ảnh"
                        >
                            &times;
                        </button>
                    </div>
                )}
              </div>
          </div>
          <div className="p-6 bg-gray-50 flex justify-end space-x-3 border-t">
            <button type="button" onClick={onClose} className="bg-white text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors">
              Hủy
            </button>
            <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow hover:shadow-lg">
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryFormModal;