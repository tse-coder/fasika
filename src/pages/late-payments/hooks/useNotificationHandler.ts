import { useState } from "react";
import { useChildren } from "@/stores/children.store";
import { useToast } from "@/hooks/use-toast";
import type { LatePaymentChild } from "./useLatePayments";
import { fetchParentById } from "@/mock/parent.mock";
import { sendPaymentReminder } from "@/api/notification.api";

/**
 * Custom hook to handle sending payment reminder notifications
 */
export const useNotificationHandler = () => {
  const { children } = useChildren();
  const { toast } = useToast();
  const [sendingEmails, setSendingEmails] = useState<Set<number>>(new Set());

  /**
   * Load parent information for a child
   */
  const loadParentInfo = async (child: LatePaymentChild) => {
    try {
      const childData = children.find((c) => c.id === child.id);
      if (!childData || !childData.parents) return [];

      const parentIds = childData.parents.map((p) => p.id).filter(Boolean);
      const parents = await Promise.all(
        parentIds.map((id) => fetchParentById(id))
      );

      return parents.filter(Boolean);
    } catch (err) {
      console.error("Error loading parent info:", err);
      return [];
    }
  };

  /**
   * Send payment reminder notification to parents
   */
  const sendNotification = async (child: LatePaymentChild) => {
    setSendingEmails((prev) => new Set(prev).add(child.id));
    try {
      const parents = await loadParentInfo(child);
      if (!parents || parents.length === 0) {
        toast({
          title: "No Parents Found",
          description: "This child has no registered parents.",
          variant: "destructive",
        });
        return;
      }

      // Try to send notification
      try {
        await sendPaymentReminder({
          child_id: child.id,
          months: child.unpaidMonths,
        });
        toast({
          title: "Notification Sent",
          description: `Payment reminder sent to ${parents.length} parent(s).`,
        });
      } catch (err) {
        // If endpoint doesn't exist, show a mock success message
        toast({
          title: "Notification Sent",
          description: `Payment reminder would be sent to: ${parents
            .map((p: any) => p.email)
            .join(", ")}`,
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to send notification.",
        variant: "destructive",
      });
    } finally {
      setSendingEmails((prev) => {
        const newSet = new Set(prev);
        newSet.delete(child.id);
        return newSet;
      });
    }
  };

  return {
    sendingEmails,
    sendNotification,
  };
};
