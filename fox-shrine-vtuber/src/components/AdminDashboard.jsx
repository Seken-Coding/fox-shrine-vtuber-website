import React, { useState, useEffect } from 'react';
import { useAuth, PermissionGate } from '../hooks/useAuth';

const AdminDashboard = () => {
    const { user, apiCall, hasPermission } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [configs, setConfigs] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Load admin data
    const loadAdminData = async () => {
        setLoading(true);
        try {
            // Load users if user has permission
            if (hasPermission('users.read')) {
                const usersResponse = await apiCall('/admin/users?limit=50');
                if (usersResponse.ok) {
                    const usersData = await usersResponse.json();
                    setUsers(usersData.users || []);
                }
            }

            // Load roles if user has permission
            if (hasPermission('users.roles')) {
                const rolesResponse = await apiCall('/admin/roles');
                if (rolesResponse.ok) {
                    const rolesData = await rolesResponse.json();
                    setRoles(rolesData.roles || []);
                }
            }

            // Load configuration if user has permission
            if (hasPermission('config.read')) {
                const configResponse = await apiCall('/config');
                if (configResponse.ok) {
                    const configData = await configResponse.json();
                    setConfigs(configData.data || {});
                }
            }
        } catch (error) {
            console.error('Failed to load admin data:', error);
            setError('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    // Update user role
    const updateUserRole = async (userId, roleName) => {
        try {
            const response = await apiCall(`/admin/users/${userId}/role`, {
                method: 'PUT',
                body: JSON.stringify({ roleName })
            });

            if (response.ok) {
                // Refresh users list
                loadAdminData();
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to update user role');
            }
        } catch (error) {
            console.error('Failed to update user role:', error);
            setError('Failed to update user role');
        }
    };

    // Update configuration
    const updateConfiguration = async (key, value) => {
        try {
            const response = await apiCall('/config', {
                method: 'PUT',
                body: JSON.stringify({
                    configs: [{ key, value, category: 'admin_updated' }]
                })
            });

            if (response.ok) {
                // Update local state
                setConfigs(prev => ({
                    ...prev,
                    [key]: value
                }));
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to update configuration');
            }
        } catch (error) {
            console.error('Failed to update configuration:', error);
            setError('Failed to update configuration');
        }
    };

    useEffect(() => {
        loadAdminData();
    }, []);

    const tabs = [
        { id: 'overview', name: 'Overview', permission: null },
        { id: 'users', name: 'Users', permission: 'users.read' },
        { id: 'roles', name: 'Roles', permission: 'users.roles' },
        { id: 'config', name: 'Configuration', permission: 'config.read' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                            <p className="text-gray-600">Welcome, {user?.displayName || user?.username}!</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                                {user?.role}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8">
                        {tabs.map((tab) => (
                            <PermissionGate key={tab.id} permission={tab.permission}>
                                <button
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === tab.id
                                            ? 'border-purple-500 text-purple-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    {tab.name}
                                </button>
                            </PermissionGate>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                        {error}
                        <button
                            onClick={() => setError('')}
                            className="float-right text-red-700 hover:text-red-900"
                        >
                            ×
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    </div>
                ) : (
                    <>
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
                                    <p className="text-3xl font-bold text-purple-600">{users.length}</p>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <h3 className="text-lg font-medium text-gray-900">Available Roles</h3>
                                    <p className="text-3xl font-bold text-blue-600">{roles.length}</p>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <h3 className="text-lg font-medium text-gray-900">Configurations</h3>
                                    <p className="text-3xl font-bold text-green-600">{Object.keys(configs).length}</p>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <h3 className="text-lg font-medium text-gray-900">Your Permissions</h3>
                                    <p className="text-3xl font-bold text-orange-600">{user?.permissions?.length || 0}</p>
                                </div>
                            </div>
                        )}

                        {/* Users Tab */}
                        {activeTab === 'users' && (
                            <PermissionGate permission="users.read">
                                <div className="bg-white shadow rounded-lg">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900">User Management</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {users.map((userData) => (
                                                    <tr key={userData.Id}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                                                    <span className="text-purple-600 font-medium">
                                                                        {userData.DisplayName?.[0] || userData.Username?.[0] || 'U'}
                                                                    </span>
                                                                </div>
                                                                <div className="ml-4">
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        {userData.DisplayName || userData.Username}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">@{userData.Username}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {userData.Email}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                userData.RoleName === 'Super Admin' ? 'bg-red-100 text-red-800' :
                                                                userData.RoleName === 'Admin' ? 'bg-purple-100 text-purple-800' :
                                                                userData.RoleName === 'Moderator' ? 'bg-blue-100 text-blue-800' :
                                                                userData.RoleName === 'VIP' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {userData.RoleName}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {userData.LastLoginAt ? new Date(userData.LastLoginAt).toLocaleDateString() : 'Never'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <PermissionGate permission="users.roles">
                                                                <select
                                                                    value={userData.RoleName}
                                                                    onChange={(e) => updateUserRole(userData.Id, e.target.value)}
                                                                    className="text-sm border border-gray-300 rounded px-2 py-1"
                                                                >
                                                                    {roles.map((role) => (
                                                                        <option key={role.Id} value={role.Name}>
                                                                            {role.Name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </PermissionGate>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </PermissionGate>
                        )}

                        {/* Roles Tab */}
                        {activeTab === 'roles' && (
                            <PermissionGate permission="users.roles">
                                <div className="bg-white shadow rounded-lg">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900">Role & Permissions</h3>
                                    </div>
                                    <div className="p-6">
                                        <div className="grid gap-6">
                                            {roles.map((role) => (
                                                <div key={role.Id} className="border border-gray-200 rounded-lg p-4">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h4 className="text-lg font-medium text-gray-900">{role.Name}</h4>
                                                            <p className="text-gray-600">{role.Description}</p>
                                                        </div>
                                                        <span className="text-sm text-gray-500">{role.PermissionCount} permissions</span>
                                                    </div>
                                                    {role.Permissions && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {role.Permissions.split(',').map((permission, index) => (
                                                                <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                                                    {permission}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </PermissionGate>
                        )}

                        {/* Configuration Tab */}
                        {activeTab === 'config' && (
                            <PermissionGate permission="config.read">
                                <div className="bg-white shadow rounded-lg">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900">Website Configuration</h3>
                                        <p className="text-sm text-gray-600">Manage website settings and content</p>
                                    </div>
                                    <div className="p-6">
                                        <div className="space-y-6">
                                            {Object.entries(configs).map(([key, value]) => (
                                                <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100">
                                                    <div className="flex-1">
                                                        <label className="text-sm font-medium text-gray-700">{key}</label>
                                                        <p className="text-xs text-gray-500">Current: {String(value)}</p>
                                                    </div>
                                                    <PermissionGate permission="config.write">
                                                        <input
                                                            type="text"
                                                            defaultValue={value}
                                                            onBlur={(e) => {
                                                                if (e.target.value !== value) {
                                                                    updateConfiguration(key, e.target.value);
                                                                }
                                                            }}
                                                            className="ml-4 px-3 py-1 border border-gray-300 rounded text-sm w-64"
                                                        />
                                                    </PermissionGate>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </PermissionGate>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
