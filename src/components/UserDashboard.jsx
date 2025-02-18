import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import authService from "../appwrite/auth"; // Importing AuthService

const socket = io("http://localhost:5000");

const UserDashboard = () => {
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [activeUsers, setActiveUsers] = useState([]);

    useEffect(() => {
        const fetchUser = async () => {
            const currentUser = await authService.getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
                socket.emit("user-joined", currentUser.name);
            }
        };
        fetchUser();

        socket.on("update-active-users", (users) => {
            setActiveUsers(users);
        });

        socket.on("receive-message", (data) => {
            setMessages((prev) => [...prev, data]);
        });

        return () => {
            socket.off("update-active-users");
            socket.off("receive-message");
        };
    }, []);

    const sendMessage = () => {
        if (message.trim() && user) {
            socket.emit("send-message", { username: user.name, message });
            setMessage("");
        }
    };

    return (
        <div className="bg-gray-900 min-h-screen text-white flex flex-col items-center p-5">
            <h1 className="text-2xl font-bold">
                Welcome, {user ? user.name : "Guest"}
            </h1>
            

            <div className="w-full max-w-lg mt-5">
                <div className="bg-gray-800 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold">Active Users</h2>
                    <div className="mt-2">
                        {activeUsers.map((username, index) => (
                            <p key={index} className="text-gray-300">{username}</p>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-800 p-4 mt-5 rounded-lg">
                    <h2 className="text-lg font-semibold">Chat</h2>
                    <div className="mt-2 h-48 overflow-y-auto bg-gray-700 p-3 rounded-lg">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`p-2 rounded-lg mb-2 ${
                                    msg.username === user?.name
                                        ? "bg-blue-500 self-end text-right"
                                        : "bg-gray-600 self-start text-left"
                                }`}
                            >
                                <strong>{msg.username}:</strong> {msg.message}
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex">
                        <input
                            type="text"
                            className="flex-1 p-2 rounded-l-lg bg-gray-600 text-white"
                            placeholder="Type a message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        />
                        <button
                            className="bg-blue-500 px-4 py-2 rounded-r-lg hover:bg-blue-600"
                            onClick={sendMessage}
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
