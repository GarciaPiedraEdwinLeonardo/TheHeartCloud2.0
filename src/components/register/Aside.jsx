import { FaComments, FaUserShield, FaChartLine, FaStethoscope, FaUsers, FaFileMedical } from 'react-icons/fa';

function Aside() {
    return (
        <div className="max-w-2xl">
            {/* Header informativo */}
            <div className="text-center lg:text-left">
                
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                    Conecta, 
                    <span className="block bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent">
                        Colabora,
                    </span>
                    Crece.
                </h1>
                <p className="text-xl text-gray-600 mt-6 leading-relaxed">
                    Únete a la comunidad médica más innovadora. Comparte conocimiento, 
                    resuelve casos clínicos y construye tu reputación profesional.
                </p>
            </div>

            {/* Características principales */}
            <div className="mt-12 space-y-8">
                <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <FaComments className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900">Foros Especializados</h3>
                        <p className="text-gray-600 mt-2">
                            Participa en comunidades médicas específicas y comparte casos clínicos 
                            con colegas de tu especialidad.
                        </p>
                    </div>
                </div>

                <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <FaUserShield className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900">Verificación Profesional</h3>
                        <p className="text-gray-600 mt-2">
                            Ambiente seguro y confiable exclusivo para médicos verificados 
                            con cédula profesional.
                        </p>
                    </div>
                </div>

                <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                        <FaChartLine className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900">Sistema de Reputación</h3>
                        <p className="text-gray-600 mt-2">
                            Construye tu Aura profesional basado en contribuciones valiosas 
                            y experiencia compartida.
                        </p>
                    </div>
                </div>

                <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                        <FaFileMedical className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900">Casos Clínicos</h3>
                        <p className="text-gray-600 mt-2">
                            Discute diagnósticos complejos y comparte experiencias con 
                            profesionales de todo el mundo.
                        </p>
                    </div>
                </div>
            </div>

            
        </div>
    );
}

export default Aside;