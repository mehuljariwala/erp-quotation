import { useState } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { QuotationForm } from './components/quotation/QuotationForm';
import { QuotationList } from './components/quotation/QuotationList';
import { FinalQuotationModule } from './components/quotation/FinalQuotationModule';
import { AuthGuard } from './components/auth';
import { CompanyModule } from './components/company';
import { AccountModule } from './components/account';
import { ProductModule } from './components/product';
import { Dashboard } from './components/dashboard';
import { CategoriesModule } from './components/category';
import { UnitsModule } from './components/unit';
import { PriceListsModule } from './components/pricelist';

const QuotationModule = ({ view, onViewChange, onNavigate }) => {
  if (view === 'form') {
    return <QuotationForm onBackToList={() => onViewChange('list')} onNavigate={onNavigate} />;
  }

  return (
    <QuotationList
      onNewQuotation={() => onViewChange('form')}
      onEditQuotation={() => onViewChange('form')}
    />
  );
};

function App() {
  const [activeModule, setActiveModule] = useState(() => sessionStorage.getItem('activeModule') || 'dashboard');
  const [quotationView, setQuotationView] = useState('form');

  const handleModuleChange = (module) => {
    setActiveModule(module);
    sessionStorage.setItem('activeModule', module);
    if (module === 'quotation') {
      setQuotationView('form');
    }
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard onNavigate={handleModuleChange} />;
      case 'quotation':
        return (
          <QuotationModule
            view={quotationView}
            onViewChange={setQuotationView}
            onNavigate={handleModuleChange}
          />
        );
      case 'final-quotation':
        return (
          <FinalQuotationModule
            onEditQuotation={() => {
              setActiveModule('quotation');
              setQuotationView('form');
            }}
          />
        );
      case 'company':
        return <CompanyModule />;
      case 'account':
        return <AccountModule />;
      case 'product':
        return <ProductModule />;
      case 'category':
        return <CategoriesModule />;
      case 'unit':
        return <UnitsModule />;
      case 'pricelist':
        return <PriceListsModule />;
      default:
        return <Dashboard onNavigate={handleModuleChange} />;
    }
  };

  return (
    <AuthGuard>
      <MainLayout
        activeModule={activeModule}
        onModuleChange={handleModuleChange}
      >
        {renderModule()}
      </MainLayout>
    </AuthGuard>
  );
}

export default App;
