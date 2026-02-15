import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OtpInput from '../components/OtpInput';
import Button from '../components/Button';
import { motion } from 'framer-motion';

const OTP = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const { state } = useLocation();
    const { verifyOtp } = useAuth();
    const navigate = useNavigate();

    // If no email in state (e.g. direct access), redirect or show error.
    const email = state?.email || '';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            // Optional: show error if not complete
            return;
        }
        setLoading(true);
        const success = await verifyOtp(email, otp);
        setLoading(false);

        if (success) {
            navigate('/login');
        }
    };

    if (!email) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                <p>No email provided. Please sign up first.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 rounded-2xl w-full max-w-md relative z-10"
            >
                <h2 className="text-2xl font-bold text-center mb-2 text-white">
                    Verify Email
                </h2>
                <p className="text-center text-gray-400 mb-6 text-sm">
                    Enter the code sent to <br /> <span className="text-green-400">{email}</span>
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="flex justify-center mb-6">
                        <OtpInput length={6} onOtpChange={setOtp} />
                    </div>

                    <div className="mt-6">
                        <Button type="submit" isLoading={loading}>
                            Verify My Account
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default OTP;
