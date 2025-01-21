// pages/index.tsx
import React from "react";

export default function HomePage() {
  return (
    <div style={{ margin: "2rem" }}>
      <h1>Welcome, you are authenticated!</h1>
      <p>All content here is protected by Next.js middleware.</p>
    </div>
  );
}
