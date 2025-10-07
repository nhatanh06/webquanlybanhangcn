import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Slide, StoreSettings } from '../../types';
import SlideFormModal from '../../components/admin/SlideFormModal';

// Helper function to convert file to Base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const AdminAppearancePage: React.FC = () => {
    const { storeSettings, updateStoreSettings } = useAppContext();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSlide, setEditingSlide] = useState<Slide | null>(null);

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const base64 = await fileToBase64(e.target.files[0]);
                await updateStoreSettings({ ...storeSettings, logo: base64 });
                alert("Đã cập nhật logo!");
            } catch (error) {
                alert("Lỗi khi tải logo. Vui lòng thử lại.");
            }
        }
    };

    const handleDeleteLogo = async () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa logo hiện tại không? Logo sẽ được thay thế bằng tên cửa hàng.')) {
            await updateStoreSettings({ ...storeSettings, logo: '' });
            alert("Đã xóa logo!");
        }
    };
    
    const handleOpenModal = (slide: Slide | null = null) => {
        setEditingSlide(slide);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSlide(null);
    };
    
    const handleSaveSlide = (slideData: Slide | Omit<Slide, 'id'>) => {
        let newSlides: Slide[];
        if ('id' in slideData) { // Editing
            newSlides = storeSettings.slides.map(s => s.id === slideData.id ? slideData : s);
        } else { // Adding
            const newSlide = { ...slideData, id: `slide-${Date.now()}`};
            newSlides = [...storeSettings.slides, newSlide];
        }
        updateStoreSettings({ ...storeSettings, slides: newSlides });
        handleCloseModal();
    };

    const handleDeleteSlide = (slideId: string) => {
        if (window.confirm('Bạn có chắc muốn xóa slide quảng cáo này?')) {
            const newSlides = storeSettings.slides.filter(s => s.id !== slideId);
            updateStoreSettings({ ...storeSettings, slides: newSlides });
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Quản lý Giao diện cửa hàng</h1>
            </div>

            {/* Logo Management */}
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                <h2 className="text-xl font-bold mb-4 text-blue-700">Logo cửa hàng</h2>
                <div className="flex items-center space-x-6">
                    <div>
                        <p className="font-medium text-gray-600 mb-2">Logo hiện tại:</p>
                        {storeSettings.logo ? (
                            <img src={storeSettings.logo} alt="Logo" className="h-16 w-auto bg-gray-100 p-2 rounded" />
                        ) : (
                             <div className="h-16 flex items-center justify-center text-gray-500">(Hiển thị tên cửa hàng)</div>
                        )}
                    </div>
                </div>
                <div className="mt-4 flex items-center space-x-3">
                     <label htmlFor="logo-upload" className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors inline-block">
                        Chọn logo mới
                    </label>
                    <input type="file" id="logo-upload" accept="image/*" className="hidden" onChange={handleLogoChange}/>
                    {storeSettings.logo && (
                        <button onClick={handleDeleteLogo} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors shadow hover:shadow-lg">
                            Xóa Logo
                        </button>
                    )}
                </div>
            </div>
            
            {/* Carousel Slides Management */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-blue-700">Quảng cáo trang chủ (Carousel)</h2>
                    <button onClick={() => handleOpenModal(null)} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow hover:shadow-lg">
                        Thêm Slide mới
                    </button>
                </div>
                <div className="space-y-4">
                    {storeSettings.slides.map(slide => (
                        <div key={slide.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                             <img src={slide.image} alt={slide.title} className="w-32 h-16 object-cover rounded-md mr-4"/>
                             <div className="flex-grow">
                                 <h3 className="font-semibold text-gray-800">{slide.title}</h3>
                                 <p className="text-sm text-gray-500">{slide.subtitle}</p>
                             </div>
                             <div className="space-x-2">
                                 <button onClick={() => handleOpenModal(slide)} className="text-blue-600 hover:text-blue-800 font-medium">Sửa</button>
                                 <button onClick={() => handleDeleteSlide(slide.id)} className="text-red-600 hover:text-red-800 font-medium">Xóa</button>
                             </div>
                        </div>
                    ))}
                </div>
            </div>

            {isModalOpen && (
                <SlideFormModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveSlide}
                    slide={editingSlide}
                />
            )}

        </div>
    );
};

export default AdminAppearancePage;
