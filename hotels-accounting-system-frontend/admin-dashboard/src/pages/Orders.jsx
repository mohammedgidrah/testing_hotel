import React from 'react';
import Header from '../components/Header';
import { useTranslation } from 'react-i18next';

export default function Orders() {
    const { t } = useTranslation("orders");
  return (
    <div className='flex-1 overflow-auto relative z-10'>
        <Header title={t('Orders')} />
        
       
    </div>
  );
}

