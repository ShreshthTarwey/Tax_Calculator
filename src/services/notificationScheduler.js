import { notificationService } from './notificationService';

class NotificationScheduler {
  constructor() {
    this.checkInterval = 1000 * 60 * 60; // Check every hour
    this.running = false;
  }

  start(userId) {
    if (this.running) return;
    this.running = true;
    this.userId = userId;

    // Initial check
    this.checkAndSendNotifications();

    // Set up periodic checks
    this.intervalId = setInterval(() => {
      this.checkAndSendNotifications();
    }, this.checkInterval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.running = false;
    }
  }

  async checkAndSendNotifications() {
    if (!this.userId) return;

    try {
      // Check for upcoming tax payments
      const nextPaymentDate = notificationService.calculateNextTaxPaymentDate();
      const daysUntilPayment = Math.ceil((nextPaymentDate - new Date()) / (1000 * 60 * 60 * 24));

      // Send tax payment reminders at different intervals
      if (daysUntilPayment === 15 || daysUntilPayment === 7 || daysUntilPayment === 3 || daysUntilPayment === 1) {
        await notificationService.createTaxPaymentReminder(
          this.userId,
          nextPaymentDate,
          0 // Amount will be updated when actual calculation is available
        );
      }

      // Check for tax saving investment deadlines
      if (notificationService.shouldRemindForTaxSaving()) {
        const financialYearEnd = new Date(new Date().getFullYear(), 2, 31); // March 31st
        const daysUntilDeadline = Math.ceil((financialYearEnd - new Date()) / (1000 * 60 * 60 * 24));

        if (daysUntilDeadline === 30 || daysUntilDeadline === 15 || daysUntilDeadline === 7) {
          await notificationService.createInvestmentDeadlineReminder(
            this.userId,
            'Section 80C',
            financialYearEnd
          );
        }
      }

      // Send tax saving opportunities based on recent calculations
      if (this.lastCalculation) {
        const opportunities = this.generateTaxSavingOpportunities(this.lastCalculation);
        for (const opportunity of opportunities) {
          await notificationService.createTaxSavingOpportunity(this.userId, opportunity);
        }
      }
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  }

  updateLastCalculation(calculation) {
    this.lastCalculation = calculation;
    // Check for new opportunities based on the latest calculation
    this.checkAndSendNotifications();
  }

  generateTaxSavingOpportunities(calculation) {
    const opportunities = [];
    const income = calculation.originalAmount;

    // Example opportunities based on income
    if (income > 500000) {
      opportunities.push({
        title: 'Maximize your 80C investments',
        potentialSavings: Math.min(income * 0.1, 150000),
        description: 'Invest in PPF, ELSS, or insurance to save taxes under Section 80C'
      });
    }

    if (income > 1000000) {
      opportunities.push({
        title: 'Consider NPS Investment',
        potentialSavings: Math.min(income * 0.1, 50000),
        description: 'Additional tax benefit under Section 80CCD(1B) for NPS investment'
      });
    }

    return opportunities;
  }
}

export const notificationScheduler = new NotificationScheduler();
export default notificationScheduler; 