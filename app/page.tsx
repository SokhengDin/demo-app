import Link from "next/link";
import { products } from "@/lib/store";
import { formatPrice, placeholderColor, iconTint } from "@/lib/format";
import { ProductIcon } from "@/lib/product-icons";

const FEATURES = [
  {
    title: "Free shipping over $40",
    description: "On every order, no code needed.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-12h-3v8.25m0 0H3.375c-.621 0-1.125-.504-1.125-1.125V9.75"
      />
    ),
  },
  {
    title: "30-day returns",
    description: "Didn't love it? Send it back.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
      />
    ),
  },
  {
    title: "Made to last",
    description: "Small-batch, durable materials.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    ),
  },
];

export default function Home() {
  const items = [...products.values()];

  return (
    <div className="flex flex-1 flex-col">
      <section className="relative overflow-hidden border-b border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(194,65,12,0.12),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(251,146,60,0.12),transparent_40%)]"
        />
        <div className="relative mx-auto w-full max-w-5xl px-6 py-16 text-center sm:py-20">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            New season
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl dark:text-stone-50">
            Everyday goods, made to last
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-stone-600 dark:text-stone-400">
            Small-batch essentials for your desk, your bag, and your morning
            routine.
          </p>
        </div>

        <div className="relative mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 px-6 pb-14 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="flex items-start gap-3 rounded-xl border border-stone-200 bg-stone-50/60 px-4 py-3 dark:border-stone-800 dark:bg-stone-950/40"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="mt-0.5 h-5 w-5 shrink-0 text-accent"
              >
                {feature.icon}
              </svg>
              <div>
                <p className="text-sm font-medium text-stone-900 dark:text-stone-50">
                  {feature.title}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <main className="mx-auto grid w-full max-w-5xl flex-1 grid-cols-1 gap-6 px-6 py-12 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-stone-800 dark:bg-stone-900"
          >
            <div
              className={`relative flex aspect-square w-full items-center justify-center ${placeholderColor(
                product.id
              )} overflow-hidden`}
            >
              <ProductIcon
                productId={product.id}
                className={`h-20 w-20 transition-transform duration-300 group-hover:scale-110 ${iconTint(
                  product.id
                )}`}
              />
              {product.stock === 0 && (
                <span className="absolute right-3 top-3 rounded-full bg-stone-900/80 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm dark:bg-stone-100/90 dark:text-stone-900">
                  Out of stock
                </span>
              )}
              {product.stock > 0 && product.stock <= 5 && (
                <span className="absolute right-3 top-3 rounded-full bg-accent/90 px-2.5 py-1 text-xs font-medium text-accent-foreground backdrop-blur-sm">
                  Low stock
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1 p-5">
              <h2 className="font-medium text-stone-900 dark:text-stone-50">
                {product.name}
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                {formatPrice(product.price)}
              </p>
            </div>
          </Link>
        ))}
      </main>
    </div>
  );
}
