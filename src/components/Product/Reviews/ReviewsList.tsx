'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useProductReviews } from '@/hooks/queries/useProductReviews';
import { useReviewLike } from '@/hooks/mutations/useReviewLike';
import * as Icon from "@phosphor-icons/react/dist/ssr";

interface ReviewsListProps {
    productId: string;
    className?: string;
}

type SortOption = 'recent' | 'helpful' | 'rating-high' | 'rating-low';

export default function ReviewsList({ productId, className = '' }: ReviewsListProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [selectedRating, setSelectedRating] = useState<number | undefined>(undefined);
    const [hasImages, setHasImages] = useState(false);
    const [sortBy, setSortBy] = useState<SortOption>('recent');

    // Fetch reviews with filters
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error,
    } = useProductReviews({
        productId,
        limit: 10,
        filters: {
            rating: selectedRating as 1 | 2 | 3 | 4 | 5 | undefined,
            hasImages,
            sortBy,
        },
    });

    // Like mutation
    const toggleLike = useReviewLike({
        onError: (error) => {
            if (error.message === 'AUTHENTICATION_REQUIRED') {
                router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
            }
        },
    });

    // Flatten all reviews from pages
    const allReviews = data?.pages.flatMap((page) => page.data) || [];
    const totalReviews = data?.pages[0]?.meta.total || 0;

    // Handle like click
    const handleLikeClick = (reviewId: string) => {
        if (!session?.user) {
            router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
            return;
        }
        toggleLike.mutate({ reviewId, productId });
    };

    // Render stars
    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Icon.Star
                        key={star}
                        className={`text-sm ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                        weight={star <= rating ? 'fill' : 'regular'}
                    />
                ))}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className={`${className}`}>
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`${className}`}>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <strong>Error loading reviews:</strong> {error.message}
                </div>
            </div>
        );
    }

    return (
        <div className={`${className}`}>
            {/* Filters */}
            <div className="mb-6 pb-6 border-b border-line">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Rating Filter */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedRating(undefined)}
                            className={`px-4 py-2 rounded-lg border transition-colors ${selectedRating === undefined
                                    ? 'bg-black text-white border-black'
                                    : 'bg-white text-black border-line hover:border-black'
                                }`}
                        >
                            All
                        </button>
                        {[5, 4, 3, 2, 1].map((rating) => (
                            <button
                                key={rating}
                                onClick={() => setSelectedRating(rating)}
                                className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-1 ${selectedRating === rating
                                        ? 'bg-black text-white border-black'
                                        : 'bg-white text-black border-line hover:border-black'
                                    }`}
                            >
                                <Icon.Star
                                    className="text-sm"
                                    weight="fill"
                                />
                                {rating}
                            </button>
                        ))}
                    </div>

                    {/* Images Filter */}
                    <button
                        onClick={() => setHasImages(!hasImages)}
                        className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${hasImages
                                ? 'bg-black text-white border-black'
                                : 'bg-white text-black border-line hover:border-black'
                            }`}
                    >
                        <Icon.Image className="text-lg" />
                        With Images
                    </button>

                    {/* Sort Dropdown */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="px-4 py-2 rounded-lg border border-line bg-white cursor-pointer hover:border-black transition-colors"
                    >
                        <option value="recent">Most Recent</option>
                        <option value="helpful">Most Helpful</option>
                        <option value="rating-high">Highest Rating</option>
                        <option value="rating-low">Lowest Rating</option>
                    </select>
                </div>

                {/* Total count */}
                <div className="mt-4 text-secondary">
                    {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                </div>
            </div>

            {/* Reviews List */}
            {allReviews.length === 0 ? (
                <div className="text-center py-12">
                    <Icon.ChatCircleText className="text-5xl text-gray-300 mx-auto mb-4" />
                    <p className="text-secondary text-lg">No reviews yet</p>
                    <p className="text-secondary text-sm mt-2">Be the first to review this product</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {allReviews.map((review) => {
                        const isLikedByMe = session?.user?.id ? review.likes.includes(session.user.id) : false;

                        return (
                            <div key={review._id} className="pb-6 border-b border-line last:border-b-0">
                                {/* Review Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold">
                                                {review.reviewBy.firstName} {review.reviewBy.lastName}
                                            </span>
                                            {review.transactionId && (
                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                                                    Verified Purchase
                                                </span>
                                            )}
                                        </div>
                                        {renderStars(review.rating)}
                                    </div>
                                    <div className="text-secondary text-sm">
                                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </div>
                                </div>

                                {/* Review Title */}
                                {review.title && (
                                    <h4 className="font-semibold text-lg mb-2">{review.title}</h4>
                                )}

                                {/* Review Message */}
                                <p className="text-secondary mb-3">{review.message}</p>

                                {/* Review Images */}
                                {review.images && review.images.length > 0 && (
                                    <div className="flex gap-2 mb-3 overflow-x-auto">
                                        {review.images.map((imageUrl, index) => (
                                            <div
                                                key={index}
                                                className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-line"
                                            >
                                                <Image
                                                    src={imageUrl}
                                                    alt={`Review image ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Like Button */}
                                <button
                                    onClick={() => handleLikeClick(review._id)}
                                    disabled={toggleLike.isPending}
                                    className={`flex items-center gap-2 text-sm transition-colors ${isLikedByMe
                                            ? 'text-red-500 hover:text-red-600'
                                            : 'text-secondary hover:text-black'
                                        } ${toggleLike.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <Icon.Heart
                                        className="text-lg"
                                        weight={isLikedByMe ? 'fill' : 'regular'}
                                    />
                                    <span>
                                        {isLikedByMe ? 'Liked' : 'Helpful'} ({review.likesCount})
                                    </span>
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Load More Button */}
            {hasNextPage && (
                <div className="text-center mt-8">
                    <button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        className="button-main bg-white text-black border-black hover:bg-black hover:text-white px-8 py-3"
                    >
                        {isFetchingNextPage ? (
                            <span className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                Loading...
                            </span>
                        ) : (
                            'Load More Reviews'
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
