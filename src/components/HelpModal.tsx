import React from 'react';
import { X, Home, Plus, Play, Settings, Search, DownloadCloud, Music, Edit, Trash2, HelpCircle } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean; // Ajout de la prop isAdmin
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, isAdmin }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Bienvenue sur CapoCanto !</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>CapoCanto vous aide à gérer et à pratiquer vos chants de Capoeira. Voici un petit guide pour commencer :</p>

          <div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">1. Navigation principale</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><Home size={16} className="inline-block mr-2" /> <strong>Accueil</strong> : Liste de tous vos chants, organisés par catégorie.</li>
              {isAdmin && ( // Afficher seulement pour les admins
                <li><Plus size={16} className="inline-block mr-2" /> <strong>Ajouter</strong> : Créez de nouveaux chants.</li>
              )}
              <li><Play size={16} className="inline-block mr-2" /> <strong>Prompteur</strong> : Un outil pour pratiquer les chants en rotation automatique.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">2. Gérer les chants (Accueil)</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><Search size={16} className="inline-block mr-2" /> <strong>Recherche</strong> : Trouvez rapidement un chant par titre, phrase mnémotechnique ou paroles.</li>
              {isAdmin && ( // Afficher seulement pour les admins
                <li><DownloadCloud size={16} className="inline-block mr-2" /> <strong>Import/Export</strong> : Importez ou exportez vos chants via un fichier CSV.</li>
              )}
              <li><Settings size={16} className="inline-block mr-2" /> <strong>Paramètres</strong> : Ajustez les réglages de l'application et du prompteur.</li>
              {isAdmin && ( // Afficher seulement pour les admins
                <li><Trash2 size={16} className="inline-block mr-2" /> <strong>Supprimer la sélection</strong> : Supprimez plusieurs chants à la fois.</li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">3. Détails d'un chant</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Cliquez sur une tuile de chant pour voir ses détails (paroles, lien média).</li>
              <li><Play size={16} className="inline-block mr-2" /> <strong>Mode lecture</strong> : Faites défiler automatiquement les paroles avec un BPM ajustable.</li>
              <li><Music size={16} className="inline-block mr-2" /> <strong>Lien média</strong> : Accédez directement à la ressource audio/vidéo du chant.</li>
              {isAdmin && ( // Afficher seulement pour les admins
                <li><Edit size={16} className="inline-block mr-2" /> <strong>Modifier</strong> : Modifiez les informations d'un chant.</li>
              )}
            </ul>
          </div>

          <p className="mt-6 text-center">Profitez bien de CapoCanto !</p>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Compris !
          </button>
        </div>
      </div>
    </div>
  );
};