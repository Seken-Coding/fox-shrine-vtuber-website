import React, { useState, useEffect, useCallback } from 'react';
import { useAuth, PermissionGate } from '../hooks/useAuth';

const AdminDashboard = () => {
    const { user, apiCall, hasPermission } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [configs, setConfigs] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Load admin data
    const loadAdminData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const requests = [];
            const hasReadUsers = hasPermission('users.read');
            const hasReadRoles = hasPermission('users.roles');
            const hasReadConfig = hasPermission('config.read');

            if (hasReadUsers) requests.push(apiCall('/admin/users?limit=50'));
            if (hasReadRoles) requests.push(apiCall('/admin/roles'));
            if (hasReadConfig) requests.push(apiCall('/config'));

            if (requests.length === 0) {
                setLoading(false);
                return;
            }

            const responses = await Promise.all(requests);
            let responseIndex = 0;

            if (hasReadUsers) {
                const usersResponse = responses[responseIndex++];
                if (usersResponse.ok) {
                    const usersData = await usersResponse.json();
                    setUsers(usersData.users || []);
                } else {
                    throw new Error('Failed to load users');
                }
            }
            if (hasReadRoles) {
                const rolesResponse = responses[responseIndex++];
                if (rolesResponse.ok) {
                    const rolesData = await rolesResponse.json();
                    setRoles(rolesData.roles || []);
                } else {
                    throw new Error('Failed to load roles');
                }
            }
            if (hasReadConfig) {
                const configResponse = responses[responseIndex++];
                if (configResponse.ok) {
                    const configData = await configResponse.json();
                    setConfigs(configData.data || {});
                } else {
                    throw new Error('Failed to load config');
                }
            }
        } catch (error) {
            console.error('Failed to load admin data:', error);
            setError(error.message || 'Failed to load admin data');
        } finally {
            setLoading(false);
        }
    }, [apiCall, hasPermission]);

    // Update user role
    const updateUserRole = useCallback(async (userId, roleName) => {
        try {
            const response = await apiCall(`/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: roleName })
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
    }, [apiCall, loadAdminData]);

    // Update configuration
    const updateConfiguration = useCallback(async (key, value) => {
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
    }, [apiCall]);

    useEffect(() => {
        loadAdminData();
    }, [loadAdminData]);

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                            <p className="text-gray-600">Welcome, {user?.username}!</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                                Role: {user?.role}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center p-8">Loading...</div>
            ) : error ? (
                <div className="text-center p-8 text-red-500">Error: {error}</div>
            ) : (
                <>
                    <div className="bg-white border-b">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <nav className="flex space-x-8">
                                <PermissionGate permission="users.read">
                                    <button
                                        onClick={() => setActiveTab('users')}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'users' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                    >
                                        Users
                                    </button>
                                </PermissionGate>
                                <PermissionGate permission="users.roles">
                                    <button
                                        onClick={() => setActiveTab('roles')}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'roles' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                    >
                                        Roles
                                    </button>
                                </PermissionGate>
                                <PermissionGate permission="config.read">
                                    <button
                                        onClick={() => setActiveTab('config')}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'config' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                    >
                                        Configuration
                                    </button>
                                </PermissionGate>
                            </nav>
                        </div>
                    </div>
                    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {activeTab === 'overview' && <DashboardOverview user={user} users={users} roles={roles} configs={configs} />}
                        <PermissionGate permission="users.read" showMessage>
                            {activeTab === 'users' && <UsersTab users={users} roles={roles} onUpdateRole={updateUserRole} />}
                        </PermissionGate>
                        <PermissionGate permission="users.roles" showMessage>
                            {activeTab === 'roles' && <RolesTab roles={roles} />}
                        </PermissionGate>
                        <PermissionGate permission="config.read" showMessage>
                            {activeTab === 'config' && <ConfigTab configs={configs} onUpdateConfig={updateConfiguration} hasUpdatePermission={hasPermission('config.update')} />}
                        </PermissionGate>
                    </main>
                </>
            )}
        </div>
    );
};

const DashboardOverview = ({ user, users, roles, configs }) => (
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
);

const UsersTab = ({ users, roles, onUpdateRole }) => {
    const [roleChanges, setRoleChanges] = useState({});

    const handleRoleChange = (userId, newRole) => {
        setRoleChanges(prev => ({ ...prev, [userId]: newRole }));
        onUpdateRole(userId, newRole);
    };

    return (
        <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">User Management</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <select
                                        value={roleChanges[user.id] || user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                                    >
                                        {roles.map(role => (
                                            <option key={role.id} value={role.name}>{role.name}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const RolesTab = ({ roles }) => (
    <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Role & Permissions</h3>
        </div>
        <div className="p-6">
            <div className="grid gap-6">
                {roles.map(role => (
                    <div key={role.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h4 className="text-lg font-medium text-gray-900">{role.name}</h4>
                                <p className="text-gray-600">{role.description || 'No description'}</p>
                            </div>
                            <span className="text-sm text-gray-500">{role.permissions?.length || 0} permissions</span>
                        </div>
                        {role.permissions && (
                            <div className="flex flex-wrap gap-2">
                                {role.permissions.map(permission => (
                                    <span key={permission} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">{permission}</span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const ConfigTab = ({ configs, onUpdateConfig, hasUpdatePermission }) => {
    const [configChanges, setConfigChanges] = useState({});
    const [editStates, setEditStates] = useState({});

    const handleInputChange = (key, value) => {
        setConfigChanges(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = (key) => {
        onUpdateConfig(key, configChanges[key]);
        setEditStates(prev => ({ ...prev, [key]: false }));
    };

    const handleEdit = (key) => {
        setConfigChanges(prev => ({ ...prev, [key]: configs[key] }));
        setEditStates(prev => ({ ...prev, [key]: true }));
    };

    return (
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
                                <label htmlFor={`config-${key}`} className="text-sm font-medium text-gray-700">{key}</label>
                                <p className="text-xs text-gray-500">Current: {String(value)}</p>
                            </div>
                            {hasUpdatePermission && (
                                editStates[key] ? (
                                    <>
                                        <input
                                            id={`config-${key}`}
                                            type="text"
                                            value={configChanges[key] || ''}
                                            onChange={(e) => handleInputChange(key, e.target.value)}
                                            className="ml-4 px-3 py-1 border border-gray-300 rounded text-sm w-64"
                                        />
                                        <button onClick={() => handleSave(key)} className="ml-2 px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700">Save</button>
                                    </>
                                ) : (
                                    <button onClick={() => handleEdit(key)} className="ml-2 px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300">Edit</button>
                                )
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
