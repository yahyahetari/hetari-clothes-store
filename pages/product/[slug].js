import { useState, useEffect, useContext } from "react";
import { CartContext } from "@/components/CartContext";
import Gallery from "@/components/Gallery";
import { connectToDB } from "@/lib/mongoose";
import { Product } from "@/models/Products";
import { Category } from "@/models/Category";
import { MinusCircle, PlusCircle } from "lucide-react";
import Loader from "@/components/Loader";
import ProductsList from "@/components/ProductsList";
import RatingsAndReviews from "@/components/RatingsAndReviews";
import { useSession } from "next-auth/react";

// Helper function to convert color name to HEX code
const getColorHex = (colorName) => {
    const colors = {
        red: "#FF0000",
        blue: "#020e77",
        green: "#00FF00",
        yellow: "#FFFF00",
        black: "#000000",
        white: "#FFFFFF",
        // You can add more colors here
    };
    return colors[colorName.toLowerCase()] || colorName;
};

// Helper function to shuffle an array
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

// Helper function to sort size values
const sortSizeValues = (values) => {
    const sizeOrder = ['xs', 's', 'm', 'l', 'xl', '2xl', '3xl', '4xl', '5xl'];
    return values.sort((a, b) => {
        const aIndex = sizeOrder.indexOf(a.toLowerCase());
        const bIndex = sizeOrder.indexOf(b.toLowerCase());
        if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
    });
};

// Helper function to check if a property is a size property
const isSizeProperty = (name) => name.toLowerCase().includes('size') || name.includes('مقاس');

// Helper function to check if a property is a color property
const isColorProperty = (name) => name.toLowerCase() === "color" || name.toLowerCase() === "لون";

