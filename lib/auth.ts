import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabase } from '@/lib/supabase';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Check if user exists in database
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          // PGRST116 is "not found" error, which is expected for new users
          console.error('Error checking user:', fetchError);
          return true; // Allow sign in even if check fails
        }

        // If user doesn't exist, create them
        if (!existingUser) {
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
            });

          if (insertError) {
            console.error('Error creating user in database:', insertError);
          } else {
            console.log('New user created:', user.email);
          }
        } else {
          console.log('Existing user signed in:', user.email);
        }

        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return true; // Allow sign in even if database operations fail
      }
    },
    async session({ session, token }) {
      // Add custom data to session
      if (session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: '/login', // Redirect to login page if not authenticated
  },
  secret: process.env.NEXTAUTH_SECRET,
};
