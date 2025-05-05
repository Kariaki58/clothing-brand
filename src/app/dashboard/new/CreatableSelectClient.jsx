'use client';
import dynamic from 'next/dynamic';

const CreatableSelect = dynamic(
    () => import('react-select/creatable'),
    { 
        ssr: false,
        loading: () => <div>Loading...</div>
    }
);

export default CreatableSelect;