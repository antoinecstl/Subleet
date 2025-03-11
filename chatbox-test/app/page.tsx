import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className="w-full text-center">
        <h1 className="text-4xl font-bold">My Shop</h1>
      </header>
      


      {/* Ajout de la bannière promotionnelle */}
      <div className="w-full p-4 text-center bg-gray-200 dark:bg-gray-800">
        <h2 className="text-2xl">Soldes d'été ! Jusqu'à 50% de réduction</h2>
      </div>

      {/* Ajout des catégories de produits */}
      <section className="w-full py-8">
        <h3 className="text-xl font-semibold mb-4">Catégories</h3>
        <div className="flex gap-4 justify-center">
          <a href="#" className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded">Catégorie 1</a>
          <a href="#" className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded">Catégorie 2</a>
          <a href="#" className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded">Catégorie 3</a>
        </div>
      </section>

      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="border p-4 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
            <h2 className="mt-2 text-xl">Product 1</h2>
            <p className="text-gray-600 dark:text-gray-300">$19.99</p>
            <Link href="./hoodie" className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">Add to Cart</Link>
          </div>
          <div className="border p-4 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
            <h2 className="mt-2 text-xl">Product 2</h2>
            <p className="text-gray-600 dark:text-gray-300">$29.99</p>
            <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">Add to Cart</button>
          </div>
          <div className="border p-4 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
            <h2 className="mt-2 text-xl">Product 3</h2>
            <p className="text-gray-600 dark:text-gray-300">$39.99</p>
            <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">Add to Cart</button>
          </div>
          <div className="border p-4 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
            <h2 className="mt-2 text-xl">Product 4</h2>
            <p className="text-gray-600 dark:text-gray-300">$49.99</p>
            <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">Add to Cart</button>
          </div>
        </div>
      </main>

      {/* Ajout de la section témoignages */}
      <section className="w-full py-8 bg-gray-200 dark:bg-gray-800">
        <h3 className="text-xl font-semibold mb-4">Ce que disent nos clients</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white dark:bg-gray-700 rounded shadow text-gray-800 dark:text-gray-100">
            <p>Produits excellents !</p>
            <p className="mt-2 font-semibold">- Client 1</p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-700 rounded shadow text-gray-800 dark:text-gray-100">
            <p>Service exceptionnel.</p>
            <p className="mt-2 font-semibold">- Client 2</p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-700 rounded shadow text-gray-800 dark:text-gray-100">
            <p>Je recommande vivement.</p>
            <p className="mt-2 font-semibold">- Client 3</p>
          </div>
        </div>
      </section>

      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
