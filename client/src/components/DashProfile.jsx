import {
  Alert,
  Button,
  TextInput,
  Modal,
  ModalBody,
  ModalHeader,
} from "flowbite-react";

import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

import { app } from "../firebase";

import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import {
  updateStart,
  updateSuccess,
  updateFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
} from "../redux/user/userSlice";

import { HiOutlineExclamationCircle } from "react-icons/hi";

export default function DashProfile() {
  const { currentUser, error } = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const filePickerRef = useRef(null);

  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);

  const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
  const [updateUserError, setUpdateUserError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageFileUploadError("Please select a valid image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setImageFileUploadError("Image must be smaller than 2MB.");
      return;
    }

    setImageFileUploadError(null);
    setImageFile(file);
    setImageFileUrl(URL.createObjectURL(file));
  };

  // Upload image to Firebase
  useEffect(() => {
    if (!imageFile) return;

    setImageFileUploading(true);
    setImageFileUploadError(null);

    const storage = getStorage(app);
    const fileName = `${Date.now()}-${imageFile.name}`;
    const storageRef = ref(storage, fileName);

    const uploadTask = uploadBytesResumable(storageRef, imageFile);

    const unsubscribe = uploadTask.on(
      "state_changed",

      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
        );

        setImageFileUploadProgress(progress);
      },

      (uploadError) => {
        console.error(uploadError);

        setImageFileUploadError("Could not upload image. Please try again.");

        setImageFileUploadProgress(null);
        setImageFileUploading(false);
        setImageFile(null);
        setImageFileUrl(null);
      },

      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          setImageFileUrl(downloadURL);
          setFormData((prev) => ({
            ...prev,
            profilePicture: downloadURL,
          }));

          setImageFileUploading(false);
          setImageFileUploadProgress(null);
        } catch (uploadError) {
          setImageFileUploadError("Could not retrieve image URL.");
          setImageFileUploading(false);
          setImageFileUploadProgress(null);
        }
      },
    );

    return () => unsubscribe();
  }, [imageFile]);

  // Handle input changes
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  // Update user profile
  const handleSubmit = async (e) => {
    e.preventDefault();

    setUpdateUserError(null);
    setUpdateUserSuccess(null);

    if (Object.keys(formData).length === 0) {
      setUpdateUserError("No changes made");
      return;
    }

    if (imageFileUploading) {
      setUpdateUserError("Please wait for image to upload");
      return;
    }

    try {
      dispatch(updateStart());

      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        dispatch(updateFailure(data.message));
        setUpdateUserError(data.message);
      } else {
        dispatch(updateSuccess(data));
        setUpdateUserSuccess("User's profile updated successfully");
      }
    } catch (updateError) {
      dispatch(updateFailure(updateError.message));
      setUpdateUserError(updateError.message);
    }
  };

  // Delete user account

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());

      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });

      // Read the response safely
      const responseText = await res.text();

      console.log("Response Status:", res.status);
      console.log("Response:", responseText);

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          "Invalid server response. Expected JSON but received HTML or invalid data.",
        );
      }

      if (!res.ok) {
        dispatch(deleteUserFailure(data.message));
        setShowModal(false);
        return;
      }

      dispatch(deleteUserSuccess(data));
      setShowModal(false);
    } catch (deleteError) {
      console.error("Delete User Error:", deleteError);

      dispatch(deleteUserFailure(deleteError.message));
      setShowModal(false);
    }
  };

  if (!currentUser) {
    return (
      <p className="text-center mt-10">Please sign in to view your profile.</p>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-3 w-full">
      <h1 className="my-7 text-center font-semibold text-3xl">Profile</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          {imageFileUploadProgress !== null && (
            <CircularProgressbar
              value={imageFileUploadProgress}
              text={`${imageFileUploadProgress}%`}
              strokeWidth={5}
              styles={{
                root: {
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  top: 0,
                  left: 0,
                },
                path: {
                  stroke: `rgba(62, 152, 199, ${
                    imageFileUploadProgress / 100
                  })`,
                },
              }}
            />
          )}

          <img
            src={imageFileUrl || currentUser.profilePicture}
            alt="user"
            className={`rounded-full w-full h-full object-cover border-8 border-[lightgray] ${
              imageFileUploadProgress !== null && imageFileUploadProgress < 100
                ? "opacity-60"
                : ""
            }`}
          />
        </div>

        {imageFileUploadError && (
          <Alert color="failure">{imageFileUploadError}</Alert>
        )}

        <TextInput
          type="text"
          id="username"
          placeholder="Username"
          defaultValue={currentUser.username}
          onChange={handleChange}
        />

        <TextInput
          type="email"
          id="email"
          placeholder="Email"
          defaultValue={currentUser.email}
          onChange={handleChange}
        />

        <TextInput
          type="password"
          id="password"
          placeholder="Password"
          onChange={handleChange}
        />

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
          onClick={() => setShowModal(true)}
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

      {/* Update messages */}
      {updateUserSuccess && (
        <Alert color="success" className="mt-5">
          {updateUserSuccess}
        </Alert>
      )}

      {updateUserError && (
        <Alert color="failure" className="mt-5">
          {updateUserError}
        </Alert>
      )}

      {error && (
        <Alert color="failure" className="mt-5">
          {error}
        </Alert>
      )}

      {/* Delete confirmation modal */}

      {/* Delete confirmation modal */}
      <Modal
        className="rounded-none"
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
        theme={{
          content: {
            inner: "relative flex flex-col rounded-xl bg-white shadow-xl",
          },
        }}
      >
        <ModalHeader />

        <ModalBody className="bg-white rounded-xl">
          <div className="text-center">
            {/* Warning Icon */}
            <HiOutlineExclamationCircle className="h-14 w-14 pt-2 text-red-500 mb-4 mx-auto" />

            {/* Confirmation Message */}
            <h3 className="mb-3 text-lg font-semibold text-gray-800">
              Are you sure you want to delete your account?
            </h3>

            <p className="mb-6 text-sm text-gray-500">
              This action cannot be undone.
            </p>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 border-none outline-none">
              {/* Delete Button */}
              <Button color="red" className="!border-0 !ring-0 focus:!ring-0 focus:!outline-none"  onClick={handleDeleteUser}>Yes, I'm sure</Button>

              {/* Cancel Button */}
              <Button
                onClick={() => setShowModal(false)}
                className="
                  !bg-gray-100
                  !text-gray-700
                  !border
                  !border-gray-300
                  hover:!bg-gray-200
                  hover:scale-105
                  active:scale-95
                  transition-all
                  duration-300
                  border-none
                  outline-none
                "
              >
                No, cancel
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
}
