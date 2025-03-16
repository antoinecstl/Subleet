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
    <div className="min-h-screen p-4 sm:p-8 pb-20 bg-background text-foreground">
      <main className="flex flex-col items-center sm:items-start mt-16 w-full">
        {/* Filters et section d'ajout */}
        {!isLoading && (
          <div className="flex flex-col sm:flex-row w-full gap-4">
            <input 
              type="text" 
              placeholder="Search by Name, Email, Phone, Projects, or Created At" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border rounded w-full sm:w-1/3 bg-background"
            />
            <button 
              onClick={() => setShowForm(true)} 
              className="bg-gradient-to-r from-blue-700 to-purple-700 text-white py-2 px-4 rounded"
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
            <div className="overflow-hidden rounded-xl shadow-2xl border border-table-border">
              <table className="min-w-full bg-table-bg">
                <thead className="bg-gradient-to-r from-blue-900 to-purple-900">
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
                        className="absolute top-1/2 right-4 transform -translate-y-1/2 text-blue-400 hover:text-blue-600 cursor-pointer"
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
                      className={`cursor-pointer transition-colors duration-150 hover:bg-gray-700 ${index !== sortedClients.length-1 ? 'border-b border-table-border' : ''}`}
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
                        {/* Delete button stops propagation */}
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setClientToDelete(client);
                          }} 
                          className="bg-red-500 text-white py-1.5 px-4 rounded-full hover:bg-red-600 transition duration-300"
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
        )}

        {/* Popup modal pour le formulaire d'ajout */}
        {showForm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-gradient-to-r from-blue-700 to-purple-700 p-6 rounded-lg w-96">
              <h2 className="text-xl mb-4">Ajouter un Client</h2>
              <form onSubmit={handleAddUser} className="flex flex-col gap-4  text-black">
                <input 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  placeholder="Nom" 
                  className="p-2 border rounded"
                />
                <input 
                  value={newEmail} 
                  onChange={(e) => setNewEmail(e.target.value)} 
                  placeholder="Email" 
                  className="p-2 border rounded"
                />
                <input 
                  value={newPhone} 
                  onChange={(e) => setNewPhone(e.target.value)} 
                  placeholder="Téléphone" 
                  className="p-2 border rounded"
                />
                <div className="flex gap-2 justify-end">
                  <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">Ajouter</button>
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)} 
                    className="bg-gray-300 text-black py-2 px-4 rounded"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {clientToDelete && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg">
              <h2 className="text-red-500 text-xl mb-4">Confirm Deletion</h2>
              <p className='text-black'>Are you sure you want to delete user "{clientToDelete.name}"?</p>
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={cancelDelete} 
                  className="bg-gray-300 text-black py-2 px-4 rounded mr-2"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete} 
                  className="bg-red-500 text-white py-2 px-4 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

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
