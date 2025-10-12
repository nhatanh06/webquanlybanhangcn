import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import StarRating from '../../components/StarRating';
import ProductCard from '../../components/ProductCard';
import QuantitySelector from '../../components/QuantitySelector';

const ReviewForm: React.FC<{ productId: string }> = ({ productId }) => {
    const { addReview, user, isSubmitting } = useAppContext();
    const [author, setAuthor] = useState(user?.name || '');
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!author.trim() || !comment.trim()) {
            setError("Vui lòng nhập tên và nội dung đánh giá.");
            return;
        }
        await addReview(productId, { author, rating, comment });
        setSubmitted(true);
    };

    if (submitted) {
        return <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Cảm ơn bạn!</strong>
            <span className="block sm:inline"> Đánh giá của bạn đã được gửi.</span>
        </div>
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h4 className="text-xl font-semibold text-gray-800">Viết đánh giá của bạn</h4>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700">Tên của bạn</label>
                <input type="text" id="author" value={author} onChange={e => setAuthor(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-black font-semibold"/>
            </div>
            <div>
                 <label className="block text-sm font-medium text-gray-700">Đánh giá</label>
                 <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button type="button" key={star} onClick={() => setRating(star)} className={`text-3xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
                    ))}
                 </div>
            </div>
            <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Nội dung</label>
                <textarea id="comment" rows={4} value={comment} onChange={e => setComment(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-black font-semibold"></textarea>
            </div>
            <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
                {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
        </form>
    );
};

const ProductDetailPage: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();
    const { products, addToCart } = useAppContext();
    const navigate = useNavigate();
    
    const product = products.find(p => p.id === productId);
    const [quantity, setQuantity] = useState(1);
    const [selectedOptions, setSelectedOptions] = useState(() => {
        if (!product) return {};
        const initialOptions: { [key: string]: string } = {};
        Object.keys(product.options).forEach(key => {
            initialOptions[key] = product.options[key][0];
        });
        return initialOptions;
    });
    const [activeImage, setActiveImage] = useState(0);

    const uniqueImages = useMemo(() => {
        if (!product) return [];
        return [...new Set(product.images.filter(img => img))];
    }, [product]);

    useEffect(() => {
        setActiveImage(0);
    }, [productId]);


    if (!product) {
        return <div className="text-center py-20">Không tìm thấy sản phẩm.</div>;
    }

    const handleAddToCart = () => {
        addToCart(product, quantity, selectedOptions);
        alert(`${product.name} đã được thêm vào giỏ hàng!`);
    };

    const handleBuyNow = () => {
        addToCart(product, quantity, selectedOptions);
        navigate('/cart');
    };
    
    const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8">
            <nav className="text-sm mb-4">
                <Link to="/" className="text-gray-500 hover:text-gray-700">Trang chủ</Link>
                <span className="mx-2">/</span>
                <Link to="/shop" className="text-gray-500 hover:text-gray-700">Cửa hàng</Link>
                <span className="mx-2">/</span>
                <span className="text-gray-800">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                <div>
                    <div className="mb-4 bg-gray-100 rounded-lg shadow-lg flex items-center justify-center">
                        <img src={uniqueImages[activeImage]} alt={product.name} className="w-full max-h-[500px] object-contain"/>
                    </div>
                    {uniqueImages.length > 1 && (
                        <div className="flex space-x-2 overflow-x-auto pb-2">
                            {uniqueImages.map((img, index) => (
                                 <img key={index} src={img} alt={`${product.name} thumbnail ${index+1}`}
                                    onClick={() => setActiveImage(index)}
                                    className={`w-20 h-20 md:w-24 md:h-24 object-contain bg-gray-100 p-1 rounded-md cursor-pointer border-2 flex-shrink-0 ${index === activeImage ? 'border-blue-500' : 'border-transparent'}`} />
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">{product.name}</h1>
                    <div className="flex items-center mb-4">
                        <StarRating rating={product.rating} />
                        <span className="text-gray-600 ml-2">({product.reviewCount} đánh giá)</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-600 mb-4">{product.price.toLocaleString('vi-VN')}₫</p>
                    <p className="text-gray-600 mb-6">{product.shortDescription}</p>

                    {Object.entries(product.options).map(([key, values]) => (
                        <div key={key} className="mb-4">
                            <h4 className="font-semibold mb-2 text-gray-800">{key}:</h4>
                            <div className="flex flex-wrap gap-2">
                                {(values as string[]).map(value => (
                                    <button key={value} onClick={() => setSelectedOptions({...selectedOptions, [key]: value})}
                                        className={`px-4 py-2 border rounded-lg text-sm ${selectedOptions[key] === value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-100'} transition-colors`}>
                                        {value}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                    
                     <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 my-6">
                        <QuantitySelector quantity={quantity} onQuantityChange={setQuantity} />
                        <div className="flex-1 grid grid-cols-2 gap-3">
                            <button onClick={handleAddToCart} className="w-full bg-blue-100 text-blue-700 font-semibold py-3 px-4 rounded-lg hover:bg-blue-200 transition-colors text-sm">Thêm vào giỏ</button>
                            <button onClick={handleBuyNow} className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm">Mua ngay</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-16">
                 <h3 className="text-2xl font-bold border-b-2 border-gray-200 pb-2 mb-4 text-gray-900">Thông tin chi tiết</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                     {Object.entries(product.specs).map(([key, value]) => (
                         <div key={key} className="bg-gray-100 p-3 rounded-md grid grid-cols-2">
                             <strong className="font-semibold">{key}</strong>
                             <span>{value}</span>
                         </div>
                     ))}
                 </div>
            </div>
             <div className="mt-16">
                 <h3 className="text-2xl font-bold border-b-2 border-gray-200 pb-2 mb-4 text-gray-900">Đánh giá sản phẩm</h3>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                     <div>
                        {product.reviews.length > 0 ? (
                           <div className="space-y-6">
                               {product.reviews.map(review => (
                                   <div key={review.id} className="border-b pb-4">
                                       <div className="flex items-center mb-1">
                                           <StarRating rating={review.rating} />
                                           <strong className="ml-3 text-gray-900">{review.author}</strong>
                                       </div>
                                       <p className="text-gray-500 text-sm mb-2">{new Date(review.date).toLocaleDateString('vi-VN')}</p>
                                       <p className="text-gray-700">{review.comment}</p>
                                   </div>
                               ))}
                           </div>
                        ) : <p className="text-gray-700">Chưa có đánh giá nào cho sản phẩm này.</p>}
                     </div>
                     <ReviewForm productId={product.id} />
                 </div>
             </div>
             
            <div className="mt-16">
                 <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">Sản phẩm liên quan</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                     {relatedProducts.map(p => (
                         <ProductCard key={p.id} product={p} />
                     ))}
                 </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;