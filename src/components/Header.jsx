import { useState } from 'react';
import Logo from './Logo';
import DesktopSearch from './DesktopSearch';
import DesktopUserMenu from './DesktopUserMenu';
import MobileControls from './MobileControls';
import MenuModal from './modals/MenuModal';
import { Menu } from 'lucide-react';

function Header({ onToggleSidebar, onProfileClick, onSearch }) {
  const [showMobileModal, setShowMobileModal] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 md:py-4">
          
          <div className="flex items-center gap-4">
            <button 
              onClick={onToggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition duration-200 lg:hidden"
              aria-label="Abrir menú de navegación"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <Logo />
          </div>
          
          <DesktopSearch onSearch={onSearch} />
          
          <DesktopUserMenu onProfileClick={onProfileClick} />

          <div className="flex items-center gap-2 lg:hidden">
            <MobileControls 
              onShowMenu={() => setShowMobileModal(true)}
              onSearch={onSearch}
            />
          </div>
        
        </div>
      </div>

      <MenuModal 
        isOpen={showMobileModal}
        onClose={() => setShowMobileModal(false)}
        onProfileClick={onProfileClick}
      />
    </header>
  );
}

export default Header;