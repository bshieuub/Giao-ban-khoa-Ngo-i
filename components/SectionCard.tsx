
import React from 'react';

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, children }) => {
  return (
    <section className="bg-white rounded-xl shadow-lg overflow-hidden transition-shadow hover:shadow-xl">
      <div className="p-5 bg-slate-50 border-b border-slate-200">
        <h2 className="text-xl font-semibold text-slate-700">{title}</h2>
      </div>
      <div className="p-6">
        {children}
      </div>
    </section>
  );
};

export default SectionCard;
