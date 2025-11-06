'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteSent: () => void;
}

export default function InviteUserModal({ isOpen, onClose, onInviteSent }: InviteUserModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationLink, setRegistrationLink] = useState('');
  const [invitedUser, setInvitedUser] = useState<any>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !name) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/invite`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email, name }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al invitar usuario');
      }

      const data = await response.json();
      setInvitedUser(data.data.user);
      setRegistrationLink(data.data.registrationLink);
      toast.success('Usuario invitado exitosamente');
      onInviteSent();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al invitar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(registrationLink);
    toast.success('¡Link copiado al portapapeles!');
  };

  const handleClose = () => {
    setEmail('');
    setName('');
    setRegistrationLink('');
    setInvitedUser(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Invitar Nuevo Usuario">
      <div className="space-y-6">
        {!registrationLink ? (
          // Invite Form
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <Input
                label="Nombre completo"
                type="text"
                placeholder="Ej: María González"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
              />
            </div>

            <div>
              <Input
                label="Correo electrónico"
                type="email"
                placeholder="maria@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
              />
            </div>

            <div className="card-dark-solid p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-warm-50 mb-2">
                ℹ️ Información
              </h4>
              <ul className="text-sm text-warm-300 space-y-1">
                <li>• El usuario será creado con estado APPROVED</li>
                <li>• Se generará un token único de registro</li>
                <li>• El token expira en 7 días</li>
                <li>• El usuario completará su registro con el link</li>
              </ul>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-dark-700">
              <Button variant="dark" onClick={handleClose} type="button">
                Cancelar
              </Button>
              <Button variant="fire" type="submit" isLoading={loading}>
                📧 Enviar Invitación
              </Button>
            </div>
          </form>
        ) : (
          // Success State with Registration Link
          <div className="space-y-6">
            <div className="text-center py-6">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-warm-50 mb-2">
                ¡Invitación Creada!
              </h3>
              <p className="text-warm-300">
                El usuario ha sido invitado exitosamente
              </p>
            </div>

            {invitedUser && (
              <div className="card-dark-solid p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-warm-500">Nombre:</span>
                  <span className="text-warm-50 font-medium">{invitedUser.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-500">Email:</span>
                  <span className="text-warm-50">{invitedUser.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-500">Estado:</span>
                  <span className="status-pending">{invitedUser.approvalStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-500">Token expira:</span>
                  <span className="text-warm-50 text-sm">
                    {new Date(invitedUser.tokenExpiresAt).toLocaleString('es-CL')}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-sm font-medium text-warm-200">
                🔗 Link de Registro
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={registrationLink}
                  readOnly
                  className="input-dark flex-1 font-mono text-sm"
                />
                <Button variant="fire" onClick={handleCopyLink}>
                  📋 Copiar
                </Button>
              </div>
              <p className="text-sm text-warm-500">
                Comparte este link con el usuario para que complete su registro.
                El link expira en 7 días.
              </p>
            </div>

            <div className="card-dark-solid p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-warm-50 mb-2">
                📝 Próximos Pasos
              </h4>
              <ol className="text-sm text-warm-300 space-y-1 list-decimal list-inside">
                <li>Copia y envía el link al usuario por email o WhatsApp</li>
                <li>El usuario accederá al link y completará su registro</li>
                <li>Ingresará sus datos personales y metadata</li>
                <li>Una vez registrado, podrá publicar servicios</li>
                <li>Podrás activar/desactivar su publicación desde el panel</li>
              </ol>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-dark-700">
              <Button variant="fire" onClick={handleClose}>
                ✓ Entendido
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
