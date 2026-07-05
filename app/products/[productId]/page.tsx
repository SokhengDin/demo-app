import Link from "next/link";
import { notFound } from "next/navigation";
import { products } from "@/lib/store";
import { formatPrice, placeholderColor, iconTint } from "@/lib/format";
import { PRODUCT_DESCRIPTIONS } from "@/lib/product-copy";
import { ProductIcon } from "@/lib/product-icons";
import { AddToCartButton } from "./add-to-cart-button";

const TRUST_ITEMS = [
  {
    label: "Free returns",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
      />
    ),
  },
  {
    label: "Ships in 2 days",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-12h-3v8.25m0 0H3.375c-.621 0-1.125-.504-1.125-1.125V9.75"
      />
    ),
  },
  {
    label: "Secure checkout",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
      />
    ),
  },
];

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
    <div className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-4xl px-6 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            className="h-4 w-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to shop
        </Link>
      </div>

      <main className="mx-auto grid w-full max-w-4xl flex-1 grid-cols-1 gap-10 px-6 py-8 sm:grid-cols-2">
        <div
          className={`relative flex aspect-square w-full items-center justify-center rounded-2xl ${placeholderColor(
            productId
          )}`}
        >
          <ProductIcon
            productId={productId}
            className={`h-32 w-32 ${iconTint(productId)}`}
          />
          {product.stock === 0 && (
            <span className="absolute right-4 top-4 rounded-full bg-stone-900/80 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm dark:bg-stone-100/90 dark:text-stone-900">
              Out of stock
            </span>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
              {product.name}
            </h1>
            <p className="mt-1 text-xl text-stone-700 dark:text-stone-300">
              {formatPrice(product.price)}
            </p>
          </div>

          <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
            {PRODUCT_DESCRIPTIONS[productId]}
          </p>

          <AddToCartButton productId={product.id} />

          <div className="mt-2 flex flex-col gap-2 border-t border-stone-200 pt-4 dark:border-stone-800">
            {TRUST_ITEMS.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="h-4 w-4 text-accent"
                >
                  {item.icon}
                </svg>
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
