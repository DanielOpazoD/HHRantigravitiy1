import React from 'react';
import { useCensusActions } from './CensusActionsContext';
import { NurseManagerModal } from '../../components/modals/NurseManagerModal';
import { BedManagerModal } from '../../components/modals/BedManagerModal';
import { MoveCopyModal, DischargeModal, TransferModal } from '../../components/modals/ActionModals';

interface CensusModalsProps {
    // Nurse Manager props
    nursesList: string[];
    setNursesList: (nurses: string[]) => void;

    // Bed Manager props
    showBedManagerModal: boolean;
    onCloseBedManagerModal: () => void;
}

export const CensusModals: React.FC<CensusModalsProps> = ({
    nursesList,
    setNursesList,
    showBedManagerModal,
    onCloseBedManagerModal
}) => {
    const {
        // Nurse Manager
        showNurseManager,
        setShowNurseManager,

        // Move/Copy
        actionState,
        setActionState,
        executeMoveOrCopy,

        // Discharge
        dischargeState,
        setDischargeState,
        executeDischarge,

        // Transfer
        transferState,
        setTransferState,
        executeTransfer
    } = useCensusActions();

    return (
        <>
            <NurseManagerModal
                isOpen={showNurseManager}
                onClose={() => setShowNurseManager(false)}
                nursesList={nursesList}
                setNursesList={setNursesList}
            />

            <BedManagerModal
                isOpen={showBedManagerModal}
                onClose={onCloseBedManagerModal}
            />

            <MoveCopyModal
                isOpen={!!actionState.type}
                type={actionState.type}
                sourceBedId={actionState.sourceBedId}
                targetBedId={actionState.targetBedId}
                onClose={() => setActionState({ type: null, sourceBedId: null, targetBedId: null })}
                onSetTarget={(id) => setActionState({ ...actionState, targetBedId: id })}
                onConfirm={executeMoveOrCopy}
            />

            <DischargeModal
                isOpen={dischargeState.isOpen}
                isEditing={!!dischargeState.recordId}
                status={dischargeState.status}
                hasClinicalCrib={dischargeState.hasClinicalCrib}
                clinicalCribName={dischargeState.clinicalCribName}
                clinicalCribStatus={dischargeState.clinicalCribStatus}
                onClinicalCribStatusChange={(s) => setDischargeState({ ...dischargeState, clinicalCribStatus: s })}
                onStatusChange={(s) => setDischargeState({ ...dischargeState, status: s })}
                onClose={() => setDischargeState({ ...dischargeState, isOpen: false })}
                onConfirm={executeDischarge}
            />

            <TransferModal
                isOpen={transferState.isOpen}
                isEditing={!!transferState.recordId}
                evacuationMethod={transferState.evacuationMethod}
                receivingCenter={transferState.receivingCenter}
                receivingCenterOther={transferState.receivingCenterOther}
                transferEscort={transferState.transferEscort}
                hasClinicalCrib={transferState.hasClinicalCrib}
                clinicalCribName={transferState.clinicalCribName}
                onUpdate={(field, val) => setTransferState({ ...transferState, [field]: val })}
                onClose={() => setTransferState({ ...transferState, isOpen: false })}
                onConfirm={executeTransfer}
            />
        </>
    );
};
