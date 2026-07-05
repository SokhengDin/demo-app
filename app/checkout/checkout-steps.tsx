const STEPS = [
  { key: "shipping", label: "Shipping" },
  { key: "payment", label: "Payment" },
  { key: "review", label: "Review" },
];

export function CheckoutSteps({ current }: { current: "shipping" | "payment" | "review" }) {
  const currentIndex = STEPS.findIndex((step) => step.key === current);

  return (
    <div className="mx-auto flex w-full max-w-md items-center justify-center gap-2 px-6 pb-2 pt-6">
      {STEPS.map((step, index) => (
        <div key={step.key} className="flex flex-1 items-center gap-2">
          <div className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                index <= currentIndex
                  ? "bg-accent text-accent-foreground"
                  : "bg-stone-200 text-stone-500 dark:bg-stone-800 dark:text-stone-500"
              }`}
            >
              {index + 1}
            </div>
            <span
              className={`text-xs font-medium ${
                index <= currentIndex
                  ? "text-stone-900 dark:text-stone-50"
                  : "text-stone-500 dark:text-stone-500"
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < STEPS.length - 1 && (
            <div
              className={`mb-4 h-px flex-1 ${
                index < currentIndex
                  ? "bg-accent"
                  : "bg-stone-200 dark:bg-stone-800"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
