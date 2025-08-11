"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { toast } from "sonner";
import { addAppliedJob, CreateAppliedJobData } from "@/lib/appliedJobsService";

interface AddJobFormData {
  companyName: string;
  jobTitle: string;
  location: string;
  salary: string;
  status: "Submitted" | "Interview" | "Rejected" | "Accepted" | "Pending";
  link: string;
}

interface AddJobModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userUid: string;
  onJobAdded: () => void;
}

export default function AddJobModal({
  isOpen,
  onOpenChange,
  userUid,
  onJobAdded,
}: AddJobModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<AddJobFormData>({
    companyName: "",
    jobTitle: "",
    location: "",
    salary: "",
    status: "Submitted",
    link: "",
  });

  const handleInputChange = (field: keyof AddJobFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      companyName: "",
      jobTitle: "",
      location: "",
      salary: "",
      status: "Submitted",
      link: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.companyName.trim() ||
      !formData.jobTitle.trim() ||
      !formData.location.trim() ||
      !formData.salary.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate salary is a number
    const salaryNumber = parseFloat(formData.salary);
    if (isNaN(salaryNumber) || salaryNumber < 0) {
      toast.error("Please enter a valid salary amount");
      return;
    }

    setIsSubmitting(true);

    try {
      const jobData: CreateAppliedJobData = {
        companyName: formData.companyName.trim(),
        jobTitle: formData.jobTitle.trim(),
        location: formData.location.trim(),
        salary: salaryNumber,
        status: formData.status,
        link: formData.link.trim() || "",
        userUid: userUid,
      };

      await addAppliedJob(jobData);

      toast.success("Job application added successfully!");
      onOpenChange(false);
      resetForm();
      onJobAdded();
    } catch (error) {
      console.error("Error adding job application:", error);
      toast.error("Failed to add job application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Job Application</DialogTitle>
          <DialogDescription>
            Fill in the details of your new job application.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) =>
                  handleInputChange("companyName", e.target.value)
                }
                placeholder="Enter company name"
                className="placeholder:text-sm"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="jobTitle">Job Title *</Label>
              <Input
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                placeholder="Enter job title"
                className="placeholder:text-sm"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="Enter job location"
                className="placeholder:text-sm"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="salary">Salary (PHP) *</Label>
              <Input
                id="salary"
                type="number"
                value={formData.salary}
                onChange={(e) => handleInputChange("salary", e.target.value)}
                placeholder="Enter salary amount"
                className="placeholder:text-sm"
                min="0"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: AddJobFormData["status"]) =>
                  handleInputChange("status", value)
                }
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="Interview">Interview</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Accepted">Accepted</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="link">Job Link</Label>
              <Input
                id="link"
                type="url"
                value={formData.link}
                onChange={(e) => handleInputChange("link", e.target.value)}
                placeholder="Enter job posting URL"
                className="placeholder:text-sm"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
