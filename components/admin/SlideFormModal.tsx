import React, { useState, useEffect } from 'react';
import { Slide } from '../../types';

interface SlideFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (slide: Slide | Omit<Slide, 'id'>) => void;
  slide: Slide | null;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const SlideFormModal: React.FC<SlideFormModalProps> = ({ isOpen, onClose, onSave, slide }) => {
  const [formData, setFormData] = useState({
    image: '',
    title: '',
    subtitle: '',
    link: ''
  });

  const formInputClasses = "mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-black font-semibold placeholder-gray-400 px-3 py-2 transition-colors hover:bg-gray-100";

  useEffect(() => {
    if (slide) {
      setFormData(slide);
    } else {
      setFormData({ image: '', title: '', subtitle: '', link: '' });
    }
  }, [slide, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64Image = await fileToBase64(e.target.files[0]);
        setFormData(prev => ({ ...prev, image: base64Image }));
      } catch (error) {
        alert("Không thể tải ảnh lên, vui lòng thử lại.");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      alert("Vui lòng tải lên hình ảnh cho slide.");
      return;
    }
    if (slide) {
      onSave({ ...formData, id: slide.id });
    } else {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">{slide ? 'Chỉnh sửa Slide' : 'Thêm Slide mới'}</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Hình ảnh</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              {formData.image && <img src={formData.image} alt="Xem trước" className="mt-4 h-32 w-full object-cover rounded-md" />}
            </div>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Tiêu đề</label>
              <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required className={formInputClasses} />
            </div>
            <div>
              <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700">Phụ đề</label>
              <input type="text" id="subtitle" name="subtitle" value={formData.subtitle} onChange={handleChange} required className={formInputClasses} />
            </div>
            <div>
              <label htmlFor="link" className="block text-sm font-medium text-gray-700">Đường dẫn (VD: /product/iphone-15-pro)</label>
              <input type="text" id="link" name="link" value={formData.link} onChange={handleChange} required className={formInputClasses} />
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

export default SlideFormModal;