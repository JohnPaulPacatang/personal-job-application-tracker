"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  ExternalLink,
  Trash,
  SquarePen,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";
import { Badge } from "@/app/components/ui/badge";
import { AppliedJobTableData, deleteAppliedJob } from "@/lib/appliedJobsService";
import { useState } from "react";

const getStatusVariant = (status: string) => {
  switch (status) {
    case "submitted":
      return "secondary";
    case "interview":
      return "default";
    case "accepted":
      return "default";
    case "rejected":
      return "destructive";
    case "pending":
      return "outline";
    default:
      return "secondary";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "submitted":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "interview":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "accepted":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "rejected":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    case "pending":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

// Actions Cell Component
function ActionsCell({ 
  job, 
  onEdit, 
  onRefresh 
}: { 
  job: AppliedJobTableData; 
  onEdit: (job: AppliedJobTableData) => void;
  onRefresh: () => void;
}) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteAppliedJob(job.id, job.jobTitle, job.companyName);
      onRefresh();
      setShowDeleteAlert(false);
    } catch (error) {
      console.error("Error deleting job:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => window.open(job.link, "_blank")}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            View job
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onEdit(job)}
            className="flex items-center gap-2"
          >
            <SquarePen className="h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setShowDeleteAlert(true)}
            className="text-red-600 flex items-center gap-2"
          >
            <Trash className="h-4 w-4 text-red-600" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your job application for{" "}
              <span className="font-semibold">{job.jobTitle}</span> at{" "}
              <span className="font-semibold">{job.companyName}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Create columns function that accepts handlers
export const createAppliedJobsColumns = (
  onEdit: (job: AppliedJobTableData) => void,
  onRefresh: () => void
): ColumnDef<AppliedJobTableData>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value: any) =>
          table.toggleAllPageRowsSelected(!!value)
        }
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value: any) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "companyName",
    header: ({ column }) => {
      return (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Company
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium min-w-[120px] text-center">
        {row.getValue("companyName")}
      </div>
    ),
    size: 150,
  },
  {
    accessorKey: "jobTitle",
    header: ({ column }) => {
      return (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Job Title
            <ArrowUpDown className=" h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="min-w-[180px] max-w-[200px] text-center">
        {row.getValue("jobTitle")}
      </div>
    ),
    size: 200,
  },
  {
    accessorKey: "location",
    header: () => <div className="font-semibold text-center">Location</div>,
    cell: ({ row }) => (
      <div className="min-w-[100px] text-center">
        {row.getValue("location")}
      </div>
    ),
    size: 120,
  },
  {
    accessorKey: "salary",
    header: () => <div className="text-center font-semibold">Salary</div>,
    cell: ({ row }) => {
      const salary = parseFloat(row.getValue("salary"));

      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "PHP",
      }).format(salary);

      return (
        <div className="text-center font-medium min-w-[100px]">{formatted}</div>
      );
    },
    size: 120,
  },
  {
    accessorKey: "status",
    header: () => <div className="font-semibold text-center">Status</div>,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div className="min-w-[100px] flex justify-center">
          <Badge
            variant={getStatusVariant(status)}
            className={`capitalize ${getStatusColor(status)}`}
          >
            {status}
          </Badge>
        </div>
      );
    },
    size: 120,
  },
  {
    accessorKey: "dateApplied",
    header: ({ column }) => {
      return (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Date Applied
            <ArrowUpDown className=" h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="text-sm min-w-[100px] text-center">
        {row.getValue("dateApplied")}
      </div>
    ),
    size: 120,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <ActionsCell 
        job={row.original} 
        onEdit={onEdit}
        onRefresh={onRefresh}
      />
    ),
  },
];