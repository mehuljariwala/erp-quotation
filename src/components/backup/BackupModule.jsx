import { useState, useRef } from 'react';
import { HardDrive, Download, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';

export const BackupModule = () => {
  const exportSettings = useSettingsStore(state => state.exportSettings);
  const importSettings = useSettingsStore(state => state.importSettings);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);

  const handleExport = () => {
    const json = exportSettings();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `erp-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ type: 'success', text: 'Settings exported successfully' });
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = importSettings(event.target.result);
      if (result.success) {
        setMessage({ type: 'success', text: 'Settings imported successfully' });
      } else {
        setMessage({ type: 'error', text: `Import failed: ${result.error}` });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="h-full flex flex-col">
      <div className="m-3 mb-0 bg-white rounded-lg border border-[#e2e8f0] shadow-sm flex flex-col min-h-0 flex-1 overflow-hidden">
        <div className="px-4 py-3 border-b border-[#e2e8f0] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <HardDrive size={16} className="text-blue-600" />
          </div>
          <h2 className="text-base font-semibold text-[#1a1a2e]">Backup & Restore</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-lg mx-auto space-y-6">
            <p className="text-sm text-[#64748b]">
              Export your application settings as a JSON file for backup, or import a previously exported file to restore your configuration.
            </p>

            {message && (
              <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                {message.text}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 rounded-lg border border-[#e2e8f0] bg-[#f8fafc]">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                  <Download size={18} className="text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-[#1a1a2e] mb-1">Export Settings</h3>
                <p className="text-xs text-[#64748b] mb-3">Download your current settings as a JSON backup file.</p>
                <button
                  onClick={handleExport}
                  className="w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Export
                </button>
              </div>

              <div className="p-4 rounded-lg border border-[#e2e8f0] bg-[#f8fafc]">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-3">
                  <Upload size={18} className="text-emerald-600" />
                </div>
                <h3 className="text-sm font-semibold text-[#1a1a2e] mb-1">Import Settings</h3>
                <p className="text-xs text-[#64748b] mb-3">Restore settings from a previously exported JSON file.</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  Import
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupModule;
