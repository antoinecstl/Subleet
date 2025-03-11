"use client"

import { useState, useEffect } from 'react';
import { FaSync, FaSortUp, FaSortDown, FaCopy } from 'react-icons/fa'; // Import sort and copy icons
import Fuse from 'fuse.js'; // Import fuse.js
import { format } from 'date-fns'; // Import date-fns for date formatting
import Toast from '../components/Toast';

// Define Client interface
interface Client {
  id: number;
  name: string;
  email: string;
  key: string | null;
  created_at: string;
  revoked: boolean;
  total_calls: number;
}

export default function DashboardAdmin() {
  const [showForm, setShowForm] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fuse, setFuse] = useState<Fuse<Client> | null>(null);
  const [revokedFilter, setRevokedFilter] = useState<'All' | 'Yes' | 'No'>('All'); // Added filter state
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // Added sort state
  const [sortKey, setSortKey] = useState<'created_at' | 'total_calls'>('created_at'); // Added sort key state
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null); // Added state for deletion
  const [name, setName] = useState(''); // Add state for name
  const [email, setEmail] = useState(''); // Add state for email
  const [clientToRevoke, setClientToRevoke] = useState<Client | null>(null); // Add state for revoke confirmation
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [toastVisible, setToastVisible] = useState(false); // Added state for toast visibility
  const [visibleApiKeys, setVisibleApiKeys] = useState<Set<string>>(new Set()); // Changed to track keys as strings
  const [isLoading, setIsLoading] = useState(true);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/fetch-admin-dash');
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const result = await response.json();
      setClients(result);
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
        keys: ['name', 'email', 'key', 'created_at'],
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

  // Apply revoked filter
  const filteredByRevoked = revokedFilter !== 'All'
    ? filteredClients.filter(client => revokedFilter === 'Yes' ? client.revoked : !client.revoked)
    : filteredClients;

  // Apply sorting
  const sortedClients = [...filteredByRevoked].sort((a, b) => {
    let compare = 0;
    if (sortKey === 'created_at') {
      compare = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    } else if (sortKey === 'total_calls') {
      compare = a.total_calls - b.total_calls;
    }
    return sortOrder === 'asc' ? compare : -compare;
  });

  const handleDelete = async (id: number): Promise<void> => {
    try {
      const response = await fetch('/api/delete-admin-dash', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Update the clients state by removing the deleted client
      setClients(clients.filter(client => client.id !== id));
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error(err);
      }
    }
  };

  const handleRevoke = async (apiKey: string): Promise<void> => {
    try {
      const response = await fetch('/api/revoke-admin-dash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Refresh the clients list
      await fetchClients();
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error(err);
      }
    }
  };

  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      const response = await fetch('/api/add_user-admin-dash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Refresh the clients list
      await fetchClients();

      // Reset form and hide it
      setName('');
      setEmail('');
      setShowForm(false);
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error(err);
      }
    }
  };

  const handleCopy = (apiKey: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      // Use navigator.clipboard API if available
      navigator.clipboard.writeText(apiKey).then(() => {
        setToast({ message: 'API Key copied to clipboard', type: 'success' });
      }).catch(() => {
        setToast({ message: 'Failed to copy API Key', type: 'error' });
      });
    } else {
      // Fallback method for mobile devices
      const textArea = document.createElement("textarea");
      textArea.value = apiKey;
      // Avoid scrolling to bottom
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setToast({ message: 'API Key copied to clipboard', type: 'success' });
      } catch (err) {
        setToast({ message: 'Failed to copy API Key', type: 'error' });
      }
      document.body.removeChild(textArea);
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

  const confirmRevoke = () => {
    if (clientToRevoke) {
      if (clientToRevoke.key) {
        handleRevoke(clientToRevoke.key);
      }
      setClientToRevoke(null);
    }
  };

  const cancelRevoke = () => {
    setClientToRevoke(null);
  };

  const toggleApiKeyVisibility = (apiKey: string) => { // Changed parameter to apiKey
    setVisibleApiKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(apiKey)) {
        newSet.delete(apiKey);
      } else {
        newSet.add(apiKey);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 pb-20 bg-background text-foreground">
      <main className="flex flex-col items-center sm:items-start mt-16 w-full">        
        {/* Filters */}
        {!isLoading && (
          <div className="flex flex-col sm:flex-row w-full gap-4">
            {/* Single Search Input */}
            <input 
              type="text" 
              placeholder="Search by Name, Email, API Key, or Created At" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border rounded w-full sm:w-1/3 bg-background"
            />

            {/* Revoked Filter */}
            <select
              value={revokedFilter}
              onChange={(e) => setRevokedFilter(e.target.value as 'All' | 'Yes' | 'No')}
              className="p-2 border rounded bg-background"
            >
              <option value="All">All</option>
              <option value="Yes">Revoked</option>
              <option value="No">Not revoked</option>
            </select>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center w-full p-8">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">Loading client data...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto w-full mt-8 relative">
              <table className="min-w-full bg-table-bg rounded-lg border border-separate ">
                <thead className="bg-table-bg">
                  <tr>
                    <th className="py-2 px-4 border-b border-table-border text-center text-table-text">Name</th>
                    <th className="py-2 px-4 border-b border-table-border text-center text-table-text">Email</th>
                    <th className="py-2 px-4 border-b border-table-border text-center text-table-text">API Key</th>
                    <th className="py-2 px-4 border-b border-table-border text-center text-table-text" >
                      <div className="flex items-center justify-center">
                      <span>Usage</span>
                      <button 
                        onClick={() => {
                          setSortKey('total_calls');
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        }}
                        className="ml-2 inline-flex items-center"
                      >
                        {sortKey === 'total_calls' && sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />}
                      </button>
                      </div>
                    </th>
                    <th className="py-2 px-4 border-b border-table-border text-center text-table-text">
                      <div className="flex items-center justify-center">
                      <span>Created At</span>
                      <button 
                        onClick={() => {
                          setSortKey('created_at');
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        }}
                        className="ml-2 inline-flex items-center"
                      >
                        {sortKey === 'created_at' && sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />}
                      </button>
                      </div>
                    </th>
                    <th className="py-2 px-4 border-b border-table-border text-center text-table-text">
                      Revoked
                    </th>
                    <th className="py-2 px-4 border-b border-table-border text-center text-table-text relative">
                      Actions
                      <FaSync 
                        className="absolute top-1/2 right-2 transform -translate-y-1/2 text-blue-400 hover:text-blue-600 cursor-pointer"
                        size={16}
                        onClick={fetchClients}
                        aria-label="Refresh Users"
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedClients.map(client => (
                    <tr key={`${client.id}-${client.key}`}>
                      <td className="py-2 px-4 border-b border-table-border text-center text-table-text">{client.name}</td>
                      <td className="py-2 px-4 border-b border-table-border text-center text-table-text">{client.email}</td>
                      <td className="py-2 px-4 border-b border-table-border text-center text-table-text">
                        {client.key ? (
                          <div className="flex items-center justify-center space-x-2">
                            <button onClick={() => client.key && toggleApiKeyVisibility(client.key)} className="hover:text-blue-600 focus:outline-none">
                              {visibleApiKeys.has(client.key) 
                                ? client.key 
                                : `${client.key.slice(0,5)}*****${client.key.slice(-5)}`}
                            </button>
                            
                            <button 
                              onClick={()  => client.key &&  handleCopy(client.key)} 
                              className="text-gray-300 hover:text-white focus:outline-none"
                              aria-label="Copy API Key"
                            >
                              <FaCopy />
                            </button>
                          </div>
                        ) : (
                          'No API Key'
                        )}
                      </td>
                      <td className="py-2 px-4 border-b border-table-border text-center text-table-text">{client.total_calls}</td>
                      <td className="py-2 px-4 border-b border-table-border text-center text-table-text">
                        {isNaN(new Date(client.created_at).getTime()) 
                          ? 'Invalid Date' 
                          : format(new Date(client.created_at), 'dd/MM/yyyy HH:mm')}
                      </td>
                      <td className="py-2 px-4 border-b border-table-border text-center text-table-text">{client.revoked ? 'Yes' : 'No'}</td>
                      <td className="py-2 px-4 border-b border-table-border text-center text-table-text">
                        <div className="flex flex-col gap-2 justify-center">
                          {!client.revoked && (
                            <button 
                              onClick={() => setClientToRevoke(client)} 
                              className="bg-yellow-500 text-white py-1 px-3 rounded hover:bg-yellow-600 transition duration-300"
                            >
                              Revoke
                            </button>
                          )}
                          <button 
                            onClick={() => setClientToDelete(client)} 
                            className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition duration-300"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add User Button */}
            <div className="w-full mt-8">
              <button 
                onClick={() => setShowForm(true)} 
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
              >
                Add New User
              </button>
            </div>
          </>
        )}

        {/* Add User Modal */}
        {showForm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-table-bg p-6 rounded-lg shadow-lg w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Add New User</h2>
                <button 
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <form className="flex flex-col gap-4" onSubmit={handleAddUser}>
                <div>
                  <label htmlFor="name" className="block mb-2">Name</label>
                  <input 
                    id="name"
                    type="text" 
                    placeholder="Enter name" 
                    className="w-full p-2 border rounded bg-background" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block mb-2">Email</label>
                  <input 
                    id="email"
                    type="email" 
                    placeholder="Enter email" 
                    className="w-full p-2 border rounded bg-background" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)}
                    className="bg-gray-300 text-black py-2 px-4 rounded hover:bg-gray-400 transition duration-300"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
                  >
                    Add User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
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

        {/* Revocation Confirmation Dialog */}
        {clientToRevoke && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg">
              <h2 className="text-yellow-500 text-xl mb-4">Confirm Revocation</h2>
              <p className='text-black'>Are you sure you want to revoke "{clientToRevoke.name}" active key ?</p>
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={cancelRevoke} 
                  className="bg-gray-300 text-black py-2 px-4 rounded mr-2"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmRevoke} 
                  className="bg-yellow-500 text-white py-2 px-4 rounded"
                >
                  Revoke
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
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
