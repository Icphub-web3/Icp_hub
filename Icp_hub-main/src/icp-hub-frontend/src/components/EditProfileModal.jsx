import { useState } from 'react'
import { X, Upload, MapPin, Link as LinkIcon, Building, Mail } from 'lucide-react'

function EditProfileModal({ isOpen, onClose, user, onSubmit }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    company: user?.company || '',
    location: user?.location || '',
    website: user?.website || '',
    email: user?.email || '',
    hireable: user?.hireable || false,
    avatar: user?.avatar || ''
  })

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, avatar: event.target.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit profile</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-grid">
            <div className="form-left">
              <div className="avatar-section">
                <div className="avatar-container">
                  <img 
                    src={formData.avatar || "https://github.com/github.png"} 
                    alt="Profile" 
                    className="profile-avatar-large"
                  />
                  <label htmlFor="avatar-upload" className="avatar-upload-btn">
                    <Upload size={16} />
                    Change photo
                  </label>
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              <div className="form-section">
                <label htmlFor="name" className="form-label">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Your name"
                />
              </div>

              <div className="form-section">
                <label htmlFor="bio" className="form-label">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Tell us about yourself"
                  rows={3}
                  maxLength={160}
                />
                <small className="form-help">
                  {160 - formData.bio.length} characters remaining
                </small>
              </div>

              <div className="form-section">
                <div className="checkbox-section">
                  <input
                    type="checkbox"
                    id="hireable"
                    name="hireable"
                    checked={formData.hireable}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="hireable" className="checkbox-label">
                    Available for hire
                  </label>
                </div>
              </div>
            </div>

            <div className="form-right">
              <div className="form-section">
                <label htmlFor="company" className="form-label">
                  <Building size={16} />
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Company name"
                />
              </div>

              <div className="form-section">
                <label htmlFor="location" className="form-label">
                  <MapPin size={16} />
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="City, country"
                />
              </div>

              <div className="form-section">
                <label htmlFor="website" className="form-label">
                  <LinkIcon size={16} />
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div className="form-section">
                <label htmlFor="email" className="form-label">
                  <Mail size={16} />
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="your@email.com"
                />
                <small className="form-help">
                  Your email address will not be publicly visible
                </small>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Update profile
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProfileModal 