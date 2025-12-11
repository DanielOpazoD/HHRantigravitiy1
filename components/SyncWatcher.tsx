/**
 * Sync Watcher
 * Observes sync status changes and shows notifications accordingly.
 * This component must be placed inside NotificationProvider.
 */

import React, { useEffect, useRef } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useDailyRecordContext } from '../context/DailyRecordContext';

export const SyncWatcher: React.FC = () => {
    const { syncStatus } = useDailyRecordContext();
    const { error, success, warning } = useNotification();

    // Track previous status to detect changes
    const prevStatusRef = useRef(syncStatus);

    useEffect(() => {
        const prevStatus = prevStatusRef.current;
        prevStatusRef.current = syncStatus;

        // Only show notification when status changes
        if (prevStatus === syncStatus) return;

        if (syncStatus === 'error' && prevStatus !== 'error') {
            error('Error de sincronización', 'Los cambios se guardaron localmente pero no se pudieron sincronizar con el servidor.');
        }

        // Optionally show success after saving (uncomment if desired)
        // if (syncStatus === 'saved' && prevStatus === 'saving') {
        //     success('Guardado', 'Cambios sincronizados correctamente');
        // }

    }, [syncStatus, error, success, warning]);

    return null; // This component doesn't render anything
};
