import React, { useRef, useState } from 'react';
import { Upload, X, Check } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import Button from './Button';

const FileUpload = ({ onUploadSuccess }) => {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        // Add dummy name/description if needed, or backend handles it
        formData.append("fileName", file.name);

        setUploading(true);
        try {
            const { data } = await api.post('/file/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (data.success) {
                toast.success("File uploaded successfully!");
                setFile(null);
                if (onUploadSuccess) onUploadSuccess();
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full glass-card rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-400" /> Upload File
            </h3>

            <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${dragActive ? 'border-indigo-400 bg-indigo-500/10' : 'border-gray-600 hover:border-gray-500'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    onChange={handleChange}
                />

                {!file ? (
                    <div className="flex flex-col items-center cursor-pointer" onClick={() => inputRef.current.click()}>
                        <Upload className="w-12 h-12 text-gray-400 mb-3" />
                        <p className="text-gray-300 font-medium">Drag & Drop or Click to Upload</p>
                        <p className="text-gray-500 text-sm mt-1">Supports images, docs, videos</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-lg mb-4">
                            <span className="text-white truncate max-w-[200px]">{file.name}</span>
                            <button onClick={() => setFile(null)} className="p-1 hover:bg-white/10 rounded-full">
                                <X className="w-4 h-4 text-red-400" />
                            </button>
                        </div>

                        <div className="w-48">
                            <Button onClick={handleUpload} isLoading={uploading}>
                                Upload Now
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUpload;
