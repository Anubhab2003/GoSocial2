import React, { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import authService from "../appwrite/auth"; // Importing AuthService
import { useNavigate, useParams } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

// Load environment variables from .env file
const socket = io(import.meta.env.VITE_PORT);

const UserDashboard = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [value, setValue] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            const currentUser = await authService.getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
                socket.emit("user-joined", currentUser.name);
            }
        };
        fetchUser();

        return () => {
            socket.off("user-joined");
        };
    }, []);

    const handleJoinRoom = useCallback(() => {
        navigate(`/room/${value}`);
    }, [navigate, value]);

    // const myMeeting = async (element) => {
    //     const appId = import.meta.env.VITE_VC_APP_ID;
    //     const serverSecret = import.meta.env.VITE_VC_SERVER;
    //     const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appId, serverSecret, roomId, Date.now().toString(), "Anubhab Chowdhury");

    //     const zc = ZegoUIKitPrebuilt.create(kitToken);
    //     zc.joinRoom({
    //         container: element,
    //         sharedLinks: [
    //             {
    //                 name: "Copy Link",
    //                 url: `https://localhost:5173/room/${roomId}`
    //             },
    //         ],
    //         scenario: {
    //             mode: ZegoUIKitPrebuilt.OneONoneCall,
    //         }
    //     });
    // };

    return (
        <div className="bg-gray-900 min-h-screen text-white flex flex-col items-center p-5">
            <h1 className="text-2xl font-bold">
                Welcome, {user ? user.name : "Guest"}
            </h1>

            <div className="w-full max-w-lg mt-5">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Enter Room Code"
                    className="p-2 rounded-lg bg-gray-800 text-white"
                />
                <button
                    onClick={handleJoinRoom}
                    className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600 mt-2"
                >
                    Join
                </button>

                {/* <div className="bg-gray-800 p-4 mt-5 rounded-lg">
                    <div ref={myMeeting} />
                </div> */}
            </div>
        </div>
    );
};

export default UserDashboard;
