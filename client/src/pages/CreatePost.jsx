
import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  FileInput,
  Select,
  TextInput,
} from 'flowbite-react';

import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';

import { app } from '../firebase';

import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

import { useNavigate } from 'react-router-dom';

export default function CreatePost() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'uncategorized',
    content: '',
  });

  const [publishError, setPublishError] = useState(null);
  const [publishing, setPublishing] = useState(false);

  const navigate = useNavigate();

  // Clean up the local image preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    setImageUploadError(null);

    // Validate image type
    if (!selectedFile.type.startsWith('image/')) {
      setImageUploadError('Please select a valid image file.');
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    // Validate image size (5 MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setImageUploadError('Image size must be less than 5 MB.');
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    setFile(selectedFile);

    // Clear previously uploaded image when selecting another
    setFormData((prev) => ({
      ...prev,
      image: '',
    }));

    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  // Upload image to Firebase Storage
  const handleUploadImage = async () => {
    if (!file) {
      setImageUploadError('Please select an image first.');
      return;
    }

    try {
      setImageUploadError(null);
      setImageUploadProgress(0);

      const storage = getStorage(app);

      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

      const storageRef = ref(storage, `posts/${fileName}`);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );

          setImageUploadProgress(progress);
        },
        (error) => {
          console.error('Firebase upload error:', error);

          setImageUploadError(
            error.code === 'storage/unauthorized'
              ? 'Permission denied. Check your Firebase Storage rules.'
              : error.code === 'storage/quota-exceeded'
                ? 'Firebase Storage quota exceeded.'
                : error.code === 'storage/bucket-not-found'
                  ? 'Firebase Storage bucket was not found. Check your configuration.'
                  : 'Image upload failed. Please try again.'
          );

          setImageUploadProgress(null);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(
              uploadTask.snapshot.ref
            );

            setFormData((prev) => ({
              ...prev,
              image: downloadURL,
            }));

            setImageUploadProgress(null);
            setImageUploadError(null);
          } catch (error) {
            console.error('Download URL error:', error);

            setImageUploadError('Unable to get the uploaded image URL.');
            setImageUploadProgress(null);
          }
        }
      );
    } catch (error) {
      console.error('Image upload error:', error);
      setImageUploadError('Something went wrong during image upload.');
      setImageUploadProgress(null);
    }
  };

  // Handle title and category
  const handleChange = (e) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Handle rich text editor
  const handleContentChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      content: value,
    }));
  };

  // Publish post
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (imageUploadProgress !== null) {
      setPublishError('Please wait until the image upload finishes.');
      return;
    }

    if (file && !formData.image) {
      setPublishError('Please upload the selected image before publishing.');
      return;
    }

    try {
      setPublishing(true);
      setPublishError(null);

      const res = await fetch('/api/post/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setPublishError(data.message || 'Failed to publish post.');
        return;
      }

      navigate(`/post/${data.slug}`);
    } catch (error) {
      console.error('Publish error:', error);
      setPublishError('Something went wrong while publishing.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-8">
      <div className="max-w-3xl mx-auto">

        {/* Page heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white">
            Create a post
          </h1>

          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Share your thoughts with the world.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 bg-white dark:bg-gray-900 p-5 sm:p-7 rounded-xl shadow-md"
        >

          {/* Title and category */}
          <div className="flex flex-col sm:flex-row gap-4">
            <TextInput
              type="text"
              placeholder="Enter post title..."
              required
              id="title"
              value={formData.title}
              onChange={handleChange}
              className="flex-1"
            />

            <Select
              id="category"
              value={formData.category}
              onChange={handleChange}
              className="sm:w-52"
            >
              <option value="uncategorized">Select a category</option>
              <option value="javascript">JavaScript</option>
              <option value="reactjs">React.js</option>
              <option value="nextjs">Next.js</option>
            </Select>
          </div>

          {/* Image upload section */}
          <div className="border-2 border-dashed border-teal-500 rounded-xl p-4 sm:p-5 bg-teal-50/50 dark:bg-gray-800">

            <div className="flex flex-col sm:flex-row gap-4 items-center">

              <div className="flex-1 w-full">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Choose post image
                </label>

                <FileInput
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />

                <p className="text-xs text-gray-500 mt-2">
                  Supported image formats. Maximum size: 5 MB.
                </p>
              </div>

              <div className="flex items-center gap-4">

                {/* Upload progress */}
                {imageUploadProgress !== null && (
                  <div className="w-12 h-12">
                    <CircularProgressbar
                      value={imageUploadProgress}
                      text={`${imageUploadProgress}%`}
                      styles={{
                        path: {
                          stroke: '#14b8a6',
                          strokeLinecap: 'round',
                        },
                        trail: {
                          stroke: '#d1d5db',
                        },
                        text: {
                          fill: '#14b8a6',
                          fontSize: '25px',
                        },
                      }}
                    />
                  </div>
                )}

                <Button
                  type="button"
                  disabled={!file || imageUploadProgress !== null}
                  onClick={handleUploadImage}
                  className="!bg-gradient-to-r !from-purple-500 !to-blue-500 !text-white hover:!from-blue-500 hover:!to-purple-600 transition-all duration-300 disabled:opacity-50"
                >
                  {imageUploadProgress !== null
                    ? 'Uploading...'
                    : formData.image
                      ? 'Upload Again'
                      : 'Upload Image'}
                </Button>

              </div>
            </div>
          </div>

          {/* Image upload error */}
          {imageUploadError && (
            <Alert color="failure">
              {imageUploadError}
            </Alert>
          )}

          {/* Image preview */}
          {previewUrl && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Image Preview
              </p>

              <img
                src={previewUrl}
                alt="Selected post"
                className="w-full h-64 sm:h-80 object-cover rounded-xl border border-gray-200 dark:border-gray-700"
              />

              {formData.image && (
                <p className="text-sm text-green-600 font-medium">
                  Image uploaded successfully!
                </p>
              )}
            </div>
          )}

          {/* Rich text editor */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Post content
            </label>

            <ReactQuill
              theme="snow"
              placeholder="Write something..."
              value={formData.content}
              onChange={handleContentChange}
              className="h-60 mb-12"
            />
          </div>

          {/* Publish button */}
          <Button
            type="submit"
            disabled={publishing || imageUploadProgress !== null}
            className="w-full !bg-gradient-to-r !from-purple-500 !to-pink-500 !text-white hover:!from-pink-500 hover:!to-purple-600 transition-all duration-300"
          >
            {publishing ? 'Publishing...' : 'Publish'}
          </Button>

          {/* Publish error */}
          {publishError && (
            <Alert color="failure">
              {publishError}
            </Alert>
          )}

        </form>
      </div>
    </div>
  );
}
