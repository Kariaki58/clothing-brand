"use client";
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';


export default function ReviewForm() {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [name, setName] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [error, setError] = useState(null);
    
    const reviewImageRef = useRef(null);
    const router = useRouter();

    const searchParams = useSearchParams();
    const productId = searchParams.get('productId');
    const orderId = searchParams.get('orderId');


    

    const handleReviewImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // Basic validation
        if (!productId || !name || !rating || !comment || !orderId) {
            setError('Please fill in all required fields');
            setIsSubmitting(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('productId', productId);
            formData.append('orderId', orderId);
            formData.append('rating', rating.toString());
            formData.append('comment', comment);
            formData.append('name', name);
            
            
            if (reviewImageRef.current?.files?.[0]) {
                formData.append('image', reviewImageRef.current.files[0]);
            }

            const response = await fetch(`/api/review?productId=${productId}&orderId=${orderId}`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                setSubmitSuccess(true);
            } else {
                setError('Failed to submit review. Please try again.');
            }
        } catch (err) {
            setError('Failed to submit review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitSuccess) {
        return (
            <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center mt-20">
                <div className="text-green-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
                <p className="text-gray-600 mb-6">Your review has been submitted successfully.</p>
                <button
                    onClick={() => router.push('/')}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md my-20">
        <h1 className="text-xl font-bold mb-6">Submit a Product Review</h1>

        <form onSubmit={handleSubmit}>
            
            <div className="mb-6">
                <label className="block text-gray-700 mb-2">Your Name*</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Enter your name"
                />
            </div>

            <div className="mb-6">
                <label className="block text-gray-700 mb-2">Rating*</label>
                <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-2xl focus:outline-none ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                        ★
                    </button>
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-gray-700 mb-2">Review*</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Share your experience with this product..."
                    required
                />
            </div>

            <div className="mb-6">
                <label className="block text-gray-700 mb-2">Add Your Photo (Optional)</label>
                <div className="flex items-center">
                    <input
                        type="file"
                        ref={reviewImageRef}
                        onChange={handleReviewImageChange}
                        accept="image/*"
                        className="hidden"
                        id="review-image"
                    />
                    <label
                        htmlFor="review-image"
                        className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md transition"
                    >
                        Choose Your Image
                    </label>
                    {imagePreview && (
                        <div className="ml-4 w-16 h-16 relative">
                            <Image
                                src={imagePreview}
                                alt="Review preview"
                                fill
                                className="rounded-md object-cover"
                            />
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2 px-4 rounded-md text-white ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} transition`}
            >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
        </div>
    );
}