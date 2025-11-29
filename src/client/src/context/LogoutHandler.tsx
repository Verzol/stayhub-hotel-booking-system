import LogoutModal from '../components/common/LogoutModal';

interface LogoutHandlerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutHandler({
  isOpen,
  onClose,
  onConfirm,
}: LogoutHandlerProps) {
  return (
    <LogoutModal isOpen={isOpen} onClose={onClose} onConfirm={onConfirm} />
  );
}
