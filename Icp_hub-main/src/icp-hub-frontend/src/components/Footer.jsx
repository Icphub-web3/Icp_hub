import { Github, Twitter, MessageSquare, Heart } from 'lucide-react'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="container">
          <div className="footer-content">
            {/* Brand Section */}
            <div className="footer-brand">
              <h3 className="footer-logo">OpenKey</h3>
              <p className="footer-tagline">
                The ultimate multichain development platform
              </p>
              
              {/* Social Links */}
              <div className="footer-social">
                <a href="https://github.com/Icphub-web3/Icp_hub" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <Github size={20} />
                </a>
                <a href="https://twitter.com/openkey" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <Twitter size={20} />
                </a>
                <a href="https://discord.gg/openkey" target="_blank" rel="noopener noreferrer" aria-label="Discord">
                  <MessageSquare size={20} />
                </a>
              </div>
            </div>

            {/* Platform Links */}
            <div className="footer-section">
              <h4>Platform</h4>
              <ul>
                <li><a href="/repositories">Browse Projects</a></li>
                <li><a href="/community">Community</a></li>
                <li><a href="/governance">Governance</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div className="footer-section">
              <h4>Resources</h4>
              <ul>
                <li><a href="https://github.com/Icphub-web3/Icp_hub/blob/main/README.md" target="_blank" rel="noopener noreferrer">Documentation</a></li>
                <li><a href="/help">Help Center</a></li>
                <li><a href="/contact">Contact</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <div className="footer-copyright">
              <p>&copy; 2024 OpenKey. All rights reserved.</p>
            </div>
            
            <div className="footer-built-with">
              <span>Built with</span>
              <Heart size={14} className="heart-icon" />
              <span>for the Web3 community</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 