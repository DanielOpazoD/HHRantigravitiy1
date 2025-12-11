import { DailyRecord } from '../types';

export const useNurseManagement = (
    record: DailyRecord | null,
    saveAndUpdate: (updatedRecord: DailyRecord) => void
) => {

    const updateNurse = (index: number, name: string) => {
        if (!record) return;
        const currentNurses = record.nurses && record.nurses.length === 2 ? [...record.nurses] : ["", ""];
        currentNurses[index] = name;
        saveAndUpdate({ ...record, nurses: currentNurses });
    };

    return {
        updateNurse
    };
};
