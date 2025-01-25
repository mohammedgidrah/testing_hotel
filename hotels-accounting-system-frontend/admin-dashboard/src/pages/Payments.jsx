import React from 'react'

import Header from '../components/Header'
import PaymentsTable from '../components/Payments/PaymentsTable'
import { useTranslation } from 'react-i18next'

function Payments() {
  const { t } = useTranslation("payments");
  return (
    <div className='flex-1 overflow-auto relative z-10'>
      <Header title={t('Payments')} />

      <PaymentsTable />
    </div>
  )
}

export default Payments