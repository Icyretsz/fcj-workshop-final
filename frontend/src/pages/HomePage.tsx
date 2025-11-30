import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthButton from "../component/AuthButton.tsx";
import { useAuth } from "react-oidc-context";
import { apiClient } from "../services/apiClient.ts";
import { User } from "../types";

const HomePage: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<User[] | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({ username: '', email: '', role: '', phone_number: '' });

    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const fetchUsers = async () => {
        if (!isAuthenticated || !user) {
            setLoading(false);
            return;
        }

        const token = user.id_token;
        const response = await apiClient.getAll<User[]>("/users", token);

        if (!response.success) {
            setError(response.error || "Failed to load users.");
        } else {
            setUsers(response.data || null);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, [isAuthenticated, user]);

    const handleGetDetails = async (userId: number) => {
        if (!user?.id_token) return;

        const response = await apiClient.getUser<User>("/users", userId.toString(), user.id_token);

        if (response.success && response.data) {
            setSelectedUser(response.data);
            setError(null);
        } else {
            setError(response.error || "Failed to fetch user details.");
        }
    };

    const handleEdit = (userToEdit: User) => {
        setEditingUser(userToEdit);
        setFormData({
            username: userToEdit.username,
            email: userToEdit.email,
            role: userToEdit.role,
            phone_number: userToEdit.phone_number
        });
        setSelectedUser(null);
    };

    const handleUpdate = async () => {
        if (!editingUser || !user?.id_token) return;

        const response = await apiClient.put<User>(
            `/users/${editingUser.id}`,
            formData,
            user.id_token
        );

        if (response.success) {
            setError(null);
            setEditingUser(null);
            await fetchUsers();
        } else {
            setError(response.error || "Failed to update user.");
        }
    };

    const handleDelete = async (userId: number) => {
        if (!user?.id_token) return;
        
        if (!confirm('Are you sure you want to delete this user?')) return;

        const response = await apiClient.deleteUser(`/users`, userId.toString(), user.id_token);

        if (response.success) {
            setError(null);
            setSelectedUser(null);
            await fetchUsers();
        } else {
            setError(response.error || "Failed to delete user.");
        }
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
        setFormData({ username: '', email: '', role: '', phone_number: '' });
    };

    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1>Welcome to Serverless Application Deployment Demo</h1>

            <AuthButton />

            {error && (
                <p style={{ color: 'red', marginTop: '20px' }}>
                    Error: {error}
                </p>
            )}

            {users && (
                <div style={{ marginTop: '20px' }}>
                    <h2>Users Management</h2>
                    
                    <table style={{ 
                        width: '100%', 
                        borderCollapse: 'collapse', 
                        marginTop: '20px',
                        border: '1px solid #ddd'
                    }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f2f2f2' }}>
                                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>ID</th>
                                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Username</th>
                                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Email</th>
                                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Role</th>
                                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Phone</th>
                                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id}>
                                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{u.id}</td>
                                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{u.username}</td>
                                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{u.email}</td>
                                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{u.role}</td>
                                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{u.phone_number}</td>
                                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                        <button 
                                            onClick={() => handleGetDetails(u.id)}
                                            style={{ 
                                                marginRight: '5px', 
                                                padding: '5px 10px',
                                                cursor: 'pointer',
                                                backgroundColor: '#4CAF50',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '3px'
                                            }}
                                        >
                                            Details
                                        </button>
                                        <button 
                                            onClick={() => handleEdit(u)}
                                            style={{ 
                                                marginRight: '5px', 
                                                padding: '5px 10px',
                                                cursor: 'pointer',
                                                backgroundColor: '#2196F3',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '3px'
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(u.id)}
                                            style={{ 
                                                padding: '5px 10px',
                                                cursor: 'pointer',
                                                backgroundColor: '#f44336',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '3px'
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {selectedUser && (
                        <div style={{ 
                            marginTop: '20px', 
                            padding: '15px', 
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            backgroundColor: '#f9f9f9'
                        }}>
                            <h3>User Details</h3>
                            <p><strong>ID:</strong> {selectedUser.id}</p>
                            <p><strong>Cognito Sub:</strong> {selectedUser.cognito_sub}</p>
                            <p><strong>Username:</strong> {selectedUser.username}</p>
                            <p><strong>Email:</strong> {selectedUser.email}</p>
                            <p><strong>Role:</strong> {selectedUser.role}</p>
                            <p><strong>Phone:</strong> {selectedUser.phone_number}</p>
                            <button 
                                onClick={() => setSelectedUser(null)}
                                style={{ 
                                    marginTop: '10px',
                                    padding: '5px 15px',
                                    cursor: 'pointer',
                                    backgroundColor: '#666',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '3px'
                                }}
                            >
                                Close
                            </button>
                        </div>
                    )}

                    {editingUser && (
                        <div style={{ 
                            marginTop: '20px', 
                            padding: '15px', 
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            backgroundColor: '#f0f8ff'
                        }}>
                            <h3>Edit User (ID: {editingUser.id})</h3>
                            <div style={{ marginBottom: '10px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Username:</label>
                                <input 
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '3px', border: '1px solid #ddd' }}
                                />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
                                <input 
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '3px', border: '1px solid #ddd' }}
                                />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Role:</label>
                                <input 
                                    type="text"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '3px', border: '1px solid #ddd' }}
                                />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Phone Number:</label>
                                <input 
                                    type="text"
                                    value={formData.phone_number}
                                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '3px', border: '1px solid #ddd' }}
                                />
                            </div>
                            <button 
                                onClick={handleUpdate}
                                style={{ 
                                    marginRight: '10px',
                                    padding: '8px 20px',
                                    cursor: 'pointer',
                                    backgroundColor: '#4CAF50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '3px'
                                }}
                            >
                                Save Changes
                            </button>
                            <button 
                                onClick={handleCancelEdit}
                                style={{ 
                                    padding: '8px 20px',
                                    cursor: 'pointer',
                                    backgroundColor: '#666',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '3px'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default HomePage;
