"use client"
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";

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
  const [threadId, setThreadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Récupérer les IDs depuis les variables d'environnement
  const vectorStoreId = process.env.NEXT_PUBLIC_VECTOR_STORE_ID || "";
  const assistantId = process.env.NEXT_PUBLIC_ASSISTANT_ID || "";

  useEffect(() => {
    // Appeler clearChat directement au chargement du composant
    clearChat();
    
    // Récupérer le threadId du localStorage s'il existe
    const savedThreadId = localStorage.getItem('chatThreadId');
    if (savedThreadId) {
      setThreadId(savedThreadId);
    }
    
    return () => {
      // Nettoyer les références au thread lorsque le composant est démonté
      localStorage.removeItem('chatThreadId');
    };
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  // Save threadId to localStorage whenever it changes
  useEffect(() => {
    if (threadId) {
      localStorage.setItem('chatThreadId', threadId);
    } else {
      localStorage.removeItem('chatThreadId');
    }
  }, [threadId]);

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
      const response = await fetch("http://localhost:54321/functions/v1/openai", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: `$\nQuestion du client: ${userQuery}`,
          vector_store_id: vectorStoreId,
          assistant_id: assistantId,
          thread_id: threadId
        })
      });
      
      if (!response.ok) {
        throw new Error(`Erreur Edge: ${response.status}`);
      }
      
      // La réponse est maintenant un objet JSON contenant la réponse et éventuellement un nouveau thread_id
      const responseData = await response.json();
      
      // Si un nouveau thread_id a été créé, le stocker
      if (responseData.thread_id) {
        setThreadId(responseData.thread_id);
      }
      
      return responseData.reply;
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
    // Réinitialiser l'ID de thread dans le state et localStorage
    setThreadId(null);
    localStorage.removeItem('chatThreadId');
    
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content: "Bonjour ! Je suis Catalisia, votre assistant virtuel. Comment puis-je vous aider aujourd'hui ? N'hésitez pas à me poser des questions sur nos services et produits.",
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
                title="Nouvelle conversation"
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
                className={`mb-4 ${
                  message.sender === 'user' 
                    ? 'ml-auto bg-blue-500 text-white' 
                    : 'mr-auto bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100'
                } rounded-lg py-2 px-4 max-w-[80%]`}
              >
                {message.sender === 'user' ? (
                  <div>{message.content}</div>
                ) : (
                  <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                        h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-2" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="text-lg font-bold mb-2" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="text-md font-bold mb-2" {...props} />,
                        a: ({ node, ...props }) => <a className="text-blue-400 underline" target="_blank" rel="noopener noreferrer" {...props} />,
                        code: ({ node, className, ...props }) => {
                          const match = /language-(\w+)/.exec(className || "");
                          const isCodeBlock = className?.includes("language-");
                          return isCodeBlock 
                            ? <code className="block bg-gray-700 text-gray-100 p-2 rounded my-2 overflow-x-auto" {...props} />
                            : <code className="bg-gray-700 text-gray-100 px-1 rounded" {...props} />;
                        },
                        pre: ({ node, ...props }) => <pre className="bg-gray-700 text-gray-100 p-2 rounded my-2 overflow-x-auto" {...props} />,
                        blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-500 pl-4 italic my-2" {...props} />,
                        strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                        em: ({ node, ...props }) => <em className="italic" {...props} />
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
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
