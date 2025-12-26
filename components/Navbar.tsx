import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white shadow">
      {/* Left: logo + brand */}
      <div className="flex items-center space-x-2">
        <Image
          src="/image.png"
          alt="Fixhub Nepal logo"
          width={32}
          height={32}
        />
        <span className="text-xl font-semibold text-black">Fixhub Nepal</span>
      </div>

      {/* Center/right: navigation */}
      <div className="flex items-center space-x-6 text-sm text-gray-700">
        <Link href="/" className="hover:text-red-500">
          Home
        </Link>
        <Link href="#services" className="hover:text-red-500">
          Services
        </Link>
        <Link href="#about" className="hover:text-red-500">
          About
        </Link>
        <Link href="#contact" className="hover:text-red-500">
          Contact
        </Link>
        <Link href="/auth/dashboard" className="hover:text-red-500">
          Dashboard
        </Link>
      </div>

      {/* Right: Login button */}
      <Link
        href="/login"
        className="bg-red-500 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-red-600"
      >
        Login
      </Link>
    </nav>
  );
}
