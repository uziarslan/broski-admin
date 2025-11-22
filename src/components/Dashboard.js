import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import axiosInstance from '../services/axiosInstance';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    // Determine active tab from URL
    const getActiveTabFromPath = useCallback(() => {
        const path = location.pathname;
        if (path === '/dashboard' || path === '/dashboard/overview') return 'overview';
        if (path === '/dashboard/users') return 'users';
        if (path === '/dashboard/videos') return 'videos';
        return 'overview';
    }, [location.pathname]);

    const [activeTab, setActiveTab] = useState(getActiveTabFromPath());
    const [users, setUsers] = useState([]);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [usersLoading, setUsersLoading] = useState(false);
    const [message, setMessage] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleteType, setDeleteType] = useState(''); // 'video' or 'user'
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [uploadForm, setUploadForm] = useState({
        title: '',
        description: '',
        category: 'other',
        tags: '',
        videoUrl: '',
        platform: 'youtube'
    });
    const [selectedThumbnail, setSelectedThumbnail] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [editingVideo, setEditingVideo] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        category: 'other',
        tags: '',
        platform: 'youtube'
    });


    // Stats
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalVideos: 0,
        totalViews: 0,
        totalLikes: 0
    });

    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchUsers(),
                fetchVideos(),
                fetchStats()
            ]);
        } catch (error) {
            setMessage({ error: 'Failed to load dashboard data' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    // Sync active tab with URL changes
    useEffect(() => {
        const newActiveTab = getActiveTabFromPath();
        setActiveTab(newActiveTab);
    }, [location.pathname, getActiveTabFromPath]);

    // Initialize Instagram embeds when modal opens
    useEffect(() => {
        if (showVideoModal && selectedVideo?.platform === 'instagram') {
            // Load Instagram embed script if not already loaded
            if (!window.instgrm) {
                const script = document.createElement('script');
                script.src = '//www.instagram.com/embed.js';
                script.async = true;
                script.onload = () => {
                    // Process embeds after script loads
                    setTimeout(() => {
                        if (window.instgrm && window.instgrm.Embeds) {
                            window.instgrm.Embeds.process();
                        }
                    }, 100);
                };
                document.head.appendChild(script);
            } else {
                // If script is already loaded, process embeds
                setTimeout(() => {
                    if (window.instgrm && window.instgrm.Embeds) {
                        window.instgrm.Embeds.process();
                    }
                }, 100);
            }
        }
    }, [showVideoModal, selectedVideo]);


    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            const response = await axiosInstance.get('/api/users/all');
            setUsers(response.data.data);
        } catch (error) {
            setMessage({ error: 'Failed to fetch users' });
        } finally {
            setUsersLoading(false);
        }
    };

    const fetchVideos = async () => {
        try {
            const response = await axiosInstance.get('/api/tv');
            setVideos(response.data.data);
        } catch (error) {
            setMessage({ error: 'Failed to fetch videos' });
        }
    };

    const fetchStats = async () => {
        try {
            const [usersResponse, videosResponse] = await Promise.all([
                axiosInstance.get('/api/users/all'),
                axiosInstance.get('/api/tv')
            ]);

            const users = usersResponse.data.data;
            const videos = videosResponse.data.data;

            const totalViews = videos.reduce((sum, video) => sum + (video.views || 0), 0);
            const totalLikes = videos.reduce((sum, video) => sum + (video.likes || 0), 0);

            setStats({
                totalUsers: users.length,
                activeUsers: users.filter(u => u.isActive).length,
                totalVideos: videos.length,
                totalViews,
                totalLikes
            });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };



    const handleVideoSelect = async (video) => {
        setSelectedVideo(video);
        setShowVideoModal(true);

        // Note: Admin viewing videos should NOT increment view count
        // This is intentional to prevent admin views from affecting user statistics
    };

    // Note: Like functionality has been removed for admins
    // Admins upload videos for users and should not be able to like their own content

    const handleEditVideo = (video) => {
        setEditingVideo(video);
        setEditForm({
            title: video.title || '',
            description: video.description || '',
            category: video.category || 'other',
            tags: Array.isArray(video.tags) ? video.tags.join(', ') : (video.tags || ''),
            platform: video.platform || 'youtube'
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editingVideo) return;

        setIsUpdating(true);
        try {
            const updateData = {
                title: editForm.title,
                description: editForm.description,
                category: editForm.category,
                tags: editForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                platform: editForm.platform
            };

            await axiosInstance.put(`/api/tv/${editingVideo._id}`, updateData);
            setMessage({ success: 'Video updated successfully!' });
            setShowEditModal(false);
            setEditingVideo(null);
            fetchVideos();
        } catch (error) {
            setMessage({ error: error.response?.data?.message || 'Failed to update video' });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = (videoId) => {
        setItemToDelete(videoId);
        setDeleteType('video');
        setShowDeleteDialog(true);
    };

    const handleDeleteUser = (userId) => {
        setItemToDelete(userId);
        setDeleteType('user');
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        setIsDeleting(true);
        try {
            if (deleteType === 'video') {
                await axiosInstance.delete(`/api/tv/${itemToDelete}`);
                setMessage({ success: 'Video deleted successfully' });
                fetchVideos();
                fetchStats();
            } else if (deleteType === 'user') {
                await axiosInstance.delete(`/api/users/${itemToDelete}`);
                setMessage({ success: 'User deleted successfully' });
                fetchUsers();
                fetchStats();
            }
        } catch (error) {
            setMessage({ error: error.response?.data?.message || `Failed to delete ${deleteType}` });
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
            setItemToDelete(null);
            setDeleteType('');
        }
    };

    // User CRUD functions



    const handleToggleUserStatus = async (userId, currentStatus) => {
        try {
            await axiosInstance.put(`/api/users/${userId}/toggle-status`);
            setMessage({ success: `User ${!currentStatus ? 'activated' : 'deactivated'} successfully` });
            fetchUsers();
        } catch (error) {
            setMessage({ error: 'Failed to update user status' });
        }
    };

    const validateVideoUrl = (url, platform) => {
        const patterns = {
            youtube: /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/,
            tiktok: /^https?:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/,
            instagram: /^https?:\/\/(www\.)?instagram\.com\/(p|reel)\/[\w-]+\//,
            vimeo: /^https?:\/\/(www\.)?vimeo\.com\/\d+/
        };
        return patterns[platform] ? patterns[platform].test(url) : false;
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setMessage({ error: 'Please select an image file for the thumbnail' });
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setMessage({ error: 'Thumbnail file size must be less than 5MB' });
                return;
            }
            setSelectedThumbnail(file);
            setMessage({});
        }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!uploadForm.videoUrl) {
            setMessage({ error: 'Please enter a video URL' });
            return;
        }
        if (!validateVideoUrl(uploadForm.videoUrl, uploadForm.platform)) {
            setMessage({ error: 'Invalid video URL for the selected platform' });
            return;
        }

        setIsUploading(true);
        setMessage({});

        try {
            const formData = new FormData();
            formData.append('title', uploadForm.title);
            formData.append('description', uploadForm.description);
            formData.append('category', uploadForm.category);
            formData.append('tags', uploadForm.tags);
            formData.append('videoUrl', uploadForm.videoUrl);
            formData.append('platform', uploadForm.platform);

            if (uploadForm.platform === 'instagram' && selectedThumbnail) {
                formData.append('thumbnail', selectedThumbnail);
            }

            await axiosInstance.post('/api/tv/add', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setMessage({ success: 'Video added successfully!' });
            setUploadForm({
                title: '',
                description: '',
                category: 'other',
                tags: '',
                videoUrl: '',
                platform: 'youtube'
            });
            setSelectedThumbnail(null);
            setShowUpload(false);
            fetchVideos();
            fetchStats();
        } catch (error) {
            setMessage({
                error: error.response?.data?.message || 'Failed to add video'
            });
        } finally {
            setIsUploading(false);
        }
    };

    const filteredVideos = videos.filter(video => {
        const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            video.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch && video.isActive;
    });

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
            user.userGoal.toLowerCase().includes(userSearchTerm.toLowerCase());
        return matchesSearch;
    });


    // Helper functions to extract video IDs from URLs
    const extractYouTubeId = (url) => {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : '';
    };

    const extractTikTokId = (url) => {
        if (!url) return '';
        const regExp = /tiktok\.com\/.*\/video\/(\d+)/;
        const match = url.match(regExp);
        return match ? match[1] : '';
    };


    const extractVimeoId = (url) => {
        if (!url) return '';
        const regExp = /vimeo\.com\/(\d+)/;
        const match = url.match(regExp);
        return match ? match[1] : '';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <div className="text-lg text-gray-600 mt-4">Loading dashboard...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <h1 className="text-2xl font-bold text-gray-900">Wingman Admin</h1>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-500">
                                Welcome, <span className="font-medium text-gray-900">{user?.name || user?.email}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Navigation Tabs */}
                <div className="mb-8">
                    <nav className="flex space-x-8">
                        <button
                            onClick={() => navigate('/dashboard/overview')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => navigate('/dashboard/users')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'users'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Users ({stats.totalUsers})
                        </button>
                        <button
                            onClick={() => navigate('/dashboard/videos')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'videos'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Videos ({stats.totalVideos})
                        </button>
                    </nav>
                </div>

                {/* Messages */}
                {message.error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {message.error}
                    </div>
                )}
                {message.success && (
                    <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                        {message.success}
                    </div>
                )}

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                                                <dd className="text-lg font-medium text-gray-900">{stats.totalUsers}</dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                                                <dd className="text-lg font-medium text-gray-900">{stats.activeUsers}</dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">Total Videos</dt>
                                                <dd className="text-lg font-medium text-gray-900">{stats.totalVideos}</dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">Total Views</dt>
                                                <dd className="text-lg font-medium text-gray-900">{stats.totalViews.toLocaleString()}</dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Users</h3>
                                    <div className="space-y-3">
                                        {users.slice(0, 5).map((user) => (
                                            <div key={user._id} className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0">
                                                        <div className="h-8 w-8 bg-indigo-500 rounded-full flex items-center justify-center">
                                                            <span className="text-sm font-medium text-white">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                                        <p className="text-sm text-gray-500">{user.subscriptionTier}</p>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {formatDate(user.createdAt)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Top Videos</h3>
                                    <div className="space-y-3">
                                        {videos.slice(0, 5).map((video) => (
                                            <div key={video._id} className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0">
                                                        <div className="h-8 w-8 bg-purple-500 rounded-md flex items-center justify-center">
                                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{video.title}</p>
                                                        <p className="text-sm text-gray-500">{video.platform}</p>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {video.views} views
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                        </div>

                        {/* Search */}
                        <div className="mb-6">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={userSearchTerm || ''}
                                    onChange={(e) => setUserSearchTerm(e.target.value)}
                                    placeholder="Search users by name or goal..."
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                                />
                            </div>
                        </div>

                        {/* Users Table */}
                        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                            {usersLoading ? (
                                <div className="p-8 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                                    <div className="text-gray-500 mt-2">Loading users...</div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    User
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Subscription
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Goal
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredUsers.map((user) => (
                                                <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-150">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10">
                                                                <div className="h-10 w-10 bg-indigo-500 rounded-full flex items-center justify-center">
                                                                    <span className="text-sm font-medium text-white">
                                                                        {user.name.charAt(0).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                                <div className="text-sm text-gray-500">{user.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.subscriptionTier === 'free' ? 'bg-gray-100 text-gray-800' :
                                                            user.subscriptionTier === 'pro' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                            }`}>
                                                            {user.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900 max-w-xs truncate">{user.userGoal}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedUser(user);
                                                                    setShowUserModal(true);
                                                                }}
                                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                                                            >
                                                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                                </svg>
                                                                View
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                                                                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white transition-colors duration-200 ${user.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                                                                    }`}
                                                            >
                                                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                    {user.isActive ? (
                                                                        <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                                                                    ) : (
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    )}
                                                                </svg>
                                                                {user.isActive ? 'Deactivate' : 'Activate'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(user._id)}
                                                                disabled={isDeleting}
                                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                                </svg>
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Videos Tab */}
                {activeTab === 'videos' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">Video Management</h2>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowUpload(true)}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                                >
                                    Add Video
                                </button>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="bg-white p-4 rounded-lg shadow">
                            <input
                                type="text"
                                value={searchTerm || ''}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search videos by title or description..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                            />
                        </div>

                        {/* Videos Table Layout */}
                        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Video
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Platform
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Stats
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Category
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredVideos.map((video) => (
                                            <tr key={video._id} className="hover:bg-gray-50 transition-colors duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-16 w-24">
                                                            {video.thumbnail ? (
                                                                <img
                                                                    className="h-16 w-24 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                                                    src={video.thumbnail}
                                                                    alt={video.title}
                                                                    onClick={() => handleVideoSelect(video)}
                                                                />
                                                            ) : (
                                                                <div
                                                                    className="h-16 w-24 rounded-lg bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                                                                    onClick={() => handleVideoSelect(video)}
                                                                >
                                                                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                                                {video.title}
                                                            </div>
                                                            <div className="text-sm text-gray-500 max-w-xs truncate">
                                                                {video.description || 'No description'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${video.platform === 'youtube' ? 'bg-red-100 text-red-800' :
                                                        video.platform === 'tiktok' ? 'bg-black text-white' :
                                                            video.platform === 'instagram' ? 'bg-pink-100 text-pink-800' :
                                                                video.platform === 'vimeo' ? 'bg-blue-100 text-blue-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        <span className="mr-1">
                                                            {video.platform === 'youtube' ? '📺' :
                                                                video.platform === 'tiktok' ? '🎵' :
                                                                    video.platform === 'instagram' ? '📷' :
                                                                        video.platform === 'vimeo' ? '🎬' : '📹'}
                                                        </span>
                                                        {video.platform.charAt(0).toUpperCase() + video.platform.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col space-y-1">
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                            </svg>
                                                            {video.views.toLocaleString()} views
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                                                            </svg>
                                                            {video.likes.toLocaleString()} likes
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${video.category === 'tutorial' ? 'bg-blue-100 text-blue-800' :
                                                        video.category === 'demo' ? 'bg-green-100 text-green-800' :
                                                            video.category === 'announcement' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {video.category.charAt(0).toUpperCase() + video.category.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => handleVideoSelect(video)}
                                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                                                        >
                                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M8 5v10l8-5-8-5z" />
                                                            </svg>
                                                            View
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditVideo(video)}
                                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
                                                        >
                                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                            </svg>
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(video._id)}
                                                            disabled={isDeleting}
                                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {isDeleting ? (
                                                                <svg className="w-3 h-3 mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                            {isDeleting ? 'Deleting...' : 'Delete'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {filteredVideos.length === 0 && (
                            <div className="bg-white shadow-sm rounded-lg p-12">
                                <div className="text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No videos found</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {searchTerm ? 'Try adjusting your search terms' : 'Get started by uploading your first video'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* User Details Modal */}
            {showUserModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">User Details</h3>
                                <button
                                    onClick={() => setShowUserModal(false)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <p className="text-sm text-gray-900">{selectedUser.name}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Subscription</label>
                                    <p className="text-sm text-gray-900">{selectedUser.subscriptionTier}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Goal</label>
                                    <p className="text-sm text-gray-900">{selectedUser.userGoal}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Challenge</label>
                                    <p className="text-sm text-gray-900">{selectedUser.userChallenge}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Rizz Level</label>
                                    <p className="text-sm text-gray-900">{selectedUser.rizzLevel}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Total XP</label>
                                    <p className="text-sm text-gray-900">{selectedUser.totalXP}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Daily Analysis Count</label>
                                    <p className="text-sm text-gray-900">{selectedUser.dailyAnalysisCount}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <p className={`text-sm ${selectedUser.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Joined</label>
                                <p className="text-sm text-gray-900">{formatDate(selectedUser.createdAt)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Modal */}
            {showUpload && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Add New Video</h3>
                            <button
                                onClick={() => setShowUpload(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleUploadSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Video Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={uploadForm.title}
                                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Enter video title"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    value={uploadForm.description}
                                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Enter video description"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category
                                    </label>
                                    <select
                                        value={uploadForm.category}
                                        onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="tutorial">Tutorial</option>
                                        <option value="demo">Demo</option>
                                        <option value="announcement">Announcement</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Platform *
                                    </label>
                                    <select
                                        value={uploadForm.platform}
                                        onChange={(e) => setUploadForm({ ...uploadForm, platform: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="youtube">YouTube</option>
                                        <option value="tiktok">TikTok</option>
                                        <option value="instagram">Instagram Reels</option>
                                        <option value="vimeo">Vimeo</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tags (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={uploadForm.tags}
                                    onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Enter tags separated by commas"
                                />
                            </div>

                            {uploadForm.platform === 'instagram' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Custom Thumbnail (Optional)
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleThumbnailChange}
                                            className="hidden"
                                            id="thumbnail-upload"
                                        />
                                        <label
                                            htmlFor="thumbnail-upload"
                                            className="cursor-pointer flex flex-col items-center"
                                        >
                                            {selectedThumbnail ? (
                                                <div className="flex flex-col items-center">
                                                    <div className="text-green-600 text-sm mb-2">
                                                        ✓ {selectedThumbnail.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Click to change thumbnail
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <div className="text-gray-400 text-4xl mb-2">📷</div>
                                                    <div className="text-sm text-gray-600 mb-1">
                                                        Upload Custom Thumbnail
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        JPG, PNG, WebP (max 5MB)
                                                    </div>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Video URL *
                                </label>
                                <input
                                    type="url"
                                    required
                                    value={uploadForm.videoUrl}
                                    onChange={(e) => setUploadForm({ ...uploadForm, videoUrl: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder={`Enter ${uploadForm.platform} video URL`}
                                />
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    type="submit"
                                    disabled={isUploading || !uploadForm.videoUrl}
                                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isUploading ? 'Adding...' : 'Add Video'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowUpload(false)}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Video Viewing Modal */}
            {showVideoModal && selectedVideo && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-2 sm:p-4 z-50">
                    <div className={`bg-white rounded-lg w-full max-h-[95vh] overflow-hidden flex flex-col shadow-2xl ${selectedVideo.platform === 'tiktok' ? 'max-w-sm sm:max-w-md' :
                        selectedVideo.platform === 'instagram' ? 'max-w-sm sm:max-w-lg' :
                            'max-w-4xl sm:max-w-5xl'
                        }`}>
                        <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                            <h3 className="text-xl font-semibold truncate pr-4">{selectedVideo.title}</h3>
                            <button
                                onClick={() => setShowVideoModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-3xl font-bold flex-shrink-0"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto flex-1">
                            <div className="bg-black rounded-lg overflow-hidden mb-4" style={{
                                aspectRatio: selectedVideo.platform === 'tiktok' ? '9/16' :
                                    selectedVideo.platform === 'instagram' ? '1/1' :
                                        '16/9',
                                width: '100%',
                                height: selectedVideo.platform === 'tiktok' ? 'min(80vh, 600px)' :
                                    selectedVideo.platform === 'instagram' ? 'min(60vh, 500px)' :
                                        'min(70vh, 500px)'
                            }}>
                                {selectedVideo.platform === 'youtube' ? (
                                    <iframe
                                        src={`https://www.youtube.com/embed/${extractYouTubeId(selectedVideo.videoUrl || selectedVideo.url)}`}
                                        title={selectedVideo.title}
                                        className="w-full h-full"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                ) : selectedVideo.platform === 'tiktok' ? (
                                    <iframe
                                        src={`https://www.tiktok.com/embed/${extractTikTokId(selectedVideo.videoUrl || selectedVideo.url)}`}
                                        title={selectedVideo.title}
                                        className="w-full h-full"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                ) : selectedVideo.platform === 'instagram' ? (
                                    <div className="w-full h-full" key={`instagram-${selectedVideo._id}`}>
                                        <blockquote
                                            className="instagram-media"
                                            data-instgrm-permalink={`${selectedVideo.videoUrl || selectedVideo.url}?utm_source=ig_embed&utm_campaign=loading`}
                                            data-instgrm-version="14"
                                            style={{
                                                background: '#FFF',
                                                border: '0',
                                                borderRadius: '3px',
                                                boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
                                                margin: '1px',
                                                maxWidth: '100%',
                                                minWidth: '326px',
                                                padding: '0',
                                                width: '99.375%'
                                            }}
                                        >
                                            <div style={{ padding: '16px' }}>
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    alignItems: 'center'
                                                }}>
                                                    <div style={{
                                                        backgroundColor: '#F4F4F4',
                                                        borderRadius: '50%',
                                                        flexGrow: '0',
                                                        height: '40px',
                                                        marginRight: '14px',
                                                        width: '40px'
                                                    }}></div>
                                                    <div style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        flexGrow: '1',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <div style={{
                                                            backgroundColor: '#F4F4F4',
                                                            borderRadius: '4px',
                                                            flexGrow: '0',
                                                            height: '14px',
                                                            marginBottom: '6px',
                                                            width: '100px'
                                                        }}></div>
                                                        <div style={{
                                                            backgroundColor: '#F4F4F4',
                                                            borderRadius: '4px',
                                                            flexGrow: '0',
                                                            height: '14px',
                                                            width: '60px'
                                                        }}></div>
                                                    </div>
                                                </div>
                                                <div style={{ padding: '19% 0' }}></div>
                                                <div style={{
                                                    display: 'block',
                                                    height: '50px',
                                                    margin: '0 auto 12px',
                                                    width: '50px'
                                                }}>
                                                    <svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1">
                                                        <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                                            <g transform="translate(-511.000000, -20.000000)" fill="#000000">
                                                                <g>
                                                                    <path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path>
                                                                </g>
                                                            </g>
                                                        </g>
                                                    </svg>
                                                </div>
                                                <div style={{ padding: '19% 0' }}></div>
                                                <div style={{
                                                    textAlign: 'center'
                                                }}>
                                                    <div style={{
                                                        color: '#3897f0',
                                                        fontFamily: 'Arial,sans-serif',
                                                        fontSize: '14px',
                                                        fontStyle: 'normal',
                                                        fontWeight: '550',
                                                        lineHeight: '18px'
                                                    }}>
                                                        View this post on Instagram
                                                    </div>
                                                </div>
                                                <div style={{ padding: '19% 0' }}></div>
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    marginBottom: '15px',
                                                    alignItems: 'center'
                                                }}>
                                                    <div>
                                                        <div style={{
                                                            backgroundColor: '#F4F4F4',
                                                            borderRadius: '50%',
                                                            height: '12.5px',
                                                            width: '12.5px',
                                                            transform: 'translateX(0px) translateY(7px)'
                                                        }}></div>
                                                        <div style={{
                                                            backgroundColor: '#F4F4F4',
                                                            height: '12.5px',
                                                            transform: 'rotate(-45deg) translateX(3px) translateY(1px)',
                                                            width: '12.5px',
                                                            flexGrow: '0',
                                                            marginRight: '14px',
                                                            marginLeft: '2px'
                                                        }}></div>
                                                        <div style={{
                                                            backgroundColor: '#F4F4F4',
                                                            borderRadius: '50%',
                                                            height: '12.5px',
                                                            width: '12.5px',
                                                            transform: 'translateX(9px) translateY(-18px)'
                                                        }}></div>
                                                    </div>
                                                    <div style={{ marginLeft: '8px' }}>
                                                        <div style={{
                                                            backgroundColor: '#F4F4F4',
                                                            borderRadius: '50%',
                                                            flexGrow: '0',
                                                            height: '20px',
                                                            width: '20px'
                                                        }}></div>
                                                        <div style={{
                                                            width: '0',
                                                            height: '0',
                                                            borderTop: '2px solid transparent',
                                                            borderLeft: '6px solid #f4f4f4',
                                                            borderBottom: '2px solid transparent',
                                                            transform: 'translateX(16px) translateY(-4px) rotate(30deg)'
                                                        }}></div>
                                                    </div>
                                                    <div style={{ marginLeft: 'auto' }}>
                                                        <div style={{
                                                            width: '0px',
                                                            borderTop: '8px solid #F4F4F4',
                                                            borderRight: '8px solid transparent',
                                                            transform: 'translateY(16px)'
                                                        }}></div>
                                                        <div style={{
                                                            backgroundColor: '#F4F4F4',
                                                            flexGrow: '0',
                                                            height: '12px',
                                                            width: '16px',
                                                            transform: 'translateY(-4px)'
                                                        }}></div>
                                                        <div style={{
                                                            width: '0',
                                                            height: '0',
                                                            borderTop: '8px solid #F4F4F4',
                                                            borderLeft: '8px solid transparent',
                                                            transform: 'translateY(-4px) translateX(8px)'
                                                        }}></div>
                                                    </div>
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    flexGrow: '1',
                                                    justifyContent: 'space-around',
                                                    marginBottom: '12px',
                                                    alignItems: 'flex-start',
                                                    padding: '0 4px'
                                                }}>
                                                    <div style={{
                                                        backgroundColor: '#F4F4F4',
                                                        borderRadius: '4px',
                                                        flexGrow: '0',
                                                        height: '14px',
                                                        marginBottom: '6px',
                                                        width: '224px'
                                                    }}></div>
                                                    <div style={{
                                                        backgroundColor: '#F4F4F4',
                                                        borderRadius: '4px',
                                                        flexGrow: '0',
                                                        height: '14px',
                                                        width: '144px'
                                                    }}></div>
                                                </div>
                                                <p style={{
                                                    color: '#c9c8cd',
                                                    fontFamily: 'Arial,sans-serif',
                                                    fontSize: '14px',
                                                    lineHeight: '17px',
                                                    margin: '0 0 0 0',
                                                    overflow: 'hidden',
                                                    padding: '8px 0 7px',
                                                    textAlign: 'center',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    <a href={`${selectedVideo.videoUrl || selectedVideo.url}?utm_source=ig_embed&utm_campaign=loading`} style={{
                                                        color: '#c9c8cd',
                                                        fontFamily: 'Arial,sans-serif',
                                                        fontSize: '14px',
                                                        fontStyle: 'normal',
                                                        fontWeight: 'normal',
                                                        lineHeight: '17px',
                                                        textDecoration: 'none'
                                                    }} target="_blank" rel="noopener noreferrer">
                                                        {selectedVideo.title}
                                                    </a>
                                                </p>
                                            </div>
                                        </blockquote>
                                    </div>
                                ) : selectedVideo.platform === 'vimeo' ? (
                                    <iframe
                                        src={`https://player.vimeo.com/video/${extractVimeoId(selectedVideo.videoUrl || selectedVideo.url)}`}
                                        title={selectedVideo.title}
                                        className="w-full h-full"
                                        frameBorder="0"
                                        allow="autoplay; fullscreen; picture-in-picture"
                                        allowFullScreen
                                    />
                                ) : (selectedVideo.videoUrl || selectedVideo.url) ? (
                                    <video
                                        controls
                                        className="w-full h-full"
                                        poster={selectedVideo.thumbnail}
                                    >
                                        <source src={selectedVideo.videoUrl || selectedVideo.url} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white">
                                        <div className="text-center">
                                            <div className="text-2xl mb-2">📹</div>
                                            <div className="text-lg font-semibold mb-2">Video</div>
                                            <div className="text-sm opacity-75">No video URL available</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center space-x-1 text-gray-500 text-sm">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                        </svg>
                                        <span>{selectedVideo.views.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center space-x-1 text-gray-500 text-sm">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                                        </svg>
                                        <span>{selectedVideo.likes.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="flex space-x-1">
                                    <button
                                        onClick={() => {
                                            setShowVideoModal(false);
                                            handleEditVideo(selectedVideo);
                                        }}
                                        className="flex items-center gap-1 bg-amber-500 text-white px-2 py-1 rounded text-xs hover:bg-amber-600 transition-colors duration-200"
                                    >
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                        </svg>
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(selectedVideo._id)}
                                        disabled={isDeleting}
                                        className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isDeleting ? (
                                            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : (
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </div>

                            {selectedVideo.description && (
                                <div className="text-gray-700 mb-4">
                                    <h4 className="font-semibold mb-2">Description:</h4>
                                    <p>{selectedVideo.description}</p>
                                </div>
                            )}

                            {selectedVideo.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {selectedVideo.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Video Edit Modal */}
            {showEditModal && editingVideo && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Edit Video</h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Video Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    disabled={isUpdating}
                                    value={editForm.title || ''}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="Enter video title"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    disabled={isUpdating}
                                    value={editForm.description || ''}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="Enter video description"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category
                                    </label>
                                    <select
                                        value={editForm.category || 'other'}
                                        disabled={isUpdating}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="tutorial">Tutorial</option>
                                        <option value="demo">Demo</option>
                                        <option value="announcement">Announcement</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Platform
                                    </label>
                                    <select
                                        value={editForm.platform || 'youtube'}
                                        disabled={isUpdating}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, platform: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="youtube">YouTube</option>
                                        <option value="tiktok">TikTok</option>
                                        <option value="instagram">Instagram Reels</option>
                                        <option value="vimeo">Vimeo</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tags (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    disabled={isUpdating}
                                    value={editForm.tags || ''}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="Enter tags separated by commas"
                                />
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {isUpdating ? (
                                        <>
                                            <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Updating...
                                        </>
                                    ) : (
                                        'Update Video'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    disabled={isUpdating}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Delete {deleteType === 'video' ? 'Video' : 'User'}
                                    </h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            {deleteType === 'video'
                                                ? 'Are you sure you want to delete this video? This action cannot be undone.'
                                                : 'Are you sure you want to delete this user? This action cannot be undone and will remove all user data.'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDeleteDialog(false);
                                        setItemToDelete(null);
                                        setDeleteType('');
                                    }}
                                    disabled={isDeleting}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {isDeleting ? (
                                        <>
                                            <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Deleting...
                                        </>
                                    ) : (
                                        'Delete'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;