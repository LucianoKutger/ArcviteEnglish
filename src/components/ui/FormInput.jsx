
import inputStyles from './FormInput.module.scss'; // Pfad anpassen

const FormInput = ({ label, placeholder, type = "text", ...props }) => (
    <div className={inputStyles.group}>
        <input 
            type={type} 
            placeholder={placeholder}
            className={inputStyles.input}
            {...props}
        />
        <label className={inputStyles.label}>
            {label}
        </label>
    </div>
);

export default FormInput;