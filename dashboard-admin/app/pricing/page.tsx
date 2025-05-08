"use client"

import Link from "next/link"
import { useUser } from "@clerk/nextjs"

export default function PricingPage() {
  const { user, isLoaded } = useUser();

  return (
    <div className="min-h-screen p-6 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary opacity-5 blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-secondary opacity-5 blur-3xl"></div>
      
      <div className="relative z-10 content-container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, Transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Pricing</span>
          </h1>
          <p className="text-lg text-muted">
            Choose the plan that's right for your business needs
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Starter Plan */}
          <div className="glass-card rounded-xl overflow-hidden hover-scale">
            <div className="p-6 text-center border-b border-card-border">
              <h3 className="text-xl font-semibold mb-2">Starter</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">$49</span>
                <span className="text-muted">/month</span>
              </div>
              <p className="text-muted">Perfect for small businesses just getting started</p>
            </div>
            <div className="p-6">
              <ul className="space-y-3 mb-8">
                {[
                  "1 AI Assistant",
                  "5,000 messages per month",
                  "Basic analytics",
                  "Standard response time",
                  "Email support",
                  "Custom knowledge base (up to 50 pages)"
                ].map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href={user ? "/dashboard" : "/sign-in"} className="block text-center btn-outline w-full px-6 py-3">
                {user ? "Go to Dashboard" : "Get Started"}
              </Link>
            </div>
          </div>

          {/* Professional Plan - Highlighted */}
          <div className="glass-card rounded-xl overflow-hidden relative hover-scale transform scale-105 shadow-xl">
            <div className="absolute top-0 left-0 w-full bg-gradient-to-r from-primary to-secondary text-white text-center py-1 text-sm font-medium">
              MOST POPULAR
            </div>
            <div className="p-6 text-center border-b border-card-border pt-8">
              <h3 className="text-xl font-semibold mb-2">Professional</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">$149</span>
                <span className="text-muted">/month</span>
              </div>
              <p className="text-muted">Ideal for growing businesses with more demands</p>
            </div>
            <div className="p-6">
              <ul className="space-y-3 mb-8">
                {[
                  "3 AI Assistants",
                  "25,000 messages per month",
                  "Advanced analytics & reporting",
                  "Faster response time",
                  "Priority email & chat support",
                  "Custom knowledge base (up to 500 pages)",
                  "Custom branding options"
                ].map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href={user ? "/dashboard" : "/sign-in"} className="block text-center btn-gradient w-full px-6 py-3">
                {user ? "Go to Dashboard" : "Get Started"}
              </Link>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="glass-card rounded-xl overflow-hidden hover-scale">
            <div className="p-6 text-center border-b border-card-border">
              <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">Custom</span>
              </div>
              <p className="text-muted">For large businesses with custom requirements</p>
            </div>
            <div className="p-6">
              <ul className="space-y-3 mb-8">
                {[
                  "Unlimited AI Assistants",
                  "Unlimited messages",
                  "Full analytics suite with API access",
                  "Fastest response time",
                  "24/7 dedicated support",
                  "Unlimited knowledge base",
                  "Complete customization",
                  "Dedicated account manager",
                  "On-premise deployment option"
                ].map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/sign-in" className="block text-center btn-outline w-full px-6 py-3">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="glass-card rounded-xl p-8 mb-8">
          <h2 className="card-header text-center text-2xl mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">Can I switch plans later?</h3>
              <p className="text-muted mb-6">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
              
              <h3 className="text-lg font-semibold mb-2">Do you offer a free trial?</h3>
              <p className="text-muted mb-6">
                We offer a 14-day free trial on all plans so you can test the features before committing.
              </p>
              
              <h3 className="text-lg font-semibold mb-2">What happens if I exceed my message limit?</h3>
              <p className="text-muted">
                If you exceed your monthly message limit, additional messages are billed at $0.005 per message. You'll receive notifications as you approach your limit.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">How is a "message" defined?</h3>
              <p className="text-muted mb-6">
                A message is defined as a single interaction with your AI assistant, either a user query or the assistant's response.
              </p>
              
              <h3 className="text-lg font-semibold mb-2">Can I create custom AI behaviors?</h3>
              <p className="text-muted mb-6">
                Yes, all plans allow you to customize your AI's behavior, knowledge, and responses. Higher tier plans offer more extensive customization options.
              </p>
              
              <h3 className="text-lg font-semibold mb-2">Do you offer discounts for non-profits?</h3>
              <p className="text-muted">
                Yes, we offer special pricing for non-profit organizations. Please contact our sales team for more information.
              </p>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Ready to transform your customer experience?</h2>
          <p className="text-lg text-muted mb-6">
            Start your 14-day free trial today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-in" className="btn-gradient px-8 py-3">
              Start Free Trial
            </Link>
            <Link href="/information" className="btn-outline px-8 py-3">
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}