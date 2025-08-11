import { 
  collection, 
  query, 
  where, 
  getDocs, 
  Timestamp,
  addDoc,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

export interface AppliedJob {
  id: string;
  companyName: string;
  dateApplied: Timestamp;
  jobTitle: string;
  link: string;
  location: string;
  salary: number;
  status: "Submitted" | "Interview" | "Rejected" | "Accepted" | "Pending";
  userUid: string;
}

export interface AppliedJobTableData {
  id: string;
  companyName: string;
  jobTitle: string;
  location: string;
  salary: number;
  status: "submitted" | "interview" | "rejected" | "accepted" | "pending";
  dateApplied: string;
  link: string;
}

export interface CreateAppliedJobData {
  companyName: string;
  jobTitle: string;
  location: string;
  salary: number;
  status: "Submitted" | "Interview" | "Rejected" | "Accepted" | "Pending";
  link: string;
  userUid: string;
  dateApplied: Date; 
}

export interface UpdateAppliedJobData {
  companyName: string;
  jobTitle: string;
  location: string;
  salary: number;
  status: "Submitted" | "Interview" | "Rejected" | "Accepted" | "Pending";
  link: string;
  dateApplied: Date; 
}

export const getAppliedJobsByUser = async (userUid: string): Promise<AppliedJobTableData[]> => {
  try {
    const appliedJobsRef = collection(db, "appliedjobs");
    const q = query(
      appliedJobsRef,
      where("userUid", "==", userUid)
    );
    
    const querySnapshot = await getDocs(q);
    
    const appliedJobs: AppliedJobTableData[] = querySnapshot.docs.map((doc) => {
      const data = doc.data() as Omit<AppliedJob, 'id'>;
      
      return {
        id: doc.id,
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        location: data.location,
        salary: data.salary,
        status: data.status.toLowerCase() as AppliedJobTableData['status'],
        dateApplied: data.dateApplied.toDate().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        link: data.link,
        dateAppliedTimestamp: data.dateApplied.toDate() 
      };
    });
    
    appliedJobs.sort((a, b) => {
      return (b as any).dateAppliedTimestamp - (a as any).dateAppliedTimestamp;
    });
   
    return appliedJobs.map(job => {
      const { dateAppliedTimestamp, ...jobWithoutTimestamp } = job as any;
      return jobWithoutTimestamp;
    });
  } catch (error) {
    console.error("Error fetching applied jobs:", error);
    toast.error("Failed to fetch applied jobs. Please try again.");
    throw new Error("Failed to fetch applied jobs");
  }
};

export const addAppliedJob = async (jobData: CreateAppliedJobData): Promise<string> => {
  try {
    toast.loading("Adding job application...");
    
    const appliedJobsRef = collection(db, "appliedjobs");
    
    const docRef = await addDoc(appliedJobsRef, {
      companyName: jobData.companyName,
      jobTitle: jobData.jobTitle,
      location: jobData.location,
      salary: jobData.salary,
      status: jobData.status,
      link: jobData.link,
      userUid: jobData.userUid,
      dateApplied: Timestamp.fromDate(jobData.dateApplied) 
    });
    
    toast.dismiss();
    toast.success(`Job application for ${jobData.jobTitle} at ${jobData.companyName} added successfully!`);
    
    return docRef.id;
  } catch (error) {
    console.error("Error adding applied job:", error);
    toast.dismiss();
    toast.error("Failed to add job application. Please try again.");
    throw new Error("Failed to add applied job");
  }
};

export const updateAppliedJob = async (jobId: string, jobData: UpdateAppliedJobData): Promise<void> => {
  try {
    toast.loading("Updating job application...");
    
    const jobDocRef = doc(db, "appliedjobs", jobId);
    
    await updateDoc(jobDocRef, {
      companyName: jobData.companyName,
      jobTitle: jobData.jobTitle,
      location: jobData.location,
      salary: jobData.salary,
      status: jobData.status,
      link: jobData.link,
      dateApplied: Timestamp.fromDate(jobData.dateApplied) // Convert Date to Timestamp
    });
    
    toast.dismiss();
    toast.success(`Job application for ${jobData.jobTitle} at ${jobData.companyName} updated successfully!`);
  } catch (error) {
    console.error("Error updating applied job:", error);
    toast.dismiss();
    toast.error("Failed to update job application. Please try again.");
    throw new Error("Failed to update applied job");
  }
};

export const deleteAppliedJob = async (jobId: string, jobTitle: string, companyName: string): Promise<void> => {
  try {
    toast.loading("Deleting job application...");
    
    const jobDocRef = doc(db, "appliedjobs", jobId);
    
    await deleteDoc(jobDocRef);
    
    toast.dismiss();
    toast.success(`Job application for ${jobTitle} at ${companyName} deleted successfully!`);
  } catch (error) {
    console.error("Error deleting applied job:", error);
    toast.dismiss();
    toast.error("Failed to delete job application. Please try again.");
    throw new Error("Failed to delete applied job");
  }
};