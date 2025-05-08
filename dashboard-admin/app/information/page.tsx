"use client"

import Link from "next/link"

export default function InformationPage() {
  return (
    <div className="min-h-screen p-6 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary opacity-5 blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-secondary opacity-5 blur-3xl"></div>
      
      <div className="relative z-10 content-container">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Enhancing Business with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Intelligent AI</span>
          </h1>
          <p className="text-xl text-muted max-w-3xl mx-auto">
            Discover how Catalysia's AI solutions can transform your customer service,
            boost engagement, and streamline operations.
          </p>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Feature 1 */}
          <div className="glass-card rounded-xl p-6 hover-scale">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="card-header text-xl mb-3">Custom AI Assistants</h3>
            <p className="text-muted">
              Deploy AI assistants that understand your business, products, and customers.
              Customize behavior, knowledge, and tone to reflect your brand identity.
            </p>
          </div>
          
          {/* Feature 2 */}
          <div className="glass-card rounded-xl p-6 hover-scale">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="card-header text-xl mb-3">Knowledge Integration</h3>
            <p className="text-muted">
              Feed your AI with your documentation, FAQs, and product information.
              Keep your assistant up-to-date with the latest information about your business.
            </p>
          </div>
          
          {/* Feature 3 */}
          <div className="glass-card rounded-xl p-6 hover-scale">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-pink-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h3 className="card-header text-xl mb-3">Seamless Integration</h3>
            <p className="text-muted">
              Integrate our AI solutions into your website, mobile app, or CRM.
              Simple API endpoints make deployment fast and hassle-free.
            </p>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="glass-card rounded-xl p-8 mb-16">
          <h2 className="card-header text-center text-2xl mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mx-auto mb-4 shadow-md">
                <span className="text-white font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Setup</h3>
              <p className="text-sm text-muted">
                We create your AI assistant project and configure it to your specifications.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mx-auto mb-4 shadow-md">
                <span className="text-white font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Knowledge Base</h3>
              <p className="text-sm text-muted">
                Upload your documents to create a custom knowledge base for your AI assistant.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mx-auto mb-4 shadow-md">
                <span className="text-white font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Customize</h3>
              <p className="text-sm text-muted">
                Fine-tune your AI's behavior, responses, and capabilities to match your brand.
              </p>
            </div>
            
            {/* Step 4 */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mx-auto mb-4 shadow-md">
                <span className="text-white font-bold">4</span>
              </div>
              <h3 className="font-semibold mb-2">Integration</h3>
              <p className="text-sm text-muted">
                Integrate the AI assistant into your digital platforms with our simple API.
              </p>
            </div>
          </div>
        </div>

        {/* Use Cases Section */}
        <div className="mb-16">
          <h2 className="card-header text-center text-2xl mb-8">Use Cases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Use Case 1 */}
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="p-6">
                <h3 className="card-header text-xl mb-3">Customer Support</h3>
                <p className="text-muted mb-4">
                  Provide 24/7 support to your customers with an AI that can handle common inquiries,
                  troubleshoot issues, and escalate complex problems to human agents when necessary.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Reduce response time by up to 80%</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Handle multiple inquiries simultaneously</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Consistent quality across all interactions</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Use Case 2 */}
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="p-6">
                <h3 className="card-header text-xl mb-3">Sales Assistance</h3>
                <p className="text-muted mb-4">
                  Guide customers through their purchase journey with product recommendations,
                  comparisons, and detailed information to boost conversion rates.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Increase conversion rates by up to 30%</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Personalized product recommendations</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Guide customers through complex decisions</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Use Case 3 */}
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="p-6">
                <h3 className="card-header text-xl mb-3">Internal Knowledge Base</h3>
                <p className="text-muted mb-4">
                  Empower your employees with instant access to company information,
                  policies, procedures, and best practices through natural language queries.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Reduce time spent searching for information</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Improve employee onboarding efficiency</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Ensure consistent application of procedures</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Use Case 4 */}
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="p-6">
                <h3 className="card-header text-xl mb-3">Interactive FAQs</h3>
                <p className="text-muted mb-4">
                  Convert static FAQ pages into interactive, conversational experiences that
                  provide more engaging and personalized customer assistance.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Improve user engagement by up to 50%</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Reduce customer support tickets</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Gather insights from customer questions</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Technology Section */}
        <div className="glass-card rounded-xl p-8 mb-16">
          <h2 className="card-header text-center text-2xl mb-8">Our Technology</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">Advanced Language Models</h3>
              <p className="text-muted mb-6">
                Our AI assistants are built on the latest large language models, fine-tuned to understand
                context, nuance, and domain-specific terminology. This ensures high-quality, relevant responses
                that feel natural and helpful.
              </p>
              
              <h3 className="text-lg font-semibold mb-3">Vector Knowledge Base</h3>
              <p className="text-muted mb-6">
                We use cutting-edge vector databases to store and retrieve information from your documents.
                This enables our AI to quickly find relevant information and provide accurate answers based
                on your specific content.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Multi-modal Capabilities</h3>
              <p className="text-muted mb-6">
                Our AI assistants can understand and process various types of input, including text,
                structured data, and in some cases even images, providing versatile interaction possibilities.
              </p>
              
              <h3 className="text-lg font-semibold mb-3">Secure and Private</h3>
              <p className="text-muted mb-6">
                We prioritize the security and privacy of your data. All interactions are encrypted,
                and we offer data residency options to comply with regional regulations.
              </p>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="glass-card rounded-xl p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Ready to enhance your business with AI?</h2>
          <p className="text-lg text-muted mb-6 max-w-2xl mx-auto">
            Start your journey with Catalysia today and experience the benefits of custom AI solutions
            tailored to your specific business needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing" className="btn-gradient px-8 py-3">
              View Pricing
            </Link>
            <Link href="/sign-in" className="btn-outline px-8 py-3">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}