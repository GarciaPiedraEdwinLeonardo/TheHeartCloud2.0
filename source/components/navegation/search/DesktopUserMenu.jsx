import Login from "../../buttons/Login";
import Profile from "../../buttons/Profile";
import Notification from "../../buttons/Notification";


function DesktopUserMenu({ onProfileClick }){
    return(
        <div className="hidden lg:flex items-center gap-4">

            <Notification/>

            <Login/>

            <div className="bg-gray-100 rounded-full p-2 hover:bg-gray-200 transition duration-200">

                <Profile onProfileClick={onProfileClick}/>

            </div>

        </div>
    );
}

export default DesktopUserMenu;