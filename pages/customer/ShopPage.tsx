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
    onClose?: () => void;
}> = ({ filters, setFilters, products, isCategoryPage, availableBrands, categories, onClose }) => {
    
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
        <aside className="w-full lg:w-72 lg:flex-shrink-0">
             <div className="flex justify-between items-center lg:hidden p-4 border-b">
                 <h3 className="text-xl font-bold text-gray-900">Lọc sản phẩm</h3>
                 <button onClick={onClose} className="text-2xl font-bold">&times;</button>
            </div>
            <div className="p-4">
            {!isCategoryPage && (
                <div className="mb-6">
                    <h4 className="font-semibold mb-2 text-gray-800">Danh mục</h4>
                    {categories.map(category => (
                        <div key={category.id} className="flex items-center mb-1">
                            <input type="radio" id={`mobile-${category.id}`} name="category" value={category.name} checked={filters.category === category.name} onChange={handleCategoryChange} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                            <label htmlFor={`mobile-${category.id}`} className="ml-2 text-gray-700">{category.name}</label>
                        </div>
                    ))}
                </div>
            )}
            
            <div className="mb-6">
                <h4 className="font-semibold mb-2 text-gray-800">Thương hiệu</h4>
                {availableBrands.map(brand => (
                    <div key={brand.id} className="flex items-center mb-1">
                        <input type="checkbox" id={`mobile-${brand.id}`} value={brand.name} checked={filters.brands.includes(brand.name)} onChange={handleBrandChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <label htmlFor={`mobile-${brand.id}`} className="ml-2 flex items-center text-gray-700 cursor-pointer">
                             <img src={brand.logo} alt={brand.name} className="w-12 h-8 object-contain mr-2" /> {brand.name}
                        </label>
                    </div>
                ))}
            </div>

            <div className="mb-6">
                <h4 className="font-semibold mb-2 text-gray-800">Giá</h4>
                {PRICE_RANGES.map(range => (
                    <div key={range.id} className="flex items-center mb-1">
                        <input type="radio" id={`mobile-${range.id}`} name="priceRange" value={range.id} checked={filters.priceRange === range.id} onChange={handlePriceChange} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                        <label htmlFor={`mobile-${range.id}`} className="ml-2 text-gray-700">{range.label}</label>
                    </div>
                ))}
            </div>

            <button onClick={resetFilters} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg transition-colors">Xóa bộ lọc</button>
            </div>
        </aside>
    );
}

const ShopPage: React.FC = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const { products, categories, brands } = useAppContext();
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    
    const currentCategory = useMemo(() => categories.find(c => c.id === categoryId), [categoryId, categories]);
    const isCategoryPage = !!currentCategory;

    const [filters, setFilters] = useState({
        category: currentCategory ? currentCategory.name : '',
        brands: [] as string[],
        sort: 'newest',
        priceRange: 'all',
    });

    useEffect(() => {
        setFilters({ category: currentCategory ? currentCategory.name : '', brands: [], sort: 'newest', priceRange: 'all' });
    }, [categoryId, currentCategory]);

    const filteredAndSortedProducts = useMemo(() => {
        let result = [...products];
        if (filters.category) result = result.filter(p => p.category === filters.category);
        if (filters.brands.length > 0) result = result.filter(p => filters.brands.includes(p.brand));
        if (filters.priceRange !== 'all') {
            const selectedRange = PRICE_RANGES.find(r => r.id === filters.priceRange);
            if (selectedRange) result = result.filter(p => p.price >= selectedRange.min && p.price <= selectedRange.max);
        }
        switch (filters.sort) {
            case 'price-asc': result.sort((a, b) => a.price - b.price); break;
            case 'price-desc': result.sort((a, b) => b.price - a.price); break;
            case 'best-selling': result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0)); break;
            default: break;
        }
        return result;
    }, [products, filters]);

    const availableBrands = useMemo<Brand[]>(() => {
        // Nếu không có danh mục nào được chọn trong bộ lọc, hiển thị tất cả các thương hiệu có sản phẩm
        if (!filters.category) {
            const allBrandNamesWithProducts = [...new Set(products.map(p => p.brand))];
            return brands
                .filter(b => allBrandNamesWithProducts.includes(b.name))
                .sort((a, b) => a.name.localeCompare(b.name));
        }
    
        // Tìm ID của danh mục đã chọn
        const selectedCategory = categories.find(c => c.name === filters.category);
        if (!selectedCategory) {
            return [];
        }
    
        // Lọc các thương hiệu có chứa ID của danh mục đã chọn trong mảng category_ids
        return brands
            .filter(brand => brand.category_ids && brand.category_ids.includes(selectedCategory.id))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [filters.category, categories, brands, products]);


    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8">
            <nav className="text-sm mb-4">
                <Link to="/" className="text-gray-500 hover:text-gray-700">Trang chủ</Link><span className="mx-2">/</span>
                {isCategoryPage && currentCategory ? (<><Link to="/shop" className="text-gray-500 hover:text-gray-700">Cửa hàng</Link><span className="mx-2">/</span><span className="text-gray-800">{currentCategory.name}</span></>) : (<span className="text-gray-800">Cửa hàng</span>)}
            </nav>

            <div className="flex flex-col lg:flex-row lg:space-x-8">
                {/* Mobile Filter Button */}
                 <div className="flex justify-between items-center mb-4 lg:hidden">
                    <button onClick={() => setIsFilterOpen(true)} className="flex items-center space-x-2 bg-white border border-gray-300 rounded-md px-4 py-2 text-gray-700 hover:bg-gray-50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM3 16a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" /></svg>
                        <span>Lọc</span>
                    </button>
                    <p className="text-gray-600 text-sm">{filteredAndSortedProducts.length} sản phẩm</p>
                 </div>

                {/* Mobile Filter Off-canvas */}
                {isFilterOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden" onClick={() => setIsFilterOpen(false)}>
                        <div className="fixed top-0 left-0 h-full w-full max-w-xs bg-white shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            <Sidebar filters={filters} setFilters={setFilters} products={products} isCategoryPage={isCategoryPage} availableBrands={availableBrands} categories={categories} onClose={() => setIsFilterOpen(false)} />
                        </div>
                    </div>
                )}

                {/* Desktop Sidebar */}
                <div className="hidden lg:block lg:w-1/4">
                    <Sidebar filters={filters} setFilters={setFilters} products={products} isCategoryPage={isCategoryPage} availableBrands={availableBrands} categories={categories} />
                </div>
                
                <main className="w-full lg:w-3/4">
                    <div className="hidden lg:flex justify-between items-center mb-6">
                        <p className="text-gray-600">Hiển thị {filteredAndSortedProducts.length} sản phẩm</p>
                        <select value={filters.sort} onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))} className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="newest">Mới nhất</option>
                            <option value="best-selling">Bán chạy</option>
                            <option value="price-asc">Giá: Tăng dần</option>
                            <option value="price-desc">Giá: Giảm dần</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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