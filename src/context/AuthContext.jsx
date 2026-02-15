import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const { data } = await api.get('/auth/me'); // Verify token
                    if (data.success) {
                        setUser(data.user);
                    } else {
                        // Token invalid/expired according to backend logic (though 401 usually throws)
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        setUser(null);
                    }
                } catch (error) {
                    console.error("Token verification failed:", error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email: email.trim().toLowerCase(), password });
            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setUser(data.user);
                toast.success("Welcome back!");
                return true;
            }
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || "Login failed";
            toast.error(msg);
            // Return error message if needed, or throw
            if (error.response?.status === 401 && error.response.data.message.includes("Not Verifyed")) {
                return "NOT_VERIFIED";
            }
            return false;
        }
    };

    const signup = async (name, email, password) => {
        try {
            const { data } = await api.post('/auth/signUp', { name, email: email.trim().toLowerCase(), password });
            // Backend returns 403 if registered but not verified (which is successful signup flow here)
            // or 200 if OTP sent
            // Actually backend code says: return res.status(403) if user exists but not verified (resends OTP)
            // return res.status(200) if fresh signup (sends OTP)

            toast.success(data.message || "OTP sent to your email!");
            return true;
        } catch (error) {
            // If 403 is returned for "User existed but not verified", axios throws
            if (error.response?.status === 403) {
                toast.info("User exists but not verified. OTP sent again.");
                return true;
            }

            console.error(error);
            toast.error(error.response?.data?.message || "Signup failed");
            return false;
        }
    };

    const verifyOtp = async (email, otp) => {
        try {
            const { data } = await api.post('/auth/verifyOtp', { email: email.trim().toLowerCase(), otp: otp.trim() });
            if (data.success) {
                toast.success("Email verified! Please login.");
                return true;
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Verification failed");
            if (error.response?.data?.warning) {
                toast.warning(error.response.data.warning);
            }
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        toast.info("Logged out successfully");
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, verifyOtp, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
