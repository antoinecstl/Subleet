"use client"
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: number;
};

export default function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Récupérer l'ID du Vector Store depuis les variables d'environnement
  const vectorStoreId = process.env.NEXT_PUBLIC_VECTOR_STORE_ID || "";

  useEffect(() => {
    // Appeler clearChat directement au chargement du composant
    clearChat();
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleChatBox = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentMessage(e.target.value);
  };

  // Appeler l'Edge Function avec la requête de l'utilisateur
  const callOpenAIEdgeFunction = async (userQuery: string) => {
    try {
      const contextPrompt = "Contexte Général : Tu es un assistant virtuel destiné à répondre aux questions des clients sur un site marchand spécialisé dans la vente d'équipements de course à pied. Ta mission est de fournir des réponses précises et utiles basées uniquement sur les informations disponibles dans le contexte spécifique ci-dessous. Tu dois rester cordial, professionnel et éviter d'inventer des informations., optimise tes réponses pour qu'elle ne soit pas à rallonge, les horaires du magasin sont du lundi au vendredi de 9h à 18h et le samedi de 9h à 12h.";
      
      const response = await fetch("http://localhost:54321/functions/v1/openai", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: `${contextPrompt}\n\nQuestion du client: ${userQuery}`,
          context: contextPrompt,
          vector_store_id: vectorStoreId // Ajout de l'ID du Vector Store
        })
      });
      
      if (!response.ok) {
        throw new Error(`Erreur Edge: ${response.status}`);
      }
      
      // La réponse est directement le texte de la réponse
      return await response.text();
    } catch (error) {
      console.error("Erreur lors de l'appel à l'API:", error);
      return "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer plus tard.";
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentMessage.trim() === "") return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentMessage,
      sender: 'user',
      timestamp: Date.now()
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setCurrentMessage("");
    setIsLoading(true);
    
    try {
      // Appeler l'API Edge Function
      const aiResponse = await callOpenAIEdgeFunction(currentMessage);
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: aiResponse,
        sender: 'assistant',
        timestamp: Date.now()
      };
      
      setMessages([...updatedMessages, assistantMessage]);
    } catch (error) {
      // En cas d'erreur, ajouter un message d'erreur
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "Désolé, une erreur s'est produite. Veuillez réessayer.",
        sender: 'assistant',
        timestamp: Date.now()
      };
      
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content: "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
      sender: 'assistant',
      timestamp: Date.now()
    };
    setMessages([welcomeMessage]);
    localStorage.setItem('chatMessages', JSON.stringify([welcomeMessage]));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div 
          className="w-96 h-[32rem] bg-white dark:bg-gray-700 rounded-lg shadow-lg flex flex-col"
        >
          <div 
            className="flex justify-between items-center p-4 border-b dark:border-gray-600"
          >
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
              <Image src="/chatbox_white.svg" alt="Chat" width={24} height={24} className="mr-2" />
              Assistant virtuel
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={clearChat} 
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                title="Effacer la conversation"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button onClick={toggleChatBox} className="text-gray-800 dark:text-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-2 ${
                  message.sender === 'user' 
                    ? 'ml-auto bg-blue-500 text-white' 
                    : 'mr-auto bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100'
                } rounded-lg py-2 px-4 max-w-[80%]`}
              >
                {message.content}
              </div>
            ))}
            {isLoading && (
              <div className="mr-auto bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg py-3 px-4 max-w-[80%] flex items-center">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 border-t dark:border-gray-600">
            <form onSubmit={sendMessage} className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Tapez votre message..."
                className="flex-1 px-3 py-1.5 border rounded dark:bg-gray-600 dark:text-gray-100"
                value={currentMessage}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className={`px-4 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Envoi...' : 'Envoyer'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <button onClick={toggleChatBox} className="bg-blue-500 text-white rounded-full p-4 shadow-lg flex items-center justify-center">
          <Image src="/chatbox_white.svg" alt="Chat" width={24} height={24} />
        </button>
      )}
    </div>
  );
}
