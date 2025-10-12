import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import ProductCard from '../../components/ProductCard';

const HomePage: React.FC = () => {
    const { products, categories, storeSettings } = useAppContext();
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = storeSettings.slides || [];

    // Tự động chuyển slide mỗi 5 giây
    useEffect(() => {
        if (slides.length === 0) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);
    
    // Lọc sản phẩm nổi bật và bán chạy
    const featuredProducts = products.filter(p => p.isFeatured).slice(0, 4);
    const bestSellerProducts = products.filter(p => p.isBestSeller).slice(0, 4);

    return (
        <div>
            {/* Hero Section - Carousel */}
            <section className="relative h-[400px] md:h-[600px] w-full overflow-hidden">
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                            <div className="text-center text-white p-4">
                                <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 animate-fade-in-down">{slide.title}</h1>
                                <p className="text-md sm:text-lg md:text-2xl mb-8 animate-fade-in-up">{slide.subtitle}</p>
                                <Link to={slide.link} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105 duration-300 shadow-lg">
                                    Mua ngay
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            {/* Featured Categories */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-blue-800 mb-8">Danh mục nổi bật</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {categories.map(category => (
                            <Link key={category.id} to={`/shop/${category.id}`} className="relative rounded-lg overflow-hidden group shadow-lg hover:shadow-2xl transition-shadow duration-300">
                                <img src={category.image} alt={category.name} className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 group-hover:bg-opacity-60">
                                    <h3 className="text-2xl font-bold text-white tracking-wider">{category.name}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* Featured Products */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-blue-800 mb-8">Sản phẩm nổi bật</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {featuredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

             {/* Flash Sale Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-blue-800 mb-2">Flash Sale</h2>
                    <p className="text-center text-gray-600 mb-8">Đừng bỏ lỡ các ưu đãi chớp nhoáng!</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {bestSellerProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;