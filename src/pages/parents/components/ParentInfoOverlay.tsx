import { Button } from "@/components/ui/button";
import { Parent } from "@/types/parent.types";
import { Phone, Mail, User, Calendar, MapPin, Briefcase } from "lucide-react";

interface ParentInfoOverlayProps {
  parent: Parent;
  isOpen: boolean;
  onClose: () => void;
}

export const ParentInfoOverlay = ({ parent, isOpen, onClose }: ParentInfoOverlayProps) => {
  if (!isOpen || !parent) return null;

  return (
    <div className="p-6">

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="flex items-center gap-4 pb-4 border-b">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              {parent.fname} {parent.lname}
            </h3>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Contact Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{parent.phone || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{parent.email || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Additional Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-medium">{parent.gender || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Record Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-medium">
                {parent.created_at ? new Date(parent.created_at).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Last Updated</p>
              <p className="font-medium">
                {parent.updated_at ? new Date(parent.updated_at).toLocaleDateString() : 'Never'}
              </p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
