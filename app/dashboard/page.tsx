"use client";
import { useEffect, useState } from "react";
import Nav from "./nav";
import { createAppliedJobsColumns } from "./columns";
import { EnhancedDataTable } from "./data-table";
import {
  getAppliedJobsByUser,
  AppliedJobTableData,
} from "@/lib/appliedJobsService";
import { toast } from "sonner";
import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Plus } from "lucide-react";
import AddJobModal from "./add-job-modal";
import { EditJobModal } from "./edit-job-modal";

const ContentSkeleton = () => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
    <div className="space-y-2">
      <Skeleton className="h-5 w-80" />
      <Skeleton className="h-4 w-40" />
    </div>
    <Skeleton className="h-10 w-full sm:w-36" />
  </div>
);

interface UserData {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export default function Dashboard() {
  const [appliedJobs, setAppliedJobs] = useState<AppliedJobTableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<AppliedJobTableData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        toast.error("Error loading user data");
      }
    }
  }, []);

  useEffect(() => {
    fetchAppliedJobs();
  }, [user]);

  const fetchAppliedJobs = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const jobs = await getAppliedJobsByUser(user.uid);
      setAppliedJobs(jobs);
    } catch (error) {
      toast.error("Failed to load applied jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleJobAdded = () => {
    fetchAppliedJobs();
  };

  const handleEdit = (job: AppliedJobTableData) => {
    setEditingJob(job);
    setIsEditModalOpen(true);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setEditingJob(null);
  };

  const handleEditSuccess = () => {
    fetchAppliedJobs(); 
  };

  const columns = createAppliedJobsColumns(handleEdit, fetchAppliedJobs);

  const NavSkeleton = () => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-10 w-full sm:w-36" />
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 sm:py-8">
            <Nav loading={loading} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pb-8 pt-6 sm:pt-8">
            <ContentSkeleton />
            <div className="flex items-center justify-center h-64 mt-8">
              <p className="text-muted-foreground text-center text-sm sm:text-base">
                Please log in to view your applications.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6 sm:py-8">
          <Nav loading={loading} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pb-8 pt-6 sm:pt-8">
          {loading ? (
            <ContentSkeleton />
          ) : (
            <div className="mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm sm:text-base">
                  Manage applications and track progress with ease.
                </p>
                {appliedJobs.length > 0 && (
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Total applications: {appliedJobs.length}
                  </p>
                )}
              </div>

              <Button
                className="flex items-center gap-2 w-full sm:w-auto justify-center"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add Application
              </Button>
            </div>
          )}
          
          {loading ? (
            <div className="flex items-center justify-center h-64 mt-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
            </div>
          ) : (
            <div className="overflow-x-auto mt-6 sm:mt-8">
              <EnhancedDataTable
                columns={columns}
                data={appliedJobs}
              />
            </div>
          )}
        </div>
      </div>

      <AddJobModal
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        userUid={user.uid}
        onJobAdded={handleJobAdded}
      />

      <EditJobModal
        isOpen={isEditModalOpen}
        onClose={handleEditClose}
        job={editingJob}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}