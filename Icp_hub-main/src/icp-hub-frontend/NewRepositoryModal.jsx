export default function NewRepositoryModal({ isOpen, onClose, onCreate }) {
  const gitignoreTemplates = ['Node', 'Python', 'Java', 'Go', 'Rust', 'C++'];

  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    gitignoreTemplate: '' // matches backend optional field
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    onCreate({
      ...formData,
      gitignoreTemplate: formData.gitignoreTemplate || null // null if empty
    });
  };

  return (
    <div>
      {/* other form fields */}
      <label htmlFor="gitignoreTemplate">.gitignore Template</label>
      <select
        id="gitignoreTemplate"
        name="gitignoreTemplate"
        value={formData.gitignoreTemplate}
        onChange={handleChange}
      >
        <option value="">None</option>
        {gitignoreTemplates.map(template => (
          <option key={template} value={template}>{template}</option>
        ))}
      </select>
      <button onClick={handleSubmit}>Create Repository</button>
    </div>
  );
}

