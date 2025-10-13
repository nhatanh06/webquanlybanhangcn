import React from 'react';
import { Link } from 'react-router-dom';

const ContactPage: React.FC = () => {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.');
    // Xóa form sau khi submit
    (e.target as HTMLFormElement).reset();
  };
  
  const formInputClasses = "block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-black font-semibold placeholder-gray-400 px-3 py-2";

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-16">
      <nav className="text-sm mb-4">
        <Link to="/" className="text-gray-500 hover:text-gray-700">Trang chủ</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">Liên hệ</span>
      </nav>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-blue-800">Liên hệ với chúng tôi</h1>
        <p className="mt-2 text-lg text-gray-600">Chúng tôi luôn sẵn sàng lắng nghe bạn. Hãy gửi tin nhắn cho chúng tôi!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-8 rounded-xl shadow-lg">
        {/* Contact Info */}
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Thông tin liên hệ</h2>
            <div className="space-y-4 text-gray-700">
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <div>
                  <h3 className="font-semibold text-gray-900">Địa chỉ</h3>
                  <p>Ấp Cầu Xéo, Xã Long Thành, Đồng Nai</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <div>
                  <h3 className="font-semibold text-gray-900">Email</h3>
                  <p>support@akstore.com</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <div>
                  <h3 className="font-semibold text-gray-900">Điện thoại</h3>
                  <p>(081) 3121 270</p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Giờ làm việc</h2>
            <p className="text-gray-700">Thứ Hai - Thứ Bảy: 9:00 - 21:00</p>
            <p className="text-gray-700">Chủ Nhật: 10:00 - 18:00</p>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
              <input type="text" id="name" required className={formInputClasses} />
            </div>
             <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" id="email" required className={formInputClasses} />
            </div>
             <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input type="tel" id="phone" required className={formInputClasses} />
            </div>
             <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Chủ đề</label>
              <input type="text" id="subject" required className={formInputClasses} />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
              <textarea id="message" rows={5} required className={formInputClasses}></textarea>
            </div>
            <div>
              <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow hover:shadow-lg transform hover:-translate-y-0.5">
                Gửi tin nhắn
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;