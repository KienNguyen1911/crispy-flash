"use client";

import { useEffect, useState, useReducer } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { Loader2, Search, Trash2, Shield, User as UserIcon } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
  googleId: string | null;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface FetchState {
  users: User[];
  meta: Meta | null;
  loading: boolean;
}

type FetchAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DATA'; payload: { users: User[]; meta: Meta } }
  | { type: 'SET_ERROR' };

const fetchReducer = (state: FetchState, action: FetchAction): FetchState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_DATA':
      return { ...state, users: action.payload.users, meta: action.payload.meta, loading: false };
    case 'SET_ERROR':
      return { ...state, loading: false };
    default:
      return state;
  }
};

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [fetchState, dispatch] = useReducer(fetchReducer, {
    users: [],
    meta: null,
    loading: true
  });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchUsers = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(debouncedSearch && { search: debouncedSearch }),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001"}/api/users?${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch users");

      const data = await response.json();
      dispatch({ type: 'SET_DATA', payload: { users: data.data, meta: data.meta } });
    } catch (error) {
      toast.error("Error fetching users");
      console.error(error);
      dispatch({ type: 'SET_ERROR' });
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchUsers();
  }, [token, page, debouncedSearch]);

  const updateRole = async (userId: string, newRole: "USER" | "ADMIN") => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001"}/api/users/${userId}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (!response.ok) throw new Error("Failed to update role");

      toast.success("Role updated successfully");
      fetchUsers(); // Refresh list
    } catch (error) {
      toast.error("Error updating role");
      console.error(error);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001"}/api/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete user");

      toast.success("User deleted successfully");
      fetchUsers(); // Refresh list
    } catch (error) {
      toast.error("Error deleting user");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <div className="flex items-center gap-2">
           <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 w-[250px]"
            />
          </div>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fetchState.loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    Loading...
                  </div>
                </TableCell>
              </TableRow>
            ) : fetchState.users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              fetchState.users.map((user) => (
                <TableRow key={user.id} suppressHydrationWarning>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-sm text-muted-foreground">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      defaultValue={user.role}
                      onValueChange={(value) => updateRole(user.id, value as "USER" | "ADMIN")}
                    >
                      <SelectTrigger className="w-[110px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">
                          <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4" /> User
                          </div>
                        </SelectItem>
                        <SelectItem value="ADMIN">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" /> Admin
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell suppressHydrationWarning>
                    {format(new Date(user.createdAt), "PPP")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteUser(user.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {fetchState.meta && fetchState.meta.totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {page} of {fetchState.meta.totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(fetchState.meta!.totalPages, p + 1))}
            disabled={page === fetchState.meta.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
