import { useState } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { QuotationForm } from './components/quotation/QuotationForm';
import { QuotationList } from './components/quotation/QuotationList';

const PlaceholderModule = ({ name }) => (
  <div className="flex items-center justify-center h-full min-h-[400px]">
    <div className="text-center">
      <div className="w-20 h-20 mx-auto mb-4 rounded-lg bg-[#e0e8f0] border border-[#b0c4d8] flex items-center justify-center">
        <span className="text-3xl opacity-50">🚧</span>
      </div>
      <h2 className="text-xl font-semibold text-text-primary mb-2">{name}</h2>
      <p className="text-text-muted text-sm">This module is under development</p>
      <p className="text-xs text-text-muted mt-1">
        Only the Quotation module is functional in this POC
      </p>
    </div>
  </div>
);

const QuotationModule = ({ view, onViewChange }) => {
  if (view === 'form') {
    return <QuotationForm onBackToList={() => onViewChange('list')} />;
  }

  return (
    <QuotationList
      onNewQuotation={() => onViewChange('form')}
      onEditQuotation={() => onViewChange('form')}
    />
  );
};

function App() {
  const [activeModule, setActiveModule] = useState('quotation');
  const [quotationView, setQuotationView] = useState('form');

  const renderModule = () => {
    switch (activeModule) {
      case 'quotation':
        return (
          <QuotationModule
            view={quotationView}
            onViewChange={setQuotationView}
          />
        );
      case 'company':
        return <PlaceholderModule name="Company Master" />;
      case 'account':
        return <PlaceholderModule name="Account Master" />;
      case 'salesman':
        return <PlaceholderModule name="Salesman Master" />;
      case 'pricelist':
        return <PlaceholderModule name="Price List" />;
      case 'product':
        return <PlaceholderModule name="Product Master" />;
      case 'user':
        return <PlaceholderModule name="User Management" />;
      case 'backup':
        return <PlaceholderModule name="Backup & Restore" />;
      case 'setting':
        return <PlaceholderModule name="Settings" />;
      default:
        return <PlaceholderModule name="Module" />;
    }
  };

  return (
    <MainLayout
      activeModule={activeModule}
      onModuleChange={(module) => {
        setActiveModule(module);
        if (module === 'quotation') {
          setQuotationView('form');
        }
      }}
    >
      {renderModule()}
    </MainLayout>
  );
}

export default App;
