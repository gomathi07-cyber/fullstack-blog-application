import { useState } from "react";
import { Button, Spinner } from "flowbite-react";
import { AiFillGoogleCircle } from "react-icons/ai";
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import { app } from "../firebase";
import { useDispatch } from "react-redux";
import { signInSuccess } from "../redux/user/userSlice";
import { useNavigate } from "react-router-dom";

// Initialize Firebase authentication
const auth = getAuth(app);

export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleGoogleClick = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      // Create Google authentication provider
      const provider = new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account",
      });

      // Authenticate with Google
      const resultsFromGoogle = await signInWithPopup(auth, provider);

      // Send Google user details to backend
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: resultsFromGoogle.user.displayName,
          email: resultsFromGoogle.user.email,
          googlePhotoUrl: resultsFromGoogle.user.photoURL,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Google authentication failed.");
      }

      // Update Redux store
      dispatch(signInSuccess(data));

      // Navigate to home page
      navigate("/");
    } catch (error) {
      console.error("Google Sign In Error:", error);
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        type="button"
        onClick={handleGoogleClick}
        disabled={loading}
        className="w-full border-2 border-pink-500 bg-white text-gray-800 hover:bg-gradient-to-r hover:from-pink-500 hover:to-orange-500 hover:text-white dark:bg-gray-800 dark:text-white"
      >
        {loading ? (
          <>
            <Spinner size="sm" />
            <span className="pl-3">Signing in...</span>
          </>
        ) : (
          <>
            <AiFillGoogleCircle className="w-6 h-6 mr-2" />
            Continue with Google
          </>
        )}
      </Button>

      {errorMessage && (
        <p className="text-red-500 text-sm mt-3">{errorMessage}</p>
      )}
    </div>
  );
}
