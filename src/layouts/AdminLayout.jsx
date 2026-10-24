import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { Modal, Toast } from '../components/common/Modal';
import { OutboxModal } from '../components/modals/OutboxModal';
import { useApp } from '../context/AppContext';

export function AdminLayout() {
  const { data, modalContent, closeModal, toastMessage } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [outboxOpen, setOutboxOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all">
        {/* Top Navbar */}
        <TopNavbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenOutbox={() => setOutboxOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Bottom Institutional Footer */}
        <footer className="bg-white border-t border-slate-200/80 py-6 px-6 text-center text-xs text-slate-500 space-y-1">
          <div className="font-semibold text-slate-700">
            Shri Ramswaroop Memorial University (SRMU) • Scholarly Publishing Portal
          </div>
          <div className="text-[11px] text-slate-400">
            IJMAR (International Journal of Multidisciplinary Advanced Research) &amp; IJSPAST (International Journal of Scientific Progress in Applied Science and Engineering)
          </div>
          <div className="text-[10px] text-slate-400">
            Enterprise Editorial Workflow • Double-Blind Peer Review • Automated APC Invoicing
          </div>
        </footer>
      </div>

      {/* Modal Layer */}
      <Modal isOpen={Boolean(modalContent)} onClose={closeModal}>
        {modalContent}
      </Modal>

      {/* Outbox Modal Layer */}
      <Modal isOpen={outboxOpen} onClose={() => setOutboxOpen(false)} wide={true}>
        <OutboxModal onClose={() => setOutboxOpen(false)} />
      </Modal>

      {/* Global Toast */}
      <Toast message={toastMessage} />
    </div>
  );
}
