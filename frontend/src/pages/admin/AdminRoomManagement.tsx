import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { adminService, type Room } from '../../services/admin.service';
import { Plus, Trash2, Home, Users, Image as ImageIcon } from 'lucide-react';

const AdminRoomManagement = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [newRoom, setNewRoom] = useState({
        name: '',
        capacity: 0,
        floor: 1,
        equipment: '',
        imageUrl: '',
        uploadedImage: ''
    });

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const data = await adminService.getAllRooms();
            setRooms(data);
        } catch (err) {
            setError('Failed to fetch rooms');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadFromUrl = async () => {
        if (!newRoom.imageUrl) return;
        setUploading(true);
        try {
            const s3Url = await adminService.uploadImageFromUrl(newRoom.imageUrl);
            setNewRoom(prev => ({ ...prev, uploadedImage: s3Url }));
            alert('Image uploaded successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to upload image from URL');
        } finally {
            setUploading(false);
        }
    };

    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const roomData = {
                name: newRoom.name,
                capacity: Number(newRoom.capacity),
                floor: Number(newRoom.floor),
                equipment: newRoom.equipment.split(',').map(s => s.trim()),
                image_url: newRoom.uploadedImage || undefined,
                is_active: true
            };

            await adminService.createRoom(roomData);
            setIsAddModalOpen(false);
            fetchRooms();
            setNewRoom({
                name: '', capacity: 0, floor: 1,
                equipment: '', imageUrl: '', uploadedImage: ''
            });
        } catch (err) {
            console.error(err);
            alert('Failed to create room');
        }
    };

    const handleDeleteRoom = async (id: number) => {
        if (confirm('Are you sure you want to delete this room?')) {
            try {
                await adminService.deleteRoom(id);
                fetchRooms();
            } catch (err) {
                console.error(err);
                alert('Failed to delete room');
            }
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Room Management</h1>
                        <p className="mt-1 text-sm text-gray-500">Manage meeting rooms and facilities</p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Add New Room
                    </button>
                </div>

                {/* Room Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map((room) => (
                        <div key={room.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="h-48 bg-gray-200 relative">
                                {room.image_url ? (
                                    <div className="relative w-full h-full">
                                        <img src={room.image_url} alt={room.name} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">

                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                        <ImageIcon className="h-12 w-12 mb-2" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2">
                                    <button onClick={() => handleDeleteRoom(room.id)} className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 shadow-sm">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="text-lg font-bold text-gray-900">{room.name}</h3>
                                <div className="mt-4 flex items-center justify-between text-sm">
                                    <div className="flex items-center text-gray-600">
                                        <Users className="h-4 w-4 mr-1" />
                                        {room.capacity} People
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <Home className="h-4 w-4 mr-1" />
                                        Floor {room.floor}
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {room.equipment && room.equipment.slice(0, 3).map((item, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                                            {item}
                                        </span>
                                    ))}
                                    {room.equipment && room.equipment.length > 3 && (
                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">+{room.equipment.length - 3}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Add Room Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Add New Room</h2>
                        </div>
                        <form onSubmit={handleCreateRoom} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Room Name</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    value={newRoom.name}
                                    onChange={e => setNewRoom({ ...newRoom, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Capacity</label>
                                    <input
                                        type="number"
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                        value={newRoom.capacity}
                                        onChange={e => setNewRoom({ ...newRoom, capacity: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Floor</label>
                                    <input
                                        type="number"
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                        value={newRoom.floor}
                                        onChange={e => setNewRoom({ ...newRoom, floor: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Equipment (comma separated)</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    placeholder="Projector, Whiteboard, WiFi"
                                    value={newRoom.equipment}
                                    onChange={e => setNewRoom({ ...newRoom, equipment: e.target.value })}
                                />
                            </div>

                            {/* Image Upload Section */}
                            <div className="border-t pt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Room Image</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                        placeholder="Paste image URL here"
                                        value={newRoom.imageUrl}
                                        onChange={e => setNewRoom({ ...newRoom, imageUrl: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleUploadFromUrl}
                                        disabled={uploading || !newRoom.imageUrl}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
                                    >
                                        {uploading ? '...' : 'Upload'}
                                    </button>
                                </div>
                                {newRoom.uploadedImage && (
                                    <div className="mt-2 relative w-full h-32 bg-gray-100 rounded-md overflow-hidden">
                                        <img src={newRoom.uploadedImage} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                                            Image Uploaded to S3
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                >
                                    Create Room
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminRoomManagement;
