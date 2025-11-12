import { IoMdMenu } from 'react-icons/io';

function Menu(){
    return(
        <button aria-label='abrir menu de navegacion' className='p-2 rounded-lg hover:bg-gray-100 transition duration-200 lg:hidden'>
            <IoMdMenu className='w-6 h-6 text-gray-600'/>
        </button>
    );
}

export default Menu;