import { FaTimes, FaUpload,FaFilePdf,} from 'react-icons/fa';

function FileUpload({ file, onFileChange, onRemoveFile }) {
  const handleChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(selectedFile.type)) {
        alert('Por favor, sube un archivo PDF, JPG o PNG');
        return;
      }
      
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('El archivo debe ser menor a 5MB');
        return;
      }
      
      onFileChange(selectedFile);
    }
  };

  return (
      <div>
        <label htmlFor="cedulaFile" className="block text-sm font-medium text-gray-700 mb-2">
          Cédula Profesional (Archivo) *
        </label>
        
        {!file ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition duration-200">
            <input
              type="file"
              id="cedulaFile"
              onChange={handleChange}
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
            />
            <label htmlFor="cedulaFile" className="cursor-pointer flex flex-col items-center">
              <FaUpload className="h-10 w-10 text-gray-400 mb-2" />
              <span className="text-sm font-medium text-gray-600">
                Haz clic para subir tu cédula profesional
              </span>
              <span className="text-xs text-gray-500 mt-1">
                PDF, JPG, PNG (Máx. 5MB)
              </span>
            </label>
          </div>
        ) : (
          <div className="border border-green-200 bg-green-50 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <FaFilePdf className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onRemoveFile}
              className="text-red-500 hover:text-red-700 transition duration-200"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
        )}
        
        <p className="text-xs text-gray-500 mt-2">
          * Sube una imagen o PDF de tu cédula profesional para verificación
        </p>
      </div>
    );
}

export default FileUpload;
