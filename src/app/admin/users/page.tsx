
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserRecord } from "firebase-admin/auth";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Trash2, MoreVertical, Edit, KeyRound, ShieldCheck, ShieldOff, Loader2, CheckCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { deleteUser, getAllUsers, updateUser, setUserAdminStatus, generatePasswordResetLink } from "./actions";
import { useNavigation } from "@/hooks/useNavigation";


const editUserSchema = z.object({
  displayName: z.string().min(1, "Name is required."),
  email: z.string().email("Invalid email address."),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;


export default function AdminUsersPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { handleNav } = useNavigation();

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [isResetLinkModalOpen, setIsResetLinkModalOpen] = useState(false);


  const form = useForm<EditUserFormValues>();

  useEffect(() => {
    if (editingUser) {
      form.reset({
        displayName: editingUser.displayName || "",
        email: editingUser.email || "",
      });
    }
  }, [editingUser, form]);


  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/signin");
      } else if (!isAdmin) {
        router.push("/");
      }
    }
  }, [user, authLoading, isAdmin, router]);

  const fetchUsers = async () => {
    setLoading(true);
    const result = await getAllUsers();
    if (result.success && result.users) {
      setUsers(result.users as unknown as UserRecord[]);
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
  }, [user, isAdmin, toast]);

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

  const handleEditUser = (user: UserRecord) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };
  
  const handleUpdateUser = async (values: EditUserFormValues) => {
    if (!editingUser) return;
    const result = await updateUser(editingUser.uid, values);
    if (result.success) {
        toast({ title: "User updated successfully!" });
        setIsEditModalOpen(false);
        setEditingUser(null);
        fetchUsers();
    } else {
        toast({ title: "Error updating user", description: result.error, variant: "destructive" });
    }
  };

  const handleToggleAdmin = async (uid: string, isAdmin: boolean) => {
      const result = await setUserAdminStatus(uid, isAdmin);
      if (result.success) {
          toast({ title: `User role ${isAdmin ? 'granted' : 'revoked'} successfully!` });
          fetchUsers();
      } else {
          toast({ title: "Error changing user role", description: result.error, variant: "destructive" });
      }
  };

  const handleGenerateResetLink = async (email: string) => {
      const result = await generatePasswordResetLink(email);
      if (result.success && result.link) {
          setResetLink(result.link);
          setIsResetLinkModalOpen(true);
      } else {
          toast({ title: "Error generating link", description: result.error, variant: "destructive" });
      }
  }

  const copyResetLink = () => {
    if(resetLink) {
        navigator.clipboard.writeText(resetLink);
        toast({ title: "Link copied to clipboard!" });
    }
  }


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
        <Button variant="outline" size="icon" onClick={handleNav('/admin')}>
            <ArrowLeft />
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
          <div className="grid grid-cols-12 gap-4 p-4 font-bold border-b bg-muted/50 text-sm">
            <div className="col-span-3">Display Name</div>
            <div className="col-span-4">Email</div>
            <div className="col-span-3">UID</div>
            <div className="col-span-1 text-center">Role</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>
          {users.map((appUser) => (
            <div key={appUser.uid} className="grid grid-cols-12 gap-4 p-4 items-center border-b last:border-b-0 text-sm">
                <div className="col-span-3 font-medium truncate">{appUser.displayName || 'N/A'}</div>
                <div className="col-span-4 truncate">{appUser.email || 'N/A'}</div>
                <div className="col-span-3 truncate text-muted-foreground">{appUser.uid}</div>
                <div className="col-span-1 text-center">
                    {appUser.customClaims?.admin ? (
                       <Badge variant="default" className="bg-primary">Admin</Badge>
                    ) : (
                       <Badge variant="secondary">User</Badge>
                    )}
                </div>
                <div className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={user?.uid === appUser.uid}>
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuItem onClick={() => handleEditUser(appUser)}>
                               <Edit className="mr-2 h-4 w-4" />
                               <span>Edit User</span>
                           </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleGenerateResetLink(appUser.email!)}>
                                <KeyRound className="mr-2 h-4 w-4" />
                                <span>Reset Password</span>
                           </DropdownMenuItem>

                            <DropdownMenuSeparator />
                            
                           {appUser.customClaims?.admin ? (
                                <DropdownMenuItem onClick={() => handleToggleAdmin(appUser.uid, false)}>
                                    <ShieldOff className="mr-2 h-4 w-4" />
                                    <span>Revoke Admin</span>
                                </DropdownMenuItem>
                           ) : (
                                <DropdownMenuItem onClick={() => handleToggleAdmin(appUser.uid, true)}>
                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                    <span>Make Admin</span>
                                </DropdownMenuItem>
                           )}

                           <DropdownMenuSeparator />

                           <AlertDialog>
                            <AlertDialogTrigger asChild>
                                 <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500 focus:bg-red-500/10 focus:text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete User</span>
                                </DropdownMenuItem>
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
                                <AlertDialogAction onClick={() => handleDeleteUser(appUser.uid)} className="bg-destructive hover:bg-destructive/90">
                                    Delete User
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                           </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
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

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
                Make changes to the user's profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleUpdateUser)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="displayName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl><Input type="email" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
      </Dialog>

      {/* Password Reset Link Modal */}
      <Dialog open={isResetLinkModalOpen} onOpenChange={setIsResetLinkModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Password Reset Link</DialogTitle>
                <DialogDescription>
                    The password reset link has been generated. Copy it and send it to the user.
                </DialogDescription>
            </DialogHeader>
            <div className="bg-muted p-4 rounded-md text-sm break-all">
                <code>{resetLink}</code>
            </div>
            <DialogFooter>
                 <Button variant="outline" onClick={() => setIsResetLinkModalOpen(false)}>Close</Button>
                 <Button onClick={copyResetLink}><CheckCircle className="mr-2 h-4 w-4"/> Copy Link</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
