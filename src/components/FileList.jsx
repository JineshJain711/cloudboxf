import React, { useEffect, useState } from 'react';
import { FileText, Download, Trash2, ExternalLink } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';

const FileList = ({ refreshTrigger }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;

        try {
            const { data } = await api.delete(`/file/${id}`);
            if (data.success) {
                toast.success("File deleted");
                fetchFiles();
            }
        } catch (error) {
            toast.error("Delete failed");
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {files.map((file) => (
                <div key={file._id} className="glass-card p-5 rounded-xl flex flex-col group hover:bg-white/15 transition-all">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-indigo-500/20 rounded-lg">
                            <FileText className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => handleDownload(file._id, file.fileName)}
                                className="p-2 hover:bg-white/10 rounded-lg text-blue-300"
                                title="Download"
                            >
                                <Download className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(file._id)}
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
                        <a
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                        >
                            Preview <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FileList;
