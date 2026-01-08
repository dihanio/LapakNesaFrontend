import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import useLoginModalStore from '../store/loginModalStore';

function ProtectedRoute({ children }) {
    const { isAuthenticated, user } = useAuthStore();
    const { openLoginModal } = useLoginModalStore();

    useEffect(() => {
        if (!isAuthenticated) {
            openLoginModal();
        }
    }, [isAuthenticated, openLoginModal]);

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Redirect admin/super_admin to admin dashboard
    if (user?.role === 'admin' || user?.role === 'super_admin') {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return children;
}

export default ProtectedRoute;
