import React, { useEffect, useState } from 'react';

interface WelcomeToastProps {
  message: string;
  onClose: () => void;
}

const WelcomeToast: React.FC<WelcomeToastProps> = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Effect để tự động đóng sau 5 giây
  useEffect(() => {
    const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Đợi animation kết thúc rồi mới gọi onClose
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  // Effect để kích hoạt animation khi component mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div 
        className={`fixed top-5 right-5 z-[100] w-full max-w-sm p-4 rounded-lg shadow-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white transition-all duration-300 ease-in-out transform
            ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
        role="alert"
    >
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div className="ml-4 flex-1">
          <p className="font-bold text-lg">Đăng nhập thành công!</p>
          <p className="text-sm">{message}</p>
        </div>
        <button 
            onClick={handleClose} 
            className="ml-4 p-1 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Đóng"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
        </button>
      </div>
    </div>
  );
};

export default WelcomeToast;