"use client"

import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image";


export default function Home() {
  const { user } = useUser();

  return (
    <div className="">
      {/* Navbar */}
      <nav className="w-full flex justify-between items-center p-5 shadow-md">
        <h1 className="text-xl font-semibold">Yojuro</h1>
        {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Image
                  src={user.user_metadata?.avatar_url || "/default-avatar.png"}
                  alt="User"
                  className="w-10 h-10 rounded-full cursor-pointer"
                  width={100}
                  height={100}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="mt-2">
                <DropdownMenuLabel>{user.user_metadata?.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log("Logout")}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button>
            <Link href={"/auth/login"}>Login</Link>
          </Button>
        )}
      </nav>

      {/* Hero Section */}
      <section className="text-center mt-10">
        <h2 className="text-3xl font-bold">Welcome to Yojuro</h2>
        <p className="text-gray-600 mt-2">Create fitness challenges, track progress, and win!</p>
        <Button className="mt-4">Get Started</Button>
      </section>

      {/* How It Works */}
      <section className="text-center mt-8">
        <h3 className="text-xl font-semibold">How It Works</h3>
        <ul className="mt-4 text-gray-600">
          <li>✔ Set a fitness challenge</li>
          <li>✔ Stake money to participate</li>
          <li>✔ Track progress & win rewards</li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-600 mt-auto p-4">
        <p>&copy; 2025 Yojuro. All rights reserved.</p>
      </footer>
    </div>
  );
}
