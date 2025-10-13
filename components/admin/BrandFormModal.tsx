import React, { useState, useEffect } from 'react';
import { Brand } from '../../types';
import { useAppContext } from '../../context/AppContext';

interface BrandFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (brand: Brand | Omit<Brand, 'id'>) => void;
  brand: Brand | null;
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

const BrandFormModal: React.FC<BrandFormModalProps> = ({ isOpen, onClose, onSave, brand }) => {
  const { categories } = useAppContext();
  const [formData, setFormData] = useState({ 
      name: '', 
      logo: '',
      category_ids: [] as string[]
  });
  
  const formInputClasses = "mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-black font-semibold placeholder-gray-400 px-3 py-2 transition-colors hover:bg-gray-100";

  useEffect(() => {
    if (brand) {
      setFormData({ name: brand.name, logo: brand.logo, category_ids: brand.category_ids || [] });
    } else {
      setFormData({ name: '', logo: '', category_ids: [] });
    }
  }, [brand, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64Image = await fileToBase64(e.target.files[0]);
        setFormData(prev => ({ ...prev, logo: base64Image }));
      } catch (error) {
        console.error("Lỗi khi chuyển đổi ảnh:", error);
        alert("Không thể tải ảnh lên, vui lòng thử lại.");
      }
    }
  };
  
  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, logo: '' }));
  };

  const handleCategorySelection = (categoryId: string) => {
    setFormData(prev => {
        const newCategoryIds = prev.category_ids.includes(categoryId)
            ? prev.category_ids.filter(id => id !== categoryId)
            : [...prev.category_ids, categoryId];
        return { ...prev, category_ids: newCategoryIds };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (brand) {
      onSave({ ...formData, id: brand.id });
    } else {
      onSave(formData);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">{brand ? 'Chỉnh sửa thương hiệu' : 'Thêm thương hiệu mới'}</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tên thương hiệu</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className={formInputClasses}/>
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700">Logo thương hiệu</label>
                <input type="file" id="logo-upload" accept="image/*" onChange={handleImageChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                {formData.logo && (
                    <div className="mt-4 relative w-fit group">
                        <p className="text-sm font-medium text-gray-700 mb-2">Xem trước:</p>
                        <img src={formData.logo} alt="Xem trước logo" className="h-16 w-auto object-contain bg-gray-100 p-2 rounded-md shadow-md"/>
                        <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Xóa logo"
                        >
                            &times;
                        </button>
                    </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Thuộc danh mục</label>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border p-3 rounded-md bg-gray-50">
                    {categories.map(cat => (
                        <div key={cat.id} className="flex items-center">
                            <input
                                type="checkbox"
                                id={`cat-${cat.id}`}
                                checked={formData.category_ids.includes(cat.id)}
                                onChange={() => handleCategorySelection(cat.id)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor={`cat-${cat.id}`} className="ml-2 text-sm text-gray-700 cursor-pointer">{cat.name}</label>
                        </div>
                    ))}
                </div>
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

export default BrandFormModal;