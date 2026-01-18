import { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axiosInstance from './../../config/axiosInstance';

function VerificationActions({ request, onUpdate, currentAdmin }) {
    const [loading, setLoading] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        if (showRejectModal || showConfirmModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showRejectModal, showConfirmModal]);

    const handleAccept = async () => {
        setShowConfirmModal(false);
        setLoading('accepting');
        
        try {
            const response = await axiosInstance.post(`/api/verification/${request.id}/verify`, {
                action: 'approve'
            });

            if (response.success) {
                onUpdate(request.id, 'approved');
            }
        } catch (error) {
            console.error('Error al aceptar solicitud:', error);
            toast.error(error.response?.data?.error || 'Error al aprobar la verificación');
        } finally {
            setLoading('');
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            toast.error('Por favor proporciona una razón para el rechazo');
            return;
        }

        if (rejectReason.trim().length < 10) {
            toast.error('La razón debe tener al menos 10 caracteres');
            return;
        }

        setLoading('rejecting');
        
        try {
            const response = await axiosInstance.post(`/api/verification/${request.id}/verify`, {
                action: 'reject',
                reason: rejectReason
            });

            if (response.success) {
                onUpdate(request.id, 'rejected');
                setShowRejectModal(false);
                setRejectReason('');
            }
        } catch (error) {
            console.error('Error al rechazar solicitud:', error);
            toast.error(error.response?.data?.error || 'Error al rechazar la solicitud');
        } finally {
            setLoading('');
        }
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
                <button
                    onClick={() => setShowConfirmModal(true)}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg font-medium text-sm sm:text-base w-full sm:w-auto"
                >
                    {loading === 'accepting' ? (
                        <FaSpinner className="w-4 h-4 animate-spin" />
                    ) : (
                        <FaCheck className="w-4 h-4" />
                    )}
                    <span>Aprobar</span>
                </button>

                <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg font-medium text-sm sm:text-base w-full sm:w-auto"
                >
                    {loading === 'rejecting' ? (
                        <FaSpinner className="w-4 h-4 animate-spin" />
                    ) : (
                        <FaTimes className="w-4 h-4" />
                    )}
                    <span>Rechazar</span>
                </button>
            </div>

            {/* Modal de confirmación para aprobar - Responsive */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden my-4 sm:my-8">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 sm:p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                                    <FaCheck className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg sm:text-xl font-bold text-white break-words">
                                        Confirmar Aprobación
                                    </h3>
                                    <p className="text-green-100 text-xs sm:text-sm break-words">
                                        Esta acción no se puede deshacer
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-4 sm:p-6">
                            <p className="text-sm sm:text-base text-gray-700 mb-4 break-words">
                                ¿Estás seguro de que deseas aprobar la verificación de{' '}
                                <strong className="text-gray-900">
                                    {request.name?.name} {request.name?.apellidopat}
                                </strong>?
                            </p>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-4">
                                <p className="text-xs sm:text-sm text-green-800 mb-2">
                                    Al aprobar, el usuario obtendrá:
                                </p>
                                <ul className="text-xs sm:text-sm text-green-700 space-y-1 list-disc list-inside">
                                    <li>Rol de médico verificado</li>
                                    <li>Acceso completo a la plataforma</li>
                                    <li>Insignia de verificación</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-4 sm:p-6 bg-gray-50 border-t border-gray-200">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                disabled={loading === 'accepting'}
                                className="flex-1 px-4 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition duration-200 font-medium disabled:opacity-50 text-sm sm:text-base"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAccept}
                                disabled={loading === 'accepting'}
                                className="flex-1 px-4 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 font-medium shadow-md disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
                            >
                                {loading === 'accepting' ? (
                                    <>
                                        <FaSpinner className="w-4 h-4 animate-spin" />
                                        <span className="hidden sm:inline">Aprobando...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaCheck className="w-4 h-4" />
                                        <span className="hidden sm:inline">Confirmar Aprobación</span>
                                        <span className="sm:hidden">Confirmar</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de rechazo - Responsive */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden my-4 sm:my-8">
                        <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 sm:p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                                    <FaTimes className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg sm:text-xl font-bold text-white break-words">
                                        Rechazar Verificación
                                    </h3>
                                    <p className="text-red-100 text-xs sm:text-sm break-words">
                                        Proporciona una razón detallada
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6">
                            <p className="text-sm sm:text-base text-gray-700 mb-4 break-words">
                                Estás rechazando la solicitud de{' '}
                                <strong className="text-gray-900">
                                    {request.name?.name} {request.name?.apellidopat}
                                </strong>
                            </p>

                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                                Razón del rechazo *
                            </label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Explica claramente por qué se rechaza la solicitud. Esto será enviado al usuario..."
                                className="w-full h-28 sm:h-32 px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none transition text-sm sm:text-base"
                                maxLength={500}
                            />
                            <div className="flex justify-between items-center mt-2">
                                <p className="text-xs text-gray-500">
                                    Mínimo 10 caracteres
                                </p>
                                <p className="text-xs text-gray-500">
                                    {rejectReason.length}/500
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-4 sm:p-6 bg-gray-50 border-t border-gray-200">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectReason('');
                                }}
                                disabled={loading === 'rejecting'}
                                className="flex-1 px-4 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition duration-200 font-medium disabled:opacity-50 text-sm sm:text-base"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={loading === 'rejecting' || !rejectReason.trim() || rejectReason.trim().length < 10}
                                className="flex-1 px-4 py-2.5 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                            >
                                {loading === 'rejecting' ? (
                                    <>
                                        <FaSpinner className="w-4 h-4 animate-spin" />
                                        <span className="hidden sm:inline">Rechazando...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaTimes className="w-4 h-4" />
                                        <span className="hidden sm:inline">Confirmar Rechazo</span>
                                        <span className="sm:hidden">Rechazar</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default VerificationActions;