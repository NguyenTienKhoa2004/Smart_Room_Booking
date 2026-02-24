import { useState, useEffect } from 'react';
import Navbar from "../components/Navbar";
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Navigate } from 'react-router-dom';
import RoomFilter from '../components/dashboard/RoomFilter';
import RoomCard from '../components/dashboard/RoomCard';
import UserBookingSidebar from '../components/dashboard/UserBookingSidebar';
import type { Room, RoomFilterState, Booking } from '../types/room';
import { getRooms, getUserBookings, cancelBooking, createBooking } from '../services/api';

const Dashboard = () => {
    const { user, isLoading: authLoading } = useAuth();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoadingRooms, setIsLoadingRooms] = useState(false);
    const [isLoadingBookings, setIsLoadingBookings] = useState(false);
    const [filters, setFilters] = useState<RoomFilterState>({
        equipment: [],
        capacity: undefined,
        floor: undefined,
        start_time: undefined,
        end_time: undefined
    });

    const fetchRooms = async () => {
        setIsLoadingRooms(true);
        try {
            const data = await getRooms(filters);
            setRooms(data || []);
        } catch (error) {
            console.error('Failed to fetch rooms:', error);
        } finally {
            setIsLoadingRooms(false);
        }
    };

    const fetchBookings = async () => {
        setIsLoadingBookings(true);
        try {
            const data = await getUserBookings();
            const sorted = (data || []).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
            setBookings(sorted);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setIsLoadingBookings(false);
        }
    };


    useEffect(() => {
        if (!authLoading && user) {
            fetchRooms();
            fetchBookings();
        }
    }, [filters, authLoading, user]);

    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return;

        socket.on('room_status_update', (data: any) => {
            console.log('Room status updated:', data);
            fetchRooms();
            fetchBookings();
        });

        return () => {
            socket.off('room_status_update');
        };
    }, [socket, filters]);


    const handleBookRoom = async (room: Room) => {
        if (!filters.start_time || !filters.end_time) {
            alert('Please select a start and end time to book a room.');
            return;
        }

        const title = prompt(`Enter a title for your booking of ${room.name} from ${filters.start_time.toLocaleTimeString()} to ${filters.end_time.toLocaleTimeString()}:`);

        if (title) {
            try {
                await createBooking({
                    room_id: room.id,
                    title,
                    start_time: filters.start_time.toISOString(),
                    end_time: filters.end_time.toISOString()
                });
                alert('Booking successful!');
                fetchRooms();
                fetchBookings();
            } catch (error: any) {
                alert(`Booking failed: ${error.response?.data?.message || 'Unknown error'}`);
            }
        }
    };

    const handleCancelBooking = async (bookingId: number) => {
        if (confirm('Are you sure you want to cancel this booking?')) {
            try {
                await cancelBooking(bookingId);
                fetchBookings();
                fetchRooms();
            } catch (error) {
                console.error('Failed to cancel booking:', error);
                alert('Failed to cancel booking');
            }
        }
    };

    if (authLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    if (user && user.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-1 flex overflow-hidden">
                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-6xl mx-auto">
                        <RoomFilter filters={filters} onFilterChange={setFilters} />

                        {isLoadingRooms ? (
                            <div className="flex justify-center p-12">
                                <div className="spinner-border animate-spin h-8 w-8 border-b-2 border-indigo-600 rounded-full"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {rooms.length > 0 ? (
                                    rooms.map(room => (
                                        <RoomCard key={room.id} room={room} onBook={handleBookRoom} />
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                                        No rooms found matching your filters.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="w-80 shrink-0 bg-white shadow-xl z-20">
                    <UserBookingSidebar
                        bookings={bookings}
                        onCancel={handleCancelBooking}
                        isLoading={isLoadingBookings}
                    />
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
