import { Link, useNavigate } from 'react-router-dom';
import { Calendar, User, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-white/60 backdrop-blur-lg shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="shrink-0 flex items-center gap-2">
                            <span className="font-bold text-xl text-gray-900">SmartBook</span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                {user.role !== 'admin' && (
                                    <Link
                                        to="/dashboard"
                                        className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                                    >
                                        <LayoutDashboard className="h-4 w-4" />
                                        Let's book it
                                    </Link>
                                )}
                                <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-md">
                                    <User className="h-4 w-4 text-blue-600" />
                                    {user.full_name}
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="text-red-600 hover:text-red-700 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                                >
                                    <LogIn className="h-4 w-4" />
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                                >
                                    <User className="h-4 w-4" />
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
