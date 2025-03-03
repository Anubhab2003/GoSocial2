import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client, Account, Databases } from 'appwrite';
import conf from '../conf/conf';

const client = new Client()
    .setEndpoint(conf.appwriteUrl) // Your Appwrite endpoint
    .setProject(conf.appwriteProjectId); // Your Appwrite project ID

const account = new Account(client);
const databases = new Databases(client);

function AdminPage() {
    const [showModal, setShowModal] = useState(false);
    const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
    const [showUndoModal, setShowUndoModal] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [posts, setPosts] = useState([]);
    const [selectedPosts, setSelectedPosts] = useState([]);
    const [recentlyDeletedPosts, setRecentlyDeletedPosts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const checkUserRole = async () => {
            try {
                const user = await account.get();
                if (user.labels && user.labels.includes('admin')) {
                    setIsAdmin(true);
                    fetchPosts();
                } else {
                    navigate('/'); // Redirect if not admin
                }
            } catch (error) {
                console.error('Error fetching user:', error);
                navigate('/'); // Redirect if not logged in
            }
        };

        const fetchPosts = async () => {
            try {
                const response = await databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteCollectionId);
                setPosts(response.documents);
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };

        checkUserRole();
    }, [navigate]);

    const handleSelectPost = (postId) => {
        setSelectedPosts(prev => prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]);
    };

    const handleDeleteSelectedPosts = async () => {
        try {
            const deletedPosts = posts.filter(post => selectedPosts.includes(post.$id));
            setRecentlyDeletedPosts(deletedPosts);

            const deletePromises = selectedPosts.map(postId => databases.deleteDocument(conf.appwriteDatabaseId, conf.appwriteCollectionId, postId));
            await Promise.all(deletePromises);
            setPosts(posts.filter(post => !selectedPosts.includes(post.$id)));
            setSelectedPosts([]);
            setShowModal(false);
            setShowUndoModal(true);
        } catch (error) {
            console.error('Error deleting posts:', error);
        }
    };

    const handleDeleteAllPosts = async () => {
        try {
            setRecentlyDeletedPosts(posts);

            const deletePromises = posts.map(post => databases.deleteDocument(conf.appwriteDatabaseId, conf.appwriteCollectionId, post.$id));
            await Promise.all(deletePromises);
            setPosts([]);
            setShowDeleteAllModal(false);
            setShowUndoModal(true);
        } catch (error) {
            console.error('Error deleting all posts:', error);
        }
    };

    const handleUndoDelete = async () => {
        try {
            const restorePromises = recentlyDeletedPosts.map(post => databases.createDocument(conf.appwriteDatabaseId, conf.appwriteCollectionId, post.$id, post));
            await Promise.all(restorePromises);
            setPosts([...posts, ...recentlyDeletedPosts]);
            setRecentlyDeletedPosts([]);
            setShowUndoModal(false);
        } catch (error) {
            console.error('Error restoring posts:', error);
        }
    };

    if (!isAdmin) {
        return null; // Prevent rendering if not admin
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 p-6">
            <div className="bg-white shadow-xl rounded-2xl p-8 max-w-lg w-full text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-6">WELCOME TO ADMIN PANEL</h1>
                <p className="text-gray-600 mb-8">
                    WITH GREAT POWER COMES GREAT RESPONSIBILITY. MANAGE THE PANEL CAREFULLY AND BE RESPONSIBLE FOR YOUR ACTIONS.
                </p>
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">User Posts</h2>
                    <div className="overflow-y-auto max-h-64">
                        {posts.map(post => (
                            <div key={post.$id} className="bg-gray-200 rounded-lg p-4 mb-2 flex justify-between items-center">
                                <div>
                                    <p className="text-lg font-semibold text-gray-800">{post.title}</p>
                                    <p className="text-gray-600">{post.content}</p>
                                </div>
                                <input
                                    type="checkbox"
                                    className="h-5 w-5 text-red-500"
                                    checked={selectedPosts.includes(post.$id)}
                                    onChange={() => handleSelectPost(post.$id)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex justify-center gap-4">
                    <button 
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
                        onClick={() => setShowModal(true)}
                    >
                        Delete Selected Posts
                    </button>
                    <button 
                        className="bg-red-700 hover:bg-red-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
                        onClick={() => setShowDeleteAllModal(true)}
                    >
                        Delete All Posts
                    </button>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Are you sure?</h2>
                        <p className="text-gray-600 mb-4">This action is irreversible.</p>
                        <div className="flex justify-center gap-4">
                            <button 
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg"
                                onClick={handleDeleteSelectedPosts}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteAllModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Are you sure?</h2>
                        <p className="text-gray-600 mb-4">This action will delete all posts and is irreversible.</p>
                        <div className="flex justify-center gap-4">
                            <button 
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg"
                                onClick={() => setShowDeleteAllModal(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="bg-red-700 hover:bg-red-800 text-white font-semibold py-2 px-4 rounded-lg"
                                onClick={handleDeleteAllPosts}
                            >
                                Delete All
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showUndoModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Posts Deleted</h2>
                        <p className="text-gray-600 mb-4">You can undo this action if needed.</p>
                        <div className="flex justify-center gap-4">
                            <button 
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg"
                                onClick={() => setShowUndoModal(false)}
                            >
                                Close
                            </button>
                            <button 
                                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
                                onClick={handleUndoDelete}
                            >
                                Undo Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminPage;
