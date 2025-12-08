import { Badge } from "@/components/ui/badge";
import { DialogTitle } from "@/components/ui/dialog";
import { calculateAge } from "@/lib/utils";
import { Child } from "@/types/child.types";
import { Parent } from "@/types/parent.types";
import { formatDate } from "date-fns";
import { Calendar, Mail, Phone, UserCircle } from "lucide-react";

type InfoOverlayProps = {
  child: Child;
  parentInfo: Parent[];
};
function InfoOverlay({ child, parentInfo }: InfoOverlayProps) {
  return (
    <div className="space-y-6">
      {/* Child header */}
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

      {/* Child info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border">
        <div className="flex items-center gap-3">
          <UserCircle className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Age</p>
            <p className="font-medium">{calculateAge(child.birthdate)} years</p>
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

      {/* Parent section */}
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
                {child.parents?.find((ref) => ref.id === p.id)?.relationship}
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
}

export default InfoOverlay;
