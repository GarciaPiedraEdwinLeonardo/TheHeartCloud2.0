import { IoMdMenu } from 'react-icons/io';
import MobileSearchButton from '../../buttons/MobileSearchButton';

function MobileControls() {
  return (
    <div className="flex lg:hidden items-center gap-2">
      {/* Botón de búsqueda móvil */}
      <MobileSearchButton/>
      
      <button 
        className="text-gray-600 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-100 transition duration-200"
      >
        <IoMdMenu className='w-6 h-6'/>
      </button>
    </div>
  );
}

export default MobileControls;