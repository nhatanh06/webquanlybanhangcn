import React, { useState, useEffect, useCallback } from 'react';
import { Product, ProductSpecs } from '../../types';
import { useAppContext } from '../../context/AppContext';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product | Omit<Product, 'id' | 'rating' | 'reviewCount' | 'reviews'>) => void;
  product: Product | null;
}

// Helper types for dynamic form fields
type SpecField = { key: string; value: string };
type OptionField = { key: string; values: string }; // values are comma-separated for UI

// Helper function to convert files to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const ProductFormModal: React.FC<ProductFormModalProps> = ({ isOpen, onClose, onSave, product }) => {
  const { categories, brands } = useAppContext();
  
  // Generates the initial state for the form
  const getInitialState = useCallback(() => ({
    name: '',
    brand: brands[0]?.name || '',
    category: categories[0]?.name || '',
    price: 0,
    originalPrice: 0,
    description: '',
    shortDescription: '',
    specs: [] as SpecField[],
    options: [] as OptionField[],
    isFeatured: false,
    isBestSeller: false,
  }), [categories, brands]);

  const [formData, setFormData] = useState(getInitialState());
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const formInputClasses = "mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-black font-semibold placeholder-gray-400 px-3 py-2 transition-colors hover:bg-gray-100";

  // Effect to populate the form when editing a product or opening it for creation
  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData({
          name: product.name,
          brand: product.brand,
          category: product.category,
          price: product.price,
          originalPrice: product.originalPrice || 0,
          description: product.description,
          shortDescription: product.shortDescription,
          specs: Object.entries(product.specs).map(([key, value]) => ({ key, value })),
          options: Object.entries(product.options).map(([key, value]) => ({ key, values: value.join(', ') })),
          isFeatured: product.isFeatured || false,
          isBestSeller: product.isBestSeller || false,
        });
        setImagePreviews(product.images);
      } else {
        setFormData(getInitialState());
        setImagePreviews([]);
      }
    }
  }, [product, isOpen, getInitialState]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // --- Specs Handlers ---
  const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...formData.specs];
    newSpecs[index][field] = value;
    setFormData(prev => ({ ...prev, specs: newSpecs }));
  };

  const handleAddSpec = () => {
    setFormData(prev => ({ ...prev, specs: [...prev.specs, { key: '', value: '' }] }));
  };

  const handleRemoveSpec = (index: number) => {
    setFormData(prev => ({ ...prev, specs: prev.specs.filter((_, i) => i !== index) }));
  };
  
  // --- Options Handlers ---
  const handleOptionChange = (index: number, field: 'key' | 'values', value: string) => {
    const newOptions = [...formData.options];
    newOptions[index][field] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const handleAddOption = () => {
    setFormData(prev => ({ ...prev, options: [...prev.options, { key: '', values: '' }] }));
  };

  const handleRemoveOption = (index: number) => {
    setFormData(prev => ({ ...prev, options: prev.options.filter((_, i) => i !== index) }));
  };


  // --- Image Handlers ---
  const handleImageUpload = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const uploadedImages: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const base64 = await fileToBase64(file);
        uploadedImages.push(base64);
      } catch (error) {
        console.error("Lỗi chuyển đổi tệp sang Base64:", error);
        alert("Có lỗi xảy ra khi tải ảnh lên. Vui lòng thử lại.");
      }
    }
    setImagePreviews(prev => [...prev, ...uploadedImages]);
  }, []);

  const handleRemoveImage = (indexToRemove: number) => {
    setImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };
  
  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, isEntering: boolean) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(isEntering);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      handleDragEvents(e, false);
      handleImageUpload(e.dataTransfer.files);
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert specs and options arrays back to objects
    const specsObject = formData.specs.reduce((acc, spec) => {
        if (spec.key.trim()) acc[spec.key.trim()] = spec.value.trim();
        return acc;
    }, {} as ProductSpecs);

    const optionsObject = formData.options.reduce((acc, option) => {
        if (option.key.trim()) {
            acc[option.key.trim()] = option.values.split(',').map(v => v.trim()).filter(Boolean);
        }
        return acc;
    }, {} as { [key: string]: string[] });

    const processedData = {
        ...formData,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice) || undefined,
        images: imagePreviews.length > 0 ? imagePreviews : ['https://images.unsplash.com/photo-1575517111478-7f6afd0973db?w=400&h=300&fit=crop'],
        specs: specsObject,
        options: optionsObject,
    };
    
    if (product) {
        onSave({ ...processedData, id: product.id, rating: product.rating, reviewCount: product.reviewCount, reviews: product.reviews });
    } else {
        onSave(processedData);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white z-10">
            <h2 className="text-2xl font-bold text-gray-800">{product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Tên, Giá */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên sản phẩm</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className={formInputClasses}/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Giá (VNĐ)</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} required className={formInputClasses}/>
              </div>
            </div>
            {/* Danh mục, Thương hiệu */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-medium text-gray-700">Danh mục</label>
                <select name="category" value={formData.category} onChange={handleChange} className={formInputClasses}>
                    {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                </select>
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700">Thương hiệu</label>
                 <select name="brand" value={formData.brand} onChange={handleChange} className={formInputClasses}>
                    {brands.map(brand => <option key={brand.id} value={brand.name}>{brand.name}</option>)}
                </select>
              </div>
            </div>
            {/* Mô tả ngắn */}
             <div>
                <label className="block text-sm font-medium text-gray-700">Mô tả ngắn</label>
                <textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} rows={2} className={formInputClasses}></textarea>
            </div>
            {/* Mô tả đầy đủ */}
             <div>
                <label className="block text-sm font-medium text-gray-700">Mô tả đầy đủ</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className={formInputClasses}></textarea>
            </div>
            
            {/* Tải ảnh */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Ảnh sản phẩm</label>
                <div 
                    className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : ''}`}
                    onDragOver={(e) => handleDragEvents(e, true)}
                    onDragLeave={(e) => handleDragEvents(e, false)}
                    onDrop={handleDrop}
                >
                    <div className="space-y-1 text-center">
                         <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                <span>Tải ảnh lên</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/png, image/jpeg, image/gif" onChange={(e) => handleImageUpload(e.target.files)} />
                            </label>
                            <p className="pl-1">hoặc kéo và thả</p>
                        </div>
                        <p className="text-xs text-gray-500">Hỗ trợ PNG, JPG, GIF</p>
                    </div>
                </div>
                {imagePreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                        {imagePreviews.map((src, index) => (
                            <div key={index} className="relative group">
                                <img src={src} alt={`Preview ${index + 1}`} className="h-24 w-24 object-cover rounded-md shadow-md" />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(index)}
                                    className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label="Xóa ảnh"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Thông số kỹ thuật - UI MỚI */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Thông số kỹ thuật</label>
              <div className="space-y-2 mt-1">
                {formData.specs.map((spec, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Tên thông số (VD: Màn hình)"
                      value={spec.key}
                      onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                      className={formInputClasses}
                    />
                     <div className="flex items-center gap-2">
                        <input
                        type="text"
                        placeholder="Giá trị (VD: 6.1 inch, Super Retina)"
                        value={spec.value}
                        onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                        className={formInputClasses + ' flex-grow'}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSpec(index)}
                          className="text-red-500 hover:text-red-700 font-bold text-xl h-10 w-10 flex-shrink-0"
                          aria-label="Xóa thông số"
                        >
                          &times;
                        </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddSpec}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-semibold p-1"
              >
                + Thêm thông số
              </button>
            </div>

            {/* Tùy chọn - UI MỚI */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Tùy chọn sản phẩm</label>
                <div className="space-y-2 mt-1">
                    {formData.options.map((option, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                        <input
                        type="text"
                        placeholder="Tên tùy chọn (VD: Màu sắc)"
                        value={option.key}
                        onChange={(e) => handleOptionChange(index, 'key', e.target.value)}
                        className={formInputClasses}
                        />
                        <div className="flex items-center gap-2">
                            <input
                            type="text"
                            placeholder="Các giá trị, cách nhau bởi dấu phẩy"
                            value={option.values}
                            onChange={(e) => handleOptionChange(index, 'values', e.target.value)}
                            className={formInputClasses + ' flex-grow'}
                            />
                            <button
                            type="button"
                            onClick={() => handleRemoveOption(index)}
                            className="text-red-500 hover:text-red-700 font-bold text-xl h-10 w-10 flex-shrink-0"
                             aria-label="Xóa tùy chọn"
                            >
                            &times;
                            </button>
                        </div>
                    </div>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={handleAddOption}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-semibold p-1"
                >
                    + Thêm tùy chọn
                </button>
            </div>
            
            {/* Checkbox */}
            <div className="flex items-center space-x-8">
                <label className="flex items-center">
                    <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded"/>
                    <span className="ml-2 text-gray-700">Sản phẩm nổi bật</span>
                </label>
                 <label className="flex items-center">
                    <input type="checkbox" name="isBestSeller" checked={formData.isBestSeller} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded"/>
                    <span className="ml-2 text-gray-700">Sản phẩm bán chạy</span>
                </label>
            </div>
          </div>
          <div className="p-6 bg-gray-50 flex justify-end space-x-3 sticky bottom-0 z-10 border-t">
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

export default ProductFormModal;