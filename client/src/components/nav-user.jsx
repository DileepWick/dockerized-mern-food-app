"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  LogOut,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {authService} from "../util/service-gateways"; // Axios utility to interact with backend API

export function NavUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isMobile } = useSidebar();

  // Fetch logged-in user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authService.get("/auth/me"); // Adjust the endpoint if needed
        setUser(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Logout functionality
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout"); // Make sure to handle logout on the backend
      // Clear user data from state and redirect to login page
      setUser(null);
      navigate.push("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Optional loading state
  }

  // If the user is not logged in, redirect to the login page
  if (!user) {
    navigate("/login"); // Redirecting to the login page
    return null; // Prevent rendering anything while redirecting
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={
                    user.avatar ||
                    "https://res.cloudinary.com/dhcawltsr/image/upload/v1739535069/2b887d85197371.5d74f0d175dcd_rmmvwh.gif"
                  }
                  alt={user.name}
                />
                <AvatarFallback className="rounded-lg">
                  {user.username}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.username}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={
                      user.avatar ||
                      "https://res.cloudinary.com/dhcawltsr/image/upload/v1739535069/2b887d85197371.5d74f0d175dcd_rmmvwh.gif"
                    }
                    alt={user.name}
                  />
                  <AvatarFallback className="rounded-lg">
                    {user.username}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.username}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
