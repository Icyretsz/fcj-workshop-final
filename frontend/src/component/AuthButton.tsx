import { useAuth } from "react-oidc-context";

function AuthButton() {
    const auth = useAuth();

    const signOutRedirect = () => {
        const clientId = "56msdcts0r2uahkt6c30lulbeh";
        const logoutUri = "http://localhost:5173";
        const cognitoDomain = "https://ap-southeast-1tuutdrtld.auth.ap-southeast-1.amazoncognito.com";
        window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    };

    if (auth.isLoading) {
        return <div>Loading...</div>;
    }

    if (auth.error) {
        return <div>Encountering error... {auth.error.message}</div>;
    }

    if (auth.isAuthenticated) {
        return (
            <div>
                <pre> Hello: {auth.user?.profile.email} </pre>
                <pre> ID Token: {auth.user?.id_token} </pre>
                <pre> Access Token: {auth.user?.access_token} </pre>
                <pre> Refresh Token: {auth.user?.refresh_token} </pre>

                <button onClick={() => auth.removeUser()}>Sign out</button>
            </div>
        );
    }

    return (
        <div>
            {!auth.isAuthenticated ? <button onClick={() => auth.signinRedirect()}>Sign in</button>
            : <button onClick={() => signOutRedirect()}>Sign out</button>}
        </div>
    );
}

export default AuthButton;