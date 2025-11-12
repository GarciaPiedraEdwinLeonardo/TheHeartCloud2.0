import { 
  FaIdCard,
  FaGlobeAmericas,
  FaGraduationCap,
  FaUniversity,
  FaCalendarAlt,
} from 'react-icons/fa';
import InputWithIcon from './../inputs/InputWithIcon';
import FileUpload from './../inputs/FileUpload';

function ProfessionalDataSection({ data, onChange, cedulaFile, onFileChange, onRemoveFile }) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
        DATOS PROFESIONALES
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="cedulaProfesional" className="block text-sm font-medium text-gray-700 mb-2">
            Cédula Profesional *
          </label>
          <InputWithIcon
            icon={FaIdCard}
            type="text"
            id="cedulaProfesional"
            name="cedulaProfesional"
            value={data.cedulaProfesional}
            onChange={onChange}
            required
          />
        </div>

        <div>
          <label htmlFor="paisEmision" className="block text-sm font-medium text-gray-700 mb-2">
            País de Emisión *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaGlobeAmericas className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="paisEmision"
              name="paisEmision"
              value={data.paisEmision}
              onChange={onChange}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              required
            >
              <option value="">Selecciona un país</option>
              <option value="MX">México</option>
              <option value="US">Estados Unidos</option>
              <option value="ES">España</option>
              <option value="AR">Argentina</option>
              <option value="CO">Colombia</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="especialidadMedica" className="block text-sm font-medium text-gray-700 mb-2">
            Especialidad Médica *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaGraduationCap className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="especialidadMedica"
              name="especialidadMedica"
              value={data.especialidadMedica}
              onChange={onChange}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              required
            >
              <option value="">Selecciona una especialidad</option>
              <option value="Cardiología">Cardiología</option>
              <option value="Pediatría">Pediatría</option>
              <option value="Neurología">Neurología</option>
              <option value="Oncología">Oncología</option>
              <option value="Ortopedia">Ortopedia</option>
              <option value="Oftalmología">Oftalmología</option>
              <option value="Medicina General">Medicina General</option>
              <option value="Otra">Otra especialidad</option>
            </select>
          </div>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="institucion" className="block text-sm font-medium text-gray-700 mb-2">
            Institución de Titulación *
          </label>
          <InputWithIcon
            icon={FaUniversity}
            type="text"
            id="institucion"
            name="institucion"
            value={data.institucion}
            onChange={onChange}
            placeholder="Universidad o Institución"
            required
          />
        </div>

        <div>
          <label htmlFor="anioTitulacion" className="block text-sm font-medium text-gray-700 mb-2">
            Año de Titulación *
          </label>
          <InputWithIcon
            icon={FaCalendarAlt}
            type="number"
            id="anioTitulacion"
            name="anioTitulacion"
            value={data.anioTitulacion}
            onChange={onChange}
            min="1950"
            max="2025"
            placeholder="2025"
            required
          />
        </div>

        <div className="md:col-span-2">
          <FileUpload
            file={cedulaFile}
            onFileChange={onFileChange}
            onRemoveFile={onRemoveFile}
          />
        </div>
      </div>
    </div>
  );
}

export default ProfessionalDataSection;