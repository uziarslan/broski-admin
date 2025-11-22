import React, { createContext, useState, useEffect } from "react";
import authService from "../services/authService";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await authService.getUser();
                if (user) {
                    setUser(user);
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchUser();
    }, []);


    const login = async (userData) => {
        const response = await authService.login(userData);
        if (response.data) {
            const loggedInUser = await authService.getUser();
            setUser(loggedInUser);
        }
        return response;
    };

    const register = async (userData) => {
        setIsLoading(true);
        await authService.register(userData);
        const registeredUser = await authService.getUser();
        setUser(registeredUser);
        setIsLoading(false);
    };

    const googleLogin = async (credentialResponse) => {
        setIsLoading(true);
        await authService.googleLogin(credentialResponse);
        const loggedInUser = await authService.getUser();
        setUser(loggedInUser);
        setIsLoading(false);
    }

    const logout = () => {
        setIsLoading(true);
        authService.logout();
        setUser(null);
        setIsLoading(false);
        window.location.href = "/login";
    };


    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                register,
                googleLogin,
                logout,
                isLoading,
                setIsLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;