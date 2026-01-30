import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ children, isLoading, ...props }) => {
    return (
        <button
            className="w-full btn-primary flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={isLoading}
            {...props}
        >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : children}
        </button>
    );
};

export default Button;
