
import { Alert, Button, TextInput } from 'flowbite-react';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';

export default function DashProfile() {
  const { currentUser } = useSelector((state) => state.user);

  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);

  const filePickerRef = useRef(null);

  // Handle image selection and preview
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate image type
    if (!file.type.startsWith('image/')) {
      setImageFileUploadError('Please select a valid image file.');
      return;
    }

    // Validate image size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setImageFileUploadError('Image must be smaller than 2MB.');
      return;
    }

    setImageFileUploadError(null);

    // Display selected image immediately
    const previewUrl = URL.createObjectURL(file);
    setImageFileUrl(previewUrl);
  };

  // Check logged-in user
  if (!currentUser) {
    return (
      <p className="text-center mt-10">
        Please sign in to view your profile.
      </p>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-3 w-full">
      <h1 className="my-7 text-center font-semibold text-3xl">
        Profile
      </h1>

      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => e.preventDefault()}
      >
        {/* Image picker */}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={filePickerRef}
          hidden
        />

        {/* Profile picture */}
        <div
          className="relative w-32 h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full"
          onClick={() => filePickerRef.current?.click()}
        >
          <img
            src={imageFileUrl || currentUser.profilePicture}
            alt="User profile"
            className="rounded-full w-full h-full object-cover border-8 border-[lightgray]"
          />
        </div>

        {/* Image validation error */}
        {imageFileUploadError && (
          <Alert color="failure">
            {imageFileUploadError}
          </Alert>
        )}

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
        <TextInput
          type="password"
          id="password"
          placeholder="Password"
        />

        {/* Update button */}
        <Button
          type="submit"
          className="w-full !bg-gradient-to-r !from-purple-500 !to-blue-500 !text-white hover:!from-blue-500 hover:!to-purple-600 transition-all duration-300"
        >
          Update
        </Button>
      </form>

      {/* Account actions */}
      <div className="flex justify-between mt-5 gap-4">
        <button
          type="button"
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-300"
        >
          Delete Account
        </button>

        <button
          type="button"
          className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors duration-300"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
