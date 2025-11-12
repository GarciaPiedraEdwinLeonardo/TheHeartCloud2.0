import { useState } from 'react';
import PersonalDataSection from './../sections/PersonalDataSection';
import ProfessionalDataSection from '../sections/ProfessionalDataSection';

function RegisterForm({ onSwitchToLogin }) {
  const [cedulaFile, setCedulaFile] = useState(null);
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    if (!cedulaFile) {
      alert('Por favor, sube tu cédula profesional');
      return;
    }
    
    console.log('Register data:', registerData);
    console.log('Cédula file:', cedulaFile);
  };

  return (
    <form onSubmit={handleSubmit}>
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
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 px-4 rounded-lg font-semibold transition duration-200"
        >
          Volver a Login
        </button>
        <button
          type="submit"
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition duration-200 shadow-sm hover:shadow-md"
        >
          Registrarse
        </button>
      </div>
    </form>
  );
}

export default RegisterForm;