import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import axiosInstance from '../services/axiosInstance';
import IconPicker from './IconPicker';
import {
    IoPeopleOutline, IoPeople,
    IoVideocamOutline, IoVideocam,
    IoGridOutline, IoGrid,
    IoStatsChartOutline, IoStatsChart,
    IoLogOutOutline,
    IoMenuOutline,
    IoCloseOutline,
    IoAddCircleOutline,
    IoSearchOutline,
    IoHelpBuoyOutline, IoHelpBuoy,
    IoChatbubbleEllipsesOutline, IoChatbubbleEllipses
} from 'react-icons/io5';

const toTitleCase = (value) => {
    if (!value && value !== 0) return '—';
    return value
        .toString()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatBoolean = (value) => (value ? 'Yes' : 'No');

const formatNumber = (value) => (typeof value === 'number' ? value.toLocaleString() : '—');

const OverviewExperience = ({
    user,
    stats,
    conversionRate,
    avgViewsPerVideo,
    activeCategories,
    totalCategories,
    topVideos,
    recentUsers,
    statusBreakdown,
    tierBreakdown,
    platformBreakdown,
    categoryInsights,
    onNavigate,
}) => {
    const tiers = ['free', 'pro'];
    const platformEntries = Object.entries(platformBreakdown);
    const topCollections = categoryInsights.slice(0, 4);

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white shadow-2xl">
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.3),_transparent_60%)]" />
                <div className="relative px-6 py-8 lg:px-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                        <div className="space-y-4">
                            <p className="text-sm uppercase tracking-widest text-indigo-200">Wingman Command Center</p>
                            <h2 className="text-3xl lg:text-4xl font-extrabold leading-tight">
                                {user?.name ? `Welcome back, ${user.name.split(' ')[0]}` : 'Welcome back'} 👋
                            </h2>
                            <p className="text-indigo-100 text-sm lg:text-base">
                                Monitor growth, coach your users, and ship new Broski TV drops from a single mission control.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => onNavigate('/dashboard/users')}
                                    className="flex items-center gap-2 bg-white text-indigo-900 px-4 py-2 rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transition-all"
                                >
                                    <IoPeople className="w-4 h-4" />
                                    Manage Users
                                </button>
                                <button
                                    onClick={() => onNavigate('/dashboard/videos')}
                                    className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/20 hover:bg-white/20 transition-all"
                                >
                                    <IoVideocam className="w-4 h-4" />
                                    New Upload
                                </button>
                            </div>
                        </div>
                        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur">
                                <p className="text-xs uppercase tracking-wide text-indigo-200">Total Users</p>
                                <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
                                <p className="text-xs text-indigo-100 mt-1">+{Math.max(stats.totalUsers - stats.activeUsers, 0)} new this week</p>
                            </div>
                            <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur">
                                <p className="text-xs uppercase tracking-wide text-indigo-200">Activation</p>
                                <p className="text-3xl font-bold mt-2">{conversionRate}%</p>
                                <p className="text-xs text-indigo-100 mt-1">Active vs total</p>
                            </div>
                            <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur">
                                <p className="text-xs uppercase tracking-wide text-indigo-200">Total Videos</p>
                                <p className="text-3xl font-bold mt-2">{stats.totalVideos}</p>
                                <p className="text-xs text-indigo-100 mt-1">{avgViewsPerVideo} avg views</p>
                            </div>
                            <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur">
                                <p className="text-xs uppercase tracking-wide text-indigo-200">Categories live</p>
                                <p className="text-3xl font-bold mt-2">{activeCategories}/{totalCategories}</p>
                                <p className="text-xs text-indigo-100 mt-1">curated collections</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 bg-white border border-gray-100 rounded-3xl shadow-sm p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">Performance spotlight</p>
                            <h3 className="text-xl font-semibold text-gray-900">Top performing drops</h3>
                        </div>
                        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                            {topVideos.length} featured
                        </span>
                    </div>
                    <div className="space-y-4">
                        {topVideos.map((video, index) => (
                            <div key={video._id} className="flex items-center gap-4 p-3 rounded-2xl border border-gray-100 hover:border-indigo-200 transition">
                                <div className="h-16 w-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                    {video.thumbnail ? (
                                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                            {video.platform === 'youtube' ? '📺' :
                                                video.platform === 'tiktok' ? '🎵' :
                                                    video.platform === 'instagram' ? '📷' : '🎬'}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">{video.title}</p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {video.category && typeof video.category === 'object'
                                            ? video.category.name
                                            : (video.category && typeof video.category === 'string'
                                                ? video.category
                                                : 'Uncategorized')}
                                    </p>
                                    <div className="h-2 bg-gray-100 rounded-full mt-3">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                            style={{ width: `${Math.min(((video.views || 0) / (topVideos[0]?.views || 1)) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-900">{(video.views || 0).toLocaleString()}</p>
                                    <p className="text-xs text-gray-500">views</p>
                                </div>
                            </div>
                        ))}
                        {topVideos.length === 0 && (
                            <div className="text-sm text-gray-500">No videos yet. Upload your first drop!</div>
                        )}
                    </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 flex flex-col gap-6">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400">User pulse</p>
                        <h3 className="text-xl font-semibold text-gray-900">Community health</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                                <span>Active</span>
                                <span>{statusBreakdown.active}</span>
                            </div>
                            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                <div className="h-full rounded-full bg-green-500" style={{ width: `${conversionRate}%` }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                                <span>Inactive</span>
                                <span>{statusBreakdown.inactive}</span>
                            </div>
                            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                <div className="h-full rounded-full bg-rose-500" style={{ width: `${100 - conversionRate}%` }} />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-center">
                            {tiers.map((tier) => (
                                <div key={tier} className="rounded-2xl border border-gray-100 p-3">
                                    <p className="text-xs uppercase tracking-wide text-gray-400">{tier}</p>
                                    <p className="text-lg font-semibold text-gray-900 mt-1">{tierBreakdown[tier]}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-gray-900">Latest signups</h4>
                            <button
                                onClick={() => onNavigate('/dashboard/users')}
                                className="text-xs text-indigo-600 font-semibold hover:underline"
                            >
                                View all
                            </button>
                        </div>
                        <div className="space-y-3">
                            {recentUsers.map((recent) => (
                                <div key={recent._id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">
                                            {(recent.name || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{recent.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{recent.userGoal || 'No goal set'}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {new Date(recent.createdAt || recent.updatedAt || Date.now()).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">Platform mix</p>
                            <h3 className="text-xl font-semibold text-gray-900">Where videos live</h3>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {platformEntries.length > 0 ? platformEntries.map(([platform, count]) => (
                            <div key={platform} className="rounded-2xl border border-gray-100 p-3 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 capitalize">{platform}</p>
                                    <p className="text-xs text-gray-500">{count} videos</p>
                                </div>
                                <div className="text-lg">
                                    {platform === 'youtube' ? '📺' :
                                        platform === 'tiktok' ? '🎵' :
                                            platform === 'instagram' ? '📷' :
                                                platform === 'vimeo' ? '🎬' : '📹'}
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-2 text-sm text-gray-500">
                                No videos yet. Upload your first drop!
                            </div>
                        )}
                    </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">Category momentum</p>
                            <h3 className="text-xl font-semibold text-gray-900">Top collections</h3>
                        </div>
                        <button
                            onClick={() => onNavigate('/dashboard/categories')}
                            className="text-xs text-indigo-600 font-semibold hover:underline"
                        >
                            Manage
                        </button>
                    </div>
                    <div className="space-y-3">
                        {topCollections.length > 0 ? topCollections.map((category) => (
                            <div key={category._id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-semibold">
                                        {(category.icon || category.name || 'CT').slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{category.name}</p>
                                        <p className="text-xs text-gray-500 truncate max-w-xs">{category.description || 'No description'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-900">{category.videoCount}</p>
                                    <p className="text-xs text-gray-500">videos</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-gray-500">Create a category to organize videos.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const UsersExperience = ({
    filteredUsers,
    userSearchTerm,
    onSearch,
    userTierFilter,
    onTierFilterChange,
    userStatusFilter,
    onStatusFilterChange,
    onViewUser,
    onToggleStatus,
    onDeleteUser,
    usersLoading,
    isDeleting,
    tierBreakdown,
    statusBreakdown,
}) => {
    const tierOptions = [
        { id: 'all', label: 'All tiers' },
        { id: 'free', label: 'Free' },
        { id: 'pro', label: 'Pro' },
    ];

    const statusOptions = [
        { id: 'all', label: 'All statuses' },
        { id: 'active', label: 'Active' },
        { id: 'inactive', label: 'Inactive' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-gray-400">Active members</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{statusBreakdown.active}</p>
                    <p className="text-xs text-green-500 mt-1">Healthy community</p>
                </div>
                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-gray-400">Inactive</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{statusBreakdown.inactive}</p>
                    <p className="text-xs text-rose-500 mt-1">Needs re-engagement</p>
                </div>
                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-gray-400">Paying members</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{tierBreakdown.pro}</p>
                    <p className="text-xs text-indigo-500 mt-1">All on Pro</p>
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm space-y-3">
                <div className="flex flex-wrap gap-3">
                    {tierOptions.map(option => (
                        <button
                            key={option.id}
                            onClick={() => onTierFilterChange(option.id)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${userTierFilter === option.id
                                ? 'bg-indigo-600 text-white shadow'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
                <div className="flex flex-wrap gap-3">
                    {statusOptions.map(option => (
                        <button
                            key={option.id}
                            onClick={() => onStatusFilterChange(option.id)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${userStatusFilter === option.id
                                ? 'bg-indigo-600 text-white shadow'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm">
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <IoSearchOutline className="w-5 h-5" />
                    </span>
                    <input
                        type="text"
                        value={userSearchTerm}
                        onChange={(e) => onSearch(e.target.value)}
                        placeholder="Search by name, goal, or email"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400"
                    />
                </div>
            </div>

            {usersLoading ? (
                <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center shadow-sm">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-3">Loading users...</p>
                </div>
            ) : (
                <>
                    {filteredUsers.length === 0 ? (
                        <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-10 text-center text-gray-500">
                            No users match your filters. Try adjusting the filters or search keyword.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {filteredUsers.map((user) => (
                                <div key={user._id} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="h-12 w-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold text-lg">
                                                {(user.name || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-base font-semibold text-gray-900 truncate">{user.name}</p>
                                                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.isActive ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-600'}`}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${user.subscriptionTier === 'free'
                                            ? 'bg-gray-100 text-gray-700'
                                            : user.subscriptionTier === 'pro'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1)}
                                        </span>
                                        <span>Goal: {user.userGoal || 'Not set'}</span>
                                        <span>Plan: {user.subscriptionPlan || 'N/A'}</span>
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <button
                                            onClick={() => onViewUser(user)}
                                            className="flex-1 min-w-[120px] inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
                                        >
                                            View profile
                                        </button>
                                        <button
                                            onClick={() => onToggleStatus(user._id, user.isActive)}
                                            className={`flex-1 min-w-[120px] inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-2xl transition ${user.isActive
                                                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                }`}
                                        >
                                            {user.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button
                                            onClick={() => onDeleteUser(user._id)}
                                            disabled={isDeleting}
                                            className="px-3 py-2 text-sm font-medium rounded-2xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

const VideosExperience = ({
    filteredVideos,
    searchTerm,
    onSearch,
    videoPlatformFilter,
    onPlatformFilterChange,
    onAddVideo,
    onSelectVideo,
    onEditVideo,
    onDeleteVideo,
    isDeleting,
    stats,
    categoryLookup,
}) => {
    const platformOptions = [
        { id: 'all', label: 'All platforms' },
        { id: 'youtube', label: 'YouTube' },
        { id: 'tiktok', label: 'TikTok' },
        { id: 'instagram', label: 'Instagram' },
        { id: 'vimeo', label: 'Vimeo' },
    ];

    const topPlatform = Object.entries(filteredVideos.reduce((acc, video) => {
        const key = video.platform || 'other';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {})).sort((a, b) => b[1] - a[1])[0]?.[0];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-gray-400">Published videos</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalVideos}</p>
                    <p className="text-xs text-indigo-500 mt-1">{stats.totalViews.toLocaleString()} total views</p>
                </div>
                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-gray-400">Average views</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                        {stats.totalVideos ? Math.round(stats.totalViews / stats.totalVideos) : 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">per video</p>
                </div>
                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-gray-400">Top platform</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2 capitalize">{topPlatform || '—'}</p>
                    <p className="text-xs text-gray-500 mt-1">based on current filters</p>
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm flex flex-wrap gap-3 items-center justify-between">
                <div className="flex flex-wrap gap-2">
                    {platformOptions.map(option => (
                        <button
                            key={option.id}
                            onClick={() => onPlatformFilterChange(option.id)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${videoPlatformFilter === option.id
                                ? 'bg-indigo-600 text-white shadow'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
                <button
                    onClick={onAddVideo}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-2xl text-sm font-semibold shadow hover:bg-indigo-700 transition"
                >
                    <IoAddCircleOutline className="w-4 h-4" />
                    Upload video
                </button>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm">
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <IoSearchOutline className="w-5 h-5" />
                    </span>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => onSearch(e.target.value)}
                        placeholder="Search by title, description, or tags"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400"
                    />
                </div>
            </div>

            {filteredVideos.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-10 text-center text-gray-500">
                    No videos match your filters. Try another platform or keyword.
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {filteredVideos.map((video) => (
                        <div key={video._id} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col gap-4">
                            <div className="flex items-start gap-4">
                                <div className="h-28 w-44 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                                    {video.thumbnail ? (
                                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl">
                                            {video.platform === 'youtube' ? '📺' :
                                                video.platform === 'tiktok' ? '🎵' :
                                                    video.platform === 'instagram' ? '📷' :
                                                        video.platform === 'vimeo' ? '🎬' : '📹'}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-lg font-semibold text-gray-900 truncate">{video.title}</p>
                                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
                                            {video.platform || 'other'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{video.description || 'No description provided.'}</p>
                                    <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-3">
                                        <span>{(video.views || 0).toLocaleString()} views</span>
                                        <span>
                                            {video.likes?.toLocaleString() || 0} likes
                                        </span>
                                        <span>
                                            {categoryLookup[typeof video.category === 'object' ? video.category?._id : video.category]?.name || 'Uncategorized'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => onSelectVideo(video)}
                                    className="flex-1 min-w-[120px] inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
                                >
                                    Preview
                                </button>
                                <button
                                    onClick={() => onEditVideo(video)}
                                    className="flex-1 min-w-[120px] inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-2xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => onDeleteVideo(video._id)}
                                    disabled={isDeleting}
                                    className="flex-1 min-w-[120px] inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-2xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const CategoriesExperience = ({
    filteredCategories,
    categoryFilter,
    onCategoryFilterChange,
    onCreateCategory,
    onEditCategory,
    onToggleCategoryStatus,
    onDeleteCategory,
    videoCountByCategory,
}) => {
    const categoryFilters = [
        { id: 'all', label: 'All' },
        { id: 'active', label: 'Active' },
        { id: 'inactive', label: 'Inactive' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                    {categoryFilters.map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => onCategoryFilterChange(filter.id)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${categoryFilter === filter.id
                                ? 'bg-indigo-600 text-white shadow'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
                <button
                    onClick={onCreateCategory}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-2xl text-sm font-semibold shadow hover:bg-indigo-700 transition"
                >
                    <IoAddCircleOutline className="w-4 h-4" />
                    New category
                </button>
            </div>

            {filteredCategories.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-10 text-center text-gray-500">
                    No categories found. Create your first category to keep videos organized.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredCategories.map(category => (
                        <div key={category._id} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col gap-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
                                        {category.icon ? category.icon.slice(0, 2).toUpperCase() : 'CT'}
                                    </div>
                                    <div>
                                        <p className="text-base font-semibold text-gray-900">{category.name}</p>
                                        <p className="text-xs text-gray-500">/{category.slug}</p>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${category.isActive ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-600'}`}>
                                    {category.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500">
                                {category.description || 'No description provided.'}
                            </p>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                                <span>Order #{category.order || 0}</span>
                                <span>{videoCountByCategory[category._id] || 0} videos</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => onEditCategory(category)}
                                    className="flex-1 min-w-[100px] inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => onToggleCategoryStatus(category._id, category.isActive)}
                                    className={`flex-1 min-w-[100px] inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-2xl transition ${category.isActive
                                        ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                                        }`}
                                >
                                    {category.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                    onClick={() => onDeleteCategory(category)}
                                    className="flex-1 min-w-[100px] inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-2xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const SupportExperience = ({ requests, loading, onRefresh, formatDateTime }) => {
    const [statusFilter, setStatusFilter] = useState('all');
    const statusOptions = [
        { id: 'all', label: 'All' },
        { id: 'open', label: 'Open' },
        { id: 'in_progress', label: 'In Progress' },
        { id: 'resolved', label: 'Resolved' },
    ];

    const filteredRequests = requests.filter((request) =>
        statusFilter === 'all' ? true : request.status === statusFilter
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                    {statusOptions.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => setStatusFilter(option.id)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${statusFilter === option.id
                                ? 'bg-indigo-600 text-white shadow'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
                <button
                    onClick={onRefresh}
                    className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-2xl text-sm font-semibold border border-indigo-100 shadow-sm hover:bg-indigo-50 transition"
                >
                    Refresh
                </button>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-10 text-center text-gray-500">Loading support requests...</div>
                ) : filteredRequests.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">No support requests found for this filter.</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredRequests.map((request) => (
                            <div key={request._id} className="p-5 flex flex-col gap-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{request.category}</p>
                                        <p className="text-xs text-gray-400">{formatDateTime(request.createdAt)}</p>
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${request.status === 'resolved'
                                        ? 'bg-green-100 text-green-700'
                                        : request.status === 'in_progress'
                                            ? 'bg-amber-100 text-amber-700'
                                            : 'bg-rose-100 text-rose-700'
                                        }`}>
                                        {toTitleCase(request.status)}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{request.message}</p>
                                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                    {request.userId && (
                                        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                                            User: {request.userId}
                                        </span>
                                    )}
                                    {request.metadata && Object.keys(request.metadata).length > 0 && (
                                        <span className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-600">
                                            Metadata included
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const FeedbackExperience = ({ feedback, loading, onRefresh, formatDateTime }) => {
    const [typeFilter, setTypeFilter] = useState('all');
    const [ratingFilter, setRatingFilter] = useState('all');

    const availableTypes = Array.from(new Set(feedback.map((entry) => entry.type))).filter(Boolean);
    const filteredFeedback = feedback.filter((entry) => {
        const matchesType = typeFilter === 'all' ? true : entry.type === typeFilter;
        const matchesRating =
            ratingFilter === 'all' ? true : (entry.rating || 0) >= Number(ratingFilter);
        return matchesType && matchesRating;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setTypeFilter('all')}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${typeFilter === 'all'
                                ? 'bg-indigo-600 text-white shadow'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            All types
                        </button>
                        {availableTypes.map((type) => (
                            <button
                                key={type}
                                onClick={() => setTypeFilter(type)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${typeFilter === type
                                    ? 'bg-indigo-600 text-white shadow'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {toTitleCase(type)}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {['all', 3, 4, 5].map((rating) => (
                            <button
                                key={rating}
                                onClick={() => setRatingFilter(rating)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${ratingFilter === rating
                                    ? 'bg-purple-600 text-white shadow'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {rating === 'all' ? 'All ratings' : `${rating}+ stars`}
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    onClick={onRefresh}
                    className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-2xl text-sm font-semibold border border-indigo-100 shadow-sm hover:bg-indigo-50 transition"
                >
                    Refresh
                </button>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-10 text-center text-gray-500">Loading feedback...</div>
                ) : filteredFeedback.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">No feedback entries found for this filter.</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredFeedback.map((entry) => (
                            <div key={entry._id} className="p-5 flex flex-col gap-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{toTitleCase(entry.type)}</p>
                                        <p className="text-xs text-gray-400">{formatDateTime(entry.createdAt)}</p>
                                    </div>
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                                        {entry.rating || 0} / 5
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{entry.message}</p>
                                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                    {entry.userId && (
                                        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                                            User: {entry.userId}
                                        </span>
                                    )}
                                    {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                                        <span className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-600">
                                            Metadata included
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

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
        if (path === '/dashboard/categories') return 'categories';
        if (path === '/dashboard/support') return 'support';
        if (path === '/dashboard/feedback') return 'feedback';
        return 'overview';
    }, [location.pathname]);

    const [activeTab, setActiveTab] = useState(getActiveTabFromPath());
    const [users, setUsers] = useState([]);
    const [videos, setVideos] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [usersLoading, setUsersLoading] = useState(false);
    const [message, setMessage] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleteType, setDeleteType] = useState(''); // 'video', 'user', or 'category'
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [uploadForm, setUploadForm] = useState({
        title: '',
        description: '',
        category: '',
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
        category: '',
        tags: '',
        platform: 'youtube'
    });

    // Category management state
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryForm, setCategoryForm] = useState({
        name: '',
        icon: 'ellipsis-horizontal',
        description: '',
        order: 0
    });
    const [isSavingCategory, setIsSavingCategory] = useState(false);


    // Stats
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalVideos: 0,
        totalViews: 0,
        totalLikes: 0
    });

    const [supportRequests, setSupportRequests] = useState([]);
    const [feedbackEntries, setFeedbackEntries] = useState([]);
    const [supportLoading, setSupportLoading] = useState(false);
    const [feedbackLoading, setFeedbackLoading] = useState(false);

    const [isFetchingCategories, setIsFetchingCategories] = useState(false);
    const [isFetchingVideos, setIsFetchingVideos] = useState(false);
    const [isFetchingStats, setIsFetchingStats] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [userTierFilter, setUserTierFilter] = useState('all');
    const [userStatusFilter, setUserStatusFilter] = useState('all');
    const [videoPlatformFilter, setVideoPlatformFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const fetchCategories = async () => {
        if (isFetchingCategories) return; // Prevent multiple simultaneous calls
        setIsFetchingCategories(true);
        try {
            const response = await axiosInstance.get('/api/categories');
            setCategories(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setIsFetchingCategories(false);
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchUsers(),
                fetchVideos(),
                fetchStats(),
                fetchCategories(),
                fetchSupportRequests(),
                fetchFeedbackEntries()
            ]);
        } catch (error) {
            setMessage({ error: 'Failed to load dashboard data' });
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        if (isFetchingVideos) return; // Prevent multiple simultaneous calls
        setIsFetchingVideos(true);
        try {
            const response = await axiosInstance.get('/api/tv');
            setVideos(response.data.data);
        } catch (error) {
            setMessage({ error: 'Failed to fetch videos' });
        } finally {
            setIsFetchingVideos(false);
        }
    };

    const fetchStats = async () => {
        if (isFetchingStats) return; // Prevent multiple simultaneous calls
        setIsFetchingStats(true);
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
        } finally {
            setIsFetchingStats(false);
        }
    };

    const fetchSupportRequests = async () => {
        setSupportLoading(true);
        try {
            const response = await axiosInstance.get('/api/support');
            setSupportRequests(response.data.data || []);
        } catch (error) {
            setMessage({ error: 'Failed to fetch support requests' });
        } finally {
            setSupportLoading(false);
        }
    };

    const fetchFeedbackEntries = async () => {
        setFeedbackLoading(true);
        try {
            const response = await axiosInstance.get('/api/feedback');
            setFeedbackEntries(response.data.data || []);
        } catch (error) {
            setMessage({ error: 'Failed to fetch feedback' });
        } finally {
            setFeedbackLoading(false);
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
            category: (video.category && typeof video.category === 'object' ? video.category._id : video.category) || '',
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
            } else if (deleteType === 'category') {
                await handleDeleteCategory();
                return;
            }
        } catch (error) {
            setMessage({ error: error.response?.data?.message || `Failed to delete ${deleteType}` });
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
            setItemToDelete(null);
            setDeleteType('');
            setSelectedCategory(null);
        }
    };

    // Category CRUD functions
    const handleCreateCategory = () => {
        setEditingCategory(null);
        setCategoryForm({
            name: '',
            icon: 'ellipsis-horizontal',
            description: '',
            order: 0
        });
        setShowCategoryModal(true);
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setCategoryForm({
            name: category.name || '',
            icon: category.icon || 'ellipsis-horizontal',
            description: category.description || '',
            order: category.order || 0
        });
        setShowCategoryModal(true);
    };

    const handleSaveCategory = async (e) => {
        e.preventDefault();
        setIsSavingCategory(true);
        try {
            if (editingCategory) {
                await axiosInstance.put(`/api/categories/${editingCategory._id}`, categoryForm);
                setMessage({ success: 'Category updated successfully!' });
            } else {
                await axiosInstance.post('/api/categories', categoryForm);
                setMessage({ success: 'Category created successfully!' });
            }
            setShowCategoryModal(false);
            setEditingCategory(null);
            fetchCategories();
        } catch (error) {
            setMessage({ error: error.response?.data?.message || 'Failed to save category' });
        } finally {
            setIsSavingCategory(false);
        }
    };

    const handleDeleteCategory = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        const deletedName = selectedCategory?.name;
        try {
            await axiosInstance.delete(`/api/categories/${itemToDelete}`);
            setMessage({ success: `${deletedName || 'Category'} deleted successfully!` });
            fetchCategories();
            fetchStats();
        } catch (error) {
            setMessage({ error: error.response?.data?.message || 'Failed to delete category' });
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
            setItemToDelete(null);
            setDeleteType('');
            setSelectedCategory(null);
        }
    };

    const handleToggleCategoryStatus = async (categoryId, currentStatus) => {
        try {
            await axiosInstance.put(`/api/categories/${categoryId}`, { isActive: !currentStatus });
            setMessage({ success: `Category ${!currentStatus ? 'activated' : 'deactivated'} successfully` });
            fetchCategories();
        } catch (error) {
            setMessage({ error: 'Failed to update category status' });
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
        const title = (video.title || '').toLowerCase();
        const description = (video.description || '').toLowerCase();
        const matchesSearch = title.includes(searchTerm.toLowerCase()) ||
            description.includes(searchTerm.toLowerCase());
        const matchesPlatform = videoPlatformFilter === 'all' || video.platform === videoPlatformFilter;
        return matchesSearch && matchesPlatform && video.isActive !== false;
    });

    const filteredUsers = users.filter(user => {
        const name = (user.name || '').toLowerCase();
        const goal = (user.userGoal || '').toLowerCase();
        const matchesSearch = name.includes(userSearchTerm.toLowerCase()) || goal.includes(userSearchTerm.toLowerCase());
        const matchesTier = userTierFilter === 'all' || user.subscriptionTier === userTierFilter;
        const matchesStatus = userStatusFilter === 'all' ||
            (userStatusFilter === 'active' ? user.isActive : !user.isActive);
        return matchesSearch && matchesTier && matchesStatus;
    });

    const videoCountByCategory = videos.reduce((acc, video) => {
        const categoryId = typeof video.category === 'object' ? video.category?._id : video.category;
        if (categoryId) {
            acc[categoryId] = (acc[categoryId] || 0) + 1;
        }
        return acc;
    }, {});

    const filteredCategories = categories
        .filter(category => categoryFilter === 'all' ||
            (categoryFilter === 'active' ? category.isActive : !category.isActive))
        .sort((a, b) => (a.order || 0) - (b.order || 0));


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

    const normalizeDateValue = (value) => {
        if (!value) return null;
        if (typeof value === 'object' && '$date' in value) {
            return value.$date;
        }
        return value;
    };

    const formatDateTime = (value) => {
        const normalized = normalizeDateValue(value);
        if (!normalized) return '—';
        const date = new Date(normalized);
        if (Number.isNaN(date.getTime())) {
            return normalized;
        }
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    const formatText = (value) => (value && value !== '' ? value : '—');

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    const closeUserModal = () => {
        setShowUserModal(false);
        setSelectedUser(null);
    };

    const renderUserProfileModal = () => {
        if (!selectedUser) return null;

        const aliasList = selectedUser.revenueCatAliases?.length
            ? selectedUser.revenueCatAliases.join(', ')
            : '—';
        const isUserActive = selectedUser.isActive !== false;

        const subscriptionRows = [
            { label: 'Tier', value: toTitleCase(selectedUser.subscriptionTier) },
            { label: 'Plan', value: toTitleCase(selectedUser.subscriptionPlan) },
            { label: 'Status', value: toTitleCase(selectedUser.subscriptionStatus) },
            { label: 'Is Subscribed', value: formatBoolean(selectedUser.isSubscribed) },
            { label: 'Store', value: toTitleCase(selectedUser.subscriptionStore) },
            { label: 'Environment', value: toTitleCase(selectedUser.subscriptionEnvironment) },
            { label: 'Platform', value: toTitleCase(selectedUser.subscriptionPlatform) },
            { label: 'Product ID', value: selectedUser.subscriptionProductId || '—' },
            { label: 'Entitlement ID', value: selectedUser.subscriptionEntitlementId || '—' },
            { label: 'Original App User ID', value: selectedUser.subscriptionOriginalAppUserId || '—' },
            { label: 'RevenueCat Aliases', value: aliasList },
            { label: 'Will Renew', value: formatBoolean(selectedUser.subscriptionWillRenew) },
            { label: 'In Trial Period', value: formatBoolean(selectedUser.isInTrialPeriod) },
        ];

        const dateRows = [
            { label: 'Latest Purchase', value: formatDateTime(selectedUser.subscriptionLatestPurchaseDate) },
            { label: 'Original Purchase', value: formatDateTime(selectedUser.subscriptionOriginalPurchaseDate) },
            { label: 'Expiration', value: formatDateTime(selectedUser.subscriptionExpirationDate) },
            { label: 'Created At', value: formatDateTime(selectedUser.createdAt) },
            { label: 'Updated At', value: formatDateTime(selectedUser.updatedAt) },
            { label: 'Last Sync', value: formatDateTime(selectedUser.lastSyncTime) },
        ];

        const profileRows = [
            { label: 'Goal', value: formatText(selectedUser.userGoal) },
            { label: 'Challenge', value: formatText(selectedUser.userChallenge) },
            { label: 'Personality', value: formatText(selectedUser.userPersonality) },
            { label: 'Active', value: formatBoolean(selectedUser.isActive) },
            { label: 'Role', value: toTitleCase(selectedUser.role) },
            { label: 'Email', value: selectedUser.email || 'Not provided' },
        ];

        const progressRows = [
            { label: 'Total XP', value: formatNumber(selectedUser.totalXP) },
            { label: 'Total Score', value: formatNumber(selectedUser.totalScore) },
            { label: 'Rizz Level', value: formatText(selectedUser.rizzLevelName || selectedUser.rizzLevel) },
            {
                label: 'Wing It Usage',
                value: `${selectedUser.dailyWingItCount ?? 0} / ${selectedUser.dailyWingItLimit ?? 0}`,
            },
            { label: 'Challenge Level', value: `${toTitleCase(selectedUser.challengeLevelName)} (${selectedUser.challengeLevel || 0})` },
            { label: 'Challenge Streak', value: formatNumber(selectedUser.challengeStreak) },
            { label: 'Daily Challenge Completed', value: formatBoolean(selectedUser.dailyChallengeCompleted) },
            { label: 'Daily Drill Completed', value: formatBoolean(selectedUser.dailyDrillCompleted) },
            { label: 'Trial Requests', value: formatNumber(selectedUser.trialRequestCount) },
            { label: 'Saved Replies', value: formatNumber(selectedUser.savedChatReplies?.length || 0) },
        ];

        const renderRows = (rows) => rows.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between text-sm text-gray-600">
                <span>{row.label}</span>
                <span className="font-semibold text-gray-900 text-right ml-4">{row.value || '—'}</span>
            </div>
        ));

        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
                    <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 flex items-start justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">{toTitleCase(selectedUser.role || 'User')}</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{selectedUser.name || 'Unnamed User'}</h3>
                            <p className="text-sm text-gray-500">{selectedUser.email || 'Email not provided'}</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isUserActive
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-rose-100 text-rose-700'
                                    }`}>
                                    {isUserActive ? 'Active' : 'Inactive'}
                                </span>
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                                    {toTitleCase(selectedUser.subscriptionTier)}
                                </span>
                                {selectedUser.subscriptionPlan && (
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                        {toTitleCase(selectedUser.subscriptionPlan)}
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={closeUserModal}
                            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-white transition-colors"
                        >
                            <IoCloseOutline className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="p-6 overflow-y-auto flex-1 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="rounded-2xl border border-gray-100 p-4">
                                <p className="text-xs uppercase tracking-wide text-gray-400">Subscription Overview</p>
                                <div className="mt-3 space-y-2">
                                    {renderRows(subscriptionRows)}
                                </div>
                            </div>
                            <div className="rounded-2xl border border-gray-100 p-4">
                                <p className="text-xs uppercase tracking-wide text-gray-400">Profile</p>
                                <div className="mt-3 space-y-2">
                                    {renderRows(profileRows)}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="rounded-2xl border border-gray-100 p-4">
                                <p className="text-xs uppercase tracking-wide text-gray-400">Progress & Usage</p>
                                <div className="mt-3 space-y-2">
                                    {renderRows(progressRows)}
                                </div>
                            </div>
                            <div className="rounded-2xl border border-gray-100 p-4">
                                <p className="text-xs uppercase tracking-wide text-gray-400">Key Dates</p>
                                <div className="mt-3 space-y-2">
                                    {renderRows(dateRows)}
                                </div>
                            </div>
                        </div>
                        {selectedUser.userGoal && (
                            <div className="rounded-2xl border border-gray-100 p-4 bg-indigo-50/50">
                                <p className="text-xs uppercase tracking-wide text-gray-400">Motivation Snapshot</p>
                                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-700">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Goal</p>
                                        <p className="font-semibold text-gray-900">{formatText(selectedUser.userGoal)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Challenge</p>
                                        <p className="font-semibold text-gray-900">{formatText(selectedUser.userChallenge)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Personality</p>
                                        <p className="font-semibold text-gray-900">{formatText(selectedUser.userPersonality)}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="flex justify-end">
                            <button
                                onClick={closeUserModal}
                                className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
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

    const navItems = [
        { id: 'overview', label: 'Overview', icon: IoStatsChartOutline, iconActive: IoStatsChart, path: '/dashboard/overview' },
        { id: 'users', label: 'Users', icon: IoPeopleOutline, iconActive: IoPeople, path: '/dashboard/users', badge: stats.totalUsers },
        { id: 'videos', label: 'Videos', icon: IoVideocamOutline, iconActive: IoVideocam, path: '/dashboard/videos', badge: stats.totalVideos },
        { id: 'categories', label: 'Categories', icon: IoGridOutline, iconActive: IoGrid, path: '/dashboard/categories', badge: categories.length },
        {
            id: 'support',
            label: 'Support',
            icon: IoHelpBuoyOutline,
            iconActive: IoHelpBuoy,
            path: '/dashboard/support',
            badge: supportRequests.filter((req) => req.status === 'open').length,
        },
        {
            id: 'feedback',
            label: 'Feedback',
            icon: IoChatbubbleEllipsesOutline,
            iconActive: IoChatbubbleEllipses,
            path: '/dashboard/feedback',
            badge: feedbackEntries.length,
        },
    ];

    const tierBreakdown = {
        free: users.filter(u => u.subscriptionTier === 'free').length,
        pro: users.filter(u => u.subscriptionTier === 'pro').length,
    };

    const statusBreakdown = {
        active: users.filter(u => u.isActive).length,
        inactive: users.filter(u => !u.isActive).length,
    };

    const platformBreakdown = videos.reduce((acc, video) => {
        const platform = video.platform || 'other';
        acc[platform] = (acc[platform] || 0) + 1;
        return acc;
    }, {});

    const topVideos = [...videos]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 4);

    const recentUsers = [...users]
        .sort((a, b) => new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0))
        .slice(0, 5);

    const activeCategories = categories.filter(cat => cat.isActive).length;
    const categoryLookup = categories.reduce((acc, category) => {
        acc[category._id] = category;
        return acc;
    }, {});

    const categoryInsights = categories.map(category => ({
        ...category,
        videoCount: videoCountByCategory[category._id] || 0,
    }));

    const conversionRate = stats.totalUsers ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0;
    const avgViewsPerVideo = stats.totalVideos ? Math.round(stats.totalViews / stats.totalVideos) : 0;
    const selectedCategoryVideoCount = selectedCategory?._id ? (videoCountByCategory[selectedCategory._id] || 0) : 0;
    const deleteModalTitle =
        deleteType === 'video' ? 'Video' :
            deleteType === 'user' ? 'User' :
                'Category';
    const deleteButtonLabel = `Delete ${deleteModalTitle}`;
    const deleteModalDescription = deleteType === 'video'
        ? 'Are you sure you want to delete this video? This action cannot be undone and the video will be permanently removed from your collection.'
        : deleteType === 'user'
            ? 'Are you sure you want to delete this user? This action cannot be undone and will permanently remove all user data including their profile, progress, and subscription information.'
            : `Are you sure you want to delete the "${selectedCategory?.name || 'selected'}" category? Videos (${selectedCategoryVideoCount}) using this category will need to be reassigned before they can appear again.`;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-indigo-900 to-indigo-800 text-white transition-all duration-300 ease-in-out flex flex-col fixed h-screen z-30`}>
                {/* Logo */}
                <div className="p-6 border-b border-indigo-700 flex items-center justify-between">
                    {sidebarOpen && (
                        <h1 className="text-2xl font-bold text-white">Broski</h1>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        {sidebarOpen ? <IoCloseOutline className="w-5 h-5" /> : <IoMenuOutline className="w-5 h-5" />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = activeTab === item.id ? item.iconActive : item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === item.id
                                    ? 'bg-white text-indigo-900 shadow-lg'
                                    : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'
                                    }`}
                            >
                                <Icon className="w-6 h-6 flex-shrink-0" />
                                {sidebarOpen && (
                                    <div className="flex-1 flex items-center justify-between">
                                        <span className="font-medium">{item.label}</span>
                                        {item.badge !== undefined && (
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${activeTab === item.id
                                                ? 'bg-indigo-100 text-indigo-900'
                                                : 'bg-indigo-700 text-white'
                                                }`}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div className="p-4 border-t border-indigo-700">
                    <div className={`flex items-center space-x-3 ${!sidebarOpen && 'justify-center'}`}>
                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold">
                                {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                            </span>
                        </div>
                        {sidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {user?.name || user?.email || 'User'}
                                </p>
                                <p className="text-xs text-indigo-300 truncate">Administrator</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleLogout}
                        className={`mt-4 w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-red-200 hover:bg-indigo-700 hover:text-white transition-colors ${!sidebarOpen && 'justify-center'}`}
                    >
                        <IoLogOutOutline className="w-5 h-5 flex-shrink-0" />
                        {sidebarOpen && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Top Bar */}
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 capitalize">
                                    {activeTab === 'overview' ? 'Dashboard Overview' : activeTab}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {activeTab === 'overview' && 'Welcome back! Here\'s what\'s happening.'}
                                    {activeTab === 'users' && 'Manage your users and their subscriptions'}
                                    {activeTab === 'videos' && 'Upload and manage video content'}
                                    {activeTab === 'categories' && 'Organize videos into categories'}
                                    {activeTab === 'support' && 'Track and respond to user support requests'}
                                    {activeTab === 'feedback' && 'Review feedback to guide your roadmap'}
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                {activeTab === 'videos' && (
                                    <button
                                        onClick={() => setShowUpload(true)}
                                        className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                                    >
                                        <IoAddCircleOutline className="w-5 h-5" />
                                        <span>Add Video</span>
                                    </button>
                                )}
                                {activeTab === 'categories' && (
                                    <button
                                        onClick={() => {
                                            setEditingCategory(null);
                                            setCategoryForm({ name: '', icon: 'ellipsis-horizontal', description: '', order: 0 });
                                            setShowCategoryModal(true);
                                        }}
                                        className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                                    >
                                        <IoAddCircleOutline className="w-5 h-5" />
                                        <span>Add Category</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="p-6">
                    <div className="space-y-6">

                        {/* Messages */}
                        {message.error && (
                            <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-lg shadow-sm">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-medium">{message.error}</span>
                                </div>
                            </div>
                        )
                        }
                        {message.success && (
                            <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-r-lg shadow-sm">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-medium">{message.success}</span>
                                </div>
                            </div>
                        )}

                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <OverviewExperience
                                user={user}
                                stats={stats}
                                conversionRate={conversionRate}
                                avgViewsPerVideo={avgViewsPerVideo}
                                activeCategories={activeCategories}
                                totalCategories={categories.length}
                                topVideos={topVideos}
                                recentUsers={recentUsers}
                                statusBreakdown={statusBreakdown}
                                tierBreakdown={tierBreakdown}
                                platformBreakdown={platformBreakdown}
                                categoryInsights={categoryInsights}
                                onNavigate={navigate}
                            />
                        )}

                        {/* Users Tab */}

                        {/* Users Tab */}
                        {activeTab === 'users' && (
                            <UsersExperience
                                filteredUsers={filteredUsers}
                                userSearchTerm={userSearchTerm}
                                onSearch={setUserSearchTerm}
                                userTierFilter={userTierFilter}
                                onTierFilterChange={setUserTierFilter}
                                userStatusFilter={userStatusFilter}
                                onStatusFilterChange={setUserStatusFilter}
                                onViewUser={(selected) => {
                                    setSelectedUser(selected);
                                    setShowUserModal(true);
                                }}
                                onToggleStatus={handleToggleUserStatus}
                                onDeleteUser={handleDeleteUser}
                                usersLoading={usersLoading}
                                isDeleting={isDeleting}
                                tierBreakdown={tierBreakdown}
                                statusBreakdown={statusBreakdown}
                            />
                        )}

                        {/* Videos Tab */}
                        {activeTab === 'videos' && (
                            <VideosExperience
                                filteredVideos={filteredVideos}
                                searchTerm={searchTerm}
                                onSearch={setSearchTerm}
                                videoPlatformFilter={videoPlatformFilter}
                                onPlatformFilterChange={setVideoPlatformFilter}
                                onAddVideo={() => setShowUpload(true)}
                                onSelectVideo={handleVideoSelect}
                                onEditVideo={handleEditVideo}
                                onDeleteVideo={handleDelete}
                                isDeleting={isDeleting}
                                stats={stats}
                                categoryLookup={categoryLookup}
                            />
                        )}

                        {/* Upload Modal */}
                        {showUpload && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                                <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                                    <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-900">Add New Video</h3>
                                                <p className="text-sm text-gray-500 mt-1">Upload a new video to your collection</p>
                                            </div>
                                            <button
                                                onClick={() => setShowUpload(false)}
                                                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white transition-colors"
                                            >
                                                <IoCloseOutline className="w-6 h-6" />
                                            </button>
                                        </div>
                                    </div>

                                    <form onSubmit={handleUploadSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Video Title *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={uploadForm.title}
                                                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
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
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                                                >
                                                    <option value="">Select a category (optional)</option>
                                                    {categories.filter(cat => cat.isActive).map((category) => (
                                                        <option key={category._id} value={category._id}>
                                                            {category.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Platform *
                                                </label>
                                                <select
                                                    value={uploadForm.platform}
                                                    onChange={(e) => setUploadForm({ ...uploadForm, platform: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                                                placeholder="Enter tags separated by commas"
                                            />
                                        </div>

                                        {uploadForm.platform === 'instagram' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Custom Thumbnail (Optional)
                                                </label>
                                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer">
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
                                                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                                                                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                </div>
                                                                <div className="text-green-600 font-medium text-sm mb-1">
                                                                    {selectedThumbnail.name}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    Click to change thumbnail
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col items-center">
                                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                                                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                </div>
                                                                <div className="text-sm font-medium text-gray-700 mb-1">
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                                                placeholder={`Enter ${uploadForm.platform} video URL`}
                                            />
                                        </div>

                                        <div className="flex space-x-3 pt-6 border-t border-gray-200">
                                            <button
                                                type="button"
                                                onClick={() => setShowUpload(false)}
                                                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isUploading || !uploadForm.videoUrl}
                                                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                            >
                                                {isUploading ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                        <span>Adding Video...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <IoAddCircleOutline className="w-5 h-5" />
                                                        <span>Add Video</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Video Viewing Modal */}
                        {showVideoModal && selectedVideo && (
                            <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-2 sm:p-4 z-50 backdrop-blur-sm">
                                <div className={`bg-white rounded-2xl w-full max-h-[95vh] overflow-hidden flex flex-col shadow-2xl ${selectedVideo.platform === 'tiktok' ? 'max-w-sm sm:max-w-md' :
                                    selectedVideo.platform === 'instagram' ? 'max-w-sm sm:max-w-lg' :
                                        'max-w-4xl sm:max-w-5xl'
                                    }`}>
                                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 flex justify-between items-center flex-shrink-0">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <h3 className="text-xl font-bold text-gray-900 truncate">{selectedVideo.title}</h3>
                                            <p className="text-sm text-gray-500 mt-1 truncate">{selectedVideo.description || 'No description'}</p>
                                        </div>
                                        <button
                                            onClick={() => setShowVideoModal(false)}
                                            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white transition-colors flex-shrink-0"
                                        >
                                            <IoCloseOutline className="w-6 h-6" />
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
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                                <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                                    <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-900">Edit Video</h3>
                                                <p className="text-sm text-gray-500 mt-1">Update video information and settings</p>
                                            </div>
                                            <button
                                                onClick={() => setShowEditModal(false)}
                                                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white transition-colors"
                                            >
                                                <IoCloseOutline className="w-6 h-6" />
                                            </button>
                                        </div>
                                    </div>

                                    <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
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
                                                    value={editForm.category || ''}
                                                    disabled={isUpdating}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <option value="">Select a category (optional)</option>
                                                    {categories.filter(cat => cat.isActive).map((category) => (
                                                        <option key={category._id} value={category._id}>
                                                            {category.name}
                                                        </option>
                                                    ))}
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

                                        <div className="flex space-x-3 pt-6 border-t border-gray-200">
                                            <button
                                                type="button"
                                                onClick={() => setShowEditModal(false)}
                                                disabled={isUpdating}
                                                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isUpdating}
                                                className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                            >
                                                {isUpdating ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                        <span>Updating...</span>
                                                    </>
                                                ) : (
                                                    <span>Update Video</span>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Categories Tab */}
                        {activeTab === 'categories' && (
                            <CategoriesExperience
                                filteredCategories={filteredCategories}
                                categoryFilter={categoryFilter}
                                onCategoryFilterChange={setCategoryFilter}
                                onCreateCategory={handleCreateCategory}
                                onEditCategory={handleEditCategory}
                                onToggleCategoryStatus={handleToggleCategoryStatus}
                                onDeleteCategory={(category) => {
                                    setItemToDelete(category?._id || null);
                                    setSelectedCategory(category);
                                    setDeleteType('category');
                                    setShowDeleteDialog(true);
                                }}
                                videoCountByCategory={videoCountByCategory}
                            />
                        )}

                        {/* Support Tab */}
                        {activeTab === 'support' && (
                            <SupportExperience
                                requests={supportRequests}
                                loading={supportLoading}
                                onRefresh={fetchSupportRequests}
                                formatDateTime={formatDateTime}
                            />
                        )}

                        {/* Feedback Tab */}
                        {activeTab === 'feedback' && (
                            <FeedbackExperience
                                feedback={feedbackEntries}
                                loading={feedbackLoading}
                                onRefresh={fetchFeedbackEntries}
                                formatDateTime={formatDateTime}
                            />
                        )}
                    </div>
                </main>

                {showUserModal && renderUserProfileModal()}

                {/* Category Modal */}
                {showCategoryModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">
                                            {editingCategory ? 'Edit Category' : 'Create New Category'}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {editingCategory ? 'Update category details' : 'Add a new category to organize your videos'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowCategoryModal(false);
                                            setEditingCategory(null);
                                        }}
                                        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white transition-colors"
                                    >
                                        <IoCloseOutline className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 overflow-y-auto flex-1">
                                <form onSubmit={handleSaveCategory} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={categoryForm.name}
                                            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                                            placeholder="e.g., Tutorials"
                                        />
                                    </div>
                                    <IconPicker
                                        selectedIcon={categoryForm.icon}
                                        onSelect={(iconName) => setCategoryForm({ ...categoryForm, icon: iconName })}
                                        label="Icon"
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            value={categoryForm.description}
                                            onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                                            rows="3"
                                            placeholder="Optional description for this category"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Display Order
                                        </label>
                                        <input
                                            type="number"
                                            value={categoryForm.order}
                                            onChange={(e) => setCategoryForm({ ...categoryForm, order: parseInt(e.target.value) || 0 })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                                            placeholder="0"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Lower numbers appear first in the category list
                                        </p>
                                    </div>
                                    <div className="flex space-x-3 pt-6 border-t border-gray-200">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowCategoryModal(false);
                                                setEditingCategory(null);
                                            }}
                                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSavingCategory}
                                            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                        >
                                            {isSavingCategory ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    <span>Saving...</span>
                                                </>
                                            ) : (
                                                <span>{editingCategory ? 'Update Category' : 'Create Category'}</span>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Dialog */}
                {showDeleteDialog && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-red-50 to-pink-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">
                                                Delete {deleteModalTitle}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">This action cannot be undone</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {deleteModalDescription}
                                </p>
                                {deleteType === 'category' && (
                                    <div className="mt-4 rounded-xl bg-amber-50 border border-amber-100 p-4">
                                        <p className="text-sm font-semibold text-amber-800">
                                            {selectedCategory?.name || 'Untitled category'}
                                        </p>
                                        <p className="text-xs text-amber-700 mt-1">
                                            {selectedCategoryVideoCount} video{selectedCategoryVideoCount === 1 ? '' : 's'} currently tagged with this category.
                                        </p>
                                    </div>
                                )}
                                <div className="mt-6 flex space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowDeleteDialog(false);
                                            setItemToDelete(null);
                                            setDeleteType('');
                                            setSelectedCategory(null);
                                        }}
                                        disabled={isDeleting}
                                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={confirmDelete}
                                        disabled={isDeleting}
                                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                    >
                                        {isDeleting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>Deleting...</span>
                                            </>
                                        ) : (
                                            <span>{deleteButtonLabel}</span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;