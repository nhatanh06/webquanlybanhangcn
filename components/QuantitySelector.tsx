import React from 'react';

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (newQuantity: number) => void;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({ quantity, onQuantityChange }) => {
  const handleDecrement = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrement = () => {
    onQuantityChange(quantity + 1);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value);
      if (!isNaN(value) && value > 0) {
          onQuantityChange(value);
      } else if (e.target.value === '') {
          onQuantityChange(1); // Mặc định là 1 nếu người dùng xóa số
      }
  };

  return (
    <div className="flex items-center border border-gray-200 rounded-lg bg-white shadow-sm" style={{ maxWidth: '120px' }}>
      <button
        type="button"
        onClick={handleDecrement}
        className="px-3 py-1 text-xl font-semibold text-blue-600 hover:bg-blue-50 rounded-l-lg focus:outline-none transition-colors"
        aria-label="Giảm số lượng"
      >
        -
      </button>
      <input
        type="number"
        value={quantity}
        onChange={handleInputChange}
        className="w-full border-l border-r text-center font-bold text-black focus:outline-none appearance-none bg-transparent"
        style={{ MozAppearance: 'textfield' }} // Ẩn mũi tên trong Firefox
      />
      <button
        type="button"
        onClick={handleIncrement}
        className="px-3 py-1 text-xl font-semibold text-blue-600 hover:bg-blue-50 rounded-r-lg focus:outline-none transition-colors"
        aria-label="Tăng số lượng"
      >
        +
      </button>
      <style>{`
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
      `}</style>
    </div>
  );
};

export default QuantitySelector;