"use client"

import { useState } from 'react';

export default function Hoodie() {
    const [selectedSize, setSelectedSize] = useState('M');
    const [quantity, setQuantity] = useState(1);
    const [color, setColor] = useState('black');

    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const colors = [
        { name: 'Black', value: 'black' },
        { name: 'Grey', value: 'grey' },
        { name: 'Navy', value: 'navy' }
    ];

    const handleAddToCart = () => {
        alert(`Added to cart: ${quantity} ${color} hoodie(s) in size ${selectedSize}`);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Product Images */}
                <div className="md:w-1/2">
                    <div className="bg-gray-100 rounded-lg p-4 h-96 flex items-center justify-center">
                        <div className="relative w-full h-full">

                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mt-4">
                        {[1, 2, 3, 4].map((num) => (
                            <div key={num} className="bg-gray-100 rounded-lg p-2 h-20">
                                <div className="w-full h-full bg-gray-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Product Info */}
                <div className="md:w-1/2">
                    <h1 className="text-3xl font-bold mb-2">Premium Comfort Hoodie</h1>
                    <div className="flex items-center mb-4">
                        <div className="flex text-yellow-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <svg key={star} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                            ))}
                        </div>
                        <span className="ml-2 text-gray-600">(128 reviews)</span>
                    </div>

                    <div className="mb-4">
                        <span className="text-2xl font-bold">€49.99</span>
                        <span className="text-gray-500 line-through ml-2">€69.99</span>
                        <span className="ml-2 bg-red-100 text-red-700 px-2 py-1 rounded text-sm">-30%</span>
                    </div>

                    <p className="text-gray-600 mb-6">
                        Our premium hoodie is made from high-quality cotton blend for ultimate comfort. 
                        Features a soft-lined hood, kangaroo pocket, and ribbed cuffs and hem.
                    </p>

                    {/* Color Selection */}
                    <div className="mb-6">
                        <h2 className="text-lg font-medium mb-2">Color</h2>
                        <div className="flex space-x-3">
                            {colors.map((colorOption) => (
                                <button
                                    key={colorOption.value}
                                    className={`w-8 h-8 rounded-full bg-${colorOption.value} border-2 ${
                                        color === colorOption.value ? 'border-blue-500' : 'border-transparent'
                                    }`}
                                    style={{ backgroundColor: colorOption.value }}
                                    onClick={() => setColor(colorOption.value)}
                                    aria-label={`Select ${colorOption.name} color`}
                                ></button>
                            ))}
                        </div>
                    </div>

                    {/* Size Selection */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-lg font-medium">Size</h2>
                            <button className="text-blue-600 text-sm">Size Guide</button>
                        </div>
                        <div className="grid grid-cols-6 gap-2">
                            {sizes.map((size) => (
                                <button
                                    key={size}
                                    className={`py-2 border rounded ${
                                        selectedSize === size 
                                            ? 'border-blue-500 bg-blue-50 text-blue-600' 
                                            : 'border-gray-300 text-gray-600'
                                    }`}
                                    onClick={() => setSelectedSize(size)}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quantity */}
                    <div className="mb-6">
                        <h2 className="text-lg font-medium mb-2">Quantity</h2>
                        <div className="flex items-center border border-gray-300 rounded w-32">
                            <button
                                className="px-3 py-1 text-xl"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            >
                                -
                            </button>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                className="w-full text-center border-0 focus:ring-0"
                            />
                            <button
                                className="px-3 py-1 text-xl"
                                onClick={() => setQuantity(quantity + 1)}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                        onClick={handleAddToCart}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition duration-200"
                    >
                        Add to Cart
                    </button>

                    {/* Additional Info */}
                    <div className="mt-6 space-y-4 text-sm">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <span>Secure Payment</span>
                        </div>
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <span>Free shipping on orders over €50</span>
                        </div>
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>30-day return policy</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}