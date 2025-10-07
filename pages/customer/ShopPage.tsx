
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import { useAppContext } from '../../context/AppContext';
import { Product, Brand, Category } from '../../types';

// Các khoảng giá để lọc
const PRICE_RANGES = [
    { id: 'all', label: 'Tất cả', min: 0, max: Infinity },
    { id: 'under-10m', label: 'Dưới 10 triệu', min: 0, max: 9999999 },
    { id: '10m-20m', label: 'Từ 10 - 20 triệu', min: 10000000, max: 20000000 },
    { id: '20m-30m', label: 'Từ 20 - 30 triệu', min: 20000001, max: 30000000 },
    { id: 'over-30m', label: 'Trên 30 triệu', min: 30000001, max: Infinity },
];

// Component Sidebar để lọc sản phẩm
const Sidebar: React.FC<{ 
    filters: any; 
    setFilters: any; 
    products: Product[];
    isCategoryPage: boolean;
    availableBrands: Brand[];
    categories: Category[];
}> = ({ filters, setFilters, products, isCategoryPage, availableBrands, categories }) => {
    
    const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters((prev: any) => ({ ...prev, category: e.target.value, brands: [] }));
    };

    const handleBrandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setFilters((prev: any) => {
            const newBrands = checked
                ? [...prev.brands, value]
                : prev.brands.filter((b: string) => b !== value);
            return { ...prev, brands: newBrands };
        });
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters((prev: any) => ({ ...prev, priceRange: e.target.value }));
    };

    const resetFilters = () => {
         setFilters({
            category: isCategoryPage ? filters.category : '',
            brands: [],
            sort: 'newest',
            priceRange: 'all'
        });
    };

    return (
        <aside className="w-full lg:w-1/4 p-4">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Lọc sản phẩm</h3>
            {/* Lọc theo danh mục (chỉ hiển thị ở trang /shop) */}
            {!isCategoryPage && (
                <div className="mb-6">
                    <h4 className="font-semibold mb-2 text-gray-800">Danh mục</h4>
                    {categories.map(category => (
                        <div key={category.id} className="flex items-center mb-1">
                            <input type="radio" id={category.id} name="category" value={category.name} checked={filters.category === category.name} onChange={handleCategoryChange} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                            <label htmlFor={category.id} className="ml-2 text-gray-700">{category.name}</label>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Lọc theo thương hiệu */}
            <div className="mb-6">
                <h4 className="font-semibold mb-2 text-gray-800">Thương hiệu</h4>
                {availableBrands.map(brand => (
                    <div key={brand.id} className="flex items-center mb-1">
                        <input type="checkbox" id={brand.id} value={brand.name} checked={filters.brands.includes(brand.name)} onChange={handleBrandChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <label htmlFor={brand.id} className="ml-2 text-gray-700">{brand.name}</label>
                    </div>
                ))}
            </div>

            {/* Lọc theo giá */}
            <div className="mb-6">
                <h4 className="font-semibold mb-2 text-gray-800">Giá</h4>
                {PRICE_RANGES.map(range => (
                    <div key={range.id} className="flex items-center mb-1">
                        <input type="radio" id={range.id} name="priceRange" value={range.id} checked={filters.priceRange === range.id} onChange={handlePriceChange} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                        <label htmlFor={range.id} className="ml-2 text-gray-700">{range.label}</label>
                    </div>
                ))}
            </div>

            <button onClick={resetFilters} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg transition-colors">
                Xóa bộ lọc
            </button>
        </aside>
    );
}

const ShopPage: React.FC = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const { products, categories, brands } = useAppContext();
    
    const currentCategory = useMemo(() => categories.find(c => c.id === categoryId), [categoryId, categories]);
    const isCategoryPage = !!currentCategory;

    const [filters, setFilters] = useState({
        category: currentCategory ? currentCategory.name : '',
        brands: [] as string[],
        sort: 'newest',
        priceRange: 'all',
    });

    // Reset bộ lọc khi categoryId thay đổi
    useEffect(() => {
        setFilters({
            category: currentCategory ? currentCategory.name : '',
            brands: [],
            sort: 'newest',
            priceRange: 'all',
        });
    }, [categoryId, currentCategory]);

    // Lọc và sắp xếp sản phẩm
    const filteredAndSortedProducts = useMemo(() => {
        let result = [...products];

        // Lọc theo danh mục (từ URL hoặc từ bộ lọc)
        if (filters.category) {
            result = result.filter(p => p.category === filters.category);
        }

        // Lọc theo thương hiệu
        if (filters.brands.length > 0) {
            result = result.filter(p => filters.brands.includes(p.brand));
        }

        // Lọc theo giá
        if (filters.priceRange !== 'all') {
            const selectedRange = PRICE_RANGES.find(r => r.id === filters.priceRange);
            if (selectedRange) {
                result = result.filter(p => p.price >= selectedRange.min && p.price <= selectedRange.max);
            }
        }

        // Sắp xếp
        switch (filters.sort) {
            case 'price-asc': result.sort((a, b) => a.price - b.price); break;
            case 'price-desc': result.sort((a, b) => b.price - a.price); break;
            case 'best-selling': result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0)); break;
            default: break;
        }

        return result;
    }, [products, filters]);

     // Tính toán các thương hiệu có sẵn dựa trên danh mục đã chọn
    const availableBrands = useMemo<Brand[]>(() => {
        let relevantProducts = products;
        if (filters.category) {
            relevantProducts = products.filter(p => p.category === filters.category);
        }
        const brandNames = [...new Set(relevantProducts.map(p => p.brand))];
        return brands.filter(brand => brandNames.includes(brand.name));
    }, [filters.category, products, brands]);


    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8">
            <nav className="text-sm mb-4">
                <Link to="/" className="text-gray-500 hover:text-gray-700">Trang chủ</Link>
                <span className="mx-2">/</span>
                {isCategoryPage && currentCategory ? (
                    <>
                        <Link to="/shop" className="text-gray-500 hover:text-gray-700">Cửa hàng</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-800">{currentCategory.name}</span>
                    </>
                ) : (
                    <span className="text-gray-800">Cửa hàng</span>
                )}
            </nav>

            <div className="flex flex-col lg:flex-row">
                <Sidebar 
                    filters={filters} 
                    setFilters={setFilters} 
                    products={products}
                    isCategoryPage={isCategoryPage}
                    availableBrands={availableBrands}
                    categories={categories}
                />
                
                <main className="w-full lg:w-3/4 p-4">
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-gray-600">Hiển thị {filteredAndSortedProducts.length} sản phẩm</p>
                        <select
                            value={filters.sort}
                            onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
                            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="newest">Mới nhất</option>
                            <option value="best-selling">Bán chạy</option>
                            <option value="price-asc">Giá: Tăng dần</option>
                            <option value="price-desc">Giá: Giảm dần</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                        {filteredAndSortedProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ShopPage;