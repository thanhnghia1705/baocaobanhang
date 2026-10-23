/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SalesDataProvider, useSalesData } from './context/SalesDataContext';
import { Header } from './components/Header';
import { PillNavigation } from './components/PillNavigation';
import { FilterBar } from './components/FilterBar';
import { FileUploadModal } from './components/FileUploadModal';
import { ExportModal } from './components/ExportModal';
import { AdvancedFilterModal } from './components/AdvancedFilterModal';

// Tabs
import { OverviewTab } from './components/tabs/OverviewTab';
import { TeamTab } from './components/tabs/TeamTab';
import { ProductGeoTab } from './components/tabs/ProductGeoTab';
import { OperationsTab } from './components/tabs/OperationsTab';
import { RawDataTab } from './components/tabs/RawDataTab';

const DashboardContent: React.FC = () => {
  const { activeTab } = useSalesData();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Header */}
      <Header
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Pill Navigation Bar */}
      <PillNavigation />

      {/* Global Filter Bar */}
      <FilterBar onOpenAdvancedFilter={() => setIsAdvancedFilterOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'team' && <TeamTab />}
        {activeTab === 'product_geo' && <ProductGeoTab />}
        {activeTab === 'operations' && <OperationsTab />}
        {activeTab === 'raw_data' && <RawDataTab />}
      </main>

      {/* Modals */}
      <FileUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
      <AdvancedFilterModal
        isOpen={isAdvancedFilterOpen}
        onClose={() => setIsAdvancedFilterOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <SalesDataProvider>
      <DashboardContent />
    </SalesDataProvider>
  );
}
