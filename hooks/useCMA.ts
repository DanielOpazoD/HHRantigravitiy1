import { DailyRecord, CMAData } from '../types';

export const useCMA = (
    record: DailyRecord | null,
    saveAndUpdate: (updatedRecord: DailyRecord) => void
) => {

    const addCMA = (data: Omit<CMAData, 'id' | 'timestamp'>) => {
        if (!record) return;
        const newEntry: CMAData = {
            ...data,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString()
        };

        const currentList = record.cma || [];

        saveAndUpdate({
            ...record,
            cma: [...currentList, newEntry]
        });
    };

    const deleteCMA = (id: string) => {
        if (!record) return;
        const currentList = record.cma || [];
        saveAndUpdate({
            ...record,
            cma: currentList.filter(item => item.id !== id)
        });
    };

    const updateCMA = (id: string, updates: Partial<CMAData>) => {
        if (!record) return;
        const currentList = record.cma || [];
        saveAndUpdate({
            ...record,
            cma: currentList.map(item =>
                item.id === id ? { ...item, ...updates } : item
            )
        });
    };

    return {
        addCMA,
        deleteCMA,
        updateCMA
    };
};
