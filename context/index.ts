/**
 * Context Index
 * Centralized exports for all React contexts and providers
 * 
 * Usage: import { useNotification, useDailyRecordContext } from './context';
 */

// Notification System
export {
    NotificationProvider,
    useNotification
} from './NotificationContext';
export type { NotificationType } from './NotificationContext';

// Daily Record Context
export {
    DailyRecordProvider,
    useDailyRecordContext
} from './DailyRecordContext';

// Confirmation Dialogs
export {
    ConfirmDialogProvider,
    useConfirmDialog
} from './ConfirmDialogContext';

// Demo Mode
export {
    DemoModeProvider,
    useDemoMode
} from './DemoModeContext';
