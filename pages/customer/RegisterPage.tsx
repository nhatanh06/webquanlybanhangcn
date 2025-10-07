import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const RegisterPage: React.FC = () => {
  const { registerUser, isSubmitting } = useAppContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
  });
  const [error, setError] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    const result = await registerUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        address: formData.address,
    });

    if (result.success) {
      navigate('/account');
    } else {
      setError(result.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Tạo tài khoản mới
          </h2>
           <p className="mt-2 text-gray-600">
                Bắt đầu hành trình mua sắm của bạn ngay hôm nay!
            </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl">
            <form className="space-y-5" onSubmit={handleRegister}>
            {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
            
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Họ và tên</label>
                <input id="name" name="name" type="text" required className="mt-1 appearance-none block w-full px-3 py-2 bg-gray-50 text-black font-semibold border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Nguyễn Văn A" value={formData.name} onChange={handleChange} />
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Địa chỉ email</label>
                <input id="email" name="email" type="email" autoComplete="email" required className="mt-1 appearance-none block w-full px-3 py-2 bg-gray-50 text-black font-semibold border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="you@example.com" value={formData.email} onChange={handleChange} />
            </div>

            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                <input id="phone" name="phone" type="tel" required className="mt-1 appearance-none block w-full px-3 py-2 bg-gray-50 text-black font-semibold border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="09xxxxxxxx" value={formData.phone} onChange={handleChange} />
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                <input id="password" name="password" type="password" required className="mt-1 appearance-none block w-full px-3 py-2 bg-gray-50 text-black font-semibold border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="••••••••" value={formData.password} onChange={handleChange} />
            </div>

            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
                <input id="confirmPassword" name="confirmPassword" type="password" required className="mt-1 appearance-none block w-full px-3 py-2 bg-gray-50 text-black font-semibold border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange}/>
            </div>

            <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Địa chỉ giao hàng <span className="text-gray-500">(Không bắt buộc)</span></label>
                <input id="address" name="address" type="text" className="mt-1 appearance-none block w-full px-3 py-2 bg-gray-50 text-black font-semibold border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="123 Đường ABC, Quận 1, TP.HCM" value={formData.address} onChange={handleChange}/>
            </div>

            <div>
                <button type="submit" disabled={isSubmitting} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:bg-gray-400">
                {isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
                </button>
            </div>
            </form>
            <p className="mt-6 text-center text-sm text-gray-600">
                Đã có tài khoản?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                    Đăng nhập ngay
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;