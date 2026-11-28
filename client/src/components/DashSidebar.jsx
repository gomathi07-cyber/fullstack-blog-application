
import {
  Sidebar,
  SidebarItems,
  SidebarItemGroup,
  SidebarItem,
} from 'flowbite-react';

import {
  HiUser,
  HiArrowSmRight,
  HiDocumentText,
} from 'react-icons/hi';

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { signoutSuccess } from '../redux/user/userSlice';
import { useDispatch, useSelector } from 'react-redux';

export default function DashSidebar() {
  const location = useLocation();
  const dispatch = useDispatch();

  const { currentUser } = useSelector((state) => state.user);

  const [tab, setTab] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');

    setTab(tabFromUrl || '');
  }, [location.search]);

  const handleSignout = async () => {
    try {
      const res = await fetch('/api/user/signout', {
        method: 'POST',
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
    <Sidebar className="w-full md:w-56 [&>div]:!rounded-none">
      <SidebarItems>
        <SidebarItemGroup className="flex flex-col gap-1">

          {/* Profile */}
          <Link to="/dashboard?tab=profile">
            <SidebarItem
              active={tab === 'profile'}
              icon={HiUser}
              label={currentUser?.isAdmin ? 'Admin' : 'User'}
              labelColor="dark"
              as="div"
            >
              Profile
            </SidebarItem>
          </Link>

          {/* Posts - Admin only */}
          {currentUser?.isAdmin && (
            <Link to="/dashboard?tab=posts">
              <SidebarItem
                active={tab === 'posts'}
                icon={HiDocumentText}
                as="div"
              >
                Posts
              </SidebarItem>
            </Link>
          )}

          {/* Sign Out */}
          <SidebarItem
            icon={HiArrowSmRight}
            className="cursor-pointer"
            onClick={handleSignout}
          >
            Sign Out
          </SidebarItem>

        </SidebarItemGroup>
      </SidebarItems>
    </Sidebar>
  );
}
