// client/src/pages/HomePage.jsx (updated again)
import React, { useContext, useEffect, useRef } from "react"; // Import useRef
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { gsap } from "gsap"; // Import GSAP
import { Helmet } from "react-helmet-async";
function HomePage() {
  const { state } = useContext(AuthContext);

  // Refs for GSAP animation targets
  const titleRef = useRef(null);
  const taglineRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    // GSAP animation for hero section elements
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.3 }
    );
    gsap.fromTo(
      taglineRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.6 }
    );
    gsap.fromTo(
      buttonRef.current,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.7)", delay: 0.9 }
    );
  }, []); // Empty dependency array means this runs once on mount

  // Framer Motion variants (can still be used for other elements or fallback)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  return (
    <motion.div
      className="min-h-[calc(100vh-120px)] bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 flex flex-col items-center justify-center p-8 text-center"
      // Removed Framer Motion animation for the main container to let GSAP handle specific elements
      // variants={containerVariants}
      // initial="hidden"
      // animate="visible"
    >
      <Helmet>
        <title>Ninad's Pottery - Handcrafted Ceramics & Home Decor</title>
        <meta
          name="description"
          content="Discover exquisite handcrafted pottery, ceramics, and unique home decor pieces from Ninad's Pottery. Shop online for artisanal quality."
        />
        {/* Open Graph / Social Media Tags (for sharing) */}
        <meta
          property="og:title"
          content="Ninad's Pottery - Handcrafted Ceramics & Home Decor"
        />
        <meta
          property="og:description"
          content="Discover exquisite handcrafted pottery, ceramics, and unique home decor pieces from Ninad's Pottery. Shop online for artisanal quality."
        />
        <meta
          property="og:image"
          content="https://yourwebsite.com/images/ninads-pottery-og-image.jpg"
        />{" "}
        {/* Replace with actual image */}
        <meta property="og:url" content="https://yourwebsite.com/" />
        <meta property="og:type" content="website" />
      </Helmet>
      <h1
        ref={titleRef} // Attach ref for GSAP
        className="text-6xl font-extrabold text-indigo-700 mb-6 opacity-0" // Start hidden for GSAP
      >
        Welcome to Ninad's Pottery!
      </h1>
      <p
        ref={taglineRef} // Attach ref for GSAP
        className="text-xl text-gray-600 max-w-2xl mb-8 opacity-0" // Start hidden for GSAP
      >
        Discover exquisite handcrafted pottery, designed to bring beauty and
        artistry to your home.
      </p>
      <div ref={buttonRef} className="opacity-0">
        {" "}
        {/* Attach ref and start hidden */}
        <Link to="/shop">
          <motion.button
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            Explore Our Shop
          </motion.button>
        </Link>
      </div>

      {/* Display user info if logged in (for testing purposes) */}
      {state.user && state.user.token && (
        <motion.div
          className="mt-8 p-4 bg-gray-200 rounded-lg max-w-md break-all border border-gray-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }} // Adjust delay to fit GSAP animation
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Your JWT (for testing):
          </h3>
          <p className="text-sm text-gray-600">{state.user.token}</p>
          <p className="text-xs text-gray-500 mt-2">
            (You can use this token in tools like Postman/Insomnia to test
            protected backend routes by setting an Authorization header with
            `Bearer YOUR_TOKEN`.)
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Your Role:{" "}
            <span className="font-bold text-blue-700">{state.user.role}</span>
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default HomePage;
