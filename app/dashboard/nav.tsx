"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
import { Skeleton } from "@/app/components/ui/skeleton";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";

interface UserData {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

interface NavProps {
  loading?: boolean;
}

const Nav: React.FC<NavProps> = ({ loading = false }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
    setUserLoading(false);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('user');
      setUser(null);
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    }
  };

  const getInitials = (name: string | null, email: string | null): string => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };
  
  const showSkeleton = loading || userLoading;

  return (
    <nav className="flex items-center justify-between border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-lg">
      <div className="flex items-center space-x-2">
        {showSkeleton ? (
          <Skeleton className="h-7 w-24" />
        ) : (
          <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        )}
      </div>

      {showSkeleton ? (
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-16 hidden sm:block" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      ) : user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center space-x-2 hover:opacity-80 transition-opacity focus:outline-none">
              <span className="text-sm font-medium text-foreground hidden sm:block">
                {user.displayName || user.email?.split('@')[0] || 'User'}
              </span>
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {getInitials(user.displayName, user.email)}
                </AvatarFallback>
                {user.photoURL && (
                  <AvatarImage 
                    src={user.photoURL} 
                    alt={user.displayName || 'User avatar'} 
                  />
                )}
              </Avatar>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user.displayName || 'User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email || 'No email'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-400 cursor-pointer"
              onClick={handleLogout}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Not logged in</span>
        </div>
      )}
    </nav>
  );
};

export default Nav;