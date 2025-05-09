
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/App";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Trash2, UserX } from "lucide-react";

type Report = {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  reason: string;
  status: string;
  created_at: string;
  reporter_name?: string;
  reported_user_name?: string;
  admin_notes?: string | null;
};

const AdminDashboard = () => {
  const { userId, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const reportsPerPage = 10;

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isLoggedIn || !userId) {
        navigate("/login");
        return;
      }

      // In a real app, you'd verify admin status from a user_roles table
      // For now, we'll do a simple check against a predefined admin user ID
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .single();

      if (error || !data) {
        navigate("/");
        toast({
          title: "Unauthorized",
          description: "You do not have access to this page.",
          variant: "destructive",
        });
        return;
      }

      // For demo purposes, consider the user an admin if they're logged in
      // In a real app, you would check against a roles table
      setIsAdmin(true);
      fetchReports();
    };

    checkAdminStatus();
  }, [userId, isLoggedIn, navigate, toast]);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      // Get all reports with the status matching the active tab or all if on "all" tab
      const query = supabase
        .from("user_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (activeTab !== "all") {
        query.eq("status", activeTab);
      }

      const { data: reportData, error } = await query;

      if (error) throw error;

      // Get user names for both reporter and reported user
      const enhancedReports = await Promise.all(
        (reportData || []).map(async (report) => {
          // Get reporter name
          const { data: reporterData } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("id", report.reporter_id)
            .single();

          // Get reported user name
          const { data: reportedUserData } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("id", report.reported_user_id)
            .single();

          return {
            ...report,
            reporter_name: reporterData 
              ? `${reporterData.first_name} ${reporterData.last_name}`.trim()
              : "Unknown User",
            reported_user_name: reportedUserData 
              ? `${reportedUserData.first_name} ${reportedUserData.last_name}`.trim()
              : "Unknown User",
          };
        })
      );

      setReports(enhancedReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({
        title: "Error",
        description: "Failed to fetch reports.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchReports();
    }
  }, [activeTab, isAdmin]);

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("user_reports")
        .update({ status: newStatus })
        .eq("id", reportId);

      if (error) throw error;

      // Update the local state
      setReports(
        reports.map((report) =>
          report.id === reportId ? { ...report, status: newStatus } : report
        )
      );

      toast({
        title: "Status Updated",
        description: `Report marked as ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating report status:", error);
      toast({
        title: "Error",
        description: "Failed to update report status.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async (userId: string, reportId: string) => {
    try {
      // In a real app, consider more cleanup steps before deletion
      // Here we just delete the user accounts
      
      // Delete user from auth.users (this is a simplified example; typically would use an admin API)
      const { error: deleteError } = await supabase.rpc('delete_user', { user_id: userId });

      if (deleteError) throw deleteError;

      // Mark the report as resolved
      await supabase
        .from("user_reports")
        .update({ status: "resolved", admin_notes: "User account deleted" })
        .eq("id", reportId);

      // Update the local state
      setReports(
        reports.map((report) =>
          report.id === reportId 
            ? { 
                ...report, 
                status: "resolved", 
                admin_notes: "User account deleted" 
              } 
            : report
        )
      );

      toast({
        title: "Account Deleted",
        description: "The user account has been permanently deleted.",
      });
    } catch (error: any) {
      console.error("Error deleting user account:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user account.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (report: Report) => {
    setSelectedReport(report);
  };

  // Calculate pagination
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = reports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(reports.length / reportsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (!isAdmin) {
    return <MainLayout><div className="container py-12">Checking permissions...</div></MainLayout>;
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Admin Dashboard</CardTitle>
            <CardDescription>
              Manage reported user accounts and take appropriate actions
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="resolved">Resolved</TabsTrigger>
                <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
                <TabsTrigger value="all">All Reports</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-full" />
                      </div>
                    ))}
                  </div>
                ) : reports.length > 0 ? (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Reported User</TableHead>
                          <TableHead>Reporter</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentReports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell>{report.reported_user_name}</TableCell>
                            <TableCell>{report.reporter_name}</TableCell>
                            <TableCell className="max-w-xs truncate">
                              {report.reason.length > 50 
                                ? `${report.reason.substring(0, 50)}...` 
                                : report.reason}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  report.status === "resolved" 
                                    ? "default" 
                                    : report.status === "dismissed" 
                                    ? "secondary"
                                    : "destructive"
                                }
                              >
                                {report.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(report.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => handleViewDetails(report)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>

                                {report.status === "pending" && (
                                  <>
                                    <Button 
                                      variant="outline" 
                                      size="icon"
                                      onClick={() => handleStatusChange(report.id, "dismissed")}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>

                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button 
                                          variant="destructive" 
                                          size="icon"
                                        >
                                          <UserX className="h-4 w-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete User Account</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This will permanently delete the user account of {report.reported_user_name}. 
                                            This action cannot be undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteAccount(report.reported_user_id, report.id)}
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {totalPages > 1 && (
                      <Pagination className="mt-4">
                        <PaginationContent>
                          {currentPage > 1 && (
                            <PaginationItem>
                              <PaginationPrevious onClick={() => paginate(currentPage - 1)} />
                            </PaginationItem>
                          )}
                          
                          {Array.from({ length: totalPages }).map((_, index) => (
                            <PaginationItem key={index}>
                              <PaginationLink 
                                onClick={() => paginate(index + 1)}
                                isActive={currentPage === index + 1}
                              >
                                {index + 1}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          
                          {currentPage < totalPages && (
                            <PaginationItem>
                              <PaginationNext onClick={() => paginate(currentPage + 1)} />
                            </PaginationItem>
                          )}
                        </PaginationContent>
                      </Pagination>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No reports found.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Report Details Dialog */}
        {selectedReport && (
          <AlertDialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
            <AlertDialogContent className="max-w-lg">
              <AlertDialogHeader>
                <AlertDialogTitle>Report Details</AlertDialogTitle>
              </AlertDialogHeader>
              
              <div className="space-y-4 my-4">
                <div>
                  <h4 className="font-medium text-sm">Reported User</h4>
                  <p>{selectedReport.reported_user_name}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm">Reported By</h4>
                  <p>{selectedReport.reporter_name}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm">Status</h4>
                  <Badge 
                    variant={
                      selectedReport.status === "resolved" 
                        ? "default" 
                        : selectedReport.status === "dismissed" 
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {selectedReport.status}
                  </Badge>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm">Date Reported</h4>
                  <p>{new Date(selectedReport.created_at).toLocaleString()}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm">Reason for Report</h4>
                  <p className="whitespace-pre-wrap">{selectedReport.reason}</p>
                </div>
                
                {selectedReport.admin_notes && (
                  <div>
                    <h4 className="font-medium text-sm">Admin Notes</h4>
                    <p className="whitespace-pre-wrap">{selectedReport.admin_notes}</p>
                  </div>
                )}
              </div>
              
              <AlertDialogFooter>
                {selectedReport.status === "pending" && (
                  <div className="flex space-x-2 mr-auto">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        handleStatusChange(selectedReport.id, "dismissed");
                        setSelectedReport(null);
                      }}
                    >
                      Dismiss Report
                    </Button>
                    
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        handleDeleteAccount(selectedReport.reported_user_id, selectedReport.id);
                        setSelectedReport(null);
                      }}
                    >
                      Delete User
                    </Button>
                  </div>
                )}
                <AlertDialogCancel>Close</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
