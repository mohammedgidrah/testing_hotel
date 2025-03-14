import Header from '../components/Header';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Ordersiteams() {
  const { t } = useTranslation("orderitems");
  return (
    <div className='flex-1 overflow-auto relative z-10'>
        <Header title={t('OrderItems')} />
      
    </div>
  );
}
