
import {
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
} from 'flowbite-react';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

export default function DashPosts() {
  const { currentUser } = useSelector((state) => state.user);

  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setFetchError(null);

        const res = await fetch(
          `/api/post/getposts?userId=${currentUser._id}`
        );

        const data = await res.json();

        if (!res.ok) {
          setFetchError(data.message || 'Failed to fetch posts');
          return;
        }

        setUserPosts(data.posts || []);
      } catch (error) {
        console.error(error.message);
        setFetchError('Something went wrong while fetching posts.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.isAdmin && currentUser?._id) {
      fetchPosts();
    }
  }, [currentUser?._id, currentUser?.isAdmin]);

  return (
    <div className="p-3 w-full overflow-x-auto">

      {loading && (
        <p className="text-center text-gray-500 my-5">
          Loading posts...
        </p>
      )}

      {fetchError && (
        <p className="text-center text-red-500 my-5">
          {fetchError}
        </p>
      )}

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

                    <TableCell>
                      {post.category}
                    </TableCell>

                    <TableCell>
                      <span className="font-medium text-red-500 hover:underline cursor-pointer">
                        Delete
                      </span>
                    </TableCell>

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
          </div>
        )}

      {!loading &&
        !fetchError &&
        (!currentUser?.isAdmin || userPosts.length === 0) && (
          <p className="text-center text-gray-500 my-5">
            You have no posts yet!
          </p>
        )}
    </div>
  );
}
