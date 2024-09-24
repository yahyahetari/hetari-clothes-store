import { useState } from 'react';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';
import { useSession } from "next-auth/react";
import Image from 'next/image';

const RatingsAndReviews = ({ productId, initialRatings = [] }) => {
    const [ratings, setRatings] = useState(initialRatings);
    const [newRating, setNewRating] = useState(0);
    const [newReview, setNewReview] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [error, setError] = useState('');
    const { data: session } = useSession();

    const averageRating = ratings.length > 0
        ? ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length
        : 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (newRating > 0 && session) {
            const newRatingObject = {
                rating: newRating,
                review: newReview,
                user: session.user.email,
            };

            try {
                const response = await fetch('/api/rate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        productId,
                        rating: newRatingObject
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    setRatings(data.updatedRatings);
                    setNewRating(0);
                    setNewReview('');
                } else {
                    const errorData = await response.json();
                    setError(errorData.message);
                }
            } catch (error) {
                console.error('Error submitting rating:', error);
                setError('An error occurred while submitting your rating.');
            }
        }
    };

    const RatingStars = ({ rating, size = 'w-5 h-5' }) => (
        <>
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`${size} ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill={star <= Math.round(rating) ? 'currentColor' : 'none'}
                />
            ))}
        </>
    );

    return (
        <div className="mt-8 bg-slate-200 p-3 ">
            <div 
                className="flex justify-between items-center cursor-pointer" 
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center">
                    <h2 className="text-lg sm:text-2xl font-semibold mr-4">Ratings and Reviews</h2>
                    {!isExpanded && (
                        <div className="flex items-center">
                            <span className="text-xl font-bold mr-2">{averageRating.toFixed(1)}</span>
                            <RatingStars rating={averageRating} size="w-4 h-4" />
                            <span className="ml-2 text-sm text-gray-500">
                                ({ratings.length}<span className="hidden sm:inline">ratings</span>)
                                </span>
                        </div>
                    )}
                </div>
                {isExpanded ? <ChevronUp /> : <ChevronDown />}
            </div>
            
            {isExpanded && (
                <>
                    <div className="flex items-center my-4">
                        <span className="text-xl font-bold mr-2">{averageRating.toFixed(1)}</span>
                        <RatingStars rating={averageRating} />
                        <span className="ml-2 text-sm text-gray-500">({ratings.length} ratings)</span>
                    </div>
                    <div className="mb-4">
                        {ratings.map((item, index) => (
                            <div key={index} className="mb-4 bg-white p-3 rounded-lg">
                                <div className="flex items-center mb-2">
                                    {session && session.user && session.user.image && (
                                        <Image
                                            src={session.user.image}
                                            alt="User"
                                            width={20}
                                            height={20}
                                            className="rounded-full mr-2"
                                        />
                                    )}
                                    <span className="font-normal text-sm ">{session?.user?.name || 'Anonymous'}</span>
                                </div>
                                <div className="flex items-center mb-2">
                                    <RatingStars rating={item.rating} size="w-4 h-4" />
                                </div>
                                <p>{item.review}</p>
                            </div>
                        ))}
                    </div>
                    {session ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block mb-2">Your Rating:</label>
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`w-6 h-6 cursor-pointer ${star <= newRating ? 'text-yellow-400' : 'text-gray-500'}`}
                                            fill={star <= newRating ? 'currentColor' : 'none'}
                                            onClick={() => setNewRating(star)}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block mb-2">Your Review:</label>
                                <textarea
                                    value={newReview}
                                    onChange={(e) => setNewReview(e.target.value)}
                                    className="w-full p-2 border border-gray-700 rounded"
                                ></textarea>
                            </div>
                            {error && (
                                <div className="text-red-500 mb-2">{error}</div>
                            )}
                            <button type="submit" className="bg-black text-white px-4 py-2 rounded">
                                Submit Review
                            </button>
                        </form>
                    ) : (
                        <p>Please sign in to leave a review.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default RatingsAndReviews;
