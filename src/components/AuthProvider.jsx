import { useCallback, useEffect, useState } from "react";
import { AuthContext } from "../AuthContext";
import { auth } from "../firebase";
import axios from "axios";


export function AuthProvider({ children }) {
    const url = "https://car-platform-api.vercel.app";
    const [currentUser, setCurrentUser] = useState(null);
    const [currentUserInfo, setCurrentUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchCurrentUserInfo = async () => {
        if (currentUser) {
            try {
                const response = await axios.get(`${url}/user/${currentUser.uid}`);
                setCurrentUserInfo(response.data);
                console.log("fetch Info run")
            } catch (userInfoError) {
                setCurrentUserInfo(null);
                console.error(userInfoError);
            }
        }
    };

    useEffect(() => {
        const result = auth.onAuthStateChanged(async (user) => {
            setLoading(true);

            if (user) {
                try {
                    setCurrentUser(user);
                    const response = await axios.get(`${url}/user/${user.uid}`);
                    setCurrentUserInfo(response.data);

                } catch (error) {
                    console.error("Failed to fetch user info:", error);
                    setCurrentUserInfo(null);
                }
            }
            setLoading(false);
        });

        return result;
    }, [])

    useEffect(() => {
        if (currentUser & currentUserInfo) {
            console.log(currentUser);
            console.log(currentUserInfo);
        } else {
            console.log(currentUser);
            console.log(currentUserInfo);
        }
    }, [currentUser, currentUserInfo]);


    const value = { url, currentUser, setCurrentUser, currentUserInfo, fetchCurrentUserInfo };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}