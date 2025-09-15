/**
 * AlertSystem - Enhanced alert system for search feedback
 * Provides consistent alert display with proper spacing and accessibility
 */

export class AlertSystem {
  constructor(containerElement) {
    this.container = containerElement;
    this.currentAlert = null;
    this.alertTimeout = null;
  }

  /**
   * Show an alert message
   * @param {string} message - Alert message
   * @param {string} type - Alert type (info, success, warning, error)
   * @param {number} duration - Auto-hide duration in ms (0 = no auto-hide)
   */
  show(message, type = "info", duration = 5000) {
    // Clear existing alert and timeout
    this.clear();

    if (!message) return;

    const alertElement = document.createElement("div");
    alertElement.className = `alert alert--${type}`;
    alertElement.setAttribute("role", "alert");
    alertElement.setAttribute("aria-live", "assertive");

    alertElement.innerHTML = `
      <div class="alert__content">
        <span class="alert__icon">${this._getIcon(type)}</span>
        <span class="alert__message">${message}</span>
        <button class="alert__close" aria-label="Close alert" type="button">×</button>
      </div>
    `;

    // Add close button functionality
    const closeButton = alertElement.querySelector(".alert__close");
    closeButton.addEventListener("click", () => this.clear());

    this.container.appendChild(alertElement);
    this.currentAlert = alertElement;

    // Auto-hide if duration is specified
    if (duration > 0) {
      this.alertTimeout = setTimeout(() => {
        this.clear();
      }, duration);
    }
  }

  /**
   * Show info alert
   */
  info(message, duration = 5000) {
    this.show(message, "info", duration);
  }

  /**
   * Show success alert
   */
  success(message, duration = 3000) {
    this.show(message, "success", duration);
  }

  /**
   * Show warning alert
   */
  warning(message, duration = 7000) {
    this.show(message, "warning", duration);
  }

  /**
   * Show error alert
   */
  error(message, duration = 0) {
    this.show(message, "error", duration);
  }

  /**
   * Clear current alert
   */
  clear() {
    if (this.alertTimeout) {
      clearTimeout(this.alertTimeout);
      this.alertTimeout = null;
    }

    if (this.currentAlert) {
      this.currentAlert.remove();
      this.currentAlert = null;
    }

    // Ensure container is properly sized even when empty
    this.container.innerHTML = '<div class="alert__placeholder"></div>';
  }

  /**
   * Get icon for alert type
   * @private
   */
  _getIcon(type) {
    const icons = {
      info: "ℹ️",
      success: "✅",
      warning: "⚠️",
      error: "❌",
    };
    return icons[type] || icons.info;
  }

  /**
   * Check if an alert is currently displayed
   */
  hasAlert() {
    return this.currentAlert !== null;
  }
}
