
import React, { useRef } from 'react';
import { LayoutList, BarChart2, Printer, Lock, FileJson, FileSpreadsheet, Upload, Settings, ClipboardList, MessageSquare, LogOut, User, Wifi, WifiOff } from 'lucide-react';
import clsx from 'clsx';
import { useDailyRecordContext } from '../context/DailyRecordContext';

export type ModuleType = 'CENSUS' | 'CUDYR' | 'HANDOFF' | 'REPORTS';
type ViewMode = 'REGISTER' | 'ANALYTICS';

interface NavbarProps {
  currentModule: ModuleType;
  setModule: (mod: ModuleType) => void;

  // Census specific controls
  censusViewMode: ViewMode;
  setCensusViewMode: (mode: ViewMode) => void;

  onPrint: () => void;
  onOpenBedManager: () => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenSettings: () => void;
  userEmail?: string | null;
  onLogout?: () => void;
  isFirebaseConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentModule,
  setModule,
  censusViewMode,
  setCensusViewMode,
  onPrint,
  onOpenBedManager,
  onExportJSON,
  onExportCSV,
  onImportJSON,
  onOpenSettings,
  userEmail,
  onLogout,
  isFirebaseConnected
}) => {
  const { record } = useDailyRecordContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => fileInputRef.current?.click();

  const handleModuleChange = (mod: ModuleType) => {
    setModule(mod);
    // Ensure clicking the main Census tab resets the view to the register table
    if (mod === 'CENSUS') {
      setCensusViewMode('REGISTER');
    }
  };

  const NavTab = ({ module, label, icon: Icon }: { module: ModuleType, label: string, icon: any }) => (
    <button
      onClick={() => handleModuleChange(module)}
      className={clsx(
        "flex items-center gap-2 px-4 py-3 border-b-2 transition-colors font-medium text-sm",
        currentModule === module
          ? "border-white text-white"
          : "border-transparent text-medical-200 hover:text-white hover:border-medical-400"
      )}
    >
      <Icon size={16} /> {label}
    </button>
  );

  return (
    <nav className="bg-medical-900 text-white shadow-md sticky top-0 z-50 print:hidden">
      <div className="max-w-screen-2xl mx-auto px-4 flex flex-wrap gap-4 justify-between items-center">

        {/* Brand */}
        <div className="flex items-center gap-2 py-2">
          <div className="bg-white/10 p-2 rounded-lg">
            <LayoutList size={24} className="text-medical-100" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Hospital Hanga Roa</h1>
            <p className="text-xs text-medical-200">Gestión de Camas</p>
          </div>
        </div>

        {/* Main Navigation Tabs */}
        <div className="flex gap-1 overflow-x-auto self-end">
          <NavTab module="CENSUS" label="Censo Diario" icon={LayoutList} />
          <NavTab module="CUDYR" label="CUDYR" icon={ClipboardList} />
          <NavTab module="HANDOFF" label="Entrega Turno" icon={MessageSquare} />
          <NavTab module="REPORTS" label="Reportes" icon={FileSpreadsheet} />
        </div>

        {/* Tools & Sub-navigation */}
        <div className="flex items-center gap-2 py-2">

          {/* Statistics Button - Always Visible to prevent layout shift */}
          <div className="mr-4">
            <button
              onClick={() => {
                if (currentModule !== 'CENSUS') {
                  setModule('CENSUS');
                  setCensusViewMode('ANALYTICS');
                } else {
                  setCensusViewMode(censusViewMode === 'ANALYTICS' ? 'REGISTER' : 'ANALYTICS');
                }
              }}
              className={clsx(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
                (currentModule === 'CENSUS' && censusViewMode === 'ANALYTICS')
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-medical-200 hover:text-white hover:bg-white/10"
              )}
              title={censusViewMode === 'ANALYTICS' && currentModule === 'CENSUS' ? "Volver al Registro" : "Ver Estadísticas"}
            >
              <BarChart2 size={16} /> <span className="hidden sm:inline">Estadística</span>
            </button>
          </div>

          <div className="flex items-center gap-1 border-l border-medical-700 pl-4">
            {/* Contextual Actions (Only for Census Register) */}
            {currentModule === 'CENSUS' && censusViewMode === 'REGISTER' && record && (
              <>
                <button
                  onClick={onPrint}
                  className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-md text-xs font-bold uppercase mr-2 border border-slate-600 transition-colors"
                >
                  <Printer size={14} /> PDF
                </button>

              </>
            )}

            {/* Global Tools */}
            <button onClick={onExportJSON} className="p-2 text-medical-200 hover:text-white hover:bg-white/10 rounded" title="Exportar Respaldo (JSON)">
              <FileJson size={18} />
            </button>
            <button onClick={onExportCSV} className="p-2 text-medical-200 hover:text-white hover:bg-white/10 rounded" title="Exportar Reporte Diario (CSV)">
              <FileSpreadsheet size={18} />
            </button>
            <button onClick={handleImportClick} className="p-2 text-medical-200 hover:text-white hover:bg-white/10 rounded" title="Importar Respaldo">
              <Upload size={18} />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept=".json,.csv" onChange={onImportJSON} />

            <button onClick={onOpenSettings} className="p-2 ml-1 text-medical-200 hover:text-white hover:bg-white/10 rounded" title="Configuración y Pruebas">
              <Settings size={18} />
            </button>

            {/* User & Logout */}
            {userEmail && onLogout && (
              <div className="flex items-center gap-2 ml-3 pl-3 border-l border-medical-700">
                <div className="flex items-center gap-1 text-xs text-medical-200">
                  <User size={14} />
                  <span className="hidden md:inline max-w-[120px] truncate">{userEmail}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-red-300 hover:text-red-100 hover:bg-red-500/20 rounded transition-colors"
                  title="Cerrar Sesión"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}

            {/* Firebase Connection Indicator */}
            <div
              className={clsx(
                "ml-3 p-1.5 rounded-full flex items-center justify-center",
                isFirebaseConnected ? "bg-green-500/20" : "bg-red-500/20"
              )}
              title={isFirebaseConnected ? "Conectado a Firebase" : "Sin conexión a Firebase"}
            >
              {isFirebaseConnected ? (
                <Wifi size={14} className="text-green-400" />
              ) : (
                <WifiOff size={14} className="text-red-400" />
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
