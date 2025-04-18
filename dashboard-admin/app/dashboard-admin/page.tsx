"use client"

import { useState, useEffect } from 'react';
import { FaSync, FaSortUp, FaSortDown } from 'react-icons/fa'; // Removed FaCopy
import Fuse from 'fuse.js';
import { format } from 'date-fns';
import Toast from '../components/Toast';
import { useRouter } from 'next/navigation';
import { getCache, setCache } from '../../lib/cache-utils';

// Update the Client interface to use project_count instead of project_list
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
  
  // Ajout d'états pour le formulaire d'ajout d'utilisateur
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Fonction de gestion de l'ajout d'utilisateur
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) {
      setToast({ message: "Nom et Email sont requis", type: 'error' });
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
        throw new Error(data.error || "Échec de l'ajout");
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
      
      setToast({ message: data.message, type: 'success' });
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
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error(err);
      }
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
      if (err instanceof Error) {
        console.error(err.message);
        setToast({ message: err.message, type: 'error' });
      } else {
        console.error(err);
        setToast({ message: 'An error occurred while deleting the client', type: 'error' });
      }
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

  const handleRefresh = () => {
    fetchClients(true);
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 pb-20 bg-background text-foreground relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-blue-500 opacity-5 blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-purple-600 opacity-5 blur-3xl"></div>
      
      <main className="flex flex-col items-center sm:items-start mt-16 w-full relative z-10 max-w-7xl mx-auto">
        {/* Filters et section d'ajout */}
        {!isLoading && (
          <div className="flex flex-col sm:flex-row w-full gap-4 mb-8">
            <input 
              type="text" 
              placeholder="Search by Name, Email, Phone, Projects, or Created At" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-3 border rounded-full w-full sm:w-1/3 bg-background/60 backdrop-blur-sm border-white/10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <button 
              onClick={() => setShowForm(true)} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-full transition duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
            >
              Add Client
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center w-full p-8">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">Loading client data...</p>
          </div>
        ) : (
          <div className="w-full mt-8">
            <div className="overflow-hidden rounded-xl shadow-2xl glass-card border border-white/10">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-blue-800 to-purple-800">
                    <tr>
                      <th className="py-4 px-6 text-left font-semibold">Name</th>
                      <th className="py-4 px-6 text-center font-semibold">Email</th>
                      <th className="py-4 px-6 text-center font-semibold">Phone</th>
                      <th className="py-4 px-6 text-center font-semibold">Projects</th>
                      <th className="py-4 px-6 text-center font-semibold">
                        <div className="flex items-center justify-center">
                          <span>Created At</span>
                          <button 
                            onClick={() => {
                              setSortKey('creation_date');
                              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                            }}
                            className="ml-2 inline-flex items-center"
                          >
                            {sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />}
                          </button>
                        </div>
                      </th>
                      <th className="py-4 px-6 text-center font-semibold relative">
                        Actions
                        <FaSync 
                          className="absolute top-1/2 right-4 transform -translate-y-1/2 text-blue-400 hover:text-blue-600 cursor-pointer hover:rotate-180 transition-all duration-500"
                          size={16}
                          onClick={handleRefresh}
                          aria-label="Refresh data"
                        />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedClients.map((client, index) => (
                      <tr 
                        key={client.id} 
                        className={`cursor-pointer transition-colors duration-150 hover:bg-white/5 ${index !== sortedClients.length-1 ? 'border-b border-white/10' : ''}`}
                        onClick={() => router.push(`/dashboard-admin/client/${client.id}`)}
                      >
                        <td className="py-4 px-6 text-left">{client.name}</td>
                        <td className="py-4 px-6 text-center">{client.email}</td>
                        <td className="py-4 px-6 text-center">{client.phone}</td>
                        <td className="py-4 px-6 text-center">{client.project_count}</td>
                        <td className="py-4 px-6 text-center">
                          {isNaN(new Date(client.creation_date).getTime()) 
                            ? 'Invalid Date' 
                            : format(new Date(client.creation_date), 'dd/MM/yyyy HH:mm')}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setClientToDelete(client);
                            }} 
                            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-1.5 px-4 rounded-full transition duration-300 transform hover:scale-105 shadow-md"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Popup modal pour le formulaire d'ajout */}
        {showForm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
            <div className="glass-card p-8 rounded-2xl w-96 border border-white/20 animate-fadeIn">
              <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">Add New Client</h2>
              <form onSubmit={handleAddUser} className="flex flex-col gap-4">
                <input 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  placeholder="Name" 
                  className="p-3 rounded-lg bg-white/10 border border-white/10 focus:border-blue-500 focus:outline-none text-white"
                />
                <input 
                  value={newEmail} 
                  onChange={(e) => setNewEmail(e.target.value)} 
                  placeholder="Email" 
                  className="p-3 rounded-lg bg-white/10 border border-white/10 focus:border-blue-500 focus:outline-none text-white"
                />
                <input 
                  value={newPhone} 
                  onChange={(e) => setNewPhone(e.target.value)} 
                  placeholder="Phone" 
                  className="p-3 rounded-lg bg-white/10 border border-white/10 focus:border-blue-500 focus:outline-none text-white"
                />
                <div className="flex gap-3 justify-end mt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)} 
                    className="px-5 py-2.5 rounded-full border border-white/20 text-white hover:bg-white/10 transition duration-300"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-full transition duration-300 transform hover:scale-105"
                  >
                    Add Client
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {clientToDelete && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
            <div className="glass-card p-8 rounded-2xl w-96 border border-white/20 animate-fadeIn">
              <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-pink-300">Confirm Deletion</h2>
              <p className="mb-6">Are you sure you want to delete user "{clientToDelete.name}"?</p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={cancelDelete} 
                  className="px-5 py-2.5 rounded-full border border-white/20 text-white hover:bg-white/10 transition duration-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete} 
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-5 py-2.5 rounded-full transition duration-300 transform hover:scale-105"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast component remains unchanged */}
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            visible={toastVisible} 
            onClose={() => setToast(null)} 
          />
        )}

      </main>
    </div>
  );
}
