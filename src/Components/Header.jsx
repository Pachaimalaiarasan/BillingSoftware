import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

const Header = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/ProductsList", label: "Products" },
    { to: "/SuppliersList", label: "Suppliers" },
    { to: "/CustomersList", label: "Customers" },
    { to: "/BillList", label: "Bills" },
    { to: "/Admin", label: "Admin" },
  ];

  return (
    <header className="bg-yellow-400 text-black shadow-md sticky top-0 z-50">
      <div className="max-w-8xl mx-auto flex justify-between items-center px-4 py-4">
        {/* Logo + Brand */}
        <Link to="/" className="flex items-center text-2xl font-bold">
          <img
            src="/images/logo.png"
            alt="Logo"
            className="h-10 w-auto mr-2"
          />
          Super Market
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-6 font-medium">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`transition hover:text-white ${
                location.pathname === link.to ? "underline font-semibold" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
          onClick={() => setMobileMenuOpen(prev => !prev)}
          className="md:hidden text-3xl focus:outline-none"
        >
          ☰
        </button>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <nav className="md:hidden bg-yellow-300 px-4 pb-4 animate-slide-down">
          <ul className="flex flex-col space-y-3 pt-3 font-medium">
            {navLinks.map(link => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="block hover:underline"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header;
