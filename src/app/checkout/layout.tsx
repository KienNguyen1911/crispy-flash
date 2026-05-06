import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | Flashcard",
  description: "Choose your subscription plan",
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
