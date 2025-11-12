import { 
  FaUser, 
} from 'react-icons/fa';
import InputWithIcon from './../inputs/InputWithIcon';
import PasswordInput from './../inputs/PasswordInput';

function PersonalDataSection({ data, onChange }) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
        DATOS PERSONALES
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="apellidoPaterno" className="block text-sm font-medium text-gray-700 mb-2">
            Apellido Paterno *
          </label>
          <input
            type="text"
            id="apellidoPaterno"
            name="apellidoPaterno"
            value={data.apellidoPaterno}
            onChange={onChange}
            className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            required
          />
        </div>

        <div>
          <label htmlFor="apellidoMaterno" className="block text-sm font-medium text-gray-700 mb-2">
            Apellido Materno *
          </label>
          <input
            type="text"
            id="apellidoMaterno"
            name="apellidoMaterno"
            value={data.apellidoMaterno}
            onChange={onChange}
            className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="nombres" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre(s) *
          </label>
          <input
            type="text"
            id="nombres"
            name="nombres"
            value={data.nombres}
            onChange={onChange}
            className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="registerEmail" className="block text-sm font-medium text-gray-700 mb-2">
            Correo Electrónico *
          </label>
          <InputWithIcon
            icon={FaUser}
            type="email"
            id="registerEmail"
            name="email"
            value={data.email}
            onChange={onChange}
            placeholder="tu@correo.com"
            required
          />
        </div>

        <div>
          <PasswordInput
            label="Contraseña *"
            name="password"
            value={data.password}
            onChange={onChange}
          />
        </div>

        <div>
          <PasswordInput
            label="Confirmar Contraseña *"
            name="confirmPassword"
            value={data.confirmPassword}
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  );
}

export default PersonalDataSection;