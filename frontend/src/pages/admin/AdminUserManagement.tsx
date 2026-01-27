import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { adminService, type AdminUser } from '../../services/admin.service';
import {
    Ban,
    CheckCircle,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Shield
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const AdminUserManagement = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState('');

    const fetchUsers = async (pageNum: number) => {
        setLoading(true);
        try {
            const data = await adminService.getAllUsers(pageNum);
            setUsers(data.users);
            setTotalPages(data.totalPages);
            setPage(data.page);
        } catch (err) {
            console.error('Failed to fetch users', err);
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(page);
    }, [page]);

    const handleBanUser = async (userId: number) => {
        if (!confirm('Are you sure you want to ban this user?')) return;

        try {
            await adminService.banUser(userId);
            toast.success('User banned successfully');
            fetchUsers(page);
        } catch (err: any) {
            console.error('Failed to ban user', err);
            toast.error(err.response?.data?.message || 'Failed to ban user');
        }
    };

    const handleUnbanUser = async (userId: number) => {
        if (!confirm('Are you sure you want to unban this user?')) return;

        try {
            await adminService.unbanUser(userId);
            toast.success('User unbanned successfully');
            fetchUsers(page);
        } catch (err: any) {
            console.error('Failed to unban user', err);
            toast.error(err.response?.data?.message || 'Failed to unban user');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Toaster position="top-right" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                        <p className="mt-1 text-sm text-gray-500">Manage system users, view status, and moderate access.</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                        <div className="flex">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                            <p className="ml-3 text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Joined
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="flex justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            No users found.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                            {user.full_name?.charAt(0).toUpperCase() || 'U'}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                                                        <div className="text-sm text-gray-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {user.role === 'admin' ? (
                                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 items-center w-fit gap-1">
                                                        <Shield className="w-3 h-3" /> Admin
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                        User
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {user.is_banned ? (
                                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 items-center w-fit gap-1">
                                                        <Ban className="w-3 h-3" /> Banned
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 items-center w-fit gap-1">
                                                        <CheckCircle className="w-3 h-3" /> Active
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {user.role !== 'admin' && (
                                                    user.is_banned ? (
                                                        <button
                                                            onClick={() => handleUnbanUser(user.id)}
                                                            className="text-green-600 hover:text-green-900 font-medium transition-colors"
                                                        >
                                                            Unban
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleBanUser(user.id)}
                                                            className="text-red-600 hover:text-red-900 font-medium transition-colors"
                                                        >
                                                            Ban
                                                        </button>
                                                    )
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        <span className="sr-only">Previous</span>
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        <span className="sr-only">Next</span>
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminUserManagement;
