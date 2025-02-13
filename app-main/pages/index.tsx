// pages/index.tsx
import dynamic from "next/dynamic";

// Dynamically import the real HomePage to disable SSR
const HomePage = dynamic(() => import("../components/HomePage"), {
  ssr: false,
});

export default function Index() {
  return (
    <HomePage />
  );
}
