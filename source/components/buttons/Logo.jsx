import logo from './../../img/logoprincipal.png'

function Logo(){
    return(
        <div className="flex items-center flex-shrink-0">

            <img src={logo} alt="TheHeartCloudLogo" className='w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 mr-2 lg:mr-3' />

            <h1 className='text-lg md:text-xl lg:text-2xl font-bold text-blue-600 whitespace-nowrap'>TheHeartCloud</h1>

        </div>
    );
}

export default Logo;