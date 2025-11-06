import Link from 'next/link';
import * as Icon from '@phosphor-icons/react/dist/ssr';

export default function NotFound() {
    return (
        <div className="product-not-found py-20">
            <div className="container">
                <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
                    {/* Icon */}
                    <div className="w-32 h-32 flex items-center justify-center rounded-full bg-gray-100 mb-8">
                        <Icon.Package size={64} weight="light" className="text-gray-400" />
                    </div>

                    {/* Heading */}
                    <h1 className="heading3 mb-4">Product Not Found</h1>

                    {/* Description */}
                    <p className="text-secondary text-center mb-8">
                        Sorry, we couldn&apos;t find the product you&apos;re looking for. It may have been removed,
                        renamed, or is temporarily unavailable.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4 flex-wrap justify-center">
                        <Link
                            href="/shop"
                            className="button-main bg-black text-white hover:bg-gray-800"
                        >
                            <Icon.Storefront size={20} className="mr-2" />
                            Browse All Products
                        </Link>

                        <Link
                            href="/"
                            className="button-main bg-white text-black border border-black hover:bg-gray-50"
                        >
                            <Icon.House size={20} className="mr-2" />
                            Go to Homepage
                        </Link>
                    </div>

                    {/* Additional Help */}
                    <div className="mt-12 p-6 bg-surface rounded-lg w-full">
                        <h3 className="heading6 mb-3">Need Help?</h3>
                        <p className="text-secondary text-sm mb-4">
                            If you believe this is an error, please contact our support team.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center text-sm">
                            <Link
                                href="/contact"
                                className="flex items-center gap-2 text-black hover:underline"
                            >
                                <Icon.Envelope size={18} />
                                Contact Support
                            </Link>
                            <span className="text-gray-300 max-sm:hidden">|</span>
                            <Link
                                href="/search"
                                className="flex items-center gap-2 text-black hover:underline"
                            >
                                <Icon.MagnifyingGlass size={18} />
                                Search Products
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
