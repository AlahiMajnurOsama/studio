
"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { UserRecord } from "firebase-admin/auth";
import { useAuth } from "@/hooks/useAuth";
import { useAppContext } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { deleteUser, getAllUsers } from "./actions";

export default function AdminUsersPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { setPageLoading } = useAppContext();
  const [isPending, startTransition] = useTransition();

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageLoading(isPending);
  }, [isPending, setPageLoading]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        startTransition(() => {
          router.push("/signin");
        });
      } else if (!isAdmin) {
        startTransition(() => {
          router.push("/");
        });
      }
    }
  }, [user, authLoading, isAdmin, router]);

  const fetchUsers = async () => {
    setLoading(true);
    const result = await getAllUsers();
    if (result.success && result.users) {
      setUsers(result.users);
    } else {
      toast({
        title: "Error fetching users",
        description: result.error,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchUsers();
    }
  }, [user, isAdmin]);

  const handleDeleteUser = async (uid: string) => {
    const result = await deleteUser(uid);
    if (result.success) {
      toast({
        title: "User Deleted",
        description: "The user has been successfully deleted.",
      });
      fetchUsers(); // Refresh the list
    } else {
      toast({
        title: "Error deleting user",
        description: result.error,
        variant: "destructive",
      });
    }
  };
  
   if (authLoading || !user || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
         <div className="flex justify-center items-center h-screen">
            <Skeleton className="w-full h-96" />
        </div>
      </div>
    );
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">
          Manage Users
        </h1>
      </div>

      {loading ? (
        <div className="p-4 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
            ))}
        </div>
      ) : (
        <div className="bg-card border rounded-lg shadow-sm">
          <div className="grid grid-cols-10 gap-4 p-4 font-bold border-b bg-muted/50">
            <div className="col-span-3">Display Name</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-3">UID</div>
            <div className="text-right">Actions</div>
          </div>
          {users.map((appUser) => (
            <div key={appUser.uid} className="grid grid-cols-10 gap-4 p-4 items-center border-b last:border-b-0 text-sm">
                <div className="col-span-3 font-medium truncate">{appUser.displayName || 'N/A'}</div>
                <div className="col-span-3 truncate">{appUser.email || 'N/A'}</div>
                <div className="col-span-3 truncate text-muted-foreground">{appUser.uid}</div>
                <div className="flex justify-end">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive" size="icon" disabled={user?.uid === appUser.uid}>
                                <Trash2 className="h-4 w-4" />
                           </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the user account. This action cannot be undone.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteUser(appUser.uid)}>
                                Delete User
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
          ))}
           {users.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                    No users found.
                </div>
            )}
        </div>
      )}
    </div>
  );
}
