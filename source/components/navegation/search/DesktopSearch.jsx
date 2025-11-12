import { FaSearch } from 'react-icons/fa';

function DesktopSearch(){
    return(
        <div className='hidden lg:flex flex-1 max-w-lg mx-4'>

            <form className='flex w-full'>
                
                <input type="text" placeholder='¿Qué estas buscando?' className='flex-1 px-4 py-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm' />

                <button type='submit' className='bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center min-w-[45px]'>

                    <FaSearch className='w-4 h-4'/>

                </button>

            </form>

        </div>
    );
}

export default DesktopSearch;