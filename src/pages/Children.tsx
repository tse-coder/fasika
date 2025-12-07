import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Search,
  UserCircle,
  MoreVertical,
  Calendar,
  Mail,
  Phone,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useChildren } from "@/stores/children.store";
import { Child } from "@/types/child.types";
import { useParents } from "@/stores/parent.store";
import { calculateAge } from "@/lib/utils";
import { useModalStore } from "@/stores/overlay.store";
import { formatDate } from "date-fns";
import { DialogTitle } from "@radix-ui/react-dialog";

const Children = () => {
  const { children, fetchChildren } = useChildren();
  const { parents, fetchParents } = useParents();
  const [search, setSearch] = useState("");

  const openModal = useModalStore((state) => state.openModal);

  useEffect(() => {
    fetchChildren();
    fetchParents();
  }, []);

  /** Show modal with child info */
  const showInfoOverlay = (child: Child) => {
    const parentRefs = child.parents || [];
    const parentIds = parentRefs.map((p) => p.id);
    const parentInfo = parents.filter((p) => parentIds.includes(p.id));
    openModal(
      <div className="space-y-6">
        {/* Child Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold text-xl">
              {child.fname[0]}
              {child.lname[0]}
            </span>
          </div>
          <div>
            <DialogTitle className="text-2xl font-bold leading-tight">
              {child.fname} {child.lname}
            </DialogTitle>

            <Badge variant={child.is_active ? "default" : "secondary"}>
              {child.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
        {/* Child Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border">
          <div className="flex items-center gap-3">
            <UserCircle className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Age</p>
              <p className="font-medium">
                {calculateAge(child.birthdate)} years
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-2 py-1 text-xs">
              ETB
            </Badge>
            <div>
              <p className="text-xs text-muted-foreground">Monthly Fee</p>
              <p className="font-medium">ETB {child.monthlyFee}</p>
            </div>
          </div>
        </div>

        {/* Parents Section */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Parents</h3>

          {parentInfo.map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-lg border bg-card shadow-sm space-y-2"
            >
              <div className="flex items-center gap-3">
                <UserCircle className="h-6 w-6 text-primary" />
                <p className="text-lg font-medium">
                  {p.fname} {p.lname}
                </p>
                <Badge variant={child.is_active ? "default" : "secondary"}>
                  {parentRefs.find((ref) => ref.id === p.id)?.relationship}
                </Badge>
              </div>

              <div className="space-y-2 pl-9">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{p.phone_number}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{p.email}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <UserCircle className="w-4 h-4 text-muted-foreground" />
                  <span>{p.gender == "M" ? "Male" : "Female"}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Joined {formatDate(p.created_at, "yyyy-MM-dd")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /** Filter children by name */
  const filteredChildren = useMemo(() => {
    return children.filter((child: Child) => {
      const fullName = `${child.fname} ${child.lname}`.toLowerCase();
      return fullName.includes(search.toLowerCase());
    });
  }, [children, search]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search children..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Link to="/register">
            <Button>Register New Child</Button>
          </Link>
        </div>

        {/* No children */}
        {filteredChildren.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border">
            <UserCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No children found</h3>
            <p className="text-muted-foreground mb-4">
              {children.length === 0
                ? "Start by registering your first child"
                : "No matches for your search"}
            </p>

            {children.length === 0 && (
              <Link to="/register">
                <Button>Register Child</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChildren.map((child: Child) => {
              return (
                <div
                  key={child.id}
                  className="stat-card cursor-pointer"
                  onClick={() => showInfoOverlay(child)}
                >
                  <div className="flex items-start justify-between mb-4">
                    {/* Avatar */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold text-lg">
                          {child.fname[0]}
                          {child.lname[0]}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-semibold text-foreground">
                          {child.fname} {child.lname}
                        </h3>

                        <Badge
                          variant={child.is_active ? "default" : "secondary"}
                        >
                          {child.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>

                    {/* Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <Link to={`/payments?child=${child.id}`}>
                          <DropdownMenuItem>View Payments</DropdownMenuItem>
                        </Link>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Child Details */}
                  <div className="mt-4 pt-4 border-t border-border flex justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Age</p>
                      <p className="font-medium">
                        {calculateAge(child.birthdate)} years
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Fee</p>
                      <p className="font-semibold">
                        ETB {child.monthlyFee?.toLocaleString() ?? "0"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Children;
