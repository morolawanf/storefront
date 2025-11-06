export default function Loading() {
    return (
        <div className="product-detail">
            <div className="featured-product py-10">
                <div className="container flex justify-between gap-y-6 flex-wrap">
                    {/* Image Gallery Skeleton */}
                    <div className="list-img md:w-1/2 md:pr-[45px] w-full">
                        <div className="animate-pulse">
                            {/* Main Image */}
                            <div className="w-full aspect-[3/4] bg-gray-200 rounded-2xl mb-4"></div>

                            {/* Thumbnail Images */}
                            <div className="flex gap-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="w-1/4 aspect-[3/4] bg-gray-200 rounded-xl"
                                    ></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Product Info Skeleton */}
                    <div className="product-infor md:w-1/2 w-full lg:pl-[15px] md:pl-2">
                        <div className="animate-pulse">
                            {/* Category & Title */}
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>

                            {/* Rating */}
                            <div className="flex items-center gap-2 mb-5">
                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                                <div className="h-4 bg-gray-200 rounded w-32"></div>
                            </div>

                            {/* Price */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-8 bg-gray-200 rounded w-24"></div>
                                <div className="h-4 bg-gray-200 rounded w-20"></div>
                                <div className="h-6 bg-gray-200 rounded w-16"></div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2 mb-6 pb-6 border-b border-line">
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                            </div>

                            {/* Countdown Timer Skeleton */}
                            <div className="flex items-center gap-8 mb-6">
                                <div className="h-10 bg-gray-200 rounded w-32"></div>
                                <div className="flex gap-3">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className="w-[60px] h-[60px] bg-gray-200 rounded-lg"
                                        ></div>
                                    ))}
                                </div>
                            </div>

                            {/* Attributes Skeleton */}
                            <div className="space-y-5 mb-6">
                                {/* Colors */}
                                <div>
                                    <div className="h-5 bg-gray-200 rounded w-20 mb-3"></div>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div
                                                key={i}
                                                className="w-12 h-12 bg-gray-200 rounded-full"
                                            ></div>
                                        ))}
                                    </div>
                                </div>

                                {/* Sizes */}
                                <div>
                                    <div className="h-5 bg-gray-200 rounded w-16 mb-3"></div>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div
                                                key={i}
                                                className="w-16 h-12 bg-gray-200 rounded-lg"
                                            ></div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Quantity & Add to Cart */}
                            <div className="h-5 bg-gray-200 rounded w-24 mb-3"></div>
                            <div className="flex gap-5 mb-5">
                                <div className="w-[180px] h-12 bg-gray-200 rounded-lg"></div>
                                <div className="flex-1 h-12 bg-gray-200 rounded-lg"></div>
                            </div>

                            {/* Buy Now Button */}
                            <div className="h-12 bg-gray-200 rounded-lg w-full"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="container mt-8">
                <div className="flex justify-center gap-8 mb-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-6 bg-gray-200 rounded w-32"></div>
                    ))}
                </div>

                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
            </div>
        </div>
    );
}
