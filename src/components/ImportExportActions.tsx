import React from 'react';
import { X, Upload, Download } from 'lucide-react';

interface ImportExportActionsProps {
  isOpen: boolean;
  onClose: () => void;
  onImportClick: () => void;
  onExportClick: () => void;
}

export const ImportExportActions: React.FC<ImportExportActionsProps> = ({
  isOpen,
  onClose,
  onImportClick,
  onExportClick,
}) => {
  if (!isOpen) return null;

  const handleImport = () => {
    onImportClick();
    onClose();
  };

  const handleExport = () => {
    onExportClick();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-lg">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-bold">Actions sur les chants</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleImport}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Download size={20} />
            <span>Importer des chants (CSV)</span>
          </button>
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 text-gray-800 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            <Upload size={20} />
            <span>Exporter des chants (CSV)</span>
          </button>
        </div>
      </div>
    </div>
  );
};