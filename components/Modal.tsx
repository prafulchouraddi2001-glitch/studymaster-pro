import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-xl w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b">
          <h2 className="text-xl font-semibold text-base">{title}</h2>
        </div>
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;