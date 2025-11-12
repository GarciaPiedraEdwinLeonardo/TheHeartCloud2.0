// forms/RegisterForm.jsx
import { useState } from 'react';
import PersonalDataSection from '../minisections/PersonalDataSection';
import ProfessionalDataSection from '../minisections/ProfessionalDataSection';
import { authService } from '../../services/auth';

function RegisterForm({ onSwitchToLogin }) {
  const [cedulaFile, setCedulaFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [registerData, setRegisterData] = useState({
    apellidoPaterno: '',
    apellidoMaterno: '',
    nombres: '',
    email: '',
    password: '',
    confirmPassword: '',
    cedulaProfesional: '',
    paisEmision: '',
    especialidadMedica: '',
    institucion: '',
    anioTitulacion: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    console.log('Datos del formulario:', registerData);
    console.log('Archivo de cédula:', cedulaFile);

    // Validaciones
    if (registerData.password !== registerData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }
    
    if (registerData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsLoading(false);
      return;
    }
    
    if (!cedulaFile) {
      setError('Por favor, sube tu cédula profesional');
      setIsLoading(false);
      return;
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(cedulaFile.type)) {
      setError('El archivo debe ser JPEG, PNG o PDF');
      setIsLoading(false);
      return;
    }

    // Validar tamaño (max 5MB)
    if (cedulaFile.size > 5 * 1024 * 1024) {
      setError('El archivo no debe superar los 5MB');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Llamando a authService.registerUser...');
      const result = await authService.registerUser(registerData, cedulaFile);

      console.log('Resultado del registro:', result);
      
      if (result.success) {
        // Registro exitoso - puedes redirigir o mostrar mensaje
        alert('¡Registro exitoso! Tu cuenta está pendiente de verificación.');
        onSwitchToLogin(); // Volver al login
      } else {
        setError(result.error);
        console.error('Error en registro:', result.error);
      }
    } catch (error) {
      console.error('Error capturado en handleSubmit:', error);
      setError('Error en el registro. Intenta nuevamente.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Mostrar error si existe */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <PersonalDataSection data={registerData} onChange={handleChange} />
      
      <ProfessionalDataSection
        data={registerData}
        onChange={handleChange}
        cedulaFile={cedulaFile}
        onFileChange={setCedulaFile}
        onRemoveFile={() => setCedulaFile(null)}
      />

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onSwitchToLogin}
          disabled={isLoading}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 px-4 rounded-lg font-semibold transition duration-200 disabled:opacity-50"
        >
          Volver a Login
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition duration-200 shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Registrando...
            </>
          ) : (
            'Registrarse'
          )}
        </button>
      </div>
    </form>
  );
}

export default RegisterForm;