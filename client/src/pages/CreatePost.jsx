import { useState } from 'react';
import { Button, Select, TextInput } from 'flowbite-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export default function CreatePost() {
  const [formData, setFormData] = useState({
    title: '',
    category: 'uncategorized',
    content: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleContentChange = (value) => {
    setFormData({
      ...formData,
      content: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log('Post data:', formData);

    // Backend publish functionality will be added later.
  };

  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold">
        Create a post
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <TextInput
            type="text"
            placeholder="Title"
            required
            id="title"
            className="flex-1"
            value={formData.title}
            onChange={handleChange}
          />

          <Select
            id="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="uncategorized">Select a category</option>
            <option value="javascript">JavaScript</option>
            <option value="reactjs">React.js</option>
            <option value="nextjs">Next.js</option>
          </Select>
        </div>

        <div className="min-h-72 mb-12">
          <ReactQuill
            theme="snow"
            placeholder="Write something..."
            value={formData.content}
            onChange={handleContentChange}
            className="h-60"
          />
        </div>

        <Button
          type="submit"
          className="w-full !bg-gradient-to-r !from-purple-500 !to-pink-500 !text-white hover:!from-pink-500 hover:!to-purple-600 transition-all duration-300"
        >
          Publish
        </Button>
      </form>
    </div>
  );
}
