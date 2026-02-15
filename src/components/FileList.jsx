import React, { useEffect, useState } from 'react';
import { FileText, Download, Trash2, ExternalLink, Edit2 } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import Modal from './Modal';

const FileList = ({ refreshTrigger }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, fileId: null });
    const [renameModal, setRenameModal] = useState({ isOpen: false, fileId: null, currentName: '' });
    const [newName, setNewName] = useState('');

    const fetchFiles = async () => {
        try {
            const { data } = await api.get('/file/my-files');
            if (data.success) {
                setFiles(data.files);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load files");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, [refreshTrigger]);

    // Handle Delete
    const openDeleteModal = (id) => {
        setDeleteModal({ isOpen: true, fileId: id });
    };

    const confirmDelete = async () => {
        if (!deleteModal.fileId) return;

        try {
            const { data } = await api.delete(`/file/${deleteModal.fileId}`);
            if (data.success) {
                toast.success("File deleted");
                fetchFiles();
                setDeleteModal({ isOpen: false, fileId: null });
            }
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    // Handle Rename
    const openRenameModal = (id, fileName) => {
        setRenameModal({ isOpen: true, fileId: id, currentName: fileName });
        setNewName(fileName);
    };

    const confirmRename = async () => {
        if (!renameModal.fileId || !newName || newName === renameModal.currentName) {
            setRenameModal({ isOpen: false, fileId: null, currentName: '' });
            return;
        }

        try {
            const { data } = await api.put(`/file/${renameModal.fileId}/rename`, { newName });
            if (data.success) {
                toast.success("File renamed");
                fetchFiles();
                setRenameModal({ isOpen: false, fileId: null, currentName: '' });
            }
        } catch (error) {
            console.error(error);
            toast.error("Rename failed");
        }
    };

    const handleDownload = async (id, fileName) => {
        try {
            // Get download URL from backend
            const { data } = await api.get(`/file/download/${id}`);

            if (data.success && data.downloadUrl) {
                // Fetch the file content as a blob
                const response = await fetch(data.downloadUrl);
                const blob = await response.blob();

                // Create object URL
                const url = window.URL.createObjectURL(blob);

                // Create temporary anchor to trigger download with correct name
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();

                // Cleanup
                link.parentNode.removeChild(link);
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error(error);
            toast.error("Download failed to start");
        }
    };

    if (loading) return <div className="text-center py-10 text-gray-400">Loading files...</div>;
    if (files.length === 0) return <div className="text-center py-10 text-gray-400">No files uploaded yet.</div>;

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {files.map((file) => (
                    <div key={file._id} className="glass-card p-5 rounded-xl flex flex-col group hover:bg-white/15 transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-indigo-500/20 rounded-lg">
                                <FileText className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleDownload(file._id, file.fileName)}
                                    className="p-2 hover:bg-white/10 rounded-lg text-blue-300"
                                    title="Download"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => openRenameModal(file._id, file.fileName)}
                                    className="p-2 hover:bg-white/10 rounded-lg text-yellow-300"
                                    title="Rename"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => openDeleteModal(file._id)}
                                    className="p-2 hover:bg-white/10 rounded-lg text-red-400"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <h4 className="font-medium text-white truncate mb-1" title={file.fileName}>
                            {file.fileName}
                        </h4>
                        <p className="text-xs text-gray-400 mb-4">
                            {new Date(file.createdAt).toLocaleDateString()}
                        </p>

                        <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center bg-transparent">
                            <span className="text-xs text-gray-500">READY</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Delete Modal */}
            <Modal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, fileId: null })}
                title="Delete File"
            >
                <div className="space-y-4">
                    <p className="text-gray-300">
                        Are you sure you want to delete this file? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setDeleteModal({ isOpen: false, fileId: null })}
                            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Rename Modal */}
            <Modal
                isOpen={renameModal.isOpen}
                onClose={() => setRenameModal({ isOpen: false, fileId: null, currentName: '' })}
                title="Rename File"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            New Filename
                        </label>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                            placeholder="Enter new filename"
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setRenameModal({ isOpen: false, fileId: null, currentName: '' })}
                            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmRename}
                            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
                        >
                            Rename
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default FileList;
