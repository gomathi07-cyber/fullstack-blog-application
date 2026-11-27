import { useState } from "react";
import {
  Avatar,
  Button,
  Dropdown,
  DropdownHeader,
  DropdownItem,
  DropdownDivider,
  Navbar,
  NavbarToggle,
  NavbarCollapse,
  NavbarLink,
  TextInput,
} from "flowbite-react";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { AiOutlineSearch } from "react-icons/ai";
import { FaMoon } from "react-icons/fa";
import { useSelector , useDispatch } from "react-redux";
import { signoutSuccess } from "../redux/user/userSlice";
export default function Header() {
  const path = useLocation().pathname;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentUser } = useSelector((state) => state.user);

  const [searchTerm, setSearchTerm] = useState("");

  // Handle search submission
  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedSearch = searchTerm.trim();

    if (trimmedSearch) {
      navigate(`/search?searchTerm=${encodeURIComponent(trimmedSearch)}`);
    }
  };

  const handleSignout = async () => {
    try {
      const res = await fetch("/api/user/signout", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signoutSuccess());
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <Navbar className="border-b-2">
      {/* Logo */}
      <Link
        to="/"
        className="self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white"
      >
        <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white">
          BlogSpace
        </span>
      </Link>

      {/* Search */}
      {/* Search */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 min-w-0 mx-2 sm:mx-3 md:max-w-48 lg:max-w-64 xl:max-w-96"
      >
        <TextInput
          type="text"
          placeholder="Search..."
          rightIcon={AiOutlineSearch}
          className="w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </form>

      {/* Right Section */}
      <div className="flex shrink-0 items-center gap-2 md:order-2">
        {/* User Authentication */}
        {currentUser ? (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar
                alt="User profile"
                img={currentUser.profilePicture}
                rounded
              />
            }
          >
            <DropdownHeader>
              <span className="block text-sm">@{currentUser.username}</span>

              <span className="block text-sm font-medium truncate">
                {currentUser.email}
              </span>
            </DropdownHeader>

            <DropdownItem onClick={() => navigate("/dashboard?tab=profile")}>
              Profile
            </DropdownItem>

            <DropdownDivider />

            <DropdownItem onClick={handleSignout}>
              Sign out
            </DropdownItem>
          </Dropdown>
        ) : (
          <Link to="/signin">
            <Button  className="bg-gradient-to-r from-purple-500 to-blue-500 !text-white hover:from-purple-600 hover:to-blue-600">
              Sign In
            </Button>
          </Link>
        )}

        <NavbarToggle />
      </div>

      {/* Navigation Links */}
      {/* Navigation Links */}
      <NavbarCollapse>
        <NavbarLink active={path === "/"} as="div">
          <Link to="/">Home</Link>
        </NavbarLink>

        <NavbarLink active={path === "/about"} as="div">
          <Link to="/about">About</Link>
        </NavbarLink>

        <NavbarLink active={path === "/projects"} as="div">
          <Link to="/projects">Projects</Link>
        </NavbarLink>
      </NavbarCollapse>
    </Navbar>
  );
}