export default function ProductPage({ product, sameSubcategoryProducts, otherSubcategoryProducts }) {
    const { addToCart } = useContext(CartContext);
    const [selectedProperties, setSelectedProperties] = useState({});
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [visibleProducts, setVisibleProducts] = useState([]);
    const [showMoreButton, setShowMoreButton] = useState(true);
    const { data: session } = useSession();

    useEffect(() => {
        if (product.properties) {
            const initialSelected = {};
            Object.entries(product.properties).forEach(([name, values]) => {
                if (Array.isArray(values) && values.length > 0) {
                    // Sort size values if the property name includes 'size' or 'مقاس'
                    if (isSizeProperty(name)) {
                        values = sortSizeValues(values);
                    }
                    initialSelected[name] = values[0];
                }
            });
            setSelectedProperties(initialSelected);
        }
        setLoading(false);

        // Combine and prepare initial visible products
        const initialProducts = [...sameSubcategoryProducts];
        if (initialProducts.length < 5) {
            initialProducts.push(...otherSubcategoryProducts.slice(0, 5 - initialProducts.length));
        }
        setVisibleProducts(initialProducts.slice(0, 5));

        // Check if there are more products to show
        setShowMoreButton(sameSubcategoryProducts.length + otherSubcategoryProducts.length > 5);
    }, [product.properties, sameSubcategoryProducts, otherSubcategoryProducts]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader />
            </div>
        );
    }

    const toggleProperty = (name, value) => {
        setSelectedProperties(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const hasProperties = product.properties && Object.values(product.properties).some(values => Array.isArray(values) && values.length > 0);

    const increaseQuantity = () => {
        setQuantity(prev => prev + 1);
    };

    const decreaseQuantity = () => {
        setQuantity(prev => (prev > 1 ? prev - 1 : 1));
    };

    const handleAddToCart = () => {
        addToCart(product._id, selectedProperties, quantity);
    };

    const loadMoreProducts = () => {
        const currentLength = visibleProducts.length;
        const remainingSameCategory = sameSubcategoryProducts.slice(currentLength);
        const remainingOtherCategory = otherSubcategoryProducts.slice(Math.max(0, currentLength - sameSubcategoryProducts.length));

        const newProducts = [...remainingSameCategory, ...remainingOtherCategory].slice(0, 5);
        setVisibleProducts(prev => [...prev, ...newProducts]);

        if (currentLength + 5 >= sameSubcategoryProducts.length + otherSubcategoryProducts.length) {
            setShowMoreButton(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 flex flex-col gap-6">
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0 w-full md:w-1/2 flex items-center justify-center">
                    <Gallery images={product.images} key={product._id} />
                </div>
                <div className="flex-grow md:w-1/2 flex flex-col gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">{product.title}</h1>
                        <p className="text-xl font-semibold mt-2">$ {product.price}</p>
                    </div>
                    <p className="text-lg">{product.description}</p>

                    {hasProperties && (
                        <div className="">
                            <div className="flex flex-wrap gap-4">
                                {Object.entries(product.properties).map(([name, values], index) => (
                                    Array.isArray(values) && values.length > 0 && (
                                        <div key={index} className="w-full md:w-1/2">
                                            <p className="text-base font-semibold">{name} :</p>
                                            <div className="flex gap-2 flex-wrap">
                                                {(isSizeProperty(name) ? sortSizeValues([...values]) : values).map((value, idx) => (
                                                    isColorProperty(name) ? (
                                                        <button
                                                            type="button"
                                                            key={idx}
                                                            className={`w-7 h-7 rounded-full border border-black ${selectedProperties[name] === value ? 'ring-2 ring-offset-2 ring-black' : ''}`}
                                                            style={{ backgroundColor: getColorHex(value) }}
                                                            onClick={() => toggleProperty(name, value)}
                                                            title={value}
                                                        />
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            key={idx}
                                                            className={`py-1 px-2 rounded-lg border border-black ${selectedProperties[name] === value ? 'bg-black text-white' : 'text-black'}`}
                                                            onClick={() => toggleProperty(name, value)}
                                                        >
                                                            {value}
                                                        </button>
                                                    )
                                                ))}
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center mt-4">
                        <MinusCircle
                            className="hover:text-red-700 cursor-pointer"
                            onClick={decreaseQuantity}
                        />
                        <span className="text-lg font-medium mx-3">{quantity}</span>
                        <PlusCircle
                            className="hover:text-red-700 cursor-pointer"
                            onClick={increaseQuantity}
                        />
                    </div>

                    <button
                        onClick={handleAddToCart}
                        className="bg-black font-medium text-xl text-white rounded-lg mt-4 py-2 flex items-center justify-center"
                    >
                        Add To Cart
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-6 h-6 icon-white ml-3"
                            viewBox="0 0 576 512"
                        >
                            <path d="M0 24C0 10.7 10.7 0 24 0L69.5 0c22 0 41.5 12.8 50.6 32l411 0c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3l-288.5 0 5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5L488 336c13.3 0 24 10.7 24 24s-10.7 24-24 24l-288.3 0c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5L24 48C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96zM252 160c0 11 9 20 20 20l44 0 0 44c0 11 9 20 20 20s20-9 20-20l0-44 44 0c11 0 20-9 20-20s-9-20-20-20l-44 0 0-44c0-11-9-20-20-20s-20 9-20 20l0 44-44 0c-11 0-20 9-20 20z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Ratings and Reviews Section */}
            <RatingsAndReviews
                productId={product._id}
                initialRatings={product.ratings || []}
            />

            {/* Related Products Section */}
            <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">Related Products</h2>

                {visibleProducts.length > 0 && (
                    <div className=" text-center">
                        <ProductsList products={visibleProducts} />
                        {showMoreButton && (
                            <button
                                onClick={loadMoreProducts}
                                className="mt-4 bg-black text-white px-4 py-2 rounded-lg"
                            >
                                Load More
                            </button>
                        )}
                        {!showMoreButton && visibleProducts.length === sameSubcategoryProducts.length + otherSubcategoryProducts.length && (
                            <p className="mt-4 text-gray-600 text-center">No more products to load.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export async function getServerSideProps({ params }) {
    await connectToDB();
    const { slug } = params;
    const product = await Product.findOne({ slug }).lean();

    if (!product) {
        return {
            notFound: true,
        };
    }

    // Find the subcategory of the product
    const subcategory = await Category.findById(product.category).lean();

    if (!subcategory) {
        return {
            notFound: true,
        };
    }

    // Find the main category
    const mainCategory = await Category.findById(subcategory.parent).lean();

    if (!mainCategory) {
        return {
            notFound: true,
        };
    }

    // Find all subcategories of the main category
    const allSubcategories = await Category.find({ parent: mainCategory._id }).lean();
    const allSubcategoryIds = allSubcategories.map(sub => sub._id);

    // Fetch products from the same subcategory
    let sameSubcategoryProducts = await Product.find({
        _id: { $ne: product._id },
        category: subcategory._id
    }).lean();

    // Fetch products from other subcategories of the same main category
    let otherSubcategoryProducts = await Product.find({
        _id: { $ne: product._id },
        category: { $in: allSubcategoryIds, $ne: subcategory._id }
    }).lean();

    // Shuffle the products
    sameSubcategoryProducts = shuffleArray(sameSubcategoryProducts);
    otherSubcategoryProducts = shuffleArray(otherSubcategoryProducts);

    return {
        props: {
            product: JSON.parse(JSON.stringify(product)),
            sameSubcategoryProducts: JSON.parse(JSON.stringify(sameSubcategoryProducts)),
            otherSubcategoryProducts: JSON.parse(JSON.stringify(otherSubcategoryProducts)),
        },
    };
}
