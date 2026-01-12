import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      // If there's a token, user is authenticated
      return !!token;
    },
  },
});

export const config = {
  matcher: ['/dashboard/:path*']
};
