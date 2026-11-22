import {
  Button,
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
  TextInput,
} from "flowbite-react";

import { Link, useLocation } from "react-router-dom";
import { AiOutlineSearch } from "react-icons/ai";
import { FaMoon } from "react-icons/fa";

export default function Header() {
  const path = useLocation().pathname;

  return (
    <Navbar className="border-b border-slate-700 bg-slate-950">
      <NavbarBrand as={Link} to="/" className="flex items-center gap-1">
        <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          BlogSpace
        </span>
        <span className="text-purple-500 text-2xl font-bold">.</span>
      </NavbarBrand>

      <form>
        <TextInput
          type="text"
          placeholder="Search..."
          rightIcon={AiOutlineSearch}
          className="hidden lg:inline"
        />
      </form>
      <Button className="w-12 h-10 lg:hidden" color="gray" pill>
        <AiOutlineSearch />
      </Button>
      <div className="flex gap-2 md:order-2">
        <Button className="w-12 h-10 hidden sm:inline" color="gray" pill>
          <FaMoon />
        </Button>
       
        <Link to="/sign-in">
          <Button
            color="light"
            className="
      !rounded-lg
      !border-2
      !border-violet-600
      !bg-white
      !text-violet-600
      !font-semibold
      !shadow-none
      !transition-all
      !duration-300

      hover:!border-transparent
      hover:!bg-gradient-to-r
      hover:!from-violet-600
      hover:!to-blue-600
      hover:!text-white
      hover:!shadow-lg
    "
          >
            Sign In
          </Button>
        </Link>
       
        <NavbarToggle />
      </div>
      <NavbarCollapse>
        <NavbarLink as={Link} to="/" active={path === "/"}>
          Home
        </NavbarLink>

        <NavbarLink as={Link} to="/about" active={path === "/about"}>
          About
        </NavbarLink>

        <NavbarLink as={Link} to="/projects" active={path === "/projects"}>
          Projects
        </NavbarLink>
      </NavbarCollapse>
    </Navbar>
  );
}
