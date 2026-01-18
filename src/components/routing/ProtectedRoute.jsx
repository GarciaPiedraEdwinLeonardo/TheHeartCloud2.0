import { Navigate } from 'react-router-dom';
import { auth } from '../../config/firebase';

/**
 * Componente para proteger rutas que requieren autenticación
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componente a renderizar si está autenticado
 * @param {string[]} props.allowedRoles - Roles permitidos para acceder (opcional)
 * @param {Object} props.userData - Datos del usuario actual (opcional)
 */
function ProtectedRoute({ children, allowedRoles = null, userData = null }) {
    const user = auth.currentUser;

    // Si no hay usuario, redirigir a login
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // Si se especificaron roles permitidos, verificar
    if (allowedRoles && userData) {
        const userRole = userData.role;
        
        if (!allowedRoles.includes(userRole)) {
            // Si el usuario no tiene un rol permitido, redirigir a home
            return <Navigate to="/home" replace />;
        }
    }

    // Usuario autenticado y con permisos, renderizar children
    return children;
}

export default ProtectedRoute;