import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [refresh, setRefresh] = useState(0);

    const handleUploadSuccess = () => {
        setRefresh(prev => prev + 1);
    };

    return (
        <div className="min-h-screen p-6 md:p-12 relative">
            {/* Ambient Background */}
            <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black -z-10"></div>

            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                        CloudBox
                    </h1>
                    <p className="text-gray-400">Welcome back, {user?.name}</p>
                </div>

                <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                    <LogOut className="w-4 h-4" /> Sign Out
                </button>
            </header>

            <main className="max-w-6xl mx-auto">
                <FileUpload onUploadSuccess={handleUploadSuccess} />

                <div className="mt-10">
                    <h2 className="text-xl font-semibold mb-6 text-gray-200 border-b border-gray-700 pb-2">Your Files</h2>
                    <FileList refreshTrigger={refresh} />
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
