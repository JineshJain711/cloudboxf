import React from 'react';

const Input = ({ label, type = 'text', ...props }) => {
    return (
        <div className="mb-4">
            {label && <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>}
            <input
                type={type}
                className="w-full px-4 py-2 glass-input rounded-lg focus:ring-2 focus:ring-indigo-500"
                {...props}
            />
        </div>
    );
};

export default Input;
