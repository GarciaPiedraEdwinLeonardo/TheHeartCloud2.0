import { useState } from 'react';
import PersonalDataSection from '../minisections/PersonalDataSection';
import ProfessionalDataSection from '../minisections/ProfessionalDataSection';

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

    try {
      // Validaciones
      if (registerData.password !== registerData.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }
      
      if (registerData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }
      
      if (!cedulaFile) {
        throw new Error('Por favor, sube tu cédula profesional');
      }

      // Registrar usuario
      const result = await AuthService.registerUser(registerData, cedulaFile);
      
      if (result.success) {
        // Éxito - podrías redirigir o mostrar mensaje
        alert('¡Registro exitoso! Tu cuenta está pendiente de verificación.');
        onSwitchToLogin(); // Volver al login
      }
      
    } catch (error) {
      console.error('Error en registro:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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
          className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold transition duration-200"
        >
          Volver a Login
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 px-4 rounded-lg font-semibold transition duration-200 shadow-sm hover:shadow-md flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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