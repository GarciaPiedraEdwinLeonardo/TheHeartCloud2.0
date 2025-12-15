import { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { FaIdCard, FaUniversity, FaCalendarAlt, FaUpload, FaArrowLeft, FaCheckCircle, FaClock } from 'react-icons/fa'; 
import cloudinaryConfig from './../../config/cloudinary'

function VerifyAccount({ onBack }) {
    const [formData, setFormData] = useState({
        apellidoPaterno: '',
        apellidoMaterno: '',
        nombre: '',
        especialidad: '',
        cedula: '',
        paisCedula: 'México', // Valor por defecto
        universidad: '',
        anioTitulacion: '',
        documentoCedula: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [verificationStatus, setVerificationStatus] = useState(''); // 'pending', 'verified', 'rejected', null
    const [canSubmit, setCanSubmit] = useState(true); 
    const [fieldErrors, setFieldErrors] = useState({});

    // Verificar estado actual al cargar el componente
    useEffect(() => {
        const checkVerificationStatus = async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        const status = userData.professionalInfo?.verificationStatus;
                        setVerificationStatus(status || '');
                        
                        // Si ya tiene una solicitud pendiente o aprobada, no puede enviar otra
                        if (status === 'pending' || status === 'verified') {
                            setCanSubmit(false);
                        }
                    }
                } catch (error) {
                    console.error('Error al verificar estado:', error);
                }
            }
        };

        checkVerificationStatus();
    }, []);

    const handleChange = (e) => {
        if (!canSubmit) return;
        
        const { name, value, files } = e.target;
        
        // Validar en tiempo real
        const error = validateField(name, value);
        setFieldErrors(prev => ({
            ...prev,
            [name]: error
        }));
        
        if (name === 'documentoCedula') {
            setFormData(prev => ({
                ...prev,
                documentoCedula: files[0]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const uploadToCloudinary = async (file) => {
        try {
            if (!file) {
                throw new Error('No se proporcionó ningún archivo');
            }

            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!allowedTypes.includes(file.type)) {
                throw new Error('Tipo de archivo no permitido. Use JPEG o PNG');
            }

            const maxSize = 4 * 1024 * 1024; // 4MB
            if (file.size > maxSize) {
                throw new Error('La imagen no puede pesar más de 4MB');
            }

            const data = new FormData();
            data.append("file", file);
            data.append("upload_preset", cloudinaryConfig.uploadPreset);

            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/auto/upload`,
                {
                    method: "POST",
                    body: data,
                }
            );

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Cloudinary error ${res.status}: ${errorText}`);
            }

            const json = await res.json();
            
            if (!json.secure_url) {
                throw new Error('Cloudinary no devolvió una URL segura');
            }
            return json.secure_url;

        } catch (error) {
            console.error('Error completo en uploadToCloudinary:', error);
            
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Error de conexión. Verifica tu internet e intenta nuevamente.');
            } else if (error.message.includes('413')) {
                throw new Error('El archivo es demasiado grande. Máximo 4MB');
            } else if (error.message.includes('400')) {
                throw new Error('Error en la configuración de Cloudinary. Contacta al administrador.');
            }
            
            throw new Error(`Error al subir el documento: ${error.message}`);
        }
    };

    const validateField = (name, value) => {
        switch (name) {
            case 'apellidoPaterno':
            case 'apellidoMaterno':
                // Solo letras, espacios y acentos, 2-30 caracteres
                if (!value) return 'Este campo es requerido';
                if (!/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]{2,30}$/.test(value)) {
                    return 'Solo letras y espacios, 2-30 caracteres';
                }
                if (value.length < 2) return 'Mínimo 2 caracteres';
                if (value.length > 30) return 'Máximo 30 caracteres';
                break;
                
            case 'nombre':
                // Solo letras, espacios y acentos, 2-50 caracteres (nombres pueden ser más largos)
                if (!value) return 'Este campo es requerido';
                if (!/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]{2,50}$/.test(value)) {
                    return 'Solo letras y espacios, 2-50 caracteres';
                }
                if (value.length < 2) return 'Mínimo 2 caracteres';
                if (value.length > 50) return 'Máximo 50 caracteres';
                break;
                
            case 'especialidad':
                // Letras, números, espacios y algunos caracteres básicos, 3-50 caracteres
                if (!value) return 'Este campo es requerido';
                if (!/^[A-Za-z0-9ÁáÉéÍíÓóÚúÑñ\s\-\.,()]{3,50}$/.test(value)) {
                    return 'Solo letras, números y espacios, 3-50 caracteres';
                }
                if (value.length < 3) return 'Mínimo 3 caracteres';
                if (value.length > 50) return 'Máximo 50 caracteres';
                break;
                
            case 'cedula':
                // Cédulas mexicanas: exactamente 7 dígitos
                if (!value) return 'Este campo es requerido';
                if (!/^\d{7}$/.test(value)) {
                    return 'La cédula debe tener exactamente 7 dígitos';
                }
                break;
                
            case 'universidad':
                // Letras, números, espacios y algunos caracteres básicos, 3-80 caracteres
                if (!value) return 'Este campo es requerido';
                if (!/^[A-Za-z0-9ÁáÉéÍíÓóÚúÑñ\s\-\.,()&]{3,80}$/.test(value)) {
                    return 'Solo letras, números y espacios, 3-80 caracteres';
                }
                if (value.length < 3) return 'Mínimo 3 caracteres';
                if (value.length > 80) return 'Máximo 80 caracteres';
                break;
                
            case 'anioTitulacion':
                // Año entre 1950 y año actual
                if (!value) return 'Este campo es requerido';
                const year = parseInt(value);
                const currentYear = new Date().getFullYear();
                if (isNaN(year)) return 'Debe ser un año válido';
                if (year < 1950 || year > currentYear) {
                    return `Año debe estar entre 1950 y ${currentYear}`;
                }
                break;
                
            default:
                return null;
        }
        return null;
    };

    const isFormValid = () => {
        // Verificar que todos los campos de texto tengan valor y no tengan errores
        const requiredFields = ['apellidoPaterno', 'apellidoMaterno', 'nombre', 'especialidad', 'cedula', 'universidad', 'anioTitulacion'];
        
        for (const field of requiredFields) {
            if (!formData[field] || fieldErrors[field]) {
                return false;
            }
        }
        
        // Verificar que se haya seleccionado un archivo
        if (!formData.documentoCedula) {
            return false;
        }
        
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Verificar si puede enviar
        if (!canSubmit) {
            setError('Ya tienes una solicitud de verificación en proceso.');
            return;
        }
        
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Validar todos los campos antes de enviar
            const errors = {};
            Object.keys(formData).forEach(key => {
                if (key !== 'documentoCedula' && key !== 'paisCedula') { // Excluir país que es fijo
                    const error = validateField(key, formData[key]);
                    if (error) errors[key] = error;
                }       
            });

            if (Object.keys(errors).length > 0) {
                setFieldErrors(errors);
                throw new Error('Por favor corrige los errores en el formulario');
            }

            const user = auth.currentUser;
            if (!user) {
                throw new Error('No hay usuario autenticado');
            }

            // Validaciones básicas
            if (!formData.documentoCedula) {
                throw new Error('Debes subir una imagen de tu cédula profesional');
            }

            // Subir documento a Cloudinary
            const documentoUrl = await uploadToCloudinary(formData.documentoCedula);

            // Preparar datos para Firestore
            const userUpdate = {
                name: {
                    apellidopat: formData.apellidoPaterno,
                    apellidomat: formData.apellidoMaterno,
                    name: formData.nombre
                },
                professionalInfo: {
                    specialty: formData.especialidad,
                    licenseNumber: formData.cedula,
                    licenseCountry: formData.paisCedula,
                    university: formData.universidad,
                    titulationYear: parseInt(formData.anioTitulacion),
                    licenseDocument: documentoUrl,
                    verificationStatus: 'pending',
                    verifiedAt: null,
                    verifiedBy: null
                },
            };

            // Actualizar en Firestore
            await updateDoc(doc(db, 'users', user.uid), userUpdate);

            // Bloquear envíos futuros
            setCanSubmit(false);
            setVerificationStatus('pending');
            setSuccess('¡Solicitud de verificación enviada! Un moderador revisará tu documentación.');
            
            setTimeout(() => {
                if (onBack) onBack();
            }, 3000);

        } catch (error) {
            console.error('Error completo en verificación:', error);
    
            let userFriendlyError = 'Error al enviar la solicitud de verificación';
    
            if (error.message.includes('Cloudinary') || error.message.includes('subir')) {
                userFriendlyError = error.message;
            } else if (error.message.includes('Firebase')) {
                userFriendlyError = 'Error de conexión con la base de datos. Intenta nuevamente.';
            }
    
            setError(userFriendlyError);

        } finally {
            setLoading(false);
        }
    };

    const currentYear = new Date().getFullYear();

    // Renderizar diferentes estados
    const renderStatusMessage = () => {
        switch (verificationStatus) {
            case 'pending':
                return (
                    <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg mb-6">
                        <div className="flex items-center gap-2">
                            <FaClock className="w-4 h-4" />
                            <span className="font-medium">Solicitud en revisión</span>
                        </div>
                        <p className="text-sm mt-1">
                            Tu solicitud de verificación está siendo revisada por nuestro equipo. 
                            Te notificaremos cuando sea procesada.
                        </p>
                    </div>
                );
            case 'verified':
                return (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                        <div className="flex items-center gap-2">
                            <FaCheckCircle className="w-4 h-4" />
                            <span className="font-medium">Cuenta verificada</span>
                        </div>
                        <p className="text-sm mt-1">
                            ¡Felicidades! Tu cuenta médica ha sido verificada exitosamente.
                        </p>
                    </div>
                );
            case 'rejected':
                return (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        <div className="flex items-center gap-2">
                            <FaCheckCircle className="w-4 h-4" />
                            <span className="font-medium">Solicitud rechazada</span>
                        </div>
                        <p className="text-sm mt-1">
                            Tu solicitud fue rechazada. Por favor contacta al administrador para más información.
                        </p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 transition duration-200"
                    >
                        <FaArrowLeft className="w-4 h-4" />
                        <span>Volver al inicio</span>
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Verificación de Cuenta Médica
                    </h1>
                    <p className="text-gray-600">
                        Completa tu información profesional para verificar tu cuenta
                    </p>
                </div>

                {/* Alertas de estado */}
                {renderStatusMessage()}

                {/* Alertas de error/success */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                        {success}
                    </div>
                )}

                {/* Formulario - Solo mostrar si puede enviar */}
                {canSubmit ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Información Personal */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaIdCard className="text-blue-600" />
                                    Información Personal
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Apellido Paterno *
                                        </label>
                                        <input
                                            type="text"
                                            name="apellidoPaterno"
                                            value={formData.apellidoPaterno}
                                            onChange={handleChange}
                                            required
                                            maxLength={30}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                                                fieldErrors.apellidoPaterno ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Paterno"
                                        />
                                        {fieldErrors.apellidoPaterno && (
                                            <p className="text-red-500 text-xs mt-1">{fieldErrors.apellidoPaterno}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Apellido Materno *
                                        </label>
                                        <input
                                            type="text"
                                            name="apellidoMaterno"
                                            value={formData.apellidoMaterno}
                                            onChange={handleChange}
                                            required
                                            maxLength={30}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                                                fieldErrors.apellidoMaterno ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Materno"
                                        />
                                        {fieldErrors.apellidoMaterno && (
                                            <p className="text-red-500 text-xs mt-1">{fieldErrors.apellidoMaterno}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nombre(s) *
                                        </label>
                                        <input
                                            type="text"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleChange}
                                            required
                                            maxLength={50}
                                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                                                fieldErrors.nombre ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Nombre completo"
                                        />
                                        {fieldErrors.nombre && (
                                            <p className="text-red-500 text-xs mt-1">{fieldErrors.nombre}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Información Profesional */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaUniversity className="text-blue-600" />
                                    Información Profesional
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Especialidad *
                                        </label>
                                        <input
                                            type="text"
                                            name="especialidad"
                                            value={formData.especialidad}
                                            onChange={handleChange}
                                            required
                                            maxLength={50}
                                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                                                fieldErrors.especialidad ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Ej: Cardiología, Pediatría, etc."
                                        />
                                        {fieldErrors.especialidad && (
                                            <p className="text-red-500 text-xs mt-1">{fieldErrors.especialidad}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Número de Cédula *
                                        </label>
                                        <input
                                            type="text"
                                            name="cedula"
                                            value={formData.cedula}
                                            onChange={handleChange}
                                            required
                                            maxLength={20}
                                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                                                fieldErrors.cedula ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Número de cédula profesional"
                                        />
                                        {fieldErrors.cedula && (
                                            <p className="text-red-500 text-xs mt-1">{fieldErrors.cedula}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            País de la Cédula *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="paisCedula"
                                                value={formData.paisCedula}
                                                readOnly
                                                disabled
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                    Solo México
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Actualmente solo aceptamos cédulas mexicanas
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Universidad *
                                        </label>
                                        <input
                                            type="text"
                                            name="universidad"
                                            value={formData.universidad}
                                            onChange={handleChange}
                                            required
                                            maxLength={80}
                                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                                                fieldErrors.universidad ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Universidad de titulación"
                                        />
                                        {fieldErrors.universidad && (
                                            <p className="text-red-500 text-xs mt-1">{fieldErrors.universidad}</p>
                                        )}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                            <FaCalendarAlt className="text-blue-600" />
                                            Año de Titulación *
                                        </label>
                                        <input
                                            type="number"
                                            name="anioTitulacion"
                                            value={formData.anioTitulacion}
                                            onChange={handleChange}
                                            required
                                            min="1950"
                                            max={currentYear}
                                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                                                fieldErrors.anioTitulacion ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Ej: 2020"
                                        />
                                        {fieldErrors.anioTitulacion && (
                                            <p className="text-red-500 text-xs mt-1">{fieldErrors.anioTitulacion}</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            Año en que obtuviste tu título profesional
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Documento de Cédula */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaUpload className="text-blue-600" />
                                    Documento de Verificación
                                </h3>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition duration-200">
                                    <input
                                        type="file"
                                        id="documentoCedula"
                                        name="documentoCedula"
                                        onChange={handleChange}
                                        accept="image/jpeg,image/png,image/jpg"
                                        required
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="documentoCedula"
                                        className="cursor-pointer block"
                                    >
                                        <FaUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-gray-700">
                                            {formData.documentoCedula 
                                                ? `Archivo seleccionado: ${formData.documentoCedula.name}`
                                                : 'Sube una captura/foto de tu cédula profesional'
                                            }
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            PNG, JPG (Máx. 4MB) - Solo imágenes, no PDF
                                        </p>
                                    </label>
                                </div>
                            </div>

                            {/* Botón de envío */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading || !canSubmit || !isFormValid()}
                                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Enviando solicitud...
                                        </>
                                    ) : (
                                        'Enviar Solicitud de Verificación'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    // Mensaje cuando no puede enviar
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                        <FaClock className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Solicitud en Proceso
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {verificationStatus === 'pending' 
                                ? 'Tu solicitud de verificación está siendo revisada por nuestro equipo.'
                                : 'Ya has completado el proceso de verificación.'
                            }
                        </p>
                        <button
                            onClick={onBack}
                            className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 transition duration-200"
                        >
                            Volver al Inicio
                        </button>
                    </div>
                )}

                {/* Información adicional */}
                <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Información importante</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Tu información será revisada por nuestro equipo</li>
                        <li>• Recibirás una notificación cuando tu cuenta sea verificada</li>
                        <li>• Solo puedes enviar una solicitud de verificación a la vez</li>
                        <li>• Actualmente solo aceptamos cédulas profesionales mexicanas</li>
                        <li>• Sube una foto o captura de tu cédula (no se aceptan PDF)</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default VerifyAccount;