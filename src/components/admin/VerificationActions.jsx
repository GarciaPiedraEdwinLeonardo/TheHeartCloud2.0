import { useState } from 'react';
import { doc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from './../../config/firebase';
import { FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import { notificationService } from '../notifications/services/notificationService';
import { toast } from 'react-hot-toast';

function VerificationActions({ request, onUpdate, currentAdmin }) {
    const [loading, setLoading] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const handleAccept = async () => {
        setLoading('accepting');
        try {
            const userRef = doc(db, 'users', request.id);
            
            await updateDoc(userRef, {
                role: 'doctor',
                'professionalInfo.verificationStatus': 'verified',
                'professionalInfo.verifiedAt': new Date(),
                'professionalInfo.verifiedBy': currentAdmin?.email, 
                
                stats: {
                    aura: 0,
                    contributionCount: 0,
                    postCount: 0,
                    commentCount: 0,
                    forumCount: 0,
                    joinedForumsCount: 0,
                    totalImagesUploaded: 0,
                    totalStorageUsed: 0
                },
                suspension: {
                    isSuspended: false,
                    reason: null,
                    startDate: null,
                    endDate: null,
                    suspendedBy: null
                },
                joinedForums: [],
                isActive: true,
                isDeleted: false,
                deletedAt: null
            });

            const userName = `${request.name?.name} ${request.name?.apellidopat}`;
            await notificationService.sendVerificationApproved(
                request.id, // userId
                userName,   // nombre del usuario
                currentAdmin?.email // correo del admin que verificó
            );

            onUpdate(request.id, 'accepted');
            
        } catch (error) {
            console.error('Error al aceptar solicitud:', error);
        } finally {
            setLoading('');
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            toast.error('Por favor proporciona una razón para el rechazo');
            return;
        }

        setLoading('rejecting');
        try {
            const userRef = doc(db, 'users', request.id);
            
            await updateDoc(userRef, {
                'professionalInfo.verificationStatus': 'rejected',
                'professionalInfo.verifiedAt': new Date(),
                'professionalInfo.verifiedBy': currentAdmin?.email, 
                'professionalInfo.rejectionReason': rejectReason,
                
                name: deleteField(),
                'professionalInfo.specialty': deleteField(),
                'professionalInfo.licenseNumber': deleteField(),
                'professionalInfo.licenseCountry': deleteField(),
                'professionalInfo.university': deleteField(),
                'professionalInfo.titulationYear': deleteField(),
                'professionalInfo.licenseDocument': deleteField()
            });

            const userName = `${request.name?.name} ${request.name?.apellidopat}`;
            await notificationService.sendVerificationRejected(
                request.id,     // userId
                userName,       // nombre del usuario
                rejectReason,   // razón del rechazo
                currentAdmin?.email // correo del admin que rechazó
            );
            onUpdate(request.id, 'rejected');
            
            setShowRejectModal(false);
            setRejectReason('');
            
        } catch (error) {
            console.error('Error al rechazar solicitud:', error);
        } finally {
            setLoading('');
        }
    };

    return (
        <>
            <div className="flex gap-2">
                <button
                    onClick={handleAccept}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-50 text-sm"
                >
                    {loading === 'accepting' ? (
                        <FaSpinner className="w-4 h-4 animate-spin" />
                    ) : (
                        <FaCheck className="w-4 h-4" />
                    )}
                    Aceptar
                </button>

                <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 disabled:opacity-50 text-sm"
                >
                    {loading === 'rejecting' ? (
                        <FaSpinner className="w-4 h-4 animate-spin" />
                    ) : (
                        <FaTimes className="w-4 h-4" />
                    )}
                    Rechazar
                </button>
            </div>

            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Razón del Rechazo
                        </h3>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Explica por qué se rechaza la solicitud..."
                            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectReason('');
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={loading === 'rejecting' || !rejectReason.trim()}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 disabled:opacity-50"
                            >
                                {loading === 'rejecting' ? 'Rechazando...' : 'Confirmar Rechazo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default VerificationActions;