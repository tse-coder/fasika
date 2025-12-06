import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Search, UserCircle, Phone, Mail, MoreVertical } from "lucide-react";
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

const Children = () => {
  const { children, fetchChildren } = useChildren();
  const { parents, fetchParents } = useParents();
  const [search, setSearch] = useState("");

  useEffect(() => {
    try {
      fetchChildren();
      fetchParents();
      console.log(children, parents);
    } catch (error) {
      console.log(error);
    }
  }, []);

  /** Filter children by child's name */
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
              const primaryParentLink =
                child.parents?.find((p) => p.isPrimary) || child.parents?.[0];

              // Load parent info using parentId
              const parent = parents.find(
                (p) => p.id === primaryParentLink?.parentId
              );

              return (
                <div key={child.id} className="stat-card">
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

                  {/* Parent Info */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <UserCircle className="w-4 h-4" />
                      <span>
                        {parent
                          ? `${parent.fname} ${parent.lname}`
                          : primaryParentLink
                          ? "Loading..."
                          : "No parent assigned"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{parent?.phone_number ?? "N/A"}</span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{parent?.email ?? "N/A"}</span>
                    </div>
                  </div>

                  {/* Child Details */}
                  <div className="mt-4 pt-4 border-t border-border flex justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Birthdate</p>
                      <p className="font-medium">
                        {new Date(child.birthdate).toLocaleDateString()}
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
