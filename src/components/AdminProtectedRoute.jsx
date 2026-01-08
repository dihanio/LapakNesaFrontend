import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

/**
 * Protected Route specifically for Admin pages
 * Redirects to /admin/login if not authenticated or not admin/super_admin
 */
export const AdminProtectedRoute = ({ children }) => {
    const { user, token } = useAuthStore();

    // If not logged in, redirect to admin login
    if (!token || !user) {
        return <Navigate to="/admin/login" replace />;
    }

    // If logged in but not admin or super_admin, redirect to admin login
    if (user.role !== 'admin' && user.role !== 'super_admin') {
        return <Navigate to="/admin/login" replace />;
    }

    // If admin or super_admin, render children
    return children;
};

/**
 * Protected Route specifically for Super Admin only pages
 * Redirects to /admin/dashboard if not super_admin
 */
export const SuperAdminProtectedRoute = ({ children }) => {
    const { user, token } = useAuthStore();

    // If not logged in, redirect to admin login
    if (!token || !user) {
        return <Navigate to="/admin/login" replace />;
    }

    // If not super_admin, redirect to admin dashboard with message
    if (user.role !== 'super_admin') {
        return <Navigate to="/admin/dashboard" replace />;
    }

    // If super_admin, render children
    return children;
};

/**
 * Hook to check if current user is super admin
 */
export const useIsSuperAdmin = () => {
    const { user } = useAuthStore();
    return user?.role === 'super_admin';
};

/**
 * Hook to check if current user is admin or super admin
 */
export const useIsAdmin = () => {
    const { user } = useAuthStore();
    return user?.role === 'admin' || user?.role === 'super_admin';
};

export default AdminProtectedRoute;
