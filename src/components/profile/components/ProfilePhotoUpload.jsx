import { useState, useRef } from 'react';
import { FaCamera, FaTimes, FaSpinner, FaUserCircle } from 'react-icons/fa';
import { useProfilePhoto } from './../hooks/useProfilePhoto';

function ProfilePhotoUpload({ currentPhoto, onPhotoUpdate, isOwnProfile = true }) {
  const [previewUrl, setPreviewUrl] = useState(currentPhoto);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null);
  
  const { uploadProfilePhoto, deleteProfilePhoto, uploading, error, clearError } = useProfilePhoto();

  // Solo permitir edición si es el perfil propio
  if (!isOwnProfile) {
    return (
      <div className="flex-shrink-0">
        {currentPhoto ? (
          <img
            src={currentPhoto}
            alt="Foto de perfil"
            className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
          />
        ) : (
          <FaUserCircle className="w-24 h-24 text-gray-400" />
        )}
      </div>
    );
  }

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Limpiar error anterior
    clearError();

    // Crear preview local
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);

    // Subir archivo a Cloudinary
    const cloudinaryUrl = await uploadProfilePhoto(file);
    if (cloudinaryUrl && onPhotoUpdate) {
      onPhotoUpdate(cloudinaryUrl);
    }
    
    // Limpiar input
    event.target.value = '';
  };

  const handleRemovePhoto = async () => {
    clearError();
    await deleteProfilePhoto();
    setPreviewUrl(null);
    if (onPhotoUpdate) {
      onPhotoUpdate(null);
    }
    setShowModal(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleOpenModal = () => {
    clearError();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    clearError();
    setShowModal(false);
  };

  return (
    <>
      <div className="relative group flex-shrink-0">
        {/* Foto de perfil actual */}
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Foto de perfil"
            className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 cursor-pointer transition duration-200 group-hover:brightness-90"
            onClick={handleOpenModal}
          />
        ) : (
          <div 
            className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer border-4 border-blue-100 transition duration-200 group-hover:bg-gray-200"
            onClick={handleOpenModal}
          >
            <FaUserCircle className="w-16 h-16 text-gray-400" />
          </div>
        )}

        {/* Botón de cámara flotante - Solo si es perfil propio */}
        {isOwnProfile && (
          <button
            onClick={handleOpenModal}
            className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 sm:p-2 rounded-full shadow-lg hover:bg-blue-700 transition duration-200 group-hover:scale-110 border-2 border-white"
            title="Cambiar foto de perfil"
            type="button"
          >
            <FaCamera className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </button>
        )}
      </div>

      {/* Modal de gestión de foto */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Foto de perfil
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
                disabled={uploading}
              >
                <FaTimes className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="text-center">
              {/* Preview actual */}
              <div className="flex justify-center mb-6">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                    <FaUserCircle className="w-20 h-20 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={triggerFileInput}
                  disabled={uploading}
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <FaCamera className="w-4 h-4" />
                      {previewUrl ? 'Cambiar foto' : 'Subir foto'}
                    </>
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                />

                {previewUrl && (
                  <button
                    onClick={handleRemovePhoto}
                    disabled={uploading}
                    className="flex items-center justify-center gap-2 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaTimes className="w-4 h-4" />
                    Eliminar foto
                  </button>
                )}

                <button
                  onClick={handleCloseModal}
                  disabled={uploading}
                  className="py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200 disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>

              {/* Información de formatos soportados */}
              <div className="mt-4 text-xs text-gray-500">
                Formatos soportados: JPG, PNG, WEBP. Máximo 5MB.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProfilePhotoUpload;