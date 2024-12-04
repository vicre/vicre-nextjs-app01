// pages/private/index.js
import React from 'react';
import nookies from 'nookies';
import jwtDecode from 'jwt-decode';

function PrivatePage({ user }) {
  return (
    <div>
      <h1>Hello {user.name}, this is a private page.</h1>
      <p>Email: {user.email}</p>
      <a href="/api/auth/logout">Logout</a>
    </div>
  );
}

export async function getServerSideProps(context) {
  const cookies = nookies.get(context);
  const { accessToken, idToken } = cookies;

  if (!accessToken || !idToken) {
    // Redirect to login page if not authenticated
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  // Decode ID token to get user information
  const decodedIdToken = jwtDecode(idToken);

  const user = {
    name: decodedIdToken.name || 'User',
    email: decodedIdToken.preferred_username || '',
  };

  return {
    props: { user },
  };
}

export default PrivatePage;
