"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, MouseEvent } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isLoggedIn, logoutUser } from "@/lib/auth";
import { FaUserCircle } from "react-icons/fa";

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Check login status on mount and whenever the pathname changes
  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, [pathname]);

  function handleLogout(event: MouseEvent<HTMLButtonElement>) {
    logoutUser();
    setLoggedIn(false);
    router.push("/login");
  }

  return (
    <nav className="flex items-center justify-evenly px-6 py-4 bg-white shadow pt-4">
      <div className="flex items-center space-x-3">
        <Image src="/logo.png" alt="Fixhub Nepal" width={60} height={60} />
        <span className="text-xl -ml-4 font-semibold text-black">Fixhub Nepal</span>
      </div>

      <div className="flex items-center space-x-16 text-lg text-black mx-80 ">
          <Link href="/">Home</Link>
          <Link href="/services">Services</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
      </div>

      {!loggedIn ? (
        <Link href="/login" className="bg-red-500 text-white px-4 py-2 rounded-full ml-8">
          Login
        </Link>
      ) : (
        <div className="relative ml-8">
          <button onClick={() => setOpen(!open)}>
            <FaUserCircle color="black" size={28} />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-50">
              <Link
                href="/auth/dashboard"
                className="block px-4 py-2 text-black hover:bg-gray-100"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}