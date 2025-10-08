import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const LoginPage: React.FC = () => {
  const { login, isSubmitting } = useAppContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = await login(email, password);

    if (success) {
      if (email === 'admin@example.com') {
        navigate('/admin');
      } else {
        navigate('/account');
      }
    } else {
      setError('Email hoặc mật khẩu không đúng!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
         <div className="text-center">
            <Link to="/" className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors">
                &larr; Quay về trang chủ
            </Link>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Chào mừng trở lại!
            </h2>
            <p className="mt-2 text-gray-600">
                Đăng nhập để tiếp tục mua sắm
            </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl">
             <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 mb-6 rounded-r-lg" role="alert">
              <p className="font-bold text-sm">Sử dụng tài khoản demo:</p>
              <ul className="list-disc list-inside text-sm mt-1">
                <li><b>Admin:</b> admin@example.com</li>
                <li><b>Khách hàng:</b> user@example.com</li>
                <li><b>Mật khẩu:</b> 1</li>
              </ul>
            </div>

            <form className="space-y-6" onSubmit={handleLogin}>
              {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
              
              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
                    Địa chỉ email
                </label>
                <div className="mt-1">
                    <input
                        id="email-address"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="appearance-none block w-full px-3 py-2 bg-gray-50 text-black font-semibold border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
              </div>

              <div>
                 <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Mật khẩu
                </label>
                <div className="mt-1">
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className="appearance-none block w-full px-3 py-2 bg-gray-50 text-black font-semibold border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                    Quên mật khẩu?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:bg-gray-400"
                >
                  {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
              </div>
            </form>
             <p className="mt-6 text-center text-sm text-gray-600">
                Chưa có tài khoản?{' '}
                <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                    Đăng ký ngay
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;