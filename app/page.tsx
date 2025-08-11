import { Login } from "@/app/components/Login"

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto flex items-center justify-center min-h-screen">
      <main className="w-full max-w-sm">
        <Login />
      </main>
    </div>
  );
}