import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Clock, Server, Wifi, WifiOff } from 'lucide-react'
import dataService from '../services/dataService'

function SystemStatus({ showDetailedStatus = false }) {
  const [status, setStatus] = useState({
    online: false,
    loading: true,
    lastCheck: null,
    responseTime: null,
    error: null
  })

  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    checkSystemHealth()
    
    if (autoRefresh) {
      const interval = setInterval(checkSystemHealth, 30000) // Check every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const checkSystemHealth = async () => {
    const startTime = Date.now()
    setStatus(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const result = await dataService.healthCheck()
      const responseTime = Date.now() - startTime
      
      setStatus({
        online: result.success && result.online,
        loading: false,
        lastCheck: new Date(),
        responseTime,
        error: result.error || null
      })
    } catch (error) {
      const responseTime = Date.now() - startTime
      setStatus({
        online: false,
        loading: false,
        lastCheck: new Date(),
        responseTime,
        error: error.message
      })
    }
  }

  const getStatusColor = () => {
    if (status.loading) return '#64b5f6'
    if (status.online) return '#4caf50'
    return '#f44336'
  }

  const getStatusText = () => {
    if (status.loading) return 'Checking...'
    if (status.online) return 'API Online'
    return 'API Offline'
  }

  const getStatusIcon = () => {
    if (status.loading) return <Clock size={16} />
    if (status.online) return <CheckCircle size={16} />
    return <AlertCircle size={16} />
  }

  const getResponseTimeColor = () => {
    if (!status.responseTime) return '#9ca3af'
    if (status.responseTime < 200) return '#4caf50'
    if (status.responseTime < 500) return '#ff9800'
    return '#f44336'
  }

  if (!showDetailedStatus) {
    // Simple status indicator for header or footer
    return (
      <div className="status-indicator-simple">
        <div 
          className="status-dot"
          style={{ backgroundColor: getStatusColor() }}
          title={`main.mo API: ${getStatusText()}${status.responseTime ? ` (${status.responseTime}ms)` : ''}`}
        />
        <span className="status-text-simple">{getStatusText()}</span>
      </div>
    )
  }

  // Detailed status component
  return (
    <div className="system-status">
      <div className="status-header">
        <div className="status-title">
          <Server size={20} />
          <h3>System Status</h3>
        </div>
        <button 
          className="refresh-button"
          onClick={checkSystemHealth}
          disabled={status.loading}
          title="Refresh status"
        >
          <Clock size={16} className={status.loading ? 'spinning' : ''} />
        </button>
      </div>

      <div className="status-content">
        {/* Main API Status */}
        <div className="status-item">
          <div className="status-item-header">
            <div className="status-item-title">
              {status.online ? <Wifi size={18} /> : <WifiOff size={18} />}
              <span>main.mo API Layer</span>
            </div>
            <div 
              className="status-badge"
              style={{ 
                backgroundColor: getStatusColor(),
                color: 'white'
              }}
            >
              {getStatusIcon()}
              {getStatusText()}
            </div>
          </div>
          
          {status.error && (
            <div className="status-error">
              <AlertCircle size={14} />
              <span>{status.error}</span>
            </div>
          )}
        </div>

        {/* Performance Metrics */}
        {status.responseTime && (
          <div className="status-metrics">
            <div className="metric">
              <span className="metric-label">Response Time</span>
              <span 
                className="metric-value"
                style={{ color: getResponseTimeColor() }}
              >
                {status.responseTime}ms
              </span>
            </div>
            
            {status.lastCheck && (
              <div className="metric">
                <span className="metric-label">Last Check</span>
                <span className="metric-value">
                  {status.lastCheck.toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Auto Refresh Toggle */}
        <div className="status-controls">
          <label className="toggle-control">
            <input 
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Auto-refresh (30s)</span>
          </label>
        </div>

        {/* Status Description */}
        <div className="status-description">
          <p>
            {status.online 
              ? 'Connected to the main.mo API layer. All backend services are operational.'
              : 'Unable to connect to the main.mo API layer. Some features may be unavailable.'
            }
          </p>
          
          <div className="api-info">
            <h4>Backend Architecture</h4>
            <div className="architecture-flow">
              <div className="flow-item">Frontend</div>
              <div className="flow-arrow">→</div>
              <div className="flow-item current">main.mo</div>
              <div className="flow-arrow">→</div>
              <div className="flow-item">Modules</div>
            </div>
            <p className="architecture-description">
              main.mo acts as the public API router, delegating requests to specialized modules 
              like user.mo, repository.mo, and search.mo for business logic processing.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemStatus 