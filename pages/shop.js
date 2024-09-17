import { useState, useEffect } from "react";
import { connectToDB } from "@/lib/mongoose";
import { Product } from "@/models/Products";
import Loader from "@/components/Loader";
import ProductsList from "@/components/ProductsList";

export default function Products({ allProducts }) {
  const [loading, setLoading] = useState(true);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const productsPerPage = 8;

  useEffect(() => {
    console.log("All products:", allProducts); // للتحقق من البيانات الواردة

    if (allProducts && allProducts.length > 0) {
      setDisplayedProducts(allProducts.slice(0, productsPerPage));
      setHasMore(allProducts.length > productsPerPage);
    }

    // تأخير قصير لمحاكاة التحميل
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [allProducts]);

  const loadMoreProducts = () => {
    setLoadingMore(true);
    const startIndex = displayedProducts.length;
    const endIndex = startIndex + productsPerPage;
    const newProducts = allProducts.slice(startIndex, endIndex);

    setDisplayedProducts(prevProducts => [...prevProducts, ...newProducts]);
    setPage(prevPage => prevPage + 1);
    setHasMore(endIndex < allProducts.length);
    setLoadingMore(false);
  };

  console.log("Loading:", loading); // للتحقق من حالة التحميل
  console.log("Displayed products:", displayedProducts); // للتحقق من المنتجات المعروضة

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <h1 className="text-3xl text-center bg-slate-300 p-5">Shop</h1>
      <div className="py-8">
        <div className="container mx-auto px-4">
          {displayedProducts.length > 0 ? (
            <>
              <ProductsList products={displayedProducts} />
              {loadingMore && (
                <div className="flex justify-center mt-4">
                  <Loader />
                </div>
              )}
              {!loadingMore && hasMore && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={loadMoreProducts}
                    className="mt-4 bg-black text-white px-4 py-2 rounded-lg"
                  >
                    Load More
                  </button>
                </div>
              )}
              {!hasMore && (
                <p className="text-center mt-4 text-gray-600">
                  No more products to load.
                </p>
              )}
            </>
          ) : (
            <p className="text-center mt-4 text-gray-600">
              No products available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  try {
    await connectToDB();
    const allProducts = await Product.find({}).sort({ '_id': -1 }).lean();

    console.log("Fetched products:", allProducts.length); // للتحقق من عدد المنتجات المجلوبة

    return {
      props: {
        allProducts: JSON.parse(JSON.stringify(allProducts)),
      }
    };
  } catch (error) {
    console.error("Error in getServerSideProps:", error);
    return {
      props: {
        allProducts: [],
        error: error.message
      }
    };
  }
}
