import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 sm:px-6 lg:px-8">
      <h1 className="text-5xl font-bold mb-8 animate-fadeIn">
        Welcome to Catalisia
      </h1>
      <p className="text-lg mb-8 text-center max-w-2xl animate-slideUp">
        Catalisia is your ultimate AI-powered chatbot solution, designed to seamlessly integrate into your business and enhance customer interactions.
      </p>
      <Link href="/dashboard">
        <button className="bg-white text-blue-500 py-2 px-6 rounded-full shadow-lg hover:bg-gray-200 transition transform hover:scale-105 duration-300">
          Go to Dashboard
        </button>
      </Link>
    </div>
  );
}
