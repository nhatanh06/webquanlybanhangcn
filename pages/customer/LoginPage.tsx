import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { ICONS } from '../../constants';
import Logo from '../../components/Logo';

const LoginPage: React.FC = () => {
  const { login, isSubmitting, storeSettings } = useAppContext();
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
  
  const handleSocialLogin = (provider: string) => {
    alert(`Chức năng đăng nhập bằng ${provider} đang được phát triển!`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
         <div className="text-center">
            <Link to="/" className="inline-block mb-6">
              {storeSettings.logo ? (
                <img src={storeSettings.logo} alt="AkStore Logo" className="h-12 w-auto mx-auto" />
              ) : (
                <Logo className="h-12" textClassName="text-gray-800" />
              )}
            </Link>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Chào mừng trở lại!
            </h2>
            <p className="mt-2 text-gray-600">
                Đăng nhập để tiếp tục mua sắm
            </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl">
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
            
            <div className="relative flex py-5 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-sm text-gray-400">Hoặc đăng nhập với</span>
                <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button onClick={() => handleSocialLogin('Google')} className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    <span className="mr-2">{ICONS.google}</span>
                    Đăng nhập với Google
                </button>
                 <button onClick={() => handleSocialLogin('Facebook')} className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm bg-[#1877F2] text-sm font-medium text-white hover:bg-[#166eeb] transition-colors">
                    <span className="mr-2">{ICONS.facebook}</span>
                    Đăng nhập với Facebook
                </button>
            </div>


             <p className="mt-8 text-center text-sm text-gray-600">
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