import Menu from "../buttons/Menu";
import Logo from "../buttons/Logo";
import DesktopSearch from "../navegation/search/DesktopSearch";
import DesktopUserMenu from "../navegation/search/DesktopUserMenu";
import MobileControls from "../navegation/search/MobileControls";

function Header(){
    return(
        <header className="bg-white shadow-sm sticky top-0 z-30">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="flex items-center justify-between py-3 md:py-4">

                    <div className="flex items-center gap-4">
                        
                        <Menu/>

                        <Logo/>

                    </div>

                    <DesktopSearch/>

                    <DesktopUserMenu/>

                    <div className="flex items-center gap-2 lg:hidden">
                        <MobileControls/>
                    </div>

                </div>

            </div>

        </header>
    );
}

export default Header;