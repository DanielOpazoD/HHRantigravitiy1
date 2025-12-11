import React, { useState, Suspense, lazy } from 'react';
import { useDailyRecord, useAuthState, useDateNavigation, useFileOperations, useExistingDays } from './hooks';
import { DailyRecordProvider } from './context';
import { Navbar, DateStrip, SettingsModal, TestAgent, SyncWatcher, DemoModePanel, LoginPage, ErrorBoundary } from './components';
import type { ModuleType } from './components';

// ========== LAZY LOADED VIEWS ==========
// These views are loaded on-demand when the user navigates to them
const CensusView = lazy(() => import('./views/CensusView').then(m => ({ default: m.CensusView })));
const CudyrView = lazy(() => import('./views/CudyrView').then(m => ({ default: m.CudyrView })));
const HandoffView = lazy(() => import('./views/HandoffView').then(m => ({ default: m.HandoffView })));
const ReportsView = lazy(() => import('./views/ReportsView').then(m => ({ default: m.ReportsView })));

// ========== LOADING FALLBACK ==========
const ViewLoader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <span className="text-gray-500 text-sm">Cargando módulo...</span>
    </div>
  </div>
);

function App() {
  // ========== AUTH STATE (extracted to hook) ==========
  const { user, authLoading, isFirebaseConnected, handleLogout } = useAuthState();

  // ========== DATE NAVIGATION (extracted to hook) ==========
  const {
    selectedYear, setSelectedYear,
    selectedMonth, setSelectedMonth,
    selectedDay, setSelectedDay,
    daysInMonth,
    currentDateString
  } = useDateNavigation();

  // ========== DAILY RECORD HOOK ==========
  const dailyRecordHook = useDailyRecord(currentDateString);
  const { record, refresh, syncStatus, lastSyncTime } = dailyRecordHook;

  // Calculate existing days (depends on record changes)
  const existingDaysInMonth = useExistingDays(selectedYear, selectedMonth, record);

  // ========== FILE OPERATIONS (extracted to hook) ==========
  const { handleExportJSON, handleExportCSV, handleImportJSON } = useFileOperations(record, refresh);

  // ========== UI STATE ==========
  const [currentModule, setCurrentModule] = useState<ModuleType>('CENSUS');
  const [censusViewMode, setCensusViewMode] = useState<'REGISTER' | 'ANALYTICS'>('REGISTER');
  const [showSettings, setShowSettings] = useState(false);
  const [isTestAgentRunning, setIsTestAgentRunning] = useState(false);
  const [showBedManager, setShowBedManager] = useState(false);
  const [showDemoPanel, setShowDemoPanel] = useState(false);

  // ========== LOADING STATE ==========
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="animate-pulse text-medical-600 text-xl font-bold">Cargando...</div>
      </div>
    );
  }

  // ========== AUTH REQUIRED ==========
  if (!user) {
    return <LoginPage onLoginSuccess={() => { }} />;
  }

  // ========== MAIN RENDER ==========
  return (
    <DailyRecordProvider value={dailyRecordHook}>
      <div className="min-h-screen bg-slate-100 font-sans flex flex-col print:bg-white print:p-0">
        <Navbar
          currentModule={currentModule}
          setModule={setCurrentModule}
          censusViewMode={censusViewMode}
          setCensusViewMode={setCensusViewMode}
          onPrint={() => window.print()}
          onOpenBedManager={() => setShowBedManager(true)}
          onExportJSON={handleExportJSON}
          onExportCSV={handleExportCSV}
          onImportJSON={handleImportJSON}
          onOpenSettings={() => setShowSettings(true)}
          userEmail={user?.email}
          onLogout={handleLogout}
          isFirebaseConnected={isFirebaseConnected}
        />

        {/* DateStrip - Only in REGISTER mode */}
        {censusViewMode === 'REGISTER' && (
          <DateStrip
            selectedYear={selectedYear} setSelectedYear={setSelectedYear}
            selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth}
            selectedDay={selectedDay} setSelectedDay={setSelectedDay}
            currentDateString={currentDateString}
            daysInMonth={daysInMonth}
            existingDaysInMonth={existingDaysInMonth}
            onOpenBedManager={() => setShowBedManager(true)}
            syncStatus={syncStatus}
            lastSyncTime={lastSyncTime}
          />
        )}

        {/* Main Content Area with Lazy Loading */}
        <main className="max-w-screen-2xl mx-auto px-4 py-6 flex-1 w-full pb-20 print:p-0 print:pb-0 print:max-w-none">
          <ErrorBoundary>
            <Suspense fallback={<ViewLoader />}>
              {currentModule === 'CENSUS' && (
                <CensusView
                  viewMode={censusViewMode}
                  selectedDay={selectedDay}
                  selectedMonth={selectedMonth}
                  currentDateString={currentDateString}
                  onOpenBedManager={() => setShowBedManager(true)}
                  showBedManagerModal={showBedManager}
                  onCloseBedManagerModal={() => setShowBedManager(false)}
                />
              )}

              {currentModule === 'CUDYR' && <CudyrView />}
              {currentModule === 'HANDOFF' && <HandoffView />}
              {currentModule === 'REPORTS' && <ReportsView />}
            </Suspense>
          </ErrorBoundary>
        </main>

        {/* Global Modals */}
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onGenerateDemo={() => setShowDemoPanel(true)}
          onRunTest={() => setIsTestAgentRunning(true)}
        />

        <TestAgent
          isRunning={isTestAgentRunning}
          onComplete={() => setIsTestAgentRunning(false)}
          currentRecord={record}
        />
      </div>

      <SyncWatcher />
      <DemoModePanel isOpen={showDemoPanel} onClose={() => setShowDemoPanel(false)} />
    </DailyRecordProvider>
  );
}

export default App;
