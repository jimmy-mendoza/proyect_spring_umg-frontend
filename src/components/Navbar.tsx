import { NavLink } from "react-router-dom";
import { Package, Tags, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/categorias", label: "Categorías", icon: Tags },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/productos", label: "Productos", icon: Package },
];

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <nav className="max-w-6xl mx-auto flex items-center gap-6 px-6 h-14">
        <span className="font-bold text-slate-800">Punto Venta</span>

        <ul className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100",
                  )
                }
              >
                <Icon className="size-4" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

export default Navbar;
