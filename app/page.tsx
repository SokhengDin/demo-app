import Link from "next/link";
import { products } from "@/lib/store";
import { formatPrice, placeholderColor } from "@/lib/format";

export default function Home() {
  const items = [...products.values()];

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white px-8 py-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Cambria Shop
        </h1>
      </header>

      <main className="mx-auto grid w-full max-w-5xl flex-1 grid-cols-1 gap-6 px-8 py-10 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className={`aspect-square w-full ${placeholderColor(product.id)}`} />
            <div className="flex flex-col gap-1 p-4">
              <h2 className="font-medium text-zinc-900 dark:text-zinc-50">
                {product.name}
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {formatPrice(product.price)}
              </p>
            </div>
          </Link>
        ))}
      </main>
    </div>
  );
}
