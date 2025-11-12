import { useState} from 'react';
import { 
  FaEnvelope
} from 'react-icons/fa';
import InputWithIcon from './../inputs/InputWithIcon';

function ForgotPasswordForm({ onBack }) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Recuperar contraseña para:', email);
    alert('Se ha enviado un correo de recuperación a: ' + email);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <p className="text-gray-600 text-sm mb-4">
          Ingresa tu correo electrónico y te enviaremos instrucciones para recuperar tu contraseña.
        </p>
        
        <label htmlFor="recoveryEmail" className="block text-sm font-medium text-gray-700 mb-2">
          Correo Electrónico
        </label>
        <InputWithIcon
          icon={FaEnvelope}
          type="email"
          id="recoveryEmail"
          name="recoveryEmail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          required
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 px-4 rounded-lg font-semibold transition duration-200"
        >
          Volver
        </button>
        <button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition duration-200 shadow-sm hover:shadow-md"
        >
          Enviar
        </button>
      </div>
    </form>
  );
}

export default ForgotPasswordForm;