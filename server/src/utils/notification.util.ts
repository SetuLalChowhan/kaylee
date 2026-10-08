import prisma from "../config/db.js";

export type NotificationPreferenceType =
  | "notifyDeadlineReminders"
  | "notifyInvoiceUpdates"
  | "notifyContentApprovals"
  | "notifyTaskReminders";

export interface CreateNotificationParams {
  userId: string;
  title: string;
  description: string;
  type?: "CAMPAIGN" | "FEEDBACK" | "PAYMENT" | "DEADLINE" | "TASK" | "INFO";
  preferenceKey?: NotificationPreferenceType;
}

/**
 * Creates a notification in the database if the user has enabled the corresponding preference.
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const { userId, title, description, type = "INFO", preferenceKey } = params;

    // Check user notification preferences if a preferenceKey is provided
    if (preferenceKey) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          notifyDeadlineReminders: true,
          notifyInvoiceUpdates: true,
          notifyContentApprovals: true,
          notifyTaskReminders: true,
        },
      });

      if (user && user[preferenceKey] === false) {
        // Notification disabled by user preference
        return null;
      }
    }

    return await prisma.notification.create({
      data: {
        userId,
        title,
        description,
        type,
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}

/**
 * Checks for upcoming campaign deadlines (within 48 hours) and triggers reminder notifications
 */
export async function checkAndTriggerDeadlineReminders(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { notifyDeadlineReminders: true },
    });

    if (!user || user.notifyDeadlineReminders === false) {
      return;
    }

    const now = new Date();
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const activeCampaigns = await prisma.ugcCampaign.findMany({
      where: {
        userId,
        status: { notIn: ["Completed", "Approved", "Draft"] },
      },
    });

    for (const campaign of activeCampaigns) {
      if (!campaign.deadline) continue;
      const deadlineDate = new Date(campaign.deadline);
      if (isNaN(deadlineDate.getTime())) continue;

      // Check if deadline is in the next 48 hours
      if (deadlineDate >= now && deadlineDate <= in48Hours) {
        // Check if a deadline notification was already sent for this campaign recently
        const existingNotif = await prisma.notification.findFirst({
          where: {
            userId,
            type: "DEADLINE",
            title: { contains: campaign.name },
            createdAt: { gte: fortyEightHoursAgo },
          },
        });

        if (!existingNotif) {
          const formattedDate = deadlineDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

          await prisma.notification.create({
            data: {
              userId,
              title: `Deadline Reminder: ${campaign.name}`,
              description: `Campaign for ${campaign.brandName} is due within 48 hours (${formattedDate}). Make sure content is submitted on time!`,
              type: "DEADLINE",
            },
          });
        }
      }
    }
  } catch (error) {
    console.error("Failed to check deadline reminders:", error);
  }
}

/**
 * Checks for pending tasks and triggers daily task reminder notification
 */
export async function checkAndTriggerTaskReminders(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { notifyTaskReminders: true },
    });

    if (!user || user.notifyTaskReminders === false) {
      return;
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Check if task reminder was already created today
    const existingNotif = await prisma.notification.findFirst({
      where: {
        userId,
        type: "TASK",
        title: "Daily Task Reminder",
        createdAt: { gte: startOfToday },
      },
    });

    if (existingNotif) {
      return;
    }

    const pendingTasks = await prisma.task.findMany({
      where: {
        userId,
        completed: false,
      },
    });

    if (pendingTasks.length > 0) {
      await prisma.notification.create({
        data: {
          userId,
          title: "Daily Task Reminder",
          description: `You have ${pendingTasks.length} upcoming task${pendingTasks.length > 1 ? "s" : ""} on your schedule. Keep up the momentum!`,
          type: "TASK",
        },
      });
    }
  } catch (error) {
    console.error("Failed to check task reminders:", error);
  }
}
