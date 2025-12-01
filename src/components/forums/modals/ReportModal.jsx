import { useState, useEffect, useRef } from 'react';
import { FaTimes, FaSpinner, FaExclamationTriangle, FaUser, FaExclamationCircle } from 'react-icons/fa';
import { auth, db } from '../../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useReportActions } from './../../reports/hooks/useReportActions';
import { toast } from 'react-hot-toast';

function ReportModal({ isOpen, onClose, reportType, targetId, targetName }) {
  const [formData, setFormData] = useState({
    reason: '',
    description: '',
    urgency: 'medium'
  });
  const [userData, setUserData] = useState(null);
  const [targetData, setTargetData] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showGeneralError, setShowGeneralError] = useState(false); // Nuevo estado
  
  const { createReport, loading } = useReportActions();

  // Refs para hacer focus
  const reasonRef = useRef(null);
  const descriptionRef = useRef(null);

  // Cargar datos del usuario actual y información del target
  useEffect(() => {
    const loadUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error('Error cargando datos del usuario:', error);
        }
      }
    };

    const loadTargetData = async () => {
      if (!targetId) return;
      
      try {
        let targetDoc;
        let collectionName;
        
        switch (reportType) {
          case 'profile':
            collectionName = 'users';
            break;
          case 'post':
            collectionName = 'posts';
            break;
          case 'comment':
            collectionName = 'comments';
            break;
          case 'forum':
            collectionName = 'forums';
            break;
          default:
            return;
        }

        targetDoc = await getDoc(doc(db, collectionName, targetId));
        
        if (targetDoc.exists()) {
          setTargetData(targetDoc.data());
        } else {
          console.warn(`⚠️ No se encontró el target ${targetId} en ${collectionName}`);
        }
      } catch (error) {
        console.error('Error cargando datos del target:', error);
      }
    };

    if (isOpen) {
      loadUserData();
      loadTargetData();
      // Resetear errores y touched al abrir
      setErrors({});
      setTouched({});
      setShowGeneralError(false); // Resetear también el error general
    }
  }, [isOpen, targetId, reportType]);

  const reportReasons = {
    forum: [
      'Contenido inapropiado',
      'Spam o autopromoción',
      'Comunidad duplicada',
      'Información médica falsa',
      'Comportamiento abusivo',
      'Violación de normas',
      'Otro'
    ],
    post: [
      'Contenido inapropiado',
      'Información médica falsa',
      'Spam',
      'Derechos de autor',
      'Acoso o bullying',
      'Contenido ofensivo',
      'Otro'
    ],
    comment: [
      'Comentario ofensivo',
      'Spam',
      'Acoso',
      'Información falsa',
      'Fuera de contexto',
      'Otro'
    ],
    user: [
      'Comportamiento abusivo',
      'Spam o autopromoción excesiva',
      'Suplantación de identidad',
      'Perfil falso o información fraudulenta',
      'Acoso o intimidación',
      'Contenido inapropiado en el perfil',
      'Usuario no verificado ejerciendo como médico',
      'Compartir información médica peligrosa',
      'Otro'
    ],
    profile: [
      'Información profesional falsa',
      'Suplantación de identidad médica',
      'Foto de perfil inapropiada',
      'Comportamiento abusivo en mensajes',
      'Spam o autopromoción excesiva',
      'Acoso a otros usuarios',
      'Compartir información médica peligrosa',
      'Usuario no verificado ejerciendo como médico',
      'Credenciales falsas o alteradas',
      'Otro'
    ]
  };

  const urgencyLevels = [
    { value: 'low', label: 'Baja', color: 'text-green-600', description: 'Problema menor' },
    { value: 'medium', label: 'Media', color: 'text-yellow-600', description: 'Necesita revisión' },
    { value: 'high', label: 'Alta', color: 'text-orange-600', description: 'Requiere atención pronto' },
    { value: 'critical', label: 'Crítica', color: 'text-red-600', description: 'Necesita acción inmediata' }
  ];

  // Validaciones
  const validateField = (name, value) => {
    switch (name) {
      case 'reason':
        if (!value) return 'Debes seleccionar un motivo para el reporte';
        return '';
      
      case 'description':
        if (!value.trim()) return 'La descripción es requerida';
        if (value.trim().length < 10) return 'La descripción debe tener al menos 10 caracteres';
        if (value.trim().length > 1000) return 'La descripción no puede exceder 1000 caracteres';
        return '';
      
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    newErrors.reason = validateField('reason', formData.reason);
    newErrors.description = validateField('description', formData.description);
    
    setErrors(newErrors);
    
    // Retornar si hay errores
    return !newErrors.reason && !newErrors.description;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Si ya se mostró el error general y el usuario está corrigiendo, ocultarlo
    if (showGeneralError) {
      setShowGeneralError(false);
    }
    
    // Validar en tiempo real solo si el campo ya fue tocado
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const getReportTitle = () => {
    switch (reportType) {
      case 'forum':
        return `Reportar Comunidad: ${targetName}`;
      case 'post':
        return `Reportar Publicación: ${targetName}`;
      case 'comment':
        return `Reportar Comentario`;
      case 'user':
        return `Reportar Usuario: ${targetName}`;
      case 'profile':
        return `Reportar Perfil: ${targetName}`;
      default:
        return 'Reportar Contenido';
    }
  };

  const getReportDescription = () => {
    switch (reportType) {
      case 'forum':
        return 'Reportar problemas con esta comunidad';
      case 'post':
        return 'Reportar problemas con esta publicación';
      case 'comment':
        return 'Reportar problemas con este comentario';
      case 'user':
        return 'Reportar problemas con este usuario';
      case 'profile':
        return 'Reportar problemas con este perfil de usuario';
      default:
        return 'Reportar contenido inapropiado';
    }
  };

  const getReportIcon = () => {
    switch (reportType) {
      case 'profile':
        return <FaUser className="w-5 h-5 text-red-600" />;
      default:
        return <FaExclamationTriangle className="w-5 h-5 text-red-600" />;
    }
  };

  const getPlaceholderText = () => {
    switch (reportType) {
      case 'profile':
        return "Describe detalladamente el problema con este perfil. Incluye información específica sobre: credenciales falsas, comportamiento inapropiado, información médica fraudulenta, etc.";
      case 'user':
        return "Describe detalladamente el problema con este usuario. Incluye ejemplos específicos de comportamiento inapropiado.";
      case 'forum':
        return "Describe detalladamente el problema con esta comunidad.";
      case 'post':
        return "Describe detalladamente el problema con esta publicación.";
      case 'comment':
        return "Describe detalladamente el problema con este comentario.";
      default:
        return "Proporciona todos los detalles relevantes sobre el problema.";
    }
  };

  const getAuthorInfoFromTarget = async () => {
    if (!targetData) return { authorId: null, authorName: null };
    
    switch (reportType) {
      case 'post':
        // Obtener nombre del autor desde users
        if (targetData.authorId) {
          try {
            const authorDoc = await getDoc(doc(db, 'users', targetData.authorId));
            if (authorDoc.exists()) {
              const authorData = authorDoc.data();
              const authorName = authorData.name ? 
                `${authorData.name.name || ''} ${authorData.name.apellidopat || ''} ${authorData.name.apellidomat || ''}`.trim() 
                : authorData.email || 'Usuario';
              
              return { 
                authorId: targetData.authorId, 
                authorName: authorName,
                forumId: targetData.forumId,
                forumName: targetData.forumName || 'Foro desconocido'
              };
            }
          } catch (error) {
            console.error('Error obteniendo datos del autor:', error);
          }
        }
        return { 
          authorId: targetData.authorId, 
          authorName: 'Autor desconocido',
          forumId: targetData.forumId,
          forumName: targetData.forumName || 'Foro desconocido'
        };
        
      case 'comment':
        // Misma lógica para comentarios
        if (targetData.authorId) {
          try {
            const authorDoc = await getDoc(doc(db, 'users', targetData.authorId));
            if (authorDoc.exists()) {
              const authorData = authorDoc.data();
              const authorName = authorData.name ? 
                `${authorData.name.name || ''} ${authorData.name.apellidopat || ''} ${authorData.name.apellidomat || ''}`.trim() 
                : authorData.email || 'Usuario';
              
              return { 
                authorId: targetData.authorId, 
                authorName: authorName,
                postId: targetData.postId,
                postTitle: targetData.postTitle || 'Post desconocido'
              };
            }
          } catch (error) {
            console.error('Error obteniendo datos del autor:', error);
          }
        }
        return { 
          authorId: targetData.authorId, 
          authorName: 'Autor desconocido',
          postId: targetData.postId,
          postTitle: targetData.postTitle || 'Post desconocido'
        };
        
      case 'user':
      case 'profile':
        return { 
          authorId: targetId, 
          authorName: targetData.name ? 
            `${targetData.name.name || ''} ${targetData.name.apellidopat || ''} ${targetData.name.apellidomat || ''}`.trim() 
            : targetData.email || 'Usuario'
        };
      case 'forum':
        return { 
          authorId: targetData.ownerId || null,
          authorName: targetData.ownerName || null
        };
      default:
        return { authorId: null, authorName: null };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Marcar todos los campos como tocados
    const allTouched = {
      reason: true,
      description: true
    };
    setTouched(allTouched);
    
    // Validar formulario completo
    if (!validateForm()) {
      // Mostrar el mensaje de error general
      setShowGeneralError(true);
      
      // Encontrar el primer campo con error y hacer focus
      if (errors.reason) {
        reasonRef.current?.focus();
      } else if (errors.description) {
        descriptionRef.current?.focus();
      }
      
      // Scroll al primer error
      const firstErrorElement = document.querySelector('.error-message');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
      
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      toast.error('Debes iniciar sesión para reportar contenido');
      return;
    }

    const { authorId, authorName, forumId, forumName, postId, postTitle } = await getAuthorInfoFromTarget();

    const reportData = {
      type: reportType,
      targetId,
      targetName,
      
      // Información del reporter
      reporterId: user.uid,
      reporterName: userData?.name ? 
        `${userData.name.name || ''} ${userData.name.apellidopat || ''} ${userData.name.apellidomat || ''}`.trim() 
        : user.email || 'Usuario',
      reporterEmail: user.email,
      
      // Detalles del reporte
      reason: formData.reason,
      description: formData.description.trim(),
      urgency: formData.urgency,
      
      // Información contextual - SOLO incluir si existe
      ...(authorId && { targetAuthorId: authorId }),
      ...(authorName && { targetAuthorName: authorName }),
      ...(forumId && { forumId }),
      ...(forumName && { forumName }),
      ...(postId && { postId }),
      ...(postTitle && { postTitle })
    };

    const result = await createReport(reportData);
    
    if (result.success) {
      toast.success('¡Reporte enviado exitosamente! Los moderadores revisarán tu reporte pronto.');
      onClose();
      setFormData({
        reason: '',
        description: '',
        urgency: 'medium'
      });
      setErrors({});
      setTouched({});
      setShowGeneralError(false);
    } else {
      toast.error(result.error || 'Error al enviar el reporte');
    }
  };

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header fijo */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-2xl">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              reportType === 'profile' ? 'bg-purple-100' : 'bg-red-100'
            }`}>
              {getReportIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 truncate">{getReportTitle()}</h2>
              <p className="text-sm text-gray-500 truncate">{getReportDescription()}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200 disabled:opacity-50 flex-shrink-0 ml-2"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="max-h-[calc(80vh-120px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6">
            {/* Mensaje de error general - SOLO cuando se intenta enviar con errores */}
            {showGeneralError && (errors.reason || errors.description) && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg error-message">
                <div className="flex items-center gap-2 mb-2">
                  <FaExclamationCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span className="text-red-800 font-medium text-sm">Completa los campos requeridos</span>
                </div>
                <ul className="text-red-700 text-sm space-y-1">
                  {errors.reason && <li>• {errors.reason}</li>}
                  {errors.description && <li>• {errors.description}</li>}
                </ul>
              </div>
            )}

            {/* Motivo del reporte */}
            <div className="mb-6">
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Motivo del reporte *
              </label>
              <select
                ref={reasonRef}
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                onBlur={handleBlur}
                disabled={loading}
                className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 disabled:opacity-50 ${
                  errors.reason && touched.reason 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                required
              >
                <option value="">Selecciona un motivo</option>
                {reportReasons[reportType]?.map((reason, index) => (
                  <option key={index} value={reason}>{reason}</option>
                ))}
              </select>
              {errors.reason && touched.reason && (
                <div className="flex items-center gap-1 mt-1">
                  <FaExclamationCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                  <p className="text-red-600 text-xs">{errors.reason}</p>
                </div>
              )}
            </div>

            {/* Urgencia */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Nivel de urgencia
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {urgencyLevels.map((level) => (
                  <label
                    key={level.value}
                    className={`flex flex-col p-3 border rounded-lg cursor-pointer transition duration-200 min-h-[60px] ${
                      formData.urgency === level.value
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="radio"
                        name="urgency"
                        value={level.value}
                        checked={formData.urgency === level.value}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`text-sm font-medium ${level.color}`}>
                        {level.label}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {level.description}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Descripción */}
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción detallada *
              </label>
              <textarea
                ref={descriptionRef}
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                onBlur={handleBlur}
                disabled={loading}
                rows={5}
                maxLength={1000}
                className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 resize-none disabled:opacity-50 ${
                  errors.description && touched.description 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder={getPlaceholderText()}
                required
              />
              <div className="flex justify-between items-center mt-1">
                <div className="flex items-center gap-1">
                  {errors.description && touched.description && (
                    <>
                      <FaExclamationCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                      <p className="text-red-600 text-xs">{errors.description}</p>
                    </>
                  )}
                </div>
                <p className={`text-xs ${
                  formData.description.length < 10 ? 'text-red-500' : 
                  formData.description.length > 800 ? 'text-orange-500' : 'text-gray-500'
                }`}>
                  {formData.description.length}/1000 caracteres
                </p>
              </div>
            </div>
          
            {/* Información adicional general */}
            <div className={`border rounded-lg p-4 mb-6 ${
              reportType === 'profile' ? 'bg-blue-50 border-blue-200' : 'bg-blue-50 border-blue-200'
            }`}>
              <h4 className="text-sm font-medium text-blue-800 mb-2">Información importante</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Los reportes son anónimos para otros usuarios</li>
                <li>• Los moderadores revisarán tu reporte en 24-48 horas</li>
                <li>• Usa este sistema solo para contenido que viole las normas</li>
                <li>• Los reportes falsos pueden resultar en sanciones</li>
                {reportType === 'profile' && (
                  <li>• Los perfiles médicos reportados serán investigados exhaustivamente</li>
                )}
              </ul>
            </div>
          </form>
        </div>

        {/* Footer fijo con botones */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200 font-medium disabled:opacity-50 order-2 sm:order-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 order-1 sm:order-2"
            >
              {loading && <FaSpinner className="w-4 h-4 animate-spin" />}
              {loading ? 'Enviando...' : 'Enviar Reporte'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportModal;