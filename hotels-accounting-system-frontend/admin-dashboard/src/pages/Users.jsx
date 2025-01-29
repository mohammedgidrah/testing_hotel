import React from 'react';

import Header from '../components/Header';
import { User } from 'lucide-react';
import UserManagement from '../components/Users/UserManagement';
import { useTranslation } from 'react-i18next';

function Users() {
    const { t } = useTranslation("users");
    return (
        <div className='flex-1 overflow-auto relative z-10'>
            <Header title={t('Users')} />
            <UserManagement />
        </div>
    )
}

export default Users