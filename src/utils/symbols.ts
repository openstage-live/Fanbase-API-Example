import type { InjectionKey } from 'vue';

/**
 * Symbol used to open the invite dialog
 */
export const openInviteDialogKey = Symbol() as InjectionKey<() => void>;

/**
 * Symbol used to open the comments dialog
 */
export const openCommentsDialogKey = Symbol() as InjectionKey<
  (id: string, title: string, date: string) => Promise<void> | void
>;
