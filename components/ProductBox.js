import { useContext, useEffect, useState } from "react";
import { CartContext } from "./CartContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import QuickAddToCart from "./QuickAddToCart";

const getColorHex = (colorName) => {
  const colors = {
    red: "#FF0000",
    blue: "#020e77",
    green: "#0a7900",
    yellow: "#FFFF00",
    black: "#000000",
    white: "#FFFFFF",
  };
  return colors[colorName.toLowerCase()] || colorName;
};

const formatPropertyValue = (key, value, hasColor) => {
  const isColor = key.toLowerCase() === "color" || key.toLowerCase() === "لون";

  if (isColor) {
    return (
      <span
        className="w-4 h-4 rounded-full -mt-1 inline-block border border-black"
        style={{
          backgroundColor: getColorHex(value),
          boxShadow: value.toLowerCase() === 'white' ? 'inset 0 0 0 1px #000' : 'none'
        }}
        title={value}
      ></span>
    );
  }

  if (hasColor && !isColor) {
    return null;
  }

  return value;
};

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};

export default function ProductBox({ _id, title, description, images, price, category, properties, product, slug }) {
  const { addToCart } = useContext(CartContext);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const propertyEntries = properties ? Object.entries(properties) : [];

  const hasColor = propertyEntries.some(([key]) =>
    key.toLowerCase() === "color" || key.toLowerCase() === "لون"
  );

  let displayedValues = propertyEntries.flatMap(([key, value]) => {
    const values = Array.isArray(value) ? value : [value];
    return values.map(v => formatPropertyValue(key, v.trim(), hasColor)).filter(Boolean);
  });

  let additionalColorsCount = 0;
  if (displayedValues.length > 5) {
    additionalColorsCount = displayedValues.length - 5;
    displayedValues = displayedValues.slice(0, 5);
  }

  const handleAddToCart = () => {
    setShowQuickAdd(true);
  };

  const shimmerEffect = {
    hidden: { x: '-100%' },
    visible: { x: '100%' },
  };

  return (
    <>
      <motion.div
        className="flex flex-col gap-1 border border-slate-800 rounded-lg h-full"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {!isImageLoaded ? (
          <div className="relative overflow-hidden">
            <div className="flex flex-col gap-1">
              <div className="relative overflow-hidden group">
                <div className="w-[150px] h-[190px] sm:w-[150px] sm:h-[190px] md:w-[180px] md:h-[260px] lg:w-[180px] lg:h-[260px] xl:w-[200px] xl:h-[280px] rounded-md m-1.5 bg-gray-400">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                    initial="hidden"
                    animate="visible"
                    variants={shimmerEffect}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    style={{ width: '50%', opacity: 0.2 }}
                  />
                </div>
              </div>
              <div className="pl-2 text-left flex-grow flex flex-col">
                <div className="h-4 bg-gray-400 rounded w-3/4 mb-1 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                    initial="hidden"
                    animate="visible"
                    variants={shimmerEffect}
                    transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                    style={{ width: '50%', opacity: 0.2 }}
                  />
                </div>
                <div className="h-4 bg-gray-400 rounded w-1/2 mb-1 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                    initial="hidden"
                    animate="visible"
                    variants={shimmerEffect}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    style={{ width: '50%', opacity: 0.2 }}
                  />
                </div>
              </div>
              <div className="pl-2 flex justify-between items-center pb-2">
                <div className="h-4 bg-gray-400 rounded w-1/4 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                    initial="hidden"
                    animate="visible"
                    variants={shimmerEffect}
                    transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                    style={{ width: '50%', opacity: 0.2 }}
                  />
                </div>
                <div className="w-14 h-8 bg-gray-400 rounded-lg mr-2 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                    initial="hidden"
                    animate="visible"
                    variants={shimmerEffect}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    style={{ width: '50%', opacity: 0.2 }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <Link href={`/product/${slug}`}>
              <div className="relative overflow-hidden group">
                <img
                  src={images[0]}
                  alt="product"
                  className="w-fit h-[180px] sm:w-[170px] sm:h-[220px] md:w-[180px] md:h-[260px] lg:w-[180px] lg:h-[260px] xl:w-[200px] xl:h-[280px] rounded-md m-1.5 transition-transform duration-300 group-hover:scale-105 bg-white object-cover cursor-pointer"
                  onLoad={() => setIsImageLoaded(true)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-95 transition-opacity duration-300">
                  <span className="text-white text-lg font-semibold">View Details</span>
                </div>
              </div>
            </Link>
            <div className="pl-2 pb-1 text-left flex-grow flex flex-col">
              <p className="text-md font-semibold" title={title}>
                {truncateText(title, 17)}
              </p>
              <div className="text-sm flex flex-wrap -mb-2.5 gap-0.5 flex-grow relative">
                {displayedValues.map((value, index) => (
                  <span key={index}>{value}</span>
                ))}
                {additionalColorsCount > 0 && (
                  <span className="text-sm text-gray-800  absolute -top-1 right-7 sm:right-12 md:right-20 xl:right-24 ">
                    +{additionalColorsCount}
                  </span>
                )}
              </div>
            </div>
            <div className="pl-2 flex justify-between items-center mt-auto pb-2">
              <p className="font-bold">$ {price}</p>
              <svg
                onClick={handleAddToCart}
                xmlns="http://www.w3.org/2000/svg"
                className="w-14 py-1 rounded-lg cursor-pointer p-4 border border-black mr-2"
                viewBox="0 0 576 512"
              >
                <path d="M0 24C0 10.7 10.7 0 24 0L69.5 0c22 0 41.5 12.8 50.6 32l411 0c26.3 0 45.5 25 38.6 50.4l-41 182.3c-8.5 31.4-37 53.3-69.5 53.3l-288.5 0 5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5L488 336c13.3 0 24 10.7 24 24s-10.7 24-24 24l-288.3 0c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5L24 48C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96zM252 160c0 11 9 20 20 20l44 0 0 44c0 11 9 20 20 20s20-9 20-20l0-44 44 0c11 0 20-9 20-20s-9-20-20-20l-44 0 0-44c0-11-9-20-20-20s-20 9-20 20l0 44-44 0c-11 0-20 9-20 20z" />
              </svg>
            </div>
          </>
        )}
        {!isImageLoaded && (
          <img
            src={images[0]}
            alt="product"
            className="hidden"
            onLoad={() => setIsImageLoaded(true)}
          />
        )}
      </motion.div>
      
      <AnimatePresence>
        {showQuickAdd && (
          <QuickAddToCart
            product={{ _id, title, images, price, properties }}
            onClose={() => setShowQuickAdd(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
