import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import OAuth from "../components/OAuth";

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { id, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [id]: value.trim(),
    }));

    setErrorMessage("");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.password) {
      setErrorMessage("Please fill out all fields.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        setErrorMessage(data.message || "Signup failed. Please try again.");
        return;
      }

      navigate("/sign-in");
    } catch (error) {
      setErrorMessage(
        error.message || "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mt-20">
      <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5">
        {/* Left section */}
        <div className="flex-1">
          <Link to="/" className="font-bold dark:text-white text-4xl">
            <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white">
              BlogSpace
            </span>
          </Link>

          <p className="text-sm mt-5">
            You can sign up with your email and password or with Google.
          </p>
        </div>

        {/* Right section */}
        <div className="flex-1">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="username">Your username</Label>
              <TextInput
                type="text"
                placeholder="Username"
                id="username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="email">Your email</Label>
              <TextInput
                type="email"
                placeholder="user@gmail.com"
                id="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="password">Your password</Label>
              <TextInput
                type="password"
                placeholder="Password"
                id="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 text-white"
            >
              {loading ? (
                <>
                  <Spinner size="sm" aria-label="Loading" />
                  <span className="pl-3">Loading...</span>
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
            <OAuth />
          </form>

          <div className="flex gap-2 text-sm mt-5">
            <span>Have an account?</span>
            <Link to="/sign-in" className="text-blue-500">
              Sign In
            </Link>
          </div>

          {errorMessage && (
            <Alert className="mt-5" color="failure">
              {errorMessage}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
