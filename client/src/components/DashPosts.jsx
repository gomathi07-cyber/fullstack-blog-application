import {
  Modal,
  ModalBody,
  ModalHeader,
  Button,
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
} from "flowbite-react";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { HiOutlineExclamationCircle } from "react-icons/hi";

export default function DashPosts() {
  const { currentUser } = useSelector((state) => state.user);

  const [userPosts, setUserPosts] = useState([]);
  const [showMore, setShowMore] = useState(true);

  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Delete modal states
  const [showModal, setShowModal] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch initial posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setFetchError(null);

        const res = await fetch(`/api/post/getposts?userId=${currentUser._id}`);

        const data = await res.json();

        if (!res.ok) {
          setFetchError(data.message || "Failed to fetch posts");
          return;
        }

        setUserPosts(data.posts || []);

        if (data.posts.length < 9) {
          setShowMore(false);
        } else {
          setShowMore(true);
        }
      } catch (error) {
        console.log(error.message);
        setFetchError("Something went wrong while fetching posts.");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.isAdmin && currentUser?._id) {
      fetchPosts();
    }
  }, [currentUser?._id, currentUser?.isAdmin]);

  // Fetch more posts
  const handleShowMore = async () => {
    const startIndex = userPosts.length;

    try {
      setLoading(true);
      setFetchError(null);

      const res = await fetch(
        `/api/post/getposts?userId=${currentUser._id}&startIndex=${startIndex}`,
      );

      const data = await res.json();

      if (!res.ok) {
        setFetchError(data.message || "Failed to fetch more posts");
        return;
      }

      setUserPosts((prev) => [...prev, ...(data.posts || [])]);

      if (data.posts.length < 9) {
        setShowMore(false);
      }
    } catch (error) {
      console.log(error.message);
      setFetchError("Something went wrong while loading more posts.");
    } finally {
      setLoading(false);
    }
  };

  // Delete post
  const handleDeletePost = async () => {
    if (!postIdToDelete) return;

    try {
      setDeleteLoading(true);

      const res = await fetch(
        `/api/post/deletepost/${postIdToDelete}/${currentUser._id}`,
        {
          method: "DELETE",
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setFetchError(
          typeof data === "string"
            ? data
            : data.message || "Failed to delete post",
        );
        return;
      }

      // Remove deleted post from the frontend
      setUserPosts((prev) =>
        prev.filter((post) => post._id !== postIdToDelete),
      );

      setShowModal(false);
      setPostIdToDelete("");
    } catch (error) {
      console.log(error.message);
      setFetchError("Something went wrong while deleting the post.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-3 w-full overflow-x-auto">
      {/* Loading */}
      {loading && (
        <p className="text-center text-gray-500 my-5">Loading posts...</p>
      )}

      {/* Error */}
      {fetchError && (
        <p className="text-center text-red-500 my-5">{fetchError}</p>
      )}

      {/* Posts table */}
      {!loading &&
        !fetchError &&
        currentUser?.isAdmin &&
        userPosts.length > 0 && (
          <div className="overflow-x-auto rounded-lg shadow-md">
            <Table hoverable>
              <TableHead>
                <TableRow>
                  <TableHeadCell>Date updated</TableHeadCell>
                  <TableHeadCell>Post image</TableHeadCell>
                  <TableHeadCell>Post title</TableHeadCell>
                  <TableHeadCell>Category</TableHeadCell>
                  <TableHeadCell>Delete</TableHeadCell>
                  <TableHeadCell>Edit</TableHeadCell>
                </TableRow>
              </TableHead>

              <TableBody className="divide-y">
                {userPosts.map((post) => (
                  <TableRow
                    key={post._id}
                    className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                    <TableCell>
                      {new Date(post.updatedAt).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      <Link to={`/post/${post.slug}`}>
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-20 h-12 object-cover rounded-md bg-gray-200"
                        />
                      </Link>
                    </TableCell>

                    <TableCell>
                      <Link
                        className="font-medium text-gray-900 dark:text-white hover:underline"
                        to={`/post/${post.slug}`}
                      >
                        {post.title}
                      </Link>
                    </TableCell>

                    <TableCell>{post.category}</TableCell>

                    {/* Delete button */}
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => {
                          setShowModal(true);
                          setPostIdToDelete(post._id);
                        }}
                        className="font-medium text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </TableCell>

                    {/* Edit */}
                    <TableCell>
                      <Link
                        className="font-medium text-teal-500 hover:underline"
                        to={`/update-post/${post._id}`}
                      >
                        Edit
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Show more */}
            {showMore && (
              <button
                type="button"
                onClick={handleShowMore}
                disabled={loading}
                className="w-full text-teal-500 text-sm py-7 hover:underline disabled:opacity-50"
              >
                Show more
              </button>
            )}
          </div>
        )}

      {/* No posts */}
      {!loading &&
        !fetchError &&
        (!currentUser?.isAdmin || userPosts.length === 0) && (
          <p className="text-center text-gray-500 my-5">
            You have no posts yet!
          </p>
        )}

      {/* Delete confirmation modal */}
      <Modal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setPostIdToDelete("");
        }}
        popup
        size="md"
        theme={{
          content: {
            base: "relative h-full w-full p-4 md:h-auto",
            inner: "relative rounded-lg bg-white shadow",
          },
        }}
      >
        <ModalHeader className="border-b-0 bg-white" />

        <ModalBody className="bg-white rounded-b-lg">
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-red-500 mb-4 mx-auto" />

            <h3 className="mb-5 text-lg font-medium text-gray-700">
              Are you sure you want to delete this post?
            </h3>

            <div className="flex justify-center gap-4">
              <Button
                color="red"
                onClick={handleDeletePost}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Yes, I'm sure"}
              </Button>

              <Button
                color="light"
                onClick={() => {
                  setShowModal(false);
                  setPostIdToDelete("");
                }}
                disabled={deleteLoading}
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
