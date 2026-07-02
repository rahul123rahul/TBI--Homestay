"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Loader, Modal, Input } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";

export default function AdminDashboard() {
  const router = useRouter();
  const toast = useToast();
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [countdown, setCountdown] = useState(3);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);

  // Administrative Data states
  const [overviewStats, setOverviewStats] = useState([]);
  const [users, setUsers] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [homestays, setHomestays] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [ads, setAds] = useState([]);
  const [cmsSeo, setCmsSeo] = useState(null);

  // Modal and Interactive states
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRole, setUserRole] = useState("Staff");

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [complaintNotes, setComplaintNotes] = useState("");
  
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState("");

  const [newAdHomestay, setNewAdHomestay] = useState("");
  const [newAdSlot, setNewAdSlot] = useState("Homepage Banner Carousel");
  const [newAdBudget, setNewAdBudget] = useState("");

  // CMS/SEO form fields
  const [cmsHeroTitle, setCmsHeroTitle] = useState("");
  const [cmsHeroSubtitle, setCmsHeroSubtitle] = useState("");
  const [cmsMetaTitle, setCmsMetaTitle] = useState("");
  const [cmsMetaDescription, setCmsMetaDescription] = useState("");

  // Authentication check
  useEffect(() => {
    const loggedIn = localStorage.getItem("isStaffLoggedIn") === "true";
    const role = localStorage.getItem("userRole");
    const isAdmin = loggedIn && role === "Admin";
    setIsAuthorized(isAdmin);

    if (!isAdmin) {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            router.push("/login");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else {
      fetchAdminData();
    }
  }, [router]);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      // 1. Overview stats
      const overRes = await fetch("http://localhost:5000/api/admin/overview");
      const overJson = await overRes.json();
      if (overJson.success) {
        setOverviewStats(overJson.data.stats);
      }

      // 2. Users
      const usersRes = await fetch("http://localhost:5000/api/admin/users");
      const usersJson = await usersRes.json();
      if (usersJson.success) {
        setUsers(usersJson.data);
      }

      // 3. Verifications
      const verRes = await fetch("http://localhost:5000/api/admin/verifications");
      const verJson = await verRes.json();
      if (verJson.success) {
        setVerifications(verJson.data);
      }

      // 4. Homestays
      const homeRes = await fetch("http://localhost:5000/api/admin/homestays");
      const homeJson = await homeRes.json();
      if (homeJson.success) {
        setHomestays(homeJson.data);
      }

      // 5. Bookings
      const bookRes = await fetch("http://localhost:5000/api/admin/bookings");
      const bookJson = await bookRes.json();
      if (bookJson.success) {
        setBookings(bookJson.data);
      }

      // 6. Reviews
      const revRes = await fetch("http://localhost:5000/api/admin/reviews");
      const revJson = await revRes.json();
      if (revJson.success) {
        setReviews(revJson.data);
      }

      // 7. Complaints
      const compRes = await fetch("http://localhost:5000/api/admin/complaints");
      const compJson = await compRes.json();
      if (compJson.success) {
        setComplaints(compJson.data);
      }

      // 8. Ads
      const adsRes = await fetch("http://localhost:5000/api/admin/ads");
      const adsJson = await adsRes.json();
      if (adsJson.success) {
        setAds(adsJson.data);
      }

      // 9. CMS & SEO Settings
      const cmsRes = await fetch("http://localhost:5000/api/admin/cms-seo");
      const cmsJson = await cmsRes.json();
      if (cmsJson.success && cmsJson.data) {
        setCmsSeo(cmsJson.data);
        setCmsHeroTitle(cmsJson.data.homepageHeroTitle || "");
        setCmsHeroSubtitle(cmsJson.data.homepageHeroSubtitle || "");
        setCmsMetaTitle(cmsJson.data.metaTitle || "");
        setCmsMetaDescription(cmsJson.data.metaDescription || "");
      }
    } catch (error) {
      console.error("Failed to load admin data:", error);
      toast.error(`Admin loading error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // User CRUD handlers
  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!userName || !userEmail) return;
    try {
      let url = "http://localhost:5000/api/admin/users";
      let method = "POST";
      const body = { name: userName, email: userEmail, role: userRole };
      if (userPassword) body.password = userPassword;

      if (selectedUser) {
        url = `http://localhost:5000/api/admin/users/${selectedUser._id}`;
        method = "PUT";
      } else {
        if (!userPassword) {
          toast.error("Password is required for new users.");
          return;
        }
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      if (json.success) {
        toast.success(selectedUser ? "User updated!" : "User created!");
        setIsUserModalOpen(false);
        setSelectedUser(null);
        setUserName("");
        setUserEmail("");
        setUserPassword("");
        setUserRole("Staff");
        fetchAdminData();
      }
    } catch (err) {
      toast.error("Failed to save user: " + err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("User deleted successfully.");
        fetchAdminData();
      }
    } catch (err) {
      toast.error("Failed to delete user: " + err.message);
    }
  };

  // Verification Requests approvals
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!selectedVerification) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/verifications/${selectedVerification._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Approved", comments: verificationNotes })
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Verification Request Approved!");
        setIsVerificationModalOpen(false);
        setVerificationNotes("");
        setSelectedVerification(null);
        fetchAdminData();
      }
    } catch (err) {
      toast.error("Failed to approve verification: " + err.message);
    }
  };

  // Homestay featured toggle & deletion
  const handleToggleFeatured = async (id, isCurrentlyFeatured) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/homestays/${id}/featured`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !isCurrentlyFeatured })
      });
      const json = await res.json();
      if (json.success) {
        toast.success(!isCurrentlyFeatured ? "Homestay pinned to featured listing!" : "Homestay unpinned.");
        fetchAdminData();
      }
    } catch (err) {
      toast.error("Failed to toggle featured status: " + err.message);
    }
  };

  const handleDeleteHomestay = async (id) => {
    if (!window.confirm("Are you sure you want to delete this homestay?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/homestays/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Homestay listing removed.");
        fetchAdminData();
      }
    } catch (err) {
      toast.error("Failed to delete homestay: " + err.message);
    }
  };

  // Booking approval/cancel status updates
  const handleUpdateBookingStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/bookings/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Booking status updated to ${newStatus}!`);
        fetchAdminData();
      }
    } catch (err) {
      toast.error("Failed to update booking status: " + err.message);
    }
  };

  // Complaints Resolution
  const handleResolveComplaint = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/complaints/${selectedComplaint._id}/resolve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Resolved", resolutionNotes: complaintNotes })
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Complaint Ticket Resolved!");
        setIsComplaintModalOpen(false);
        setComplaintNotes("");
        setSelectedComplaint(null);
        fetchAdminData();
      }
    } catch (err) {
      toast.error("Failed to resolve ticket: " + err.message);
    }
  };

  // Ads Campaigns CRUD
  const handleCreateAd = async (e) => {
    e.preventDefault();
    if (!newAdHomestay || !newAdBudget) return;
    try {
      const res = await fetch("http://localhost:5000/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          homestay: newAdHomestay,
          promoSlot: newAdSlot,
          budget: Number(newAdBudget)
        })
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Advertisement campaign published!");
        setNewAdHomestay("");
        setNewAdBudget("");
        fetchAdminData();
      }
    } catch (err) {
      toast.error("Failed to publish ad campaign: " + err.message);
    }
  };

  const handleToggleAdStatus = async (id, currentActiveState) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/ads/${id}/toggle`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActiveState })
      });
      const json = await res.json();
      if (json.success) {
        toast.success(!currentActiveState ? "Campaign Activated!" : "Campaign Paused.");
        fetchAdminData();
      }
    } catch (err) {
      toast.error("Failed to toggle campaign state: " + err.message);
    }
  };

  // CMS/SEO Saves
  const handleSaveCmsSeo = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/admin/cms-seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          homepageHeroTitle: cmsHeroTitle,
          homepageHeroSubtitle: cmsHeroSubtitle,
          metaTitle: cmsMetaTitle,
          metaDescription: cmsMetaDescription
        })
      });
      const json = await res.json();
      if (json.success) {
        toast.success("CMS page copy and SEO metadata updated globally!");
        fetchAdminData();
      }
    } catch (err) {
      toast.error("Failed to update CMS configurations: " + err.message);
    }
  };

  // Access Denied layout check
  if (isAuthorized === false) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 bg-muted/10 min-h-[60vh]">
        <div className="w-full max-w-md bg-card border border-red-200 dark:border-red-900/30 rounded-3xl p-8 shadow-xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500" />
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" className="h-8 w-8">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-red-800 dark:text-red-400">Admin Clearance Required</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This space is restricted to Trishul System Administrators only.
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl p-4">
            <p className="text-xs font-semibold text-red-700 dark:text-red-400">
              Redirecting in <span className="font-bold text-sm text-red-800 dark:text-red-300">{countdown}s</span>...
            </p>
          </div>
          <Button onClick={() => router.push("/login")} className="w-full">Sign In as Admin</Button>
        </div>
      </div>
    );
  }

  if (isAuthorized === null || isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-muted/10 min-h-[50vh]">
        <Loader variant="spinner" size="lg" label="Vetting administrative credentials..." />
      </div>
    );
  }

  // RENDERS
  const renderOverview = () => {
    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          {overviewStats.map((stat, idx) => (
            <div key={idx} className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{stat.name}</p>
              <p className="mt-2 text-2xl font-bold text-primary dark:text-primary-foreground">{stat.value}</p>
              <span className="text-[10px] font-medium text-accent block mt-1">{stat.change}</span>
            </div>
          ))}
        </div>

        {/* Global Overview Graphics */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-base font-bold text-primary dark:text-primary-foreground">Monthly Occupancy Rates & System Load</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Average occupancy across all 8 homestays (Summer Season)</p>
          <div className="mt-6 space-y-4">
            {[
              { month: "May 2026", percentage: "64%" },
              { month: "June 2026", percentage: "82%" },
              { month: "July 2026 (Projected)", percentage: "94%" }
            ].map((d, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-primary">{d.month}</span>
                  <span className="text-accent">{d.percentage} Occupied</span>
                </div>
                <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: d.percentage }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderUsers = () => {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex justify-between items-center border-b border-border pb-4">
          <div>
            <h3 className="text-base font-bold text-primary dark:text-primary-foreground">Users & Roles Registry</h3>
            <p className="text-xs text-muted-foreground mt-0.5">List and assign roles to platform operators.</p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setSelectedUser(null);
              setUserName("");
              setUserEmail("");
              setUserPassword("");
              setUserRole("Staff");
              setIsUserModalOpen(true);
            }}
          >
            Create User Account
          </Button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/60 text-primary font-semibold">
                <th className="px-4 py-3">User Name</th>
                <th className="px-4 py-3">Email Address</th>
                <th className="px-4 py-3">System Role</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {users.map((u, i) => (
                <tr key={i} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-semibold text-primary">{u.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider
                      ${
                        u.role === "Admin"
                          ? "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400"
                          : u.role === "Owner"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                          : "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400"
                      }
                    `}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(u);
                        setUserName(u.name);
                        setUserEmail(u.email);
                        setUserPassword("");
                        setUserRole(u.role);
                        setIsUserModalOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900/30"
                      onClick={() => handleDeleteUser(u._id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* User Modal */}
        <Modal
          isOpen={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          title={selectedUser ? "Update User Details" : "Register Platform User"}
        >
          <form onSubmit={handleSaveUser} className="space-y-4">
            <Input
              id="name"
              label="Account Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
            <Input
              id="email"
              type="email"
              label="Email Address"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              required
            />
            <Input
              id="pass"
              type="password"
              label={selectedUser ? "Secret Key Override (optional)" : "Secret Access Key"}
              value={userPassword}
              onChange={(e) => setUserPassword(e.target.value)}
              required={!selectedUser}
            />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-primary dark:text-primary-foreground">System Permissions Role</label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
              >
                <option value="Staff">Staff (Classifier Operations)</option>
                <option value="Owner">Owner (Listing Hosts)</option>
                <option value="Admin">Admin (Full Permissions)</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4 border-t border-border/60">
              <Button variant="outline" className="flex-1 text-xs" onClick={() => setIsUserModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex-1 text-xs">{selectedUser ? "Save Updates" : "Create Account"}</Button>
            </div>
          </form>
        </Modal>
      </div>
    );
  };

  const renderOwnersVerifications = () => {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h3 className="text-base font-bold text-primary dark:text-primary-foreground">Owners Document Vetting Console</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Vetting property deeds, ID proofs, and compliance certifications.</p>
        </div>

        <div className="space-y-4">
          {verifications.map((req, idx) => (
            <div key={idx} className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-primary dark:text-primary-foreground">{req.propertyName}</h4>
                  <p className="text-xs text-muted-foreground mt-1">Host User: {req.owner ? req.owner.name : "Unlinked Host"}</p>
                </div>
                <span className={`inline-flex items-center rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider
                  ${
                    req.status === "Approved"
                      ? "bg-green-100 text-green-800"
                      : req.status === "Rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }
                `}>
                  {req.status}
                </span>
              </div>

              <div className="mt-4 border-t border-border/20 pt-3">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Uploaded Vetting Documents:</span>
                <div className="flex gap-2.5 mt-2">
                  {req.documents.map((d, i) => (
                    <span key={i} className="text-[10px] font-semibold bg-muted border border-border px-2.5 py-1 rounded-full text-primary">
                      📄 {d}
                    </span>
                  ))}
                </div>
              </div>

              {req.comments && (
                <p className="text-xs text-muted-foreground italic mt-3 bg-muted/30 p-2.5 rounded-lg">
                  Comments: {req.comments}
                </p>
              )}

              {req.status === "Pending" && (
                <div className="mt-4 flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedVerification(req);
                      setVerificationNotes("");
                      setIsVerificationModalOpen(true);
                    }}
                  >
                    Vetting Approval
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Verification Modal */}
        <Modal
          isOpen={isVerificationModalOpen}
          onClose={() => setIsVerificationModalOpen(false)}
          title="Approve Host Verification"
        >
          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <p className="text-xs text-muted-foreground leading-normal">
              By confirming, you certify that all uploaded deeds and IDs have been validated against government registries.
            </p>
            <Input
              id="notes"
              label="Auditor Vetting Notes"
              placeholder="e.g. Deeds checked on municipal registry page..."
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              required
            />
            <div className="flex gap-3 pt-4 border-t border-border/60">
              <Button variant="outline" className="flex-1 text-xs" onClick={() => setIsVerificationModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex-1 text-xs">Verify & Approve</Button>
            </div>
          </form>
        </Modal>
      </div>
    );
  };

  const renderHomestays = () => {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h3 className="text-base font-bold text-primary dark:text-primary-foreground">Properties Network Catalog</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Toggle home page featured properties, edit, or delete listings.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {homestays.map((h, idx) => (
            <div key={idx} className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="flex gap-4">
                <img src={h.images[0]} alt={h.name} className="h-20 w-24 object-cover rounded-lg border border-border" />
                <div className="flex-1 space-y-1">
                  <h4 className="text-sm font-bold text-primary dark:text-primary-foreground">{h.name}</h4>
                  <p className="text-xs text-muted-foreground">{h.location}</p>
                  <p className="text-xs font-semibold text-accent">{h.category} • ₹{h.startingPrice}/night</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
                <span className="text-[10px] text-muted-foreground">Host: {h.hostDetails.name}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={h.category === "Top Rated" ? "bg-accent/10 border-accent text-accent" : ""}
                    onClick={() => handleToggleFeatured(h._id, h.category === "Top Rated")}
                  >
                    ★ {h.category === "Top Rated" ? "Featured" : "Feature"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900/30"
                    onClick={() => handleDeleteHomestay(h._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBookings = () => {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h3 className="text-base font-bold text-primary dark:text-primary-foreground">Bookings Master Ledger</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Overview and state controls for guest reservations.</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/65 text-primary font-semibold">
                <th className="px-4 py-3">Property</th>
                <th className="px-4 py-3">Guest Name</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Total Cost</th>
                <th className="px-4 py-3">Booking Status</th>
                <th className="px-4 py-3 text-right">State Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {bookings.map((b, idx) => (
                <tr key={idx} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-primary">{b.homestay ? b.homestay.name : "Deleted Property"}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">
                    <p className="font-semibold text-primary">{b.guestName}</p>
                    <p className="text-[10px]">{b.guestEmail}</p>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">
                    {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-primary">₹{b.totalAmount}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider
                      ${
                        b.status === "Confirmed"
                          ? "bg-green-100 text-green-800"
                          : b.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : b.status === "Completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }
                    `}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right flex justify-end gap-1.5 align-middle py-4">
                    {b.status === "Pending" && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateBookingStatus(b._id, "Confirmed")}
                      >
                        Confirm
                      </Button>
                    )}
                    {b.status !== "Cancelled" && b.status !== "Completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900/30"
                        onClick={() => handleUpdateBookingStatus(b._id, "Cancelled")}
                      >
                        Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderReviews = () => {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h3 className="text-base font-bold text-primary dark:text-primary-foreground">Global Reviews Monitor</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Sentiment classifications and deletion capabilities.</p>
        </div>

        <div className="space-y-4">
          {reviews.map((rev, idx) => (
            <div key={idx} className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-primary">{rev.homestay ? rev.homestay.name : "Eco-Stay"}</span>
                <span className="text-xs text-muted-foreground">{rev.date}</span>
                <span className={`inline-flex items-center rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  rev.sentiment === "Positive"
                    ? "bg-green-100 text-green-800"
                    : rev.sentiment === "Neutral"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {rev.sentiment}
                </span>
              </div>
              <p className="text-xs italic text-muted-foreground leading-relaxed">"{rev.text}"</p>
              {rev.response && (
                <div className="mt-3 bg-muted p-3 rounded-lg text-xs leading-normal">
                  <span className="font-bold text-primary uppercase block text-[8px] mb-1">Host Reply:</span>
                  {rev.response}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMarketingAds = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
        {/* Campaign creator */}
        <div className="lg:col-span-4 rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6 self-start">
          <div>
            <h3 className="text-base font-bold text-primary dark:text-primary-foreground">Publish Ad Campaign</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Promote specific homestays on searches.</p>
          </div>

          <form onSubmit={handleCreateAd} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-primary dark:text-primary-foreground">Select Homestay</label>
              <select
                value={newAdHomestay}
                onChange={(e) => setNewAdHomestay(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-inner text-foreground"
                required
              >
                <option value="">-- Choose Listing --</option>
                {homestays.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-primary dark:text-primary-foreground">Promotional Ad Spot</label>
              <select
                value={newAdSlot}
                onChange={(e) => setNewAdSlot(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-inner text-foreground"
              >
                <option value="Homepage Banner Carousel">Homepage Banner Carousel</option>
                <option value="Search Results Promoted Top">Search Results Promoted Top</option>
                <option value="Recommendation Pop-up">Recommendation Pop-up</option>
              </select>
            </div>

            <Input
              id="budget"
              type="number"
              label="Monthly Ad Budget (₹)"
              placeholder="e.g. 5000"
              value={newAdBudget}
              onChange={(e) => setNewAdBudget(e.target.value)}
              required
            />

            <Button type="submit" className="w-full text-xs">Launch Campaign</Button>
          </form>
        </div>

        {/* Campaign List */}
        <div className="lg:col-span-8 rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-primary dark:text-primary-foreground">Active Ad Slots</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Platform promotional allocations and billings.</p>
          </div>

          <div className="space-y-4">
            {ads.map((ad, idx) => (
              <div key={idx} className="flex justify-between items-center border border-border/60 p-4 rounded-xl">
                <div>
                  <h4 className="text-xs font-bold text-primary dark:text-primary-foreground">
                    {ad.homestay ? ad.homestay.name : "Deleted Property"}
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-1">Slot: {ad.promoSlot}</p>
                  <p className="text-[10px] font-bold text-accent mt-0.5">Budget: ₹{ad.budget}/month</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${ad.isActive ? "bg-green-500 animate-pulse" : "bg-red-400"}`} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleAdStatus(ad._id, ad.isActive)}
                  >
                    {ad.isActive ? "Pause" : "Activate"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderComplaints = () => {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h3 className="text-base font-bold text-primary dark:text-primary-foreground">Guest Complaints Helpdesk</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Review issues and log audit resolution summaries.</p>
        </div>

        <div className="space-y-4">
          {complaints.map((comp, idx) => (
            <div key={idx} className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-primary dark:text-primary-foreground">
                    Property: {comp.homestay ? comp.homestay.name : "Eco-Stay"}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">Guest: {comp.guestName} ({comp.guestEmail})</p>
                </div>
                <span className={`inline-flex items-center rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider
                  ${
                    comp.status === "Resolved"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }
                `}>
                  {comp.status}
                </span>
              </div>

              <p className="text-xs font-medium text-foreground bg-muted p-3.5 rounded-xl mt-3">
                Issue: "{comp.issue}"
              </p>

              {comp.resolutionNotes && (
                <div className="mt-3 border-t border-border/20 pt-2 text-xs text-muted-foreground">
                  <span className="font-bold text-primary block text-[8px] uppercase mb-1">Resolution Action Log:</span>
                  {comp.resolutionNotes}
                </div>
              )}

              {comp.status !== "Resolved" && (
                <div className="mt-4 flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedComplaint(comp);
                      setComplaintNotes("");
                      setIsComplaintModalOpen(true);
                    }}
                  >
                    Resolve Ticket
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Resolve Modal */}
        <Modal
          isOpen={isComplaintModalOpen}
          onClose={() => setIsComplaintModalOpen(false)}
          title="Log Complaint Resolution"
        >
          <form onSubmit={handleResolveComplaint} className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Please enter the remediation steps taken (e.g. host compensated guest, hardware repaired).
            </p>
            <Input
              id="notes"
              label="Auditor Resolution Inclusions"
              placeholder="e.g. Checked with host, caretaker replaced WiFi router..."
              value={complaintNotes}
              onChange={(e) => setComplaintNotes(e.target.value)}
              required
            />
            <div className="flex gap-3 pt-4 border-t border-border/60">
              <Button variant="outline" className="flex-1 text-xs" onClick={() => setIsComplaintModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex-1 text-xs">Resolve Ticket</Button>
            </div>
          </form>
        </Modal>
      </div>
    );
  };

  const renderCmsSeo = () => {
    return (
      <form onSubmit={handleSaveCmsSeo} className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6 max-w-4xl mx-auto animate-fadeIn">
        <div>
          <h3 className="text-lg font-bold text-primary dark:text-primary-foreground">CMS Content & Global SEO Editor</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Manage home page title tags, alt tags, and headers configurations.</p>
        </div>

        <div className="space-y-5 border-t border-border/40 pt-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-accent">Homepage Copy (CMS)</h4>
          <Input
            id="hero-t"
            label="Hero Banner Header"
            value={cmsHeroTitle}
            onChange={(e) => setCmsHeroTitle(e.target.value)}
            required
          />
          <div className="space-y-1">
            <label className="text-xs font-semibold text-primary dark:text-primary-foreground">Hero Banner Subtitle</label>
            <textarea
              value={cmsHeroSubtitle}
              onChange={(e) => setCmsHeroSubtitle(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary text-foreground leading-normal"
              rows={3}
              required
            />
          </div>
        </div>

        <div className="space-y-4 border-t border-border/40 pt-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-accent">Search Engine Indexing (SEO)</h4>
          <Input
            id="meta-t"
            label="Global Page meta_title"
            value={cmsMetaTitle}
            onChange={(e) => setCmsMetaTitle(e.target.value)}
            required
          />
          <div className="space-y-1">
            <label className="text-xs font-semibold text-primary dark:text-primary-foreground">Global Page meta_description</label>
            <textarea
              value={cmsMetaDescription}
              onChange={(e) => setCmsMetaDescription(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary text-foreground leading-normal"
              rows={3}
              required
            />
          </div>
        </div>

        <div className="pt-4 border-t border-border/60 flex justify-end">
          <Button type="submit">Publish Changes Globally</Button>
        </div>
      </form>
    );
  };

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full min-h-[70vh]">
      {/* Admin Sidebar Navigation */}
      <aside className="w-64 border-r border-border p-6 space-y-6 hidden md:block">
        <div>
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Superuser Access</h2>
          <p className="text-base font-bold text-primary mt-1">Admin Console</p>
        </div>

        <nav className="space-y-1">
          {[
            { id: "overview", name: "System Overview", icon: "⚙️" },
            { id: "users", name: "Users & Roles", icon: "👥" },
            { id: "owners", name: "Owners Vetting", icon: "🛡️" },
            { id: "homestays", name: "Homestays Hub", icon: "🏡" },
            { id: "bookings", name: "Bookings Ledger", icon: "📅" },
            { id: "reviews", name: "Global Reviews", icon: "💬" },
            { id: "ads", name: "Marketing Ads", icon: "📢" },
            { id: "complaints", name: "Complaints desk", icon: "⚠️" },
            { id: "cmsseo", name: "CMS & SEO Panel", icon: "📝" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left rounded-xl px-4.5 py-3 text-xs font-semibold flex items-center gap-3 transition-colors cursor-pointer
                ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground font-bold shadow-md"
                    : "text-muted-foreground hover:bg-muted hover:text-primary"
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Administrative Area */}
      <main className="flex-1 p-6 md:p-8 space-y-6 overflow-x-hidden">
        {/* Mobile Tab Select */}
        <div className="md:hidden border border-border p-3 rounded-2xl bg-card flex justify-around mb-4 text-lg">
          <button onClick={() => setActiveTab("overview")} title="Overview">⚙️</button>
          <button onClick={() => setActiveTab("users")} title="Users">👥</button>
          <button onClick={() => setActiveTab("owners")} title="Owners">🛡️</button>
          <button onClick={() => setActiveTab("homestays")} title="Homestays">🏡</button>
          <button onClick={() => setActiveTab("bookings")} title="Bookings">📅</button>
          <button onClick={() => setActiveTab("reviews")} title="Reviews">💬</button>
          <button onClick={() => setActiveTab("ads")} title="Ads">📢</button>
          <button onClick={() => setActiveTab("complaints")} title="Complaints">⚠️</button>
          <button onClick={() => setActiveTab("cmsseo")} title="CMS">📝</button>
        </div>

        {activeTab === "overview" && renderOverview()}
        {activeTab === "users" && renderUsers()}
        {activeTab === "owners" && renderOwnersVerifications()}
        {activeTab === "homestays" && renderHomestays()}
        {activeTab === "bookings" && renderBookings()}
        {activeTab === "reviews" && renderReviews()}
        {activeTab === "ads" && renderMarketingAds()}
        {activeTab === "complaints" && renderComplaints()}
        {activeTab === "cmsseo" && renderCmsSeo()}
      </main>
    </div>
  );
}
