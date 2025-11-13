import VerificationPanel from "./admin/VerificationPanel";
import Header from "./sections/Header";

function Home(){
    return(
        <div className="min-h-screen bg-gray-50">

            <Header/>

            <div className="flex">

                <VerificationPanel/>

                {/* Sidebar para web */}
                {/*<Sidebar/>*/}

                {/* Sidebar Modal Responsive */}
                {/*<SidebarModal/>*/}

                {/* Contenido Principal "Main" 
                <div className="flex-1 min-w-0 flex justify-center">

                    <div className="w-full max-w-7x1">
                        <Main/>
                        /* <ProfileView/> */
                        /* <SearchResults/> */
                        /* <ThemeView/> */
                        /* <PostDetailView> 
                    </div>

                </div>*/}

            </div>

        </div>
    );
}

export default Home;