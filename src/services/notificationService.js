import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

class NotificationService {
  constructor() {
    this.db = getFirestore();
  }

  async createNotification(userId, notification) {
    try {
      await addDoc(collection(this.db, 'notifications'), {
        ...notification,
        userId,
        read: false,
        createdAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async createTaxPaymentReminder(userId, dueDate, amount) {
    const notification = {
      type: 'TAX_PAYMENT',
      title: 'Tax Payment Reminder',
      message: `You have a tax payment of ₹${amount.toLocaleString()} due on ${dueDate.toLocaleDateString()}`,
      timestamp: Timestamp.fromDate(dueDate),
      priority: 'high',
      metadata: {
        amount,
        dueDate: dueDate.toISOString()
      }
    };
    await this.createNotification(userId, notification);
  }

  async createInvestmentDeadlineReminder(userId, scheme, deadline) {
    const notification = {
      type: 'DEADLINE',
      title: 'Investment Deadline Reminder',
      message: `Deadline approaching for ${scheme} investment - ${deadline.toLocaleDateString()}`,
      timestamp: Timestamp.fromDate(deadline),
      priority: 'medium',
      metadata: {
        scheme,
        deadline: deadline.toISOString()
      }
    };
    await this.createNotification(userId, notification);
  }

  async createPolicyUpdateNotification(userId, policyTitle, summary) {
    const notification = {
      type: 'POLICY_UPDATE',
      title: 'Tax Policy Update',
      message: `${policyTitle}: ${summary}`,
      timestamp: Timestamp.now(),
      priority: 'low',
      metadata: {
        policyTitle,
        summary
      }
    };
    await this.createNotification(userId, notification);
  }

  async createTaxSavingOpportunity(userId, opportunity) {
    const notification = {
      type: 'INVESTMENT',
      title: 'Tax Saving Opportunity',
      message: `${opportunity.title} - Potential savings: ₹${opportunity.potentialSavings.toLocaleString()}`,
      timestamp: Timestamp.now(),
      priority: 'medium',
      metadata: opportunity
    };
    await this.createNotification(userId, notification);
  }

  // Helper method to calculate next tax payment date
  calculateNextTaxPaymentDate() {
    const now = new Date();
    const quarterMonths = [3, 6, 9, 12];
    const currentMonth = now.getMonth() + 1;
    
    let nextQuarterMonth = quarterMonths.find(month => month > currentMonth);
    if (!nextQuarterMonth) {
      nextQuarterMonth = quarterMonths[0];
    }
    
    const nextPaymentDate = new Date(now.getFullYear(), nextQuarterMonth - 1, 15);
    if (nextPaymentDate < now) {
      nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + 1);
    }
    
    return nextPaymentDate;
  }

  // Helper method to check if it's time for tax saving investments
  shouldRemindForTaxSaving() {
    const now = new Date();
    // Remind in the last quarter of the financial year (January to March)
    return now.getMonth() >= 0 && now.getMonth() <= 2;
  }
}

export const notificationService = new NotificationService();
export default notificationService; 