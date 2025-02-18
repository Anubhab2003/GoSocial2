import React, { useEffect, useState } from 'react';
import socket from '../socket';

function ActiveUsers({ selectUser, currentUserId }) {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        socket.on('updateUserList', (userList) => {
            setUsers(userList.filter(user => user.userId !== currentUserId));
        });

        return () => {
            socket.off('updateUserList');
        };
    }, [currentUserId]);

    return (
        <div className="p-4 bg-white shadow-lg rounded-lg max-w-md">
            <h2 className="text-lg font-semibold mb-2">Active Users</h2>
            <ul>
                {users.map((user) => (
                    <li
                        key={user.userId}
                        className="p-2 cursor-pointer hover:bg-gray-200 rounded"
                        onClick={() => selectUser(user)}
                    >
                        {user.username}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ActiveUsers;
