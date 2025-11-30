import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from "react-oidc-context";

const cognitoAuthConfig = {
    authority: "https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_TuutdRTLd",
    client_id: "56msdcts0r2uahkt6c30lulbeh",
    redirect_uri: "http://localhost:5173",
    response_type: "code",
    scope: "email openid phone",
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
      <AuthProvider {...cognitoAuthConfig}>
        <App />
      </AuthProvider>
  </React.StrictMode>,
)
