import { useGtm } from '@gtm-support/vue-gtm';

/**
 * Composable for tracking fan-related events using GTM
 * Uses @gtm-support/vue-gtm for proper Vue integration
 */
export function useFanTracking() {
  const gtm = useGtm();

  /**
   * Get current page title dynamically
   */
  const getCurrentPageTitle = (): string => {
    if (typeof document === 'undefined') return 'Unknown';
    return document.title || 'Unknown';
  };

  /**
   * Get current user ID from dataLayer or return null
   */
  const getCurrentUserId = (): string | null => {
    if (typeof window === 'undefined' || !window.dataLayer) return null;

    // Find the most recent user_id in dataLayer
    for (let i = window.dataLayer.length - 1; i >= 0; i--) {
      const item = window.dataLayer[i];

      if (item && typeof item === 'object' && item.user_id) {
        return item.user_id;
      }
    }

    return null;
  };

  /**
   * Base function to track events with consistent structure
   */
  const trackEvent = (
    eventName: string,
    eventData: Record<string, unknown> = {},
    userId?: string | null,
  ) => {
    if (!gtm) {
      return;
    }

    const finalUserId = userId !== undefined ? userId : getCurrentUserId();

    gtm.trackEvent({
      event: eventName,
      user_id: finalUserId,
      page_title: getCurrentPageTitle(),
      timestamp: new Date().toISOString(),
      ...eventData,
    });
  };

  // =============================================================================
  // USER ID MANAGEMENT
  // =============================================================================

  /**
   * Set user ID in GTM dataLayer
   */
  const setUserIdInGTM = (userId: string) => {
    if (!gtm) {
      return;
    }

    // Use GTM's trackEvent to set user_id persistently
    gtm.trackEvent({
      user_id: userId,
    });
  };

  /**
   * Clear user ID from GTM dataLayer
   */
  const clearUserIdFromGTM = () => {
    if (!gtm) {
      return;
    }

    // Clear user_id using GTM's trackEvent
    gtm.trackEvent({
      event: 'config',
      user_id: null,
    });
  };

  // =============================================================================
  // AUTHENTICATION & ACCOUNT
  // =============================================================================

  /**
   * Track when fan details are refreshed
   */
  const trackFanDetailsRefreshed = (userId?: string, subscription_id?: string) => {
    if (userId) {
      setUserIdInGTM(userId);
    }
    trackEvent('fan_details_refreshed', { subscription_id }, userId);
  };

  /**
   * Track when fan logs out
   */
  const trackFanLogout = (userId?: string) => {
    trackEvent('fan_logout', {}, userId);
    clearUserIdFromGTM();
  };

  // =============================================================================
  // SIGNUP FLOW
  // =============================================================================

  /**
   * Track when user requests signup
   */
  const trackSignupRequested = () => {
    trackEvent('signup_requested', {}, null);
  };

  /**
   * Track when user submits signup data
   */
  const trackSignupSubmitted = (friendId?: string) => {
    trackEvent('signup_submitted', { friend_id: friendId }, null);
  };

  // =============================================================================
  // TIER & PAYMENT
  // =============================================================================

  /**
   * Track when user toggles tier (inspects different tiers)
   */
  const trackTierToggled = (tier_tag?: string) => {
    if (tier_tag) {
      trackEvent('tier_toggled', { tier_tag });
    }
  };

  /**
   * Track when user selects a tier
   */
  const trackTierSelected = (tier_tag?: string) => {
    if (tier_tag) {
      trackEvent('tier_selected', { tier_tag });
    }
  };

  /**
   * Track when payment form is loaded
   */
  const trackPaymentFormLoaded = (tier_tag: string) => {
    trackEvent('payment_form_loaded', { tier_tag });
  };

  /**
   * Track when fan requests membership cancellation
   */
  const trackMembershipCancellationRequested = (tier_tag?: string, subscription_id?: string) => {
    trackEvent('membership_cancellation_requested', { tier_tag, subscription_id });
  };

  // =============================================================================
  // POST INTERACTIONS
  // =============================================================================

  /**
   * Track when fan likes a post
   */
  const trackPostLiked = ({ post_id, fan_id }: { post_id: string; fan_id?: string }) => {
    trackEvent(
      'post_liked',
      {
        post_id,
        interaction_type: 'like',
      },
      fan_id,
    );
  };

  /**
   * Track when fan unlikes a post
   */
  const trackPostUnliked = ({ post_id, fan_id }: { post_id: string; fan_id?: string }) => {
    trackEvent(
      'post_unliked',
      {
        post_id,
        interaction_type: 'like',
      },
      fan_id,
    );
  };

  /**
   * Track when fan comments on a post
   */
  const trackPostCommented = ({
    post_id,
    comment_id,
    fan_id,
  }: {
    post_id: string;
    comment_id: string;
    fan_id: string;
  }) => {
    trackEvent(
      'post_commented',
      {
        post_id,
        comment_id,
        interaction_type: 'comment',
      },
      fan_id,
    );
  };

  /**
   * Track when fan shares something
   */
  const trackShared = ({
    fan_id,
    title,
    text,
    url,
  }: {
    fan_id?: string;
    title?: string;
    text?: string;
    url?: string;
  }) => {
    trackEvent(
      'post_shared',
      {
        interaction_type: 'share',
        title,
        text,
        url,
      },
      fan_id,
    );
  };

  // =============================================================================
  // COMMENT INTERACTIONS
  // =============================================================================

  /**
   * Track when fan likes a comment
   */
  const trackCommentLiked = ({
    comment_id,
    post_id,
    fan_id,
  }: {
    comment_id: string;
    post_id?: string;
    fan_id?: string;
  }) => {
    trackEvent(
      'comment_liked',
      {
        post_id,
        comment_id,
        interaction_type: 'like',
      },
      fan_id,
    );
  };

  /**
   * Track when fan unlikes a comment
   */
  const trackCommentUnliked = ({
    post_id,
    comment_id,
    fan_id,
  }: {
    comment_id: string;
    post_id?: string;
    fan_id?: string;
  }) => {
    trackEvent(
      'comment_unliked',
      {
        post_id,
        comment_id,
        interaction_type: 'like',
      },
      fan_id,
    );
  };

  /**
   * Track when fan replies to a comment
   */
  const trackCommentReplied = ({
    post_id,
    comment_id,
    reply_id,
    fan_id,
  }: {
    post_id: string;
    comment_id: string;
    reply_id: string;
    fan_id: string;
  }) => {
    trackEvent(
      'comment_replied',
      {
        post_id,
        comment_id,
        reply_id,
        interaction_type: 'reply',
      },
      fan_id,
    );
  };

  return {
    // Core tracking function
    trackEvent,

    // User ID management
    setUserIdInGTM,
    clearUserIdFromGTM,

    // Authentication & Account
    trackFanDetailsRefreshed,
    trackFanLogout,

    // Signup Flow
    trackSignupRequested,
    trackSignupSubmitted,

    // Tier & Payment
    trackTierToggled,
    trackTierSelected,
    trackPaymentFormLoaded,
    trackMembershipCancellationRequested,

    // Post Interactions
    trackPostLiked,
    trackPostUnliked,
    trackPostCommented,
    trackShared,

    // Comment Interactions
    trackCommentLiked,
    trackCommentUnliked,
    trackCommentReplied,
  };
}
