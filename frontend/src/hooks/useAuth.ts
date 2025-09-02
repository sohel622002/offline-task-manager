import { useState } from "react";
import { toast } from "react-toastify";

type LoginSignupResponse = {
    message: string;
    user: {
        id: string;
        email: string;
        fullName: string;
    },
    token: string;
}

export const useAuth = () => {
    const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const [user, setUser] = useState<LoginSignupResponse["user"] | null>(null);

    const login = async (email: string, password: string) => {
        try {
            const response = await fetch(`${VITE_BACKEND_URL}/auth/cloud/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error("Login failed");
            }

            const result: LoginSignupResponse = await response.json();
            localStorage.setItem("token", result.token);
            localStorage.setItem("user", JSON.stringify(result.user));
            setUser(result.user);
            toast.success(result.message || "Login successful!");
        } catch (error: Error | any) {
            console.error(error);
            toast.error(error ? error.message : "Login failed. Please check your credentials and try again.");
        }
    }

    const signUp = async (data: { email: string, password: string, fullName: string }) => {
        try {
            const response = await fetch(`${VITE_BACKEND_URL}/auth/cloud/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Sign up failed");
            }

            const result: LoginSignupResponse = await response.json();
            localStorage.setItem("token", result.token);
            localStorage.setItem("user", JSON.stringify(result.user));
            setUser(result.user);
            toast.success(result.message || "Sign up successful!");
        } catch (error: Error | any) {
            console.error(error);
            toast.error(error ? error.message : "Sign up failed. Please try again.");
        }
    }

    const validateUserLoggedIn = () => {
        const token = localStorage.getItem("token");
        if (!token) return false;
        return true;
    };

    return { login, signUp, user, validateUserLoggedIn };
}