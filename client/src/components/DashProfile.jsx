import { Button, TextInput } from "flowbite-react";
import { useSelector } from "react-redux";

export default function DashProfile() {
  const { currentUser } = useSelector((state) => state.user);

  if (!currentUser) {
    return (
      <p className="text-center mt-10">Please sign in to view your profile.</p>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-3 w-full">
      <h1 className="my-7 text-center font-semibold text-3xl">Profile</h1>

      <form className="flex flex-col gap-4">
        {/* Profile Picture */}
        <div className="w-32 h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full">
          <img
            src={currentUser.profilePicture}
            alt="User profile"
            className="rounded-full w-full h-full object-cover border-8 border-[lightgray]"
          />
        </div>

        {/* Username */}
        <TextInput
          type="text"
          id="username"
          placeholder="Username"
          defaultValue={currentUser.username}
        />

        {/* Email */}
        <TextInput
          type="email"
          id="email"
          placeholder="Email"
          defaultValue={currentUser.email}
        />

        {/* Password */}
        <TextInput type="password" id="password" placeholder="Password" />

        {/* Update Button */}
        <Button
          type="submit"
          className="w-full !bg-gradient-to-r !from-purple-500 !to-blue-500 !text-white hover:!from-blue-500 hover:!to-purple-600 transition-all duration-300"
        >
          Update
        </Button>
      </form>

      {/* Account Actions */}
      <div className="text-red-500 flex justify-between mt-5">
        <span className="cursor-pointer">Delete Account</span>
        <span className="cursor-pointer">Sign Out</span>
      </div>
    </div>
  );
}
