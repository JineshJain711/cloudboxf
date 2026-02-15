import React, { useState, useRef, useEffect } from 'react';

const OtpInput = ({ length = 6, onOtpChange }) => {
    const [otp, setOtp] = useState(new Array(length).fill(""));
    const inputRefs = useRef([]);

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (index, e) => {
        const value = e.target.value;
        if (isNaN(value)) return;

        const newOtp = [...otp];
        // Allow only one digit
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Trigger callback
        const combinedOtp = newOtp.join("");
        onOtpChange(combinedOtp);

        // Move to next input if current field is filled
        if (value && index < length - 1 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleClick = (index) => {
        inputRefs.current[index].setSelectionRange(1, 1);
        // Optional: if previous empty, focus that instead? 
        // For now, simple behavior is fine.
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
            // Move to previous input on backspace if current is empty
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData("text").slice(0, length);
        if (!/^\d+$/.test(data)) return;

        const newOtp = [...otp];
        data.split("").forEach((char, i) => {
            newOtp[i] = char;
        });
        setOtp(newOtp);
        onOtpChange(newOtp.join(""));

        // Focus last filled
        const focusIndex = Math.min(data.length, length - 1);
        inputRefs.current[focusIndex].focus();
    };

    return (
        <div className="flex justify-between gap-2 my-6">
            {otp.map((value, index) => (
                <input
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    type="text"
                    value={value}
                    onChange={(e) => handleChange(index, e)}
                    onClick={() => handleClick(index)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center text-xl font-bold rounded-lg glass-input focus:ring-2 focus:ring-indigo-500 transition-all border border-white/10 bg-black/30 text-white"
                />
            ))}
        </div>
    );
};

export default OtpInput;
