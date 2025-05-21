"use client"

import { useState, useEffect } from 'react';
import { FaSync, FaSortUp, FaSortDown } from 'react-icons/fa';
import Fuse from 'fuse.js';
import { format } from 'date-fns';
import Toast from '../components/Toast';
import { useRouter } from 'next/navigation';
import { getCache, setCache } from '../../lib/cache-utils';
import { useUser } from "@clerk/nextjs";

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  creation_date: string;
  project_count: number;
}

export default function DashboardAdmin() {
  const router = useRouter();
  const { user } = useUser();
  const [showForm, setShowForm] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [fuse, setFuse] = useState<Fuse<Client> | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortKey, setSortKey] = useState<'creation_date'>('creation_date');
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form states for adding a new user
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Handle adding a new user
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) {
      setToast({ message: "Name and Email are required", type: 'error' });
      return;
    }
    try {
      const response = await fetch('/api/admin/users/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, email: newEmail, phone: newPhone })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to add client");
      }
      
      // Ensure the new client has a project_count of 0 if not set by the API
      const newClient = {
        ...data.client,
        project_count: data.client.project_count || 0
      };
      
      // Update local state
      const updatedClients = [...clients, newClient];
      setClients(updatedClients);
      
      // Update cache with the new client list
      setCache('cache_admin_clients', updatedClients);
      
      setToast({ message: data.message || "Client added successfully", type: 'success' });
      setShowForm(false);
      setNewName('');
      setNewEmail('');
      setNewPhone('');
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const fetchClients = async (bypassCache = false) => {
    try {
      setIsLoading(true);
      
      // Try to get from cache first, unless bypassing cache
      if (!bypassCache) {
        const cachedClients = getCache<Client[]>('cache_admin_clients');
        if (cachedClients) {
          setClients(cachedClients);
          setIsLoading(false);
          return;
        }
      }
      
      const response = await fetch('/api/admin/fetch/dashboard');
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const result = await response.json();
      setClients(result);
      
      // Store in cache
      setCache('cache_admin_clients', result);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setToast({ 
        message: err instanceof Error ? err.message : 'Failed to fetch client data', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (clients.length > 0) {
      const options = {
        keys: ['name', 'email', 'phone', 'project_count', 'creation_date'],
        threshold: 0.3,
      };
      setFuse(new Fuse(clients, options));
    }
  }, [clients]);

  useEffect(() => {
    if (toast) {
      setToastVisible(true);
      const timer = setTimeout(() => {
        setToastVisible(false);
        setTimeout(() => setToast(null), 500); // Wait for fade-out
      }, 3000); 
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const filteredClients = searchTerm && fuse
    ? fuse.search(searchTerm).map(result => result.item)
    : clients;

  const sortedClients = [...filteredClients].sort((a, b) => {
    const compare = new Date(a.creation_date).getTime() - new Date(b.creation_date).getTime();
    return sortOrder === 'asc' ? compare : -compare;
  });

  const handleDelete = async (id: number): Promise<void> => {
    try {
      const response = await fetch('/api/admin/users/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Update local state
      const updatedClients = clients.filter(client => client.id !== id);
      setClients(updatedClients);
      
      // Update cache with the new client list
      setCache('cache_admin_clients', updatedClients);
      
      // Also clear any related client caches
      localStorage.removeItem(`cache_client_${id}`);
      
      setToast({ message: 'Client deleted successfully', type: 'success' });
    } catch (err) {
      console.error('Error deleting client:', err);
      setToast({ 
        message: err instanceof Error ? err.message : 'An error occurred while deleting the client', 
        type: 'error' 
      });
    }
  };

  const confirmDelete = () => {
    if (clientToDelete) {
      handleDelete(clientToDelete.id);
      setClientToDelete(null);
    }
  };

  const cancelDelete = () => {
    setClientToDelete(null);
  };

  return (
    <div className="min-h-screen p-6 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary opacity-5 blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-secondary opacity-5 blur-3xl"></div>
      
      <div className="relative z-10 content-container">
        <div className="page-header">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-lg text-muted">
                Welcome back{user?.firstName ? `, ${user.firstName}` : ''}. Manage your clients and their projects.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-2">
              <button 
                onClick={() => fetchClients(true)} 
                className="btn-outline px-4 py-2 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <button 
                onClick={() => setShowForm(true)}
                className="btn-gradient px-4 py-2 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Client
              </button>
            </div>
          </div>
        </div>

        {/* Client search bar */}
        <div className="mb-6">
          <input 
            type="text" 
            placeholder="Search by Name, Email, Phone, Projects, or Created At" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field w-full sm:w-1/2"
          />
        </div>

        {/* Clients table */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Clients</h2>
          
          {isLoading ? (
            <div className="min-h-[200px] flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl glass-card">
              <div className="overflow-x-auto">
                <table className="table-modern min-w-full">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th className="text-center">Email</th>
                      <th className="text-center">Phone</th>
                      <th className="text-center">Projects</th>
                      <th className="text-center">
                        <div className="flex items-center justify-center">
                          <span>Created At</span>
                          <button 
                            onClick={() => {
                              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                            }}
                            className="ml-2 inline-flex items-center"
                          >
                            {sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />}
                          </button>
                        </div>
                      </th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedClients.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8">
                          <p className="text-muted">No clients found</p>
                        </td>
                      </tr>
                    ) : (
                      sortedClients.map((client, index) => (
                        <tr 
                          key={client.id} 
                          className={`cursor-pointer hover:bg-card-hover-border`}
                          onClick={() => router.push(`/dashboard-admin/client/${client.id}`)}
                        >
                          <td>{client.name}</td>
                          <td className="text-center">{client.email}</td>
                          <td className="text-center">{client.phone || "—"}</td>
                          <td className="text-center">{client.project_count}</td>
                          <td className="text-center">
                            {isNaN(new Date(client.creation_date).getTime()) 
                              ? 'Invalid Date' 
                              : format(new Date(client.creation_date), 'dd/MM/yyyy')}
                          </td>
                          <td className="text-center">
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setClientToDelete(client);
                              }} 
                              className="px-3 py-1 rounded-full border border-error text-error text-sm hover:bg-error hover:text-white transition duration-200 pointer-events-auto"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Popup modal for adding a client */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
          <div className="glass-card p-8 rounded-xl w-96 border border-card-border animate-fadeIn">
            <h2 className="card-header text-2xl mb-6">Add New Client</h2>
            <form onSubmit={handleAddUser} className="flex flex-col gap-4">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  placeholder="Enter client name" 
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input 
                  value={newEmail} 
                  onChange={(e) => setNewEmail(e.target.value)} 
                  placeholder="Enter client email" 
                  type="email"
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone (Optional)</label>
                <input 
                  value={newPhone} 
                  onChange={(e) => setNewPhone(e.target.value)} 
                  placeholder="Enter client phone" 
                  className="input-field"
                />
              </div>
              <div className="flex gap-3 justify-end mt-4">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)} 
                  className="btn-ghost px-5 py-2"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-gradient px-5 py-2"
                >
                  Add Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {clientToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
          <div className="glass-card p-8 rounded-xl w-96 border border-card-border animate-fadeIn">
            <h2 className="card-header text-2xl mb-4">Confirm Deletion</h2>
            <p className="mb-6">Are you sure you want to delete the client "{clientToDelete.name}"?</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={cancelDelete} 
                className="btn-ghost px-5 py-2"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="btn-gradient bg-gradient-to-r from-error to-error-light hover:from-error hover:to-error px-5 py-2"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          visible={toastVisible}
          onClose={() => {
            setToastVisible(false);
            setTimeout(() => setToast(null), 500);
          }}
        />
      )}
    </div>
  );
}
