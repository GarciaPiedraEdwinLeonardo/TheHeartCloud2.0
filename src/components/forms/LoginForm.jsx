import { useState} from 'react';
import { FaUser } from 'react-icons/fa';
import InputWithIcon from './../inputs/InputWithIcon';
import PasswordInput from './../inputs/PasswordInput';

function LoginForm({ onSwitchToRegister, onSwitchToForgotPassword }) {
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login data:', loginData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Correo Electrónico
        </label>
        <InputWithIcon
          icon={FaUser}
          type="email"
          id="email"
          name="email"
          value={loginData.email}
          onChange={handleChange}
          placeholder="tu@correo.com"
          required
        />
      </div>

      <div className="mb-6">
        <PasswordInput
          label="Contraseña"
          name="password"
          value={loginData.password}
          onChange={handleChange}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition duration-200 shadow-sm hover:shadow-md"
      >
        Ingresar
      </button>

      <div className="mt-6 text-center space-y-3">
        <div>
          <button
            type="button"
            onClick={onSwitchToForgotPassword}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition duration-200"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">o</span>
          </div>
        </div>

        <div>
          <p className="text-gray-600 text-sm">
            ¿No tienes cuenta?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-green-600 hover:text-green-800 font-semibold transition duration-200"
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </form>
  );
}

export default LoginForm;