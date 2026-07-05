import Link from "next/link";
import { notFound } from "next/navigation";
import { products } from "@/lib/store";
import { formatPrice, placeholderColor } from "@/lib/format";
import { AddToCartButton } from "./add-to-cart-button";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const product = products.get(productId);

  if (!product) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white px-8 py-6 dark:border-zinc-800 dark:bg-zinc-950">
        <Link
          href="/"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← Back to shop
        </Link>
      </header>

      <main className="mx-auto grid w-full max-w-4xl flex-1 grid-cols-1 gap-10 px-8 py-10 sm:grid-cols-2">
        <div className={`aspect-square w-full rounded-xl ${placeholderColor(productId)}`} />

        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {product.name}
          </h1>
          <p className="text-lg text-zinc-700 dark:text-zinc-300">
            {formatPrice(product.price)}
          </p>

          <AddToCartButton productId={product.id} />
        </div>
      </main>
    </div>
  );
}
