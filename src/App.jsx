import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import { CiSearch } from "react-icons/ci";
import { IoClose } from "react-icons/io5";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { GoDownload } from "react-icons/go";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  const [urlsToDisplay, setUrlsToDisplay] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDefaultSearch, setIsDefaultSearch] = useState(true);
  const [loadingImages, setLoadingImages] = useState(true);

  const apiKey = "OzeFVgOD3F-umctS-zLapVfh9f2buxKlLA7bhH8DZtQ";

  async function getUnsplashPhotos(query, isDefault = false) {
    setLoadingImages(true);
    try {
      const response = await axios.get(
        `https://api.unsplash.com/search/photos?query=${query}&client_id=${apiKey}&per_page=8`
      );
      setUrlsToDisplay(response.data.results);
      setSearchTerm(query);
      setIsDefaultSearch(isDefault);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setTimeout(() => {
        setLoadingImages(false);
      }, 1000);
    }
  }

  useEffect(() => {
    getUnsplashPhotos("africans", true);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() !== "") {
      const delayDebounce = setTimeout(() => {
        getUnsplashPhotos(searchQuery, false);
      }, 500);
      return () => clearTimeout(delayDebounce);
    } else {
      getUnsplashPhotos("africans", true);
    }
  }, [searchQuery]);

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
  };

  const handlePrev = () => {
    setSelectedImageIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : urlsToDisplay.length - 1
    );
  };

  const handleNext = () => {
    setSelectedImageIndex((prevIndex) =>
      prevIndex < urlsToDisplay.length - 1 ? prevIndex + 1 : 0
    );
  };

  const handleDownload = async (imageUrl) => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "downloaded-image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Search Component */}
      <div className="flex flex-col justify-center items-center p-32 bg-[#DCE3EB]">
        <div className="bg-white shadow-lg p-3 rounded-lg lg:w-[100%] w-[100%] flex gap-3">
          <CiSearch className="text-2xl text-gray-500" />
          <input
            type="text"
            placeholder="Search for photos"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full outline-none"
          />
        </div>

        {!isDefaultSearch && searchTerm && (
          <h2 className="text-center text-2xl font-semibold mt-5 text-[#263343]">
            Search results for{" "}
            <span className="text-[#72778B] font-bold">
              &quot;{searchTerm}&quot;
            </span>
          </h2>
        )}
      </div>

      {/* Image Grid Component */}
      <div className="lg:grid lg:grid-cols-3 grid-cols-1 gap-5 lg:px-48 -mt-10 pb-20">
        {loadingImages
          ? Array(8)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="w-full h-60 bg-gray-300 animate-pulse duration-50 rounded-lg"></div>
              ))
          : urlsToDisplay.map((url, index) => (
              <div
                key={index}
                className="relative rounded-lg overflow-hidden cursor-pointer group lg:py-0 py-2 ml-2 mr-2"
                onClick={() => handleImageClick(index)}>
                {/* Image */}
                <img
                  src={url.urls.small}
                  alt={url.alt_description}
                  className="w-full h-60 object-cover rounded-lg group-hover:scale-120 transition ease-in-out duration-300"
                />

                {/* Hover Overlay */}
                <div className="flex justify-between absolute bottom-0 left-0 w-full p-5 text-white bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div>
                    <h1 className="text-lg font-semibold">{url.user.name}</h1>
                    <p className="text-sm text-stone-400">
                      {url.user.location || "Unknown"}
                    </p>
                  </div>

                  <div>
                    <button
                      onClick={() =>
                        handleDownload(
                          urlsToDisplay[selectedImageIndex].urls.full
                        )
                      }
                      className="mt-3 text-white bg-black hover:bg-[#111] transition ease-in-out duration-300 rounded p-2 flex gap-3 cursor-pointer">
                      Download <GoDownload />
                    </button>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* Modal Component */}
      {selectedImageIndex !== null && urlsToDisplay[selectedImageIndex] && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 flex items-center justify-center bg-black/70">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative p-5">
              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="absolute z-100 top-10 right-10 text-white text-3xl cursor-pointer"
                onClick={() => setSelectedImageIndex(null)}>
                <IoClose />
              </motion.button>

              {/* Previous Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute left-0 z-100 top-1/2 transform -translate-y-1/2 bg-black/50 p-3 rounded-full text-white text-xl hover:bg-black transition"
                onClick={handlePrev}>
                <FaChevronLeft />
              </motion.button>

              {/* Next Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute right-0 z-100 top-1/2 transform -translate-y-1/2 bg-black/50 p-3 rounded-full text-white text-xl hover:bg-black transition"
                onClick={handleNext}>
                <FaChevronRight />
              </motion.button>

              {/* Image with Slide Animation */}
              <div className="flex flex-col items-center w-fit mx-auto relative">
                <motion.img
                  key={selectedImageIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4 }}
                  src={urlsToDisplay[selectedImageIndex].urls.regular}
                  alt={urlsToDisplay[selectedImageIndex].alt_description}
                  className="max-h-[80vh] w-auto object-contain"
                />

                <div className="p-5 bg-white flex justify-between w-full">
                  <div>
                    <h1 className="text-lg font-semibold text-[#263343]">
                      {urlsToDisplay[selectedImageIndex].user.name}
                    </h1>
                    <p className="textsm text-stone-500">
                      {urlsToDisplay[selectedImageIndex].user.location ||
                        "Unknown"}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleDownload(
                        urlsToDisplay[selectedImageIndex].urls.full
                      )
                    }
                    className="mt-3 text-white bg-black rounded p-2 flex gap-3 cursor-pointer hover:bg-[#111] transition ease-in-out duration-300">
                    Free Download <GoDownload />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

export default App;
