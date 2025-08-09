# OPENKEY

**OPENKEYHUB** is a comprehensive multichain development platform designed to revolutionize Web3 development by providing seamless integration across multiple blockchain networks. Built with modern web technologies and powered by the Internet Computer Protocol (ICP), OPENKEY serves as a unified hub for developers to build, deploy, and manage decentralized applications across Ethereum, Internet Computer, Polygon, BSC, Avalanche, and other leading blockchain ecosystems.

## Overview

OPENKEY addresses the fragmentation challenges in the Web3 development ecosystem by offering a single, intuitive interface that connects disparate blockchain networks. The platform enables developers to leverage the unique capabilities of different blockchains while maintaining consistency in their development workflow.

## Frontend Installation and Setup

### Prerequisites

Ensure your development environment meets the following requirements:

- **Node.js**: Version 16.0 or higher
- **npm**: Version 7.0 or higher (comes with Node.js)
- **Git**: For version control
- **Modern Web Browser**: Chrome, Firefox, Safari, or Edge

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Icphub-web3/Icp_hub.git
   cd Icp_hub
   ```

2. **Navigate to Frontend Directory**
   ```bash
   cd src/icp-hub-frontend
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Configure Environment Variables**
   
   Create a `.env` file in the `src/icp-hub-frontend` directory:
   ```bash
   touch .env
   ```
   
   Add the following configuration:
   ```env
   VITE_DFX_NETWORK=local
   VITE_BACKEND_CANISTER_ID=your_backend_canister_id
   VITE_INTERNET_IDENTITY_CANISTER_ID=your_internet_identity_canister_id
   ```

5. **Start the Development Server**
   ```bash
   npm run dev
   ```

6. **Access the Application**
   
   Open your web browser and navigate to:
   ```
   http://localhost:5173
   ```

### Development Commands

- **Start Development Server**: `npm run dev`
- **Build for Production**: `npm run build`
- **Preview Production Build**: `npm run preview`
- **Run Linting**: `npm run lint`

### Browser Compatibility

OPENKEY frontend supports all modern browsers with ES6+ compatibility:

- Chrome 88+
- Firefox 78+
- Safari 14+
- Edge 88+

### Troubleshooting

**Port Already in Use**
If port 5173 is occupied, Vite will automatically use the next available port. Check the terminal output for the correct URL.

**Module Resolution Errors**
Ensure all dependencies are installed by running:
```bash
rm -rf node_modules package-lock.json
npm install
```

**Environment Variable Issues**
Verify that your `.env` file is properly formatted and located in the `src/icp-hub-frontend` directory.

## Technical Architecture

The OPENKEY frontend is built using:

- **React 18**: For component-based user interface development
- **Vite**: For fast development and optimized production builds
- **React Router**: For client-side routing and navigation
- **Lucide React**: For consistent iconography
- **CSS Modules**: For component-scoped styling

## Contributing

We welcome contributions to improve OPENKEY. Please review our contribution guidelines and submit pull requests through our GitHub repository.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Support

For technical support and documentation, please visit our [GitHub repository](https://github.com/Icphub-web3/Icp_hub) or contact our development team.
