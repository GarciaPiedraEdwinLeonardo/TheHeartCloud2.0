// components/PostImages.jsx
import { useState } from 'react';
import { FaExpand, FaTimes } from 'react-icons/fa';

function PostImages({ images }) {
  const [expandedImage, setExpandedImage] = useState(null);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-1 gap-3">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <img
              src={image.url}
              alt={`Imagen ${index + 1} del post`}
              className="w-full max-h-96 object-contain rounded-lg border border-gray-200 cursor-pointer"
              onClick={() => setExpandedImage(image)}
            />
            <button
              onClick={() => setExpandedImage(image)}
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FaExpand className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Modal para imagen expandida */}
      {expandedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={expandedImage.url}
              alt="Imagen expandida"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-4 right-4 bg-white text-gray-800 p-2 rounded-full hover:bg-gray-200 transition duration-200"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default PostImages;