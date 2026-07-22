'use client';
import Modal from './Modal';
import Button from './Button';
interface Props { isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; confirmLabel?: string; variant?: 'danger' | 'primary'; loading?: boolean; }
export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', variant = 'danger', loading = false }: Props) {
  return <Modal isOpen={isOpen} onClose={onClose} title={title}><p className="text-sm text-gray-600 mb-6">{message}</p><div className="flex justify-end gap-3"><Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button><Button variant={variant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button></div></Modal>;
}
