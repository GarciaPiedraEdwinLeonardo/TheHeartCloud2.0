import { FaExclamationTriangle } from "react-icons/fa";
function DeleteAcount({cancelDelete,deleteLoading,deleteAccount}){
    return(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">

                <div className="flex items-center gap-3 mb-4">

                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <FaExclamationTriangle className="w-6 h-6 text-red-600" />
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Eliminar Cuenta</h3>
                        <p className="text-sm text-gray-600">Esta acción no se puede deshacer</p>
                    </div>

                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-red-700">
                        <strong>Advertencia:</strong> Al eliminar tu cuenta:
                    </p>

                    <ul className="text-sm text-red-600 mt-2 space-y-1">
                        <li>• Se perderán todos tus datos permanentemente</li>
                        <li>• Tus publicaciones,comentarios y comunidades se mantendrán</li>
                        <li>• No podrás recuperar tu cuenta</li>
                    </ul>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={cancelDelete}
                        disabled={deleteLoading}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition duration-200 disabled:opacity-50"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={deleteAccount}
                        disabled={deleteLoading}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {deleteLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Eliminando...
                            </>
                                ) : (
                                    'Eliminar Cuenta'
                                )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeleteAcount;