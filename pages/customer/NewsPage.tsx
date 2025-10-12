import React from 'react';
import { Link } from 'react-router-dom';

const mockNewsArticles: any[] = [];

const NewsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-16">
      <nav className="text-sm mb-4">
        <Link to="/" className="text-gray-500 hover:text-gray-700">Trang chủ</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">Tin tức</span>
      </nav>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-blue-800">Tin tức & Sự kiện</h1>
        <p className="mt-2 text-lg text-gray-600">Cập nhật những thông tin mới nhất từ thế giới công nghệ cùng AkStore.</p>
      </div>

      {mockNewsArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockNewsArticles.map((article: any) => (
            <div key={article.id} className="bg-white rounded-lg shadow-md hover:shadow-xl overflow-hidden group transform hover:-translate-y-2 transition-all duration-300 ease-in-out flex flex-col">
              <Link to="#" className="block flex flex-col flex-grow">
                <div className="relative">
                  <img src={article.image} alt={article.title} className="w-full h-56 object-cover" />
                  <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">{article.category}</span>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <p className="text-sm text-gray-500 mb-2">{article.date}</p>
                  <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors mb-3 flex-grow">{article.title}</h2>
                  <p className="text-gray-600 mb-4 text-sm">{article.excerpt}</p>
                  <span className="font-semibold text-blue-600 hover:text-blue-700 mt-auto">
                    Đọc thêm &rarr;
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="mt-2 text-2xl font-bold text-gray-800">Chưa có tin tức nào</h2>
            <p className="mt-1 text-gray-600">Vui lòng quay lại sau để cập nhật những bài viết mới nhất.</p>
        </div>
      )}
    </div>
  );
};

export default NewsPage;