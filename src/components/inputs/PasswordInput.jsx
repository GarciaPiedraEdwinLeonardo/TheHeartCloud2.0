import { useState} from 'react';
import { 
  FaEye, 
  FaEyeSlash, 
  FaLock, 
} from 'react-icons/fa';

function PasswordInput({ label, name, value, onChange, placeholder = "••••••••", required = true }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaLock className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type={showPassword ? "text" : "password"}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          placeholder={placeholder}
          required={required}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition duration-200"
        >
          {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}

export default PasswordInput;